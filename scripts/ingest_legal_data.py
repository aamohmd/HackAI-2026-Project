import os
import sys
import argparse
from typing import List

# Add the project root to sys.path to import api
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from api.knowledge.ingest import split_into_articles
from api.knowledge.retriever import HybridRetriever
from api.knowledge.translator import translate_to_arabic
from api.knowledge.types import Chunk

def main():
    parser = argparse.ArgumentParser(description="Ingest legal text into Mizan Knowledge Base")
    parser.add_argument("--file", required=True, help="Path to the raw text file")
    parser.add_argument("--law-name", required=True, help="Official name of the law")
    parser.add_argument("--law-code", required=True, help="Short code for the law (e.g., moudawana)")
    parser.add_argument("--domain", required=True, help="Legal domain (e.g., family_law)")
    parser.add_argument("--translate", action="store_true", help="Translate text to Arabic if it's in French")
    
    args = parser.parse_args()
    
    if not os.path.exists(args.file):
        print(f"Error: File {args.file} not found.")
        return

    with open(args.file, "r", encoding="utf-8") as f:
        content = f.read()

    if args.translate:
        print(f"Translating {args.law_name} to Arabic...")
        content = translate_to_arabic(content)

    print(f"Chunking {args.law_name} into articles...")
    chunks = split_into_articles(content, args.law_name, args.law_code, args.domain)
    
    print(f"Found {len(chunks)} articles. Indexing into Hybrid Retriever...")
    
    # We initialize the retriever with the list of domains we care about
    # For now just the current one
    retriever = HybridRetriever(domains=[args.domain])
    retriever.index_chunks(args.domain, chunks)
    
    print(f"Successfully ingested {len(chunks)} articles into {args.domain} collection.")

if __name__ == "__main__":
    main()
