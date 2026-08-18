from app.models.pricing import ModelPricing

def calculate_cost(
    input_tokens: int,
    output_tokens: int,
    pricing: ModelPricing,
) -> float:
    input_cost = (
        input_tokens / 1_000_000
    ) * pricing.input_price_per_1m

    output_cost = (
        output_tokens / 1_000_000
    ) * pricing.output_price_per_1m

    return input_cost + output_cost