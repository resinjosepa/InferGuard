import tiktoken


MODEL_ENCODING_REGISTRY = {
    "gpt-5.6": "o200k_base",
}

_encoders = {}


def get_tokenizer(model_name: str):
    encoding_name = MODEL_ENCODING_REGISTRY.get(model_name)

    if encoding_name is None:
        return None

    if model_name in _encoders:
        return _encoders[model_name]

    try:
        tokenizer = tiktoken.get_encoding(encoding_name)
        _encoders[model_name] = tokenizer
        return tokenizer
    except Exception:
        return None


def count_tokens(
    text: str,
    model_name: str,
) -> int | None:
    tokenizer = get_tokenizer(model_name)

    if tokenizer is None:
        return None

    return len(tokenizer.encode(text))