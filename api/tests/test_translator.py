import os
from api.knowledge.translator import translate_to_arabic

def test_translation_mock():
    # Test fallback behavior when no API key is present
    if "GEMINI_API_KEY" in os.environ:
        del os.environ["GEMINI_API_KEY"]
        
    text = "Article 1: La loi est..."
    result = translate_to_arabic(text)
    assert "[TRANSLATED TO ARABIC]" in result

def test_translation_real():
    # Only runs if GEMINI_API_KEY is present
    if "GEMINI_API_KEY" not in os.environ:
        return
        
    text = "Article 1: Tout le monde a le droit à la justice."
    result = translate_to_arabic(text)
    assert "المادة 1" in result or "الحق في العدالة" in result
