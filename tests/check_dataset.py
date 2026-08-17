import json
from collections import Counter
from pathlib import Path


DATASET_PATH = Path("data/workflow_dataset.jsonl")

EXPECTED_LABELS = {
    "simple",
    "rag",
    "multi_hop",
    "agentic",
    "open_ended",
}


def main():
    examples = []

    with DATASET_PATH.open("r", encoding="utf-8") as file:
        for line_number, line in enumerate(file, start=1):
            line = line.strip()

            if not line:
                continue

            example = json.loads(line)

            assert set(example.keys()) == {"text", "label"}, (
                f"Invalid fields on line {line_number}"
            )

            assert isinstance(example["text"], str)
            assert example["text"].strip()

            assert example["label"] in EXPECTED_LABELS, (
                f"Invalid label on line {line_number}: "
                f"{example['label']}"
            )

            examples.append(example)

    counts = Counter(example["label"] for example in examples)

    print(f"Total examples: {len(examples)}")
    print("\nLabel distribution:")

    for label in sorted(EXPECTED_LABELS):
        print(f"{label}: {counts[label]}")

    assert len(examples) == 250
    assert counts == {
        "simple": 50,
        "rag": 50,
        "multi_hop": 50,
        "agentic": 50,
        "open_ended": 50,
    }

    print("\nDataset structure and balance: PASS")


if __name__ == "__main__":
    main()