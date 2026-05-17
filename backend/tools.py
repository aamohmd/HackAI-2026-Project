# GPT-4o-mini tool schemas for structured output

ANSWER_TOOL = {
    "name": "submit_legal_answer",
    "description": "Submit a grounded legal answer in Moroccan Darija. You must call this function. Do not produce free text.",
    "parameters": {
        "type": "object",
        "properties": {
            "answer_darija": {
                "type": "string",
                "description": "الجواب الكامل بالدارجة المغربية. ما تستعملش الفصحى الصعبة."
            },
            "citations": {
                "type": "array",
                "items": {
                    "type": "object",
                    "properties": {
                        "article_number":  {"type": "string"},
                        "law_name":        {"type": "string"},
                        "law_code":        {"type": "string"},
                        "claim_supported": {
                            "type": "string",
                            "description": "The specific claim in the answer this article supports"
                        }
                    },
                    "required": ["article_number", "law_name", "claim_supported"]
                }
            },
            "confidence":       {"type": "number"},
            "recommend_lawyer": {"type": "boolean"},
            "answer_register":  {"type": "string", "enum": ["simple", "standard", "technical"]}
        },
        "required": ["answer_darija", "citations", "confidence", "recommend_lawyer"]
    }
}

SCORE_CLAIMS_TOOL = {
    "name": "score_claims",
    "description": "Score claims from the primary answer based on provided chunks.",
    "parameters": {
        "type": "object",
        "properties": {
            "scores": {
                "type": "array",
                "items": {
                    "type": "object",
                    "properties": {
                        "claim": {"type": "string", "description": "The factual claim being evaluated"},
                        "score": {"type": "string", "enum": ["grounded", "hedged", "not_in_context"]}
                    },
                    "required": ["claim", "score"]
                }
            }
        },
        "required": ["scores"]
    }
}

SYNTHESIS_TOOL = {
    "name": "submit_synthesis",
    "description": "Submit the final synthesized legal answer.",
    "parameters": {
        "type": "object",
        "properties": {
            "answer_darija": {
                "type": "string",
                "description": "الجواب النهائي المعدل بالدارجة المغربية. ما تستعملش الفصحى الصعبة."
            },
            "citations": {
                "type": "array",
                "items": {
                    "type": "object",
                    "properties": {
                        "article_number":  {"type": "string"},
                        "law_name":        {"type": "string"},
                        "law_code":        {"type": "string"},
                        "claim_supported": {"type": "string"}
                    },
                    "required": ["article_number", "law_name", "claim_supported"]
                }
            },
            "confidence":       {"type": "number", "description": "Computed confidence score"},
            "recommend_lawyer": {"type": "boolean"}
        },
        "required": ["answer_darija", "citations", "confidence", "recommend_lawyer"]
    }
}
