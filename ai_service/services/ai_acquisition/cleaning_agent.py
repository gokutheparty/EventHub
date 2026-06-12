import os
import uuid
import logging
from enum import Enum
from typing import List, Optional
import psycopg2
from pydantic import BaseModel, Field
from openai import OpenAI
import instructor

from services.ai_acquisition.extraction_agent import RawVendorExtraction, get_instructor_client

# Configure logger
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger("ai_acquisition.cleaning_agent")

class VendorCategoryEnum(str, Enum):
    EVENT_CENTER = "EVENT_CENTER"
    EVENT_PLANNER = "EVENT_PLANNER"
    USHERING_AGENCY = "USHERING_AGENCY"
    CATERER = "CATERER"
    DECORATOR = "DECORATOR"
    PHOTOGRAPHER = "PHOTOGRAPHER"
    DJ_MC = "DJ_MC"
    MAKEUP_ARTIST = "MAKEUP_ARTIST"
    SECURITY = "SECURITY"

class GhanaRegionEnum(str, Enum):
    GREATER_ACCRA = "Greater Accra"
    ASHANTI = "Ashanti"
    WESTERN = "Western"
    EASTERN = "Eastern"
    CENTRAL = "Central"
    VOLTA = "Volta"
    NORTHERN = "Northern"
    UPPER_EAST = "Upper East"
    UPPER_WEST = "Upper West"
    BONO = "Bono"
    BONO_EAST = "Bono East"
    AHAFO = "Ahafo"
    SAVANNAH = "Savannah"
    NORTH_EAST = "North East"
    OTI = "Oti"
    WESTERN_NORTH = "Western North"

class CleanedVendorRecord(BaseModel):
    """
    Schema for production-ready, standardized vendor details.
    """
    name: str = Field(description="Canonical business name, stripped of emojis, hashtags, or social tags")
    categories: List[VendorCategoryEnum] = Field(description="List of standardized EventHub categories")
    description: str = Field(description="Sanitized, professional marketing description, free of hashtags and clutter")
    location: str = Field(description="Canonical normalized street address")
    city: str = Field(description="Resolved canonical city (e.g. Accra, Kumasi, Tema)")
    region: GhanaRegionEnum = Field(description="Resolved canonical administrative region of Ghana")
    country: str = Field("Ghana", description="Canonical country")
    latitude: Optional[float] = Field(None, description="Resolved decimal latitude coordinates")
    longitude: Optional[float] = Field(None, description="Resolved decimal longitude coordinates")
    phones: List[str] = Field(description="Standardized phone numbers in strict E.164 format (+233...)")
    email: Optional[str] = Field(None, description="Sanitized contact email address")
    website: Optional[str] = Field(None, description="Sanitized business website URL")
    social_links: dict = Field(default_factory=dict, description="Parsed social URLs dictionary, e.g. {'instagram': '...', 'facebook': '...'}")
    confidence_score: float = Field(0.85, description="AI confidence rating of classification between 0.0 and 1.0")
    trust_score: float = Field(0.80, description="AI validation rating based on listing density between 0.0 and 1.0")

def run_cleaning_agent(raw_data: RawVendorExtraction) -> CleanedVendorRecord:
    """
    Transforms raw scraped data into a normalized, clean CleanedVendorRecord.
    Enforces E.164 phone formats, maps neighborhoods to regions, and strips clutter.
    """
    logger.info("Initializing Agent 3: Cleaning & transformation phase.")
    client = get_instructor_client()
    model = os.getenv("LLM_MODEL_CLEANING") or "gpt-4o"
    
    try:
        response = client.chat.completions.create(
            model=model,
            response_model=CleanedVendorRecord,
            messages=[
                {
                    "role": "system",
                    "content": (
                        "You are an expert data cleaning assistant for EventHub. "
                        "Transform raw business data into structured CleanedVendorRecords using these rules:\n\n"
                        "1. **Phone Standardization**: Convert all Ghanaian numbers to E.164 format. "
                        "Strip the local leading 0 and prepend +233 (e.g. '024 123 4567' -> '+233241234567'). "
                        "Discard invalid numbers.\n"
                        "2. **Neighborhood Mapping**: Map neighborhood fragments to canonical cities and regions "
                        "(e.g., 'East Legon' or 'Airport Residential' -> City: 'Accra', Region: 'Greater Accra'; "
                        "'Bantama' or 'Adum' -> City: 'Kumasi', Region: 'Ashanti').\n"
                        "3. **Text Sanitization**: Strip emojis, social media hashtags, and excessive spacing from the name and description. "
                        "Convert descriptions into professional marketing text.\n"
                        "4. **Category Mapping**: Select the appropriate categories from the strict VendorCategoryEnum list."
                    )
                },
                {"role": "user", "content": f"Transform this raw vendor data:\n\n{raw_data.model_dump_json()}"}
            ],
            temperature=0.0
        )
        logger.info(f"Successfully cleaned profile for: {response.name}")
        return response
    except Exception as e:
        logger.error(f"Error during structured vendor cleaning: {str(e)}")
        raise e

def get_db_connection():
    """
    Establishes connection to the PostgreSQL database using the DATABASE_URL environment variable.
    """
    db_url = os.getenv("DATABASE_URL")
    if not db_url:
        raise ValueError("DATABASE_URL environment variable is missing.")
    return psycopg2.connect(db_url)

def check_duplicate(conn, name: str, phones: List[str], email: Optional[str]) -> bool:
    """
    Checks for duplicates in both active production Vendors and VendorStaging tables.
    Returns True if duplicate matches by phone, email, or exact case-insensitive name.
    """
    with conn.cursor() as cur:
        # Check by phone numbers
        if phones:
            phone_placeholders = ", ".join(["%s"] * len(phones))
            
            # Check production Vendor table
            cur.execute(
                f'SELECT id FROM "Vendor" WHERE phone IN ({phone_placeholders})',
                phones
            )
            if cur.fetchone():
                logger.info("Deduplication Match: Found active vendor with matching phone.")
                return True
                
            # Check VendorStaging table
            cur.execute(
                f'SELECT id FROM "VendorStaging" WHERE phone IN ({phone_placeholders})',
                phones
            )
            if cur.fetchone():
                logger.info("Deduplication Match: Found staged candidate with matching phone.")
                return True

        # Check by email
        if email:
            cur.execute('SELECT id FROM "Vendor" WHERE LOWER(email) = LOWER(%s)', (email,))
            if cur.fetchone():
                logger.info("Deduplication Match: Found active vendor with matching email.")
                return True
                
            cur.execute('SELECT id FROM "VendorStaging" WHERE LOWER(email) = LOWER(%s)', (email,))
            if cur.fetchone():
                logger.info("Deduplication Match: Found staged candidate with matching email.")
                return True

        # Check by name case-insensitively
        cur.execute('SELECT id FROM "Vendor" WHERE LOWER(name) = LOWER(%s)', (name,))
        if cur.fetchone():
            logger.info("Deduplication Match: Found active vendor with matching name.")
            return True
            
        cur.execute('SELECT id FROM "VendorStaging" WHERE LOWER(name) = LOWER(%s)', (name,))
        if cur.fetchone():
            logger.info("Deduplication Match: Found staged candidate with matching name.")
            return True

    return False

def insert_staging_record(record: CleanedVendorRecord, source_url: Optional[str] = None) -> Optional[str]:
    """
    Performs deduplication checks and writes a CleanedVendorRecord directly to the VendorStaging table.
    Returns the staging ID if written, or None if skipped as a duplicate.
    """
    conn = None
    try:
        conn = get_db_connection()
        
        # Run Deduplication filters
        if check_duplicate(conn, record.name, record.phones, record.email):
            logger.warning(f"Skipping ingestion for '{record.name}': duplicate entity detected.")
            return None

        staging_id = str(uuid.uuid4())
        primary_phone = record.phones[0] if record.phones else None
        
        # Map dynamic category enums to display strings (e.g. EVENT_CENTER -> "Event Centers")
        # In a real environment, this maps Enums to seeded category display names
        category_mapping = {
            VendorCategoryEnum.EVENT_CENTER: "Event Centers",
            VendorCategoryEnum.EVENT_PLANNER: "Event Planners",
            VendorCategoryEnum.USHERING_AGENCY: "Ushering Agencies",
            VendorCategoryEnum.CATERER: "Caterers",
            VendorCategoryEnum.DECORATOR: "Decorators",
            VendorCategoryEnum.PHOTOGRAPHER: "Photographers",
            VendorCategoryEnum.DJ_MC: "DJs",
            VendorCategoryEnum.MAKEUP_ARTIST: "Makeup Artists",
            VendorCategoryEnum.SECURITY: "Security Services"
        }
        mapped_categories = [category_mapping[cat] for cat in record.categories]

        with conn.cursor() as cur:
            insert_query = """
                INSERT INTO "VendorStaging" (
                    id, categories, name, description, location, city, region, country, 
                    latitude, longitude, phone, email, website, "socialLinks", 
                    "extractedImages", "sourceUrl", "confidenceScore", "trustScore", 
                    "approvalStatus", "createdAt"
                ) VALUES (
                    %s, %s, %s, %s, %s, %s, %s, %s, 
                    %s, %s, %s, %s, %s, %s::jsonb, 
                    %s, %s, %s, %s, 
                    'PENDING', NOW()
                )
            """
            
            # Format social links dictionary to JSON string
            import json
            social_json = json.dumps(record.social_links)
            
            cur.execute(
                insert_query,
                (
                    staging_id,
                    mapped_categories,
                    record.name,
                    record.description,
                    record.location,
                    record.city,
                    record.region.value,
                    record.country,
                    record.latitude,
                    record.longitude,
                    primary_phone,
                    record.email,
                    record.website,
                    social_json,
                    [], # extractedImages
                    source_url,
                    record.confidence_score,
                    record.trust_score
                )
            )
            conn.commit()
            logger.info(f"Successfully staged candidate '{record.name}' with Staging ID: {staging_id}")
            
            # Log AI acquisition event in AiAcquisitionLog
            log_id = str(uuid.uuid4())
            cur.execute(
                """
                INSERT INTO "AiAcquisitionLog" (id, "agentName", action, details, "createdAt")
                VALUES (%s, 'Cleaning Agent', 'STAGED_CANDIDATE', %s, NOW())
                """,
                (log_id, f"Staged {record.name} (Phone: {primary_phone}) from Source: {source_url}")
            )
            conn.commit()
            
            return staging_id
            
    except Exception as e:
        if conn:
            conn.rollback()
        logger.error(f"Failed to ingest staging record: {str(e)}")
        raise e
    finally:
        if conn:
            conn.close()
