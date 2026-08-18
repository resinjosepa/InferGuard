from app.core.model_registry import get_model_pricing


def calculate_cost(
    input_tokens: int,
    output_tokens: int,
    model_name: str,
) -> float:
    pricing = get_model_pricing(model_name)

    if pricing is None:
        raise ValueError(
            f"Unsupported model: {model_name}"
        )

    input_cost = (
        input_tokens / 1_000_000
    ) * pricing.input_price_per_1m

    output_cost = (
        output_tokens / 1_000_000
    ) * pricing.output_price_per_1m

    return input_cost + output_cost