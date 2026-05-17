import os
import unittest
import google.generativeai as genai
from backend.tools import ANSWER_TOOL, SCORE_CLAIMS_TOOL, SYNTHESIS_TOOL

class TestToolSchemas(unittest.TestCase):
    @classmethod
    def setUpClass(cls):
        api_key = os.environ.get("GEMINI_API_KEY")
        if not api_key or api_key == "dummy_key_for_tests":
            raise unittest.SkipTest("Skipping real API tests. Please provide GEMINI_API_KEY.")
        genai.configure(api_key=api_key)
        cls.model = genai.GenerativeModel("gemini-2.0-flash")

    def test_primary_tool_compliance(self):
        """Test that Gemini always uses the submit_legal_answer tool and not free text."""
        response = self.model.generate_content(
            contents=[{"role": "user", "parts": ["شنو هي شروط الزواج؟"]}],
            tools=[{"function_declarations": [ANSWER_TOOL]}],
            tool_config={"function_calling_config": {"mode": "ANY"}}
        )
        
        # Verify it called a function
        self.assertTrue(response.candidates[0].content.parts[0].function_call)
        
        # Verify it called the correct function
        call = response.candidates[0].content.parts[0].function_call
        self.assertEqual(call.name, "submit_legal_answer")
        
        # Verify required args are present
        args = dict(call.args)
        self.assertIn("answer_darija", args)
        self.assertIn("citations", args)
        self.assertIn("confidence", args)
        self.assertIn("recommend_lawyer", args)

    def test_devil_tool_compliance(self):
        """Test that Gemini always uses the score_claims tool."""
        response = self.model.generate_content(
            contents=[{"role": "user", "parts": ["Score these claims based on the text."]}],
            tools=[{"function_declarations": [SCORE_CLAIMS_TOOL]}],
            tool_config={"function_calling_config": {"mode": "ANY"}}
        )
        
        call = response.candidates[0].content.parts[0].function_call
        self.assertEqual(call.name, "score_claims")
        self.assertIn("scores", dict(call.args))

    def test_synthesis_tool_compliance(self):
        """Test that Gemini always uses the submit_synthesis tool."""
        response = self.model.generate_content(
            contents=[{"role": "user", "parts": ["Synthesize this answer."]}],
            tools=[{"function_declarations": [SYNTHESIS_TOOL]}],
            tool_config={"function_calling_config": {"mode": "ANY"}}
        )
        
        call = response.candidates[0].content.parts[0].function_call
        self.assertEqual(call.name, "submit_synthesis")
        args = dict(call.args)
        self.assertIn("answer_darija", args)
        self.assertIn("citations", args)
        self.assertIn("confidence", args)
        self.assertIn("recommend_lawyer", args)

if __name__ == "__main__":
    unittest.main()
