from fastapi import FastAPI
from app.models import context
from app.models.request import AnalyzeRequest
from app.services import create_context
from app.services.workflow_service import predict_workflow
from app.services.token_estimator import estimate_tokens
from app.services.llm_service import generate_response
from app.services.cost_service import calculate_cost

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

    # 1. Predict workflow
    prediction, confidence = predict_workflow(request.prompt)

    context.workflow_type = str(prediction)
    context.complexity_confidence = float(confidence)

    # 2. Predict token usage
    token_estimate = estimate_tokens(
        request.prompt,
        context.workflow_type,
        request.model,
        request.max_output_tokens,
    )

    context.estimated_input_tokens = token_estimate.input_tokens
    context.estimated_output_tokens = token_estimate.output_tokens

    estimated_cost = calculate_cost(
    token_estimate.input_tokens,
    token_estimate.output_tokens,
    request.model,
    )

    context.estimated_cost = estimated_cost

    # 3. Call the selected LLM
    response = generate_response(
        prompt=request.prompt,
        model_name=request.model,
        workflow_type=context.workflow_type,
        predicted_output_tokens=token_estimate.output_tokens,
        max_output_tokens=request.max_output_tokens,
    )

    actual_cost = calculate_cost(
        input_tokens=response.input_tokens or 0,
        output_tokens=response.output_tokens or 0,
        model_name=request.model,
        reasoning_tokens=response.reasoning_tokens or 0,
    )

    # 4. Return actual model response
    return {
        "request_id": context.request_id,
        "user_id": context.user_id,
        "prompt": context.prompt,
        "model": request.model,
        "workflow_type": context.workflow_type,
        "workflow_confidence": context.complexity_confidence,
        "predicted_input_tokens": token_estimate.input_tokens,
        "predicted_output_tokens": token_estimate.output_tokens,
        "estimated_cost": estimated_cost,
        "actual_cost": actual_cost,
        "actual_input_tokens": response.input_tokens,
        "actual_output_tokens": response.output_tokens,
        "actual_total_tokens": response.total_tokens,
        "response": response.text,
    }