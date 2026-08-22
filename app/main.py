from fastapi import FastAPI
from pydantic import BaseModel
from fastapi.middleware.cors import CORSMiddleware
from app.models import context
from app.models.request import AnalyzeRequest
from app.services import create_context
from app.services.workflow_service import predict_workflow
from app.services.token_estimator import estimate_tokens
from app.services.llm_service import generate_response
from app.services.llm_service import log_actual_usage
from app.services.cost_service import calculate_cost
from app.services.dashboard_service import get_dashboard_stats
from app.services.guardrail_service import (
    check_cost_guardrail,
    get_max_cost,
    set_max_cost,
)

class GuardrailConfig(BaseModel):
    max_cost: float

app = FastAPI(
    title="InferGuard",
    description="Guardrails and cost protection for LLM inference APIs.",
    version="0.1.0",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/")
def read_root():
    return {
        "message": "Welcome to InferGuard API",
        "status": "healthy"
    }

@app.get("/dashboard/stats")
def dashboard_stats():
    return get_dashboard_stats()

@app.get("/guardrails/config")
def get_guardrail_config():
    max_cost = get_max_cost()

    return {
        "max_cost": max_cost,
        "warning_threshold": max_cost * 0.8,
    }


@app.put("/guardrails/config")
def update_guardrail_config(config: GuardrailConfig):
    max_cost = set_max_cost(config.max_cost)

    return {
        "max_cost": max_cost,
        "warning_threshold": max_cost * 0.8,
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

    # 3. Apply cost guardrail
    max_cost = get_max_cost()

    guardrail = check_cost_guardrail(
        predicted_cost=estimated_cost,
        max_cost=max_cost,
    )

    if guardrail.action == "BLOCK":
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
            "guardrail_action": guardrail.action,
            "guardrail_reason": guardrail.reason,
            "guardrail_threshold": guardrail.threshold,
            "blocked": True,
            "response": None,
        }

    # 4. Call the selected LLM
    try:
        response = generate_response(
            prompt=request.prompt,
            model_name=request.model,
            workflow_type=context.workflow_type,
            predicted_output_tokens=token_estimate.output_tokens,
            max_output_tokens=request.max_output_tokens,
        )

    except RuntimeError as exc:
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
            "actual_cost": None,
            "cost_error": None,
            "actual_input_tokens": None,
            "actual_output_tokens": None,
            "actual_reasoning_tokens": None,
            "actual_total_tokens": None,
            "response": None,
            "guardrail_action": guardrail.action,
            "guardrail_reason": guardrail.reason,
            "guardrail_threshold": guardrail.threshold,
            "blocked": False,
            "inference_error": str(exc),
        }

    actual_cost = calculate_cost(
        input_tokens=response.input_tokens or 0,
        output_tokens=response.output_tokens or 0,
        model_name=request.model,
        reasoning_tokens=response.reasoning_tokens or 0,
    )

    cost_error = actual_cost - estimated_cost

    log_actual_usage(
        response,
        user_id=request.user_id,
        model_name=request.model,
        workflow_type=context.workflow_type,
        predicted_output_tokens=token_estimate.output_tokens,
        predicted_cost=estimated_cost,
        actual_cost=actual_cost,
        max_output_tokens=request.max_output_tokens,
    )

    # 5. Return actual model response
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
        "cost_error": cost_error,
        "actual_input_tokens": response.input_tokens,
        "actual_output_tokens": response.output_tokens,
        "actual_reasoning_tokens": response.reasoning_tokens,
        "actual_total_tokens": response.total_tokens,
        "response": response.text,
        "guardrail_action": guardrail.action,
        "guardrail_reason": guardrail.reason,
        "guardrail_threshold": guardrail.threshold,
        "blocked": False,
    }