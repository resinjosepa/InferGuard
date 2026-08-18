from app.models.pricing import ModelPricing


MODEL_REGISTRY: dict[str, ModelPricing] = {
    "gpt-5.6": ModelPricing(
        model_name="gpt-5.6",
        input_price_per_1m=5.0,
        output_price_per_1m=30.0,
    ),
}


def get_model_pricing(model_name: str) -> ModelPricing | None:
    return MODEL_REGISTRY.get(model_name)