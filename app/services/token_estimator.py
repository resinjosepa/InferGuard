from dataclasses import dataclass

# Approximate tokens per word.
# This is intentionally conservative rather than pretending
# that word count equals exact tokenizer output.
TOKENS_PER_WORD = 1.3

# Expected output-token multipliers by workflow.
# These are initial heuristics and will be calibrated later
# using real execution data.
WORKFLOW_OUTPUT_MULTIPLIERS = {
    "simple": 1.0,
    "rag": 2.5,
    "multi_hop": 4.0,
    "agentic": 6.0,
    "open_ended": 8.0,
}

@dataclass
class TokenEstimate:
    input_tokens: int
    output_tokens: int
    total_tokens: int

def estimate_tokens(
    prompt: str,
    workflow_type: str,
) -> TokenEstimate:
    word_count = len(prompt.split())

    input_tokens = max(
        1,
        round(word_count * TOKENS_PER_WORD),
    )

    multiplier = WORKFLOW_OUTPUT_MULTIPLIERS.get(
        workflow_type,
        2.0,
    )

    output_tokens = max(
        1,
        round(input_tokens * multiplier),
    )

    total_tokens = input_tokens + output_tokens

    return TokenEstimate(
        input_tokens=input_tokens,
        output_tokens=output_tokens,
        total_tokens=total_tokens,
    )