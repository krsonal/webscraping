# 🕸️ Web Scraping API with FastAPI

This is a Python web application that provides REST APIs for scraping websites and asking questions about the scraped content. It's built using **FastAPI** and served using **Uvicorn**.

---

## 🚀 Features

- 🔍 **Scrape API**: Extracts content from any given URL.
- 💬 **Ask API**: Allows users to ask questions based on the scraped content.
- 📘 Interactive Swagger UI for API testing.

---

## 🧰 Tech Stack

- **Python 3.10+**
- **FastAPI**
- **LangChain** (optional, for LLM-based Q&A)

---


## COMMANDS TO RUN

1. Python application 
    ```bash
    ollama run llama3.2
   pip install -r requirements.txt
   uvicorn app.main:app --host 0.0.0.0 --port 8000 --reload
   ```
2. Frontend application 
    ```bash
   npm run dev
   ```

