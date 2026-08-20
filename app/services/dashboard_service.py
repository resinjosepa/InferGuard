import json
from pathlib import Path


DATA_FILE = Path("data/output_token_usage.jsonl")


def get_dashboard_stats() -> dict:
    records = []

    if DATA_FILE.exists():
        with DATA_FILE.open("r", encoding="utf-8") as file:
            for line in file:
                line = line.strip()

                if not line:
                    continue

                try:
                    records.append(json.loads(line))
                except json.JSONDecodeError:
                    continue

    total_requests = len(records)

    estimated_cost = sum(
        record.get("predicted_cost", 0) or 0
        for record in records
    )

    actual_cost = sum(
        record.get("actual_cost", 0) or 0
        for record in records
    )

    workflow_distribution = {}

    for record in records:
        workflow = record.get("workflow_type", "unknown")
        workflow_distribution[workflow] = (
            workflow_distribution.get(workflow, 0) + 1
        )

    recent_requests = records[-10:]
    recent_requests.reverse()

    return {
        "total_requests": total_requests,
        "estimated_cost": estimated_cost,
        "actual_cost": actual_cost,
        "cost_variance": actual_cost - estimated_cost,
        "workflow_distribution": workflow_distribution,
        "recent_requests": recent_requests,
    }