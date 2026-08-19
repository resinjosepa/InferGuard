from pydantic import BaseModel


class UsageRecord(BaseModel):
    model: str
    workflow_type: str
    input_tokens: int
    predicted_output_tokens: int
    actual_output_tokens: int
    reasoning_tokens: int | None = None
    max_output_tokens: int | None = None