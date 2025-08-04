from langchain.text_splitter import RecursiveCharacterTextSplitter
from langchain_ollama import OllamaEmbeddings
from langchain.docstore.document import Document
from langchain_community.vectorstores.pgvector import PGVector, DistanceStrategy
from langchain_community.vectorstores import Chroma
import os
from dotenv import load_dotenv

load_dotenv()

splitter = RecursiveCharacterTextSplitter(
        chunk_size=int(os.getenv("CHUNK_SIZE")),
        chunk_overlap=int(os.getenv("CHUNK_OVERLAP")),
        separators=["\n\n", "\n", ".", "!", "?", ",", " ", ""])


def create_pgvector_store(text):
    chunks = splitter.split_text(text)
    docs = [Document(page_content=chunk) for chunk in chunks]
    embeddings = OllamaEmbeddings(model=os.getenv("EMBEDDING_MODEL"))
    connection_string = os.getenv("PGVECTOR_DB")
    return PGVector.from_documents(
        documents=docs,
        embedding=embeddings,
        collection_name=os.getenv("COLLECTION_NAME"),
        connection_string=connection_string,
        distance_strategy=DistanceStrategy.COSINE,
    )


def create_chromaVector_store(text):
    chunks = splitter.split_text(text)
    embeddings = OllamaEmbeddings(model=os.getenv("EMBEDDING_MODEL"))  # dimension 1024
    vectordb = Chroma.from_texts(chunks, embedding=embeddings)
    return vectordb
