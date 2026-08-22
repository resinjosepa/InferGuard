import json
from dataclasses import dataclass
from pathlib import Path


DEFAULT_MAX_COST = 0.002

CONFIG_FILE = Path("data/guardrail_config.json")


@dataclass
class GuardrailDecision:
    action: str
    reason: str
    predicted_cost: float
    threshold: float


def _load_config() -> float:
    if not CONFIG_FILE.exists():
        return DEFAULT_MAX_COST

    try:
        with CONFIG_FILE.open("r", encoding="utf-8") as file:
            config = json.load(file)

        max_cost = float(config.get("max_cost", DEFAULT_MAX_COST))

        if max_cost <= 0:
            return DEFAULT_MAX_COST

        return max_cost

    except (OSError, ValueError, TypeError, json.JSONDecodeError):
        return DEFAULT_MAX_COST


def _save_config(max_cost: float) -> None:
    CONFIG_FILE.parent.mkdir(parents=True, exist_ok=True)

    with CONFIG_FILE.open("w", encoding="utf-8") as file:
        json.dump(
            {"max_cost": max_cost},
            file,
            indent=2,
        )


def get_max_cost() -> float:
    return _load_config()


def set_max_cost(max_cost: float) -> float:
    if max_cost <= 0:
        raise ValueError("Maximum cost must be greater than 0.")

    _save_config(max_cost)

    return max_cost


def check_cost_guardrail(
    predicted_cost: float,
    max_cost: float,
) -> GuardrailDecision:

    warning_threshold = max_cost * 0.8

    if predicted_cost > max_cost:
        return GuardrailDecision(
            action="BLOCK",
            reason="Predicted cost exceeds the configured limit.",
            predicted_cost=predicted_cost,
            threshold=max_cost,
        )

    if predicted_cost >= warning_threshold:
        return GuardrailDecision(
            action="WARN",
            reason="Predicted cost is approaching the configured limit.",
            predicted_cost=predicted_cost,
            threshold=max_cost,
        )

    return GuardrailDecision(
        action="ALLOW",
        reason="Predicted cost is within the configured limit.",
        predicted_cost=predicted_cost,
        threshold=max_cost,
    )