from pydantic import BaseModel


class AnalyzeRequest(BaseModel):
    user_id: str
    prompt: str
    model: str = "gpt-5.6"
    max_output_tokens: int | None = None