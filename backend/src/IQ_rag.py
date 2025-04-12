import os
from typing import List, Dict
import openai
from dotenv import load_dotenv
import numpy as np
from pathlib import Path

# Load environment variables
load_dotenv()

# Initialize OpenAI client
openai.api_key = os.getenv("OPENAI_API_KEY")

class IQRAG:
    def __init__(self):
        self.documents = []
        self.embeddings = []
        
    def load_documents(self):
        """Load and process the Binance-related documents"""
        data_dir = Path("data")
        for file in data_dir.glob("*.txt"):
            with open(file, "r", encoding="utf-8") as f:
                content = f.read()
                self.documents.append(content)
    
    def create_embeddings(self):
        """Create embeddings for the documents"""
        for doc in self.documents:
            response = openai.embeddings.create(
                model="text-embedding-3-small",
                input=doc
            )
            self.embeddings.append(response.data[0].embedding)
    
    def find_relevant_context(self, query: str, top_k: int = 3) -> List[str]:
        """Find the most relevant context for a query"""
        # Create embedding for the query
        query_embedding = openai.embeddings.create(
            model="text-embedding-3-small",
            input=query
        ).data[0].embedding
        
        # Calculate cosine similarity
        similarities = []
        for embedding in self.embeddings:
            similarity = np.dot(query_embedding, embedding) / (
                np.linalg.norm(query_embedding) * np.linalg.norm(embedding)
            )
            similarities.append(similarity)
        
        # Get top k most similar documents
        top_indices = np.argsort(similarities)[-top_k:][::-1]
        return [self.documents[i] for i in top_indices]
    
    def answer_question(self, question: str) -> str:
        """Answer a question about Binance using RAG"""
        # Find relevant context
        context = self.find_relevant_context(question)
        
        # Create the prompt
        prompt = f"""Based on the following context about Binance, please answer the question in exactly two simple, friendly sentences that a new user can easily understand.
        
Context:
{context}

Question: {question}

Please provide a clear, concise answer in exactly two sentences."""

        # Get answer from GPT
        response = openai.chat.completions.create(
            model="gpt-3.5-turbo",
            messages=[
                {"role": "system", "content": "You are a friendly Binance expert who explains crypto concepts in simple, easy-to-understand terms for beginners."},
                {"role": "user", "content": prompt}
            ],
            temperature=0.7,
            max_tokens=150
        )
        
        return response.choices[0].message.content

def main():
    # Initialize the RAG system
    rag = IQRAG()
    
    # Load and process documents
    print("Loading documents...")
    rag.load_documents()
    
    # Create embeddings
    print("Creating embeddings...")
    rag.create_embeddings()
    
    # Example question
    question = "What is WCT?"
    
    # Get answer
    print("\nQuestion:", question)
    answer = rag.answer_question(question)
    print("\nAnswer:", answer)

if __name__ == "__main__":
    main() 