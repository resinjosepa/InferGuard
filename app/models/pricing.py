from pydantic import BaseModel


class ModelPricing(BaseModel):
    model_name: str
    input_price_per_1m: float
    output_price_per_1m: float


GPT_5_6_PRICING = ModelPricing(
    model_name="gpt-5.6",
    input_price_per_1m=5.0,
    output_price_per_1m=30.0,
)
