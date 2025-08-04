from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from app.services.qa import build_qa_chain
from app.store.memory import memory_store
from langchain_ollama import OllamaEmbeddings
from langchain_community.vectorstores.pgvector import PGVector, DistanceStrategy
import os
from dotenv import load_dotenv
from app.services.intent import detect_intent


load_dotenv()

router = APIRouter()


class AskRequest(BaseModel):
    question: str


@router.post("/", status_code=200)
def ask_question(req: AskRequest):
    # Intent detection
    intent = detect_intent(req.question)

    # Load vector store
    vectordb = memory_store.get("vectordb")
    if not vectordb:
        try:
            embeddings = OllamaEmbeddings(model=os.getenv("EMBEDDING_MODEL"))
            vectordb = PGVector.from_existing_index(
                embedding=embeddings,
                collection_name=os.getenv("COLLECTION_NAME"),
                connection_string=os.getenv("PGVECTOR_DB"),
                distance_strategy=DistanceStrategy.COSINE,
            )
            memory_store["vectordb"] = vectordb
        except Exception:
            raise HTTPException(status_code=400, detail="No scraped website found and no persisted vector data.")

    # QA retrieval
    try:
        qa_chain = build_qa_chain(vectordb)
        result = qa_chain.invoke({
            "query": req.question})
        return {
            "intent": intent,
            "answer": result["result"]
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
