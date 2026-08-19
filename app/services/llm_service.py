import os
from dataclasses import dataclass
from urllib import response

from dotenv import load_dotenv
from google import genai

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

    config = None

    if max_output_tokens is not None:
        config = {
            "max_output_tokens": max_output_tokens
        }

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
        if usage and usage.candidates_token_count is not None
        else (
            usage.total_token_count - usage.prompt_token_count
            if usage
            and usage.total_token_count is not None
            and usage.prompt_token_count is not None
            else None
        )
    )

    total_tokens = (
        usage.total_token_count
        if usage
        else None
    )

    reasoning_tokens = (
        usage.thoughts_token_count
        if usage
        else None
    )

    result = LLMResponse(
        text=response.text if response.text is not None else "",
        input_tokens=input_tokens,
        output_tokens=output_tokens,
        total_tokens=total_tokens,
        reasoning_tokens=reasoning_tokens,
    )

    log_actual_usage(
        result,
        model_name=model_name,
        workflow_type=workflow_type,
        predicted_output_tokens=predicted_output_tokens,
        max_output_tokens=max_output_tokens,
    )

    return result

    

def log_actual_usage(
    response: LLMResponse,
    model_name: str,
    workflow_type: str,
    predicted_output_tokens: int,
    max_output_tokens: int | None = None,
) -> None:
    if response.input_tokens is None or response.output_tokens is None:
        return

    record = UsageRecord(
        model=model_name,
        workflow_type=workflow_type,
        input_tokens=response.input_tokens,
        predicted_output_tokens=predicted_output_tokens,
        actual_output_tokens=response.output_tokens,
        reasoning_tokens=response.reasoning_tokens,
        max_output_tokens=max_output_tokens,
    )

    log_usage(record)