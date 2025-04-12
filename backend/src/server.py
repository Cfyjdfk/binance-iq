from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from binance_rag import BinanceRAG
import os
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

# Initialize FastAPI app
app = FastAPI()

# Add CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Allows all origins
    allow_credentials=True,
    allow_methods=["*"],  # Allows all methods
    allow_headers=["*"],  # Allows all headers
)

# Initialize RAG system
rag = BinanceRAG()

# Load documents and create embeddings
print("Loading documents...")
rag.load_documents()
print("Creating embeddings...")
rag.create_embeddings()

class Question(BaseModel):
    message: str

@app.post("/chat")
async def chat(question: Question):
    try:
        # Get answer from RAG system
        answer = rag.answer_question(question.message)
        return {"response": answer}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000) 