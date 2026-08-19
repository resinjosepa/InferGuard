import json
from pathlib import Path

from app.models.usage_record import UsageRecord


DATA_FILE = Path("data/output_token_usage.jsonl")


def log_usage(record: UsageRecord) -> None:
    DATA_FILE.parent.mkdir(parents=True, exist_ok=True)

    with DATA_FILE.open("a", encoding="utf-8") as file:
        file.write(
            json.dumps(record.model_dump())
            + "\n"
        )