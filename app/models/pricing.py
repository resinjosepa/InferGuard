from pydantic import BaseModel


class ModelPricing(BaseModel):
    model_name: str
    input_price_per_1m: float
    output_price_per_1m: float

    output_multipliers: dict[str, float] = {}


GPT_5_6_PRICING = ModelPricing(
    model_name="gpt-5.6",
    input_price_per_1m=5.0,
    output_price_per_1m=30.0,
    output_multipliers={
        "simple": 1.0,
        "rag": 5.0,
        "multi_hop": 10.0,
        "agentic": 15.0,
        "open_ended": 12.5,
    },
)


GEMINI_3_5_FLASH_PRICING = ModelPricing(
    model_name="gemini-3.5-flash",
    input_price_per_1m=1.50,
    output_price_per_1m=9.00,
    output_multipliers={
        "simple": 1.0,
        "rag": 5.0,
        "multi_hop": 10.0,
        "agentic": 15.0,
        "open_ended": 12.5,
    },
)