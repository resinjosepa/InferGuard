import json
from pathlib import Path


DATA_FILE = Path("data/output_token_usage.jsonl")


def _load_records() -> list[dict]:
    records = []

    if not DATA_FILE.exists():
        return records

    with DATA_FILE.open(
        "r",
        encoding="utf-8",
    ) as file:
        for line in file:
            line = line.strip()

            if not line:
                continue

            try:
                records.append(
                    json.loads(line)
                )
            except json.JSONDecodeError:
                continue

    return records


def get_dashboard_stats() -> dict:
    records = _load_records()

    total_requests = len(records)

    estimated_cost = sum(
        record.get(
            "predicted_cost",
            0,
        )
        or 0
        for record in records
    )

    actual_cost = sum(
        record.get(
            "actual_cost",
            0,
        )
        or 0
        for record in records
    )

    workflow_distribution = {}

    for record in records:
        workflow = record.get(
            "workflow_type",
            "unknown",
        )

        workflow_distribution[
            workflow
        ] = (
            workflow_distribution.get(
                workflow,
                0,
            )
            + 1
        )

    # Newest first.
    newest_first = list(
        reversed(records)
    )

    return {
        "total_requests": total_requests,
        "estimated_cost": estimated_cost,
        "actual_cost": actual_cost,
        "cost_variance": (
            actual_cost -
            estimated_cost
        ),
        "workflow_distribution":
            workflow_distribution,

        # Overview only needs a small list.
        "recent_requests":
            newest_first[:5],

        # Requests page gets everything.
        "all_requests":
            newest_first,
    }