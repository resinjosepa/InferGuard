from fastapi import FastAPI
from app.models.request import AnalyzeRequest
from app.services import create_context
from app.services.workflow_service import predict_workflow

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
    context = create_context(request)
    prediction, confidence = predict_workflow(request.prompt)
    
    # Ensure any NumPy strings are converted to Python standard string representation
    context.workflow_type = str(prediction)
    context.complexity_confidence = float(confidence)
    
    return context
