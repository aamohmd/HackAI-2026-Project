import os
import time
import json
import logging
from backend.schemas import Chunk, UserProfile
from backend.agent.debate.loop import DebateLoop

logging.basicConfig(level=logging.WARNING)

# Dummy test data
TEST_CASES = [
    {
        "query": "شنو هما الشروط ديال الطلاق؟",
        "chunks": [
            Chunk(
                text="Article 78: Divorce is the dissolution of the marriage contract by the husband or wife in accordance with the conditions prescribed by law.",
                article_number="78",
                law_name="Moudawana",
                law_code="moudawana",
                domain="family_law"
            ),
            Chunk(
                text="Article 79: Whoever wishes to divorce must petition the court for permission to have it documented by two adouls (public notaries).",
                article_number="79",
                law_name="Moudawana",
                law_code="moudawana",
                domain="family_law"
            )
        ]
    },
    {
        "query": "شحال ديال العطلة عندي حق فيها فالعام؟",
        "chunks": [
            Chunk(
                text="Article 231: Every employee is entitled to paid annual leave after six months of continuous service in the same enterprise. The duration is 1.5 days per month of service.",
                article_number="231",
                law_name="Code du Travail",
                law_code="code_travail",
                domain="labour"
            )
        ]
    }
]

def run_benchmark():
    api_key = os.environ.get("GEMINI_API_KEY")
    if not api_key or api_key == "dummy_key_for_tests":
        print("❌ Error: Valid GEMINI_API_KEY is required for benchmarking.")
        print("Please set it in your .env file or run:")
        print("export GEMINI_API_KEY='your_real_key'")
        return

    print("🚀 Starting Multi-Agent Debate Loop Benchmark...")
    print("-------------------------------------------------")
    
    loop = DebateLoop()
    user = UserProfile(user_id="benchmark_user", wilaya="Rabat", literacy_score=0.5)
    
    times = []
    
    for i, test_case in enumerate(TEST_CASES):
        print(f"\nTest {i+1}: {test_case['query']}")
        
        start_time = time.time()
        
        try:
            # We must import without mocks here to hit the real Gemini endpoint
            import google.generativeai as genai
            genai.configure(api_key=api_key)
            
            result = loop.run(test_case['query'], test_case['chunks'], user)
            
            end_time = time.time()
            latency = end_time - start_time
            times.append(latency)
            
            print(f"✅ Success in {latency:.2f} seconds")
            print(f"Confidence: {result.confidence}")
            print(f"Citations: {len(result.citations)} grounded articles")
            
        except Exception as e:
            print(f"❌ Failed: {e}")
            
    if times:
        print("\n📊 Benchmark Results:")
        print(f"Total Runs: {len(times)}")
        print(f"Average Latency: {sum(times)/len(times):.2f}s")
        print(f"Min Latency: {min(times):.2f}s")
        print(f"Max Latency: {max(times):.2f}s")

if __name__ == "__main__":
    run_benchmark()
