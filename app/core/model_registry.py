from app.models.pricing import (
    ModelPricing,
    GPT_5_6_PRICING,
    GEMINI_3_5_FLASH_PRICING,
)


MODEL_REGISTRY: dict[str, ModelPricing] = {
    "gpt-5.6": GPT_5_6_PRICING,
    "gemini-3.5-flash": GEMINI_3_5_FLASH_PRICING,
}


def get_model_pricing(model_name: str) -> ModelPricing | None:
    return MODEL_REGISTRY.get(model_name)