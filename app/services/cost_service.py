from app.core.model_registry import get_model_pricing


def calculate_cost(
    input_tokens: int,
    output_tokens: int,
    model_name: str,
    reasoning_tokens: int = 0,
) -> float:
    pricing = get_model_pricing(model_name)

    if pricing is None:
        raise ValueError(
            f"Unsupported model: {model_name}"
        )

    input_cost = (
        input_tokens / 1_000_000
    ) * pricing.input_price_per_1m

    billable_output_tokens = output_tokens + reasoning_tokens
    output_cost = (
        billable_output_tokens / 1_000_000
    ) * pricing.output_price_per_1m

    return input_cost + output_cost