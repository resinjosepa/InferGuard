import os
import sys

# Ensure the project root directory is in the Python path so that imports from 'app' work correctly
sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), "..")))

import json
import joblib
from sklearn.model_selection import train_test_split
from sklearn.linear_model import LogisticRegression
from sklearn.metrics import accuracy_score, classification_report, confusion_matrix
from app.services.embedding_service import generate_embedding


def main():
    # 10. Create required directories automatically if they do not exist.
    # We ensure the ml/models output directory exists before saving the model.
    output_dir = os.path.join("ml", "models")
    os.makedirs(output_dir, exist_ok=True)
    print(f"Ensured output directory exists: {output_dir}")

    # 1. Load the dataset from: data/workflow_dataset.jsonl
    dataset_path = os.path.join("data", "workflow_dataset.jsonl")
    print(f"Loading dataset from {dataset_path}...")
    
    texts = []
    labels = []
    
    with open(dataset_path, "r", encoding="utf-8") as f:
        for line in f:
            if not line.strip():
                continue
            record = json.loads(line)
            # 2. Each JSONL record has: text and label
            texts.append(record["text"])
            labels.append(record["label"])

    print(f"Loaded {len(texts)} records from dataset.")

    # 4. Generate a 384-dimensional MiniLM embedding for every text.
    #
    # --- Clear explanation of why embeddings are generated ---
    # Machine learning models (like Logistic Regression) operate on numerical matrices and vectors,
    # meaning they cannot directly process raw text. We generate text embeddings to convert the 
    # natural language queries into 384-dimensional numerical vectors (using the MiniLM model).
    # These vectors mathematically capture the semantic meaning, context, and intent of the text. 
    # This enables the model to make predictions based on the semantic similarity of the text,
    # rather than relying on brittle, exact keyword matches.
    # ---------------------------------------------------------
    print("Generating embeddings for all texts using the embedding service...")
    embeddings = []
    for i, text in enumerate(texts):
        # 3. Load the existing embedding model through: app.services.embedding_service
        # (generate_embedding imported from app.services.embedding_service)
        emb = generate_embedding(text)
        embeddings.append(emb)
        if (i + 1) % 50 == 0 or (i + 1) == len(texts):
            print(f"Generated embeddings for {i + 1}/{len(texts)} texts...")

    # 5. Split the dataset into training and validation sets using:
    # - test_size=0.2
    # - random_state=42
    # - stratify by label
    #
    # --- Clear explanation of why the data is split ---
    # We split our dataset into separate training (80%) and validation (20%) sets. This partition
    # allows us to train the model on one portion of the data and then test its performance on an
    # independent, unseen portion. If we evaluated the model using the same data we used to train it,
    # the model could easily achieve high scores by simply memorizing the training samples (overfitting).
    # Splitting the data gives us an honest, unbiased estimation of how the model will perform on new text.
    # We use 'stratify=labels' to ensure that the training and validation sets have the same proportion of
    # each category label as the original dataset, which helps build a balanced classifier.
    # ---------------------------------------------------
    print("Splitting dataset into training and validation sets...")
    X_train, X_val, y_train, y_val = train_test_split(
        embeddings,
        labels,
        test_size=0.2,
        random_state=42,
        stratify=labels
    )
    print(f"Training set size: {len(X_train)}")
    print(f"Validation set size: {len(X_val)}")

    # 6. Train a scikit-learn LogisticRegression classifier.
    # 7. Use:
    # - max_iter=1000
    # - random_state=42
    #
    # --- Clear explanation of what the classifier learns ---
    # The Logistic Regression classifier learns the relationship between the input features (the 384-dimensional
    # text embeddings) and the target classes (the labels like "simple", "complex", etc.). During training,
    # the algorithm assigns a numerical weight (coefficient) to each of the 384 dimensions of the embedding,
    # along with a bias term. It adjusts these weights iteratively to find a boundary (hyperplane) that 
    # best separates the different classes. When a new text embedding is supplied, the classifier uses 
    # these learned weights to calculate the probability of each class and selects the most likely one.
    # --------------------------------------------------------
    print("Training LogisticRegression classifier...")
    classifier = LogisticRegression(max_iter=1000, random_state=42)
    classifier.fit(X_train, y_train)
    print("Classifier training complete.")

    # 8. Evaluate the classifier on the validation set and print:
    # - validation accuracy
    # - classification report
    # - confusion matrix
    #
    # --- Clear explanation of why validation accuracy matters ---
    # Validation accuracy tells us the percentage of correct predictions the classifier makes on the 
    # validation set. This metric is essential because it measures the model's generalization capability.
    # If the validation accuracy is high, it indicates that the model has successfully learned generalized
    # patterns from the training data that apply to new, unseen queries. A large discrepancy between 
    # training accuracy and validation accuracy would warn us of overfitting, meaning our model is not yet
    # ready for real-world deployments.
    # -------------------------------------------------------------
    print("\n--- Model Evaluation on Validation Set ---")
    val_predictions = classifier.predict(X_val)
    val_accuracy = accuracy_score(y_val, val_predictions)
    
    print(f"Validation Accuracy: {val_accuracy:.4f}")
    
    print("\nClassification Report:")
    print(classification_report(y_val, val_predictions))
    
    print("\nConfusion Matrix:")
    print(confusion_matrix(y_val, val_predictions))
    print("-------------------------------------------\n")

    # 9. Save the trained classifier to: ml/models/workflow_classifier.joblib
    model_save_path = os.path.join(output_dir, "workflow_classifier.joblib")
    print(f"Saving trained classifier to {model_save_path}...")
    joblib.dump(classifier, model_save_path)
    print("Successfully saved model!")


if __name__ == "__main__":
    main()
