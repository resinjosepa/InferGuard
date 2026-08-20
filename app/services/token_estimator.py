from pydantic import BaseModel

from app.services.tokenizer_service import count_tokens
from app.core.model_registry import get_model_pricing


class TokenEstimate(BaseModel):
    input_tokens: int
    output_tokens: int
    total_tokens: int
    confidence: float


BASE_OUTPUT_TOKENS = 8


def estimate_tokens(
    prompt: str,
    workflow_type: str,
    model_name: str = "gpt-5.6",
    max_output_tokens: int | None = None,
) -> TokenEstimate:

    # 1. Estimate input tokens
    exact_input_tokens = count_tokens(
        prompt,
        model_name,
    )

    if exact_input_tokens is not None:
        input_tokens = exact_input_tokens
        confidence = 1.0
    else:
        input_tokens = max(
            1,
            round(len(prompt.split()) * 1.3),
        )
        confidence = 0.5

    # 2. Get workflow complexity multiplier
    pricing = get_model_pricing(model_name)

    if pricing is None:
        multiplier = 1.0
    else:
        multiplier = pricing.output_multipliers.get(
            workflow_type,
            1.0,
        )

    # 3. Estimate output tokens
    if max_output_tokens is not None:
        # max_output_tokens is already the user's requested
        # output budget. Never multiply it by workflow complexity.
        output_tokens = max_output_tokens
    else:
        output_tokens = round(
            BASE_OUTPUT_TOKENS * multiplier
        )

    output_tokens = max(1, output_tokens)

    return TokenEstimate(
        input_tokens=input_tokens,
        output_tokens=output_tokens,
        total_tokens=input_tokens + output_tokens,
        confidence=confidence,
    )