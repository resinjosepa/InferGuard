from dataclasses import dataclass


DEFAULT_MAX_COST = 0.002

_max_cost = DEFAULT_MAX_COST


@dataclass
class GuardrailDecision:
    action: str
    reason: str
    predicted_cost: float
    threshold: float


def get_max_cost() -> float:
    return _max_cost


def set_max_cost(max_cost: float) -> float:
    global _max_cost

    if max_cost <= 0:
        raise ValueError("Maximum cost must be greater than 0.")

    _max_cost = max_cost

    return _max_cost


def check_cost_guardrail(
    predicted_cost: float,
    max_cost: float,
) -> GuardrailDecision:

    if predicted_cost > max_cost:
        return GuardrailDecision(
            action="BLOCK",
            reason="Predicted cost exceeds the configured limit.",
            predicted_cost=predicted_cost,
            threshold=max_cost,
        )

    warning_threshold = max_cost * 0.8

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