from pydantic import BaseModel

class AnalyzeRequest(BaseModel):
    user_id: str
    prompt: str
