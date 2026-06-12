import os
import logging
from typing import List, Optional
from pydantic import BaseModel, Field
from openai import OpenAI
import instructor

# Configure logger
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger("ai_acquisition.extraction_agent")

class RawVendorExtraction(BaseModel):
    """
    Schema for initial unstructured capture from crawled web elements.
    """
    name: str = Field(description="The extracted raw name of the vendor/business")
    phones: List[str] = Field(default_factory=list, description="List of raw, unformatted phone number strings")
    emails: List[str] = Field(default_factory=list, description="List of raw emails identified")
    location_chunks: List[str] = Field(default_factory=list, description="Street signs, landmarks, neighborhood names, or raw address fragments")
    website: Optional[str] = Field(None, description="Raw website URL if mentioned")
    social_urls: List[str] = Field(default_factory=list, description="List of Facebook, Instagram, or social links identified")
    capacity_hints: Optional[str] = Field(None, description="Raw indicators of guest size limits or capacity restrictions")
    asset_urls: List[str] = Field(default_factory=list, description="List of primary image, logo, or asset URLs")

def get_instructor_client() -> OpenAI:
    """
    Instantiates an OpenAI client wrapped with Instructor.
    Supports endpoint overrides for DeepSeek or custom OpenAI API gateways.
    """
    api_key = os.getenv("OPENAI_API_KEY") or os.getenv("DEEPSEEK_API_KEY")
    base_url = os.getenv("OPENAI_API_BASE") or os.getenv("DEEPSEEK_API_BASE") or "https://api.openai.com/v1"
    
    if not api_key:
        logger.warning("No API key detected in environment. Attempting client instantiation with system defaults.")
        
    client = OpenAI(api_key=api_key, base_url=base_url)
    return instructor.from_openai(client)

def run_extraction_agent(raw_scraped_text: str) -> RawVendorExtraction:
    """
    Analyzes raw text chunk and extracts a RawVendorExtraction structured record.
    Uses gpt-4o-mini as specified by default.
    """
    logger.info("Initializing Agent 2: Raw data extraction phase.")
    client = get_instructor_client()
    model = os.getenv("LLM_MODEL_EXTRACTION") or "gpt-4o-mini"
    
    try:
        response = client.chat.completions.create(
            model=model,
            response_model=RawVendorExtraction,
            messages=[
                {
                    "role": "system",
                    "content": (
                        "You are an expert AI data extraction agent for an events marketplace in Ghana. "
                        "Analyze the unstructured crawled text page and extract all relevant raw information. "
                        "Extract phone numbers, email addresses, location segments, website addresses, social handles, "
                        "and image links exactly as they appear without format alterations."
                    )
                },
                {"role": "user", "content": f"Extract raw vendor details from this scraped text:\n\n{raw_scraped_text}"}
            ],
            temperature=0.0
        )
        logger.info(f"Successfully extracted details for vendor name: {response.name}")
        return response
    except Exception as e:
        logger.error(f"Error during structured vendor extraction: {str(e)}")
        raise e
