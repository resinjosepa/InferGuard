from pydantic import BaseModel

class WorkloadFeatures(BaseModel):
    prompt_length: int
    sentence_count: int
    question_count: int
    instruction_count: int
    enumeration_count: int
    research_signal: int
    retrieval_signal: int
    comparison_signal: int
    tool_signal: int
    iteration_signal: int
    generation_signal: int
