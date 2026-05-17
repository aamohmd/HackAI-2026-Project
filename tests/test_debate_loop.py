import os
import unittest
from unittest.mock import patch, MagicMock

from backend.schemas import Chunk, UserProfile, FinalAnswer
from backend.agent.debate.loop import DebateLoop
from backend.agent.debate.primary import call_primary_agent

class TestDebateLoop(unittest.TestCase):
    def setUp(self):
        self.dummy_transcript = "شنو هما الشروط ديال الطلاق؟"
        self.dummy_user = UserProfile(user_id="test_user", wilaya="Casablanca", literacy_score=0.8)
        self.dummy_chunks = [
            Chunk(
                text="Article 78: Divorce is the dissolution of the marriage...",
                article_number="78",
                law_name="Moudawana",
                law_code="moudawana",
                domain="family_law"
            )
        ]

    @patch('backend.agent.debate.loop.call_synthesis_agent')
    @patch('backend.agent.debate.loop.call_devils_advocate')
    @patch('backend.agent.debate.loop.call_primary_agent')
    def test_loop_execution_order(self, mock_primary, mock_devil, mock_synthesis):
        # Setup mocks
        mock_primary.return_value = MagicMock(answer_darija="Mock primary answer")
        mock_devil.return_value = MagicMock()
        mock_synthesis.return_value = FinalAnswer(
            answer_darija="Final synthesized answer",
            citations=[],
            confidence=0.9,
            recommend_lawyer=False
        )

        loop = DebateLoop()
        result = loop.run(self.dummy_transcript, self.dummy_chunks, self.dummy_user)

        # Asserts
        mock_primary.assert_called_once()
        mock_devil.assert_called_once()
        mock_synthesis.assert_called_once()
        
        self.assertEqual(result.answer_darija, "Final synthesized answer")
        self.assertEqual(result.confidence, 0.9)

if __name__ == '__main__':
    unittest.main()
