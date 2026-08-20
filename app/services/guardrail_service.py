from dataclasses import dataclass


@dataclass
class GuardrailDecision:
    action: str
    reason: str
    predicted_cost: float
    threshold: float


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