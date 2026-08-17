import os
import sys

sys.path.append(
    os.path.abspath(
        os.path.join(os.path.dirname(__file__), "..")
    )
)
import joblib

from app.services.embedding_service import generate_embedding


MODEL_PATH = "ml/models/workflow_classifier.joblib"


EVALUATION_CASES = [
    # simple
    (
        "What is the boiling point of water at sea level?",
        "simple",
    ),
    (
        "Give me a brief definition of recursion.",
        "simple",
    ),

    # rag
    (
        "Use the information already stored in our company knowledge "
        "to answer this question.",
        "rag",
    ),
    (
        "Look through the material available to you and identify "
        "the relevant facts for my question.",
        "rag",
    ),

    # multi-hop
    (
        "Examine these studies, connect their findings, and determine "
        "which conclusion is best supported by the evidence.",
        "multi_hop",
    ),
    (
        "Compare the two proposals, identify their tradeoffs, and "
        "explain which one better satisfies the requirements.",
        "multi_hop",
    ),

    # agentic
    (
        "Investigate the issue, try different approaches, and continue "
        "refining the solution until the requirements are satisfied.",
        "agentic",
    ),
    (
        "Check the available resources, perform the necessary actions, "
        "observe the results, and adapt your next step based on what happens.",
        "agentic",
    ),

    # open-ended
    (
        "Write a comprehensive essay discussing the evolution of "
        "artificial intelligence, including its major milestones, "
        "current challenges, and possible future directions.",
        "open_ended",
    ),
    (
        "Develop a detailed strategic analysis of how a startup could "
        "build a sustainable competitive advantage in an emerging market.",
        "open_ended",
    ),
]


def main():
    classifier = joblib.load(MODEL_PATH)

    correct = 0

    print("\n--- Unseen Workflow Evaluation ---\n")

    for index, (text, expected) in enumerate(EVALUATION_CASES, start=1):
        embedding = generate_embedding(text)

        prediction = classifier.predict([embedding])[0]

        probabilities = classifier.predict_proba([embedding])[0]
        confidence = max(probabilities)

        is_correct = prediction == expected

        if is_correct:
            correct += 1

        status = "PASS" if is_correct else "FAIL"

        print(f"{index}. [{status}]")
        print(f"Prompt:    {text}")
        print(f"Expected:  {expected}")
        print(f"Predicted: {prediction}")
        print(f"Confidence: {confidence:.2%}")
        print()

    accuracy = correct / len(EVALUATION_CASES)

    print("--------------------------------")
    print(f"Correct: {correct}/{len(EVALUATION_CASES)}")
    print(f"Accuracy: {accuracy:.2%}")
    print("--------------------------------")


if __name__ == "__main__":
    main()