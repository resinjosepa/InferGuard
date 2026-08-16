from fastapi import FastAPI
from app.models.request import AnalyzeRequest
from app.services import create_context

app = FastAPI(
    title="InferGuard",
    description="Guardrails and cost protection for LLM inference APIs.",
    version="0.1.0",
)


@app.get("/")
def read_root():
    return {
        "message": "Welcome to InferGuard API",
        "status": "healthy"
    }


@app.post("/analyze")
def analyze(request: AnalyzeRequest):
    return create_context(request)
