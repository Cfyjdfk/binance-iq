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

class BinanceRAG:
    def __init__(self):
        self.documents = []
        self.embeddings = []
        self.data_dir = Path(__file__).parent.parent / "data"
        
    def load_documents(self):
        """Load and process all text files from the data directory"""
        print(f"Loading documents from {self.data_dir}")
        for file in self.data_dir.glob("*.txt"):
            print(f"Processing {file.name}")
            with open(file, "r", encoding="utf-8") as f:
                content = f.read()
                self.documents.append({
                    "content": content,
                    "source": file.name
                })
        print(f"Loaded {len(self.documents)} documents")
    
    def create_embeddings(self):
        """Create embeddings for the documents"""
        print("Creating embeddings...")
        for doc in self.documents:
            response = openai.embeddings.create(
                model="text-embedding-3-small",
                input=doc["content"]
            )
            doc["embedding"] = response.data[0].embedding
        print("Embeddings created successfully")
    
    def find_relevant_context(self, query: str, top_k: int = 3) -> List[Dict]:
        """Find the most relevant context for a query"""
        # Create embedding for the query
        query_embedding = openai.embeddings.create(
            model="text-embedding-3-small",
            input=query
        ).data[0].embedding
        
        # Calculate cosine similarity
        similarities = []
        for doc in self.documents:
            similarity = np.dot(query_embedding, doc["embedding"]) / (
                np.linalg.norm(query_embedding) * np.linalg.norm(doc["embedding"])
            )
            similarities.append(similarity)
        
        # Get top k most similar documents
        top_indices = np.argsort(similarities)[-top_k:][::-1]
        return [self.documents[i] for i in top_indices]
    
    def is_binance_related(self, question: str) -> bool:
        """Check if the question is related to Binance or cryptocurrency"""
        binance_keywords = [
            "binance", "crypto", "bitcoin", "ethereum", "blockchain",
            "wallet", "trading", "exchange", "token", "coin", "defi",
            "staking", "launchpool", "bnb", "wct", "fdusd", "usdc"
        ]
        
        question_lower = question.lower()
        return any(keyword in question_lower for keyword in binance_keywords)
    
    def get_gpt_response(self, question: str) -> str:
        """Get a direct response from GPT for non-Binance questions"""
        response = openai.chat.completions.create(
            model="gpt-3.5-turbo",
            messages=[
                {"role": "system", "content": "You are a helpful assistant that provides clear and accurate answers to any question."},
                {"role": "user", "content": question}
            ],
            temperature=0.7,
            max_tokens=300
        )
        return response.choices[0].message.content
    
    def answer_question(self, question: str) -> str:
        """Answer a question using RAG for Binance topics or direct GPT for other topics"""
        # Check if the question is related to Binance
        if not self.is_binance_related(question):
            return self.get_gpt_response(question)
        
        # Find relevant context
        relevant_docs = self.find_relevant_context(question)
        
        # Format context with sources
        context_str = "\n\n".join([
            f"From {doc['source']}:\n{doc['content']}"
            for doc in relevant_docs
        ])
        
        # Create the prompt
        prompt = f"""You are a Binance expert assistant. Based on the following context about Binance, please answer the question in exactly two simple, friendly sentences that a new user can easily understand.
        
Context:
{context_str}

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
        
        answer = response.choices[0].message.content
        
        return answer

def main():
    # Initialize the RAG system
    rag = BinanceRAG()
    
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