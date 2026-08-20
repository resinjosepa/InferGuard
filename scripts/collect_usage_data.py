from fastapi.testclient import TestClient

from app.main import app


client = TestClient(app)


TEST_PROMPTS = [
    # simple
    "What is Python?",
    "What is a database?",
    "Give me three benefits of exercise.",
    "Explain what an API is in simple terms.",
    "What is the difference between RAM and storage?",

    # rag
    "Based on the provided document, what are the main conclusions?",
    "According to the supplied context, what problem does the system solve?",
    "Using the information in the document, summarize the key requirements.",
    "From the provided context, identify the main risks mentioned.",
    "According to the supplied material, what are the recommended next steps?",

    # multi_hop
    "A company has 120 employees. 25% work remotely and 40% of the remote employees are engineers. How many remote engineers are there?",
    "If a product costs $80 after a 20% discount, what was its original price?",
    "A train travels 60 km in the first hour and 80 km in the second hour. What is its average speed over the two hours?",
    "If Alice is older than Bob, Bob is older than Charlie, and Charlie is older than David, who is the youngest?",
    "A project has 5 tasks. Tasks A and B must finish before C, and C must finish before D and E. What tasks can start first?",

    # agentic
    "Plan the steps needed to analyze a Python project's dependencies and identify outdated packages.",
    "Create a step-by-step plan to debug a failing FastAPI endpoint.",
    "Plan how to migrate a small application from SQLite to PostgreSQL.",
    "Determine the steps needed to deploy a FastAPI application to a cloud server.",
    "Plan a workflow for monitoring an application's API errors and responding to failures.",

    # open_ended
    "Explain how artificial intelligence could change education over the next decade.",
    "Discuss the advantages and disadvantages of remote work.",
    "What could the future of robotics look like?",
    "Explain the biggest challenges facing software developers today.",
    "Discuss how AI infrastructure might evolve in the future.",
]


def main():
    for i, prompt in enumerate(TEST_PROMPTS, start=1):
        try:
            response = client.post(
                "/analyze",
                json={
                    "user_id": "dataset_collector",
                    "prompt": prompt,
                    "model": "gemini-3.5-flash",
                    "max_output_tokens": 100,
                },
            )

            print(
                f"\n[{i}/{len(TEST_PROMPTS)}] "
                f"status={response.status_code}"
            )

            if response.status_code == 200:
                data = response.json()

                print(
                    f"workflow={data['workflow_type']} "
                    f"confidence={data['workflow_confidence']:.3f} "
                    f"predicted_output={data['predicted_output_tokens']} "
                    f"actual_output={data['actual_output_tokens']} "
                    f"reasoning={data['actual_reasoning_tokens']}"
                )

            elif response.status_code == 429:
                print("QUOTA EXCEEDED — skipping this request.")

            else:
                print(response.text)

        except Exception as e:
            print(f"\nERROR: {type(e).__name__}")
            print(e)
            break


if __name__ == "__main__":
    main()