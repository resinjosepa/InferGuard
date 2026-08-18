from pydantic import BaseModel

from app.services.tokenizer_service import count_tokens


class TokenEstimate(BaseModel):
    input_tokens: int
    output_tokens: int
    total_tokens: int
    confidence: float


def estimate_tokens(
    prompt: str,
    workflow_type: str,
    model_name: str = "gpt-5.6",
    max_output_tokens: int | None = None,
) -> TokenEstimate:

    exact_input_tokens = count_tokens(
        prompt,
        model_name,
    )

    if exact_input_tokens is not None:
        input_tokens = exact_input_tokens
        confidence = 1.0
    else:
        # Fallback approximation when the
        # model tokenizer is unavailable.
        input_tokens = max(
            1,
            round(len(prompt.split()) * 1.3),
        )
        confidence = 0.5

    output_estimates = {
        "simple": 8,
        "rag": 40,
        "multi_hop": 80,
        "agentic": 120,
        "open_ended": 100,
    }

    output_tokens = output_estimates.get(
        workflow_type,
        50,
    )

    if max_output_tokens is not None:
        output_tokens = min(
            output_tokens,
            max_output_tokens,
        )

    return TokenEstimate(
        input_tokens=input_tokens,
        output_tokens=output_tokens,
        total_tokens=input_tokens + output_tokens,
        confidence=confidence,
    )