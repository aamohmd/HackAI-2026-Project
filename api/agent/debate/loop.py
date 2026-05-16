import logging
from api.schemas import FinalAnswer, Chunk, UserProfile
from api.agent.debate.primary import call_primary_agent
from api.agent.debate.devil import call_devils_advocate
from api.agent.debate.synthesis import call_synthesis_agent

logger = logging.getLogger(__name__)

class DebateLoop:
    def __init__(self, max_retries: int = 2):
        self.max_retries = max_retries

    def run(self, transcript: str, chunks: list[Chunk], user: UserProfile) -> FinalAnswer:
        # Step 1: Primary Agent drafts the answer
        logger.info("Running Primary Agent")
        primary = self._execute_with_retry(
            func=call_primary_agent,
            transcript=transcript,
            chunks=chunks,
            literacy_score=user.literacy_score
        )
        
        # Step 2: Devil's Advocate scores the claims
        logger.info("Running Devil's Advocate")
        scores = self._execute_with_retry(
            func=call_devils_advocate,
            answer=primary.answer_darija,
            chunks=chunks
        )
        
        # Step 3: Synthesis Agent finalizes the answer
        logger.info("Running Synthesis Agent")
        final = self._execute_with_retry(
            func=call_synthesis_agent,
            primary=primary,
            scores=scores
        )
        
        return final

    def _execute_with_retry(self, func, **kwargs):
        last_exception = None
        for attempt in range(self.max_retries):
            try:
                return func(**kwargs)
            except Exception as e:
                logger.warning(f"Attempt {attempt + 1} failed for {func.__name__}: {e}")
                last_exception = e
        logger.error(f"Failed to execute {func.__name__} after {self.max_retries} attempts")
        raise last_exception
