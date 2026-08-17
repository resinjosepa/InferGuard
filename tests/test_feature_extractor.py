from app.services.feature_extractor import extract_features


def test_simple_prompt():
    features = extract_features("What is the capital of France?")

    assert features.question_count == 1
    assert features.research_signal == 0
    assert features.retrieval_signal == 0
    assert features.tool_signal == 0
    assert features.iteration_signal == 0


def test_retrieval_prompt():
    features = extract_features(
        "Search our knowledge base and find the relevant information."
    )

    assert features.retrieval_signal >= 2


def test_comparison_prompt():
    features = extract_features(
        "Compare these two approaches and explain their differences."
    )

    assert features.comparison_signal >= 2


def test_agentic_prompt():
    features = extract_features(
        "Browse the website, run the code, and keep trying until you find a solution."
    )

    assert features.tool_signal >= 2
    assert features.iteration_signal >= 2


def test_multi_step_prompt():
    features = extract_features(
        "Find the information, compare the results, verify the claims, "
        "and explain the conclusion."
    )

    assert features.instruction_count >= 3
    assert features.comparison_signal >= 1


def test_indirect_retrieval_prompt():
    features = extract_features(
        "Consult the company's stored documents and use the relevant sources "
        "to answer my question."
    )

    assert features.retrieval_signal >= 2