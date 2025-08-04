from fastapi import FastAPI
from app.routes import scrape, ask
from fastapi.middleware.cors import CORSMiddleware

app = FastAPI(title="Website Scraper API")

# Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(scrape.router, prefix="/api/v1/scrape", tags=["Scrape"])
app.include_router(ask.router, prefix="/api/v1/ask", tags=["Ask"])
