import os
import uuid
import logging
import asyncio
import signal
from typing import List, Optional
from contextlib import asynccontextmanager
import asyncpg
from fastapi import FastAPI, HTTPException, BackgroundTasks
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from dotenv import load_dotenv

# Import modular agents
from agents.discovery import DiscoveryAgent
from agents.extraction import ExtractionAgent
from agents.cleaning import CleaningAgent
from agents.enrichment import EnrichmentAgent
from agents.trust_scoring import TrustScoringAgent
from agents.deduplication import DeduplicationAgent
from agents.growth import GrowthAgent

# Load configurations
load_dotenv()

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger("eventhub_ai_service")

from urllib.parse import urlparse, urlunparse, parse_qsl, urlencode

def sanitize_db_url_for_asyncpg(url: str) -> str:
    parsed = urlparse(url)
    if parsed.query:
        # asyncpg only supports a subset of query parameters (like ssl options, timeout, etc.)
        allowed_keys = {'ssl', 'sslmode', 'sslrootcert', 'sslcert', 'sslkey', 'timeout', 'command_timeout', 'server_settings'}
        queries = parse_qsl(parsed.query)
        filtered_queries = [(k, v) for k, v in queries if k.lower() in allowed_keys]
        new_query = urlencode(filtered_queries)
        parsed = parsed._replace(query=new_query)
    return urlunparse(parsed)

@asynccontextmanager
async def lifespan(app: FastAPI):
    # Retrieve connection details
    db_url = os.getenv("DATABASE_URL")
    if not db_url:
        logger.error("No DATABASE_URL found in environment variables.")
        raise ValueError("DATABASE_URL is required for database connection pool.")

    sanitized_url = sanitize_db_url_for_asyncpg(db_url)
    logger.info("Initializing asyncpg connection pool on startup lifespan context...")
    try:
        # Create pool with dynamic parameters (min 2, max 10, max_inactive_connection_lifetime=300)
        app.state.db_pool = await asyncpg.create_pool(
            dsn=sanitized_url,
            min_size=2,
            max_size=10,
            max_inactive_connection_lifetime=300.0
        )
        logger.info("asyncpg database connection pool successfully created.")
    except Exception as e:
        logger.error(f"Failed to create database connection pool: {str(e)}")
        raise e

    yield

    # Clean termination on shutdown (uvicorn captures sigterm and calls this teardown block)
    logger.info("Closing database connection pool on shutdown...")
    if hasattr(app.state, "db_pool") and app.state.db_pool:
        await app.state.db_pool.close()
        logger.info("asyncpg connection pool terminated cleanly.")

app = FastAPI(
    title="EventHub AI Acquisition & Growth Service",
    description="Microservice running autonomous agents 1-7 for vendor discovery, LLM parsing, deduplication, and claims.",
    version="1.0.0",
    lifespan=lifespan
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Request Models
class CrawlRequest(BaseModel):
    category: str
    target_city: str
    source_url: Optional[str] = None

class CrawlStatusResponse(BaseModel):
    job_id: str
    status: str
    pages_scraped: int
    records_staged: int
    logs: List[str]

# In-memory job tracker for demo/MVP
jobs_db = {}

def execute_agent_pipeline(job_id: str, category: str, city: str, source: Optional[str]):
    jobs_db[job_id]["status"] = "processing"
    logs = jobs_db[job_id]["logs"]
    
    try:
        # Initialize pipeline data
        pipeline_data = {
            "category": category,
            "city": city,
            "source_url": source,
            "extracted_records": []
        }

        # Instantiating Agent Instances
        discovery_agent = DiscoveryAgent()
        extraction_agent = ExtractionAgent()
        cleaning_agent = CleaningAgent()
        enrichment_agent = EnrichmentAgent()
        trust_agent = TrustScoringAgent()
        dedup_agent = DeduplicationAgent()
        growth_agent = GrowthAgent()

        # Step 1: Discovery (Agent 1)
        pipeline_data = discovery_agent.run(pipeline_data)
        logs.extend(discovery_agent.logs)

        # Step 2: Extraction (Agent 2)
        pipeline_data = extraction_agent.run(pipeline_data)
        logs.extend(extraction_agent.logs)

        # Step 3: Cleaning (Agent 3)
        pipeline_data = cleaning_agent.run(pipeline_data)
        logs.extend(cleaning_agent.logs)

        # Step 4: Enrichment (Agent 4)
        pipeline_data = enrichment_agent.run(pipeline_data)
        logs.extend(enrichment_agent.logs)

        # Step 5: Trust Scoring (Agent 5)
        pipeline_data = trust_agent.run(pipeline_data)
        logs.extend(trust_agent.logs)

        # Step 6: Deduplication (Agent 6)
        pipeline_data = dedup_agent.run(pipeline_data)
        logs.extend(dedup_agent.logs)

        # Step 7: Growth / Claiming (Agent 7)
        pipeline_data = growth_agent.run(pipeline_data)
        logs.extend(growth_agent.logs)

        # Log final results and push to database
        unique_records = pipeline_data.get("extracted_records", [])
        
        # In production deployment, we would run:
        # for rec in unique_records:
        #     # Insert into vendor_staging table using psycopg2/SQLAlchemy
        #     # db.execute(insert_stmt, rec)
        
        jobs_db[job_id]["records_staged"] = len(unique_records)
        jobs_db[job_id]["pages_scraped"] = len(pipeline_data.get("discovered_urls", []))
        jobs_db[job_id]["status"] = "completed"
        logs.append(f"[Pipeline] ✅ Job finished. Staged {len(unique_records)} unique records, skipped duplicates.")
        
    except Exception as e:
        logger.error(f"Job {job_id} failed: {str(e)}")
        jobs_db[job_id]["status"] = "failed"
        logs.append(f"[Pipeline] ❌ Job failed with error: {str(e)}")

@app.post("/crawl", response_model=CrawlStatusResponse)
async def trigger_crawling_pipeline(req: CrawlRequest, background_tasks: BackgroundTasks):
    job_id = str(uuid.uuid4())
    jobs_db[job_id] = {
        "job_id": job_id,
        "status": "queued",
        "pages_scraped": 0,
        "records_staged": 0,
        "logs": ["[Pipeline] 🚀 Crawl Job queued under ID: " + job_id]
    }
    
    background_tasks.add_task(
        execute_agent_pipeline,
        job_id,
        req.category,
        req.target_city,
        req.source_url
    )
    
    return jobs_db[job_id]

@app.get("/crawl/{job_id}", response_model=CrawlStatusResponse)
async def get_job_status(job_id: str):
    if job_id not in jobs_db:
        raise HTTPException(status_code=404, detail="Job ID not found")
    return jobs_db[job_id]

@app.get("/")
def read_root():
    return {"message": "EventHub AI service is online."}
