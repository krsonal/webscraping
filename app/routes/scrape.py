from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from app.services.scraper import scrape_website_with_depth
from app.services.vector_store import create_pgvector_store, create_chromaVector_store
from app.store.memory import memory_store
import os
from dotenv import load_dotenv

router = APIRouter()


class ScrapeRequest(BaseModel):
    url: str


@router.post("/", status_code=200)
def scrape_url(req: ScrapeRequest):
    try:
        text = scrape_website_with_depth(req.url, depth=int(os.getenv("SCRAPING_DEPTH")))
        vectordb = create_pgvector_store(text)
        # vectordb = create_chromaVector_store(text)
        memory_store["vectordb"] = vectordb
        return {"message": "Scraping and vector creation successful"}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
