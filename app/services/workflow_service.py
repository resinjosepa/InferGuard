import joblib

from app.services.embedding_service import generate_embedding


MODEL_PATH = "ml/models/workflow_classifier.joblib"

_classifier = joblib.load(MODEL_PATH)


def predict_workflow(text: str) -> tuple[str, float]:
    embedding = generate_embedding(text)

    prediction = _classifier.predict([embedding])[0]

    probabilities = _classifier.predict_proba([embedding])[0]
    confidence = float(max(probabilities))

    return prediction, confidence