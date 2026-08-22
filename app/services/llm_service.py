import os
from dataclasses import dataclass

from dotenv import load_dotenv
from google import genai
from google.genai import types

from app.models.usage_record import UsageRecord
from app.services.usage_logger import log_usage


load_dotenv()


@dataclass
class LLMResponse:
    text: str
    input_tokens: int | None
    output_tokens: int | None
    total_tokens: int | None
    reasoning_tokens: int | None


_api_key = os.getenv("GEMINI_API_KEY")

if not _api_key:
    raise RuntimeError("GEMINI_API_KEY is not configured.")


_client = genai.Client(api_key=_api_key)


def generate_response(
    prompt: str,
    model_name: str = "gemini-3.5-flash",
    workflow_type: str = "simple",
    predicted_output_tokens: int = 8,
    max_output_tokens: int | None = None,
) -> LLMResponse:

    # Make sure the model has enough room for a useful visible answer.
    output_limit = max(
        max_output_tokens or 256,
        256,
    )

    config = types.GenerateContentConfig(
        max_output_tokens=output_limit,

        # InferGuard's normal requests do not need
        # heavy internal reasoning.
        thinking_config=types.ThinkingConfig(
            thinking_level="minimal"
        ),
    )

    response = _client.models.generate_content(
        model=model_name,
        contents=prompt,
        config=config,
    )

    usage = response.usage_metadata

    input_tokens = (
        usage.prompt_token_count
        if usage
        else None
    )

    output_tokens = (
        usage.candidates_token_count
        if usage
        and usage.candidates_token_count is not None
        else None
    )

    total_tokens = (
        usage.total_token_count
        if usage
        else None
    )

    reasoning_tokens = (
        usage.thoughts_token_count
        if usage
        and usage.thoughts_token_count is not None
        else None
    )

    text = response.text if response.text else ""

    # Defensive fallback in case response.text is empty.
    if not text.strip() and response.candidates:

        candidate = response.candidates[0]

        if candidate.content and candidate.content.parts:

            parts = []

            for part in candidate.content.parts:

                if getattr(part, "text", None):
                    parts.append(part.text)

            text = "".join(parts).strip()

    return LLMResponse(
        text=text,
        input_tokens=input_tokens,
        output_tokens=output_tokens,
        total_tokens=total_tokens,
        reasoning_tokens=reasoning_tokens,
    )


def log_actual_usage(
    response: LLMResponse,
    user_id: str,
    model_name: str,
    workflow_type: str,
    predicted_output_tokens: int,
    predicted_cost: float | None = None,
    actual_cost: float | None = None,
    max_output_tokens: int | None = None,
) -> None:

    if (
        response.input_tokens is None
        or response.output_tokens is None
    ):
        return

    record = UsageRecord(
        user_id=user_id,
        model=model_name,
        workflow_type=workflow_type,
        input_tokens=response.input_tokens,
        predicted_output_tokens=predicted_output_tokens,
        actual_output_tokens=response.output_tokens,
        reasoning_tokens=response.reasoning_tokens,
        predicted_cost=predicted_cost,
        actual_cost=actual_cost,
        cost_error=(
            actual_cost - predicted_cost
            if (
                actual_cost is not None
                and predicted_cost is not None
            )
            else None
        ),
        max_output_tokens=max_output_tokens,
    )

    log_usage(record)