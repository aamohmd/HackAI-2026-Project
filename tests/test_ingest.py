from backend.knowledge.ingest import split_into_articles

def test_split_into_articles():
    raw_text = "المادة 1: نص المادة الأولى.\nالمادة 2: نص المادة الثانية."
    chunks = split_into_articles(raw_text, "مدونة الأسرة", "moudawana", "family_law")
    
    assert len(chunks) == 2
    assert chunks[0].article_number == "1"
    assert "نص المادة الأولى" in chunks[0].text
    assert chunks[1].article_number == "2"
    assert "نص المادة الثانية" in chunks[1].text

def test_split_into_articles_french():
    raw_text = "Article 1: Le texte du premier article.\nArticle 2 - Le texte du second."
    chunks = split_into_articles(raw_text, "Code du Travail", "labour_code", "labour_law")
    
    assert len(chunks) == 2
    assert chunks[0].article_number == "1"
    assert "Le texte du premier article" in chunks[0].text
