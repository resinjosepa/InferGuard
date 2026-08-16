from datetime import datetime
from pydantic import BaseModel

class RequestContext(BaseModel):
    request_id: str
    user_id: str
    prompt: str
    timestamp: datetime

    workflow_type: str | None = None
    estimated_input_tokens: int | None = None
    estimated_output_tokens: int | None = None
    estimated_cost: float | None = None
    complexity_confidence: float | None = None
    budget_limit: float | None = None
    spent: float | None = None
    remaining_budget: float | None = None
    individual_anomaly_score: float | None = None
    cross_user_anomaly_score: float | None = None
    attack_pattern: str | None = None
    action: str | None = None
    risk_score: float | None = None
    reason: str | None = None
