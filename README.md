# InferGuard

InferGuard is a Python FastAPI application designed to provide guardrails and cost protection for LLM inference APIs.

## Project Structure

```text
inferguard/
├── app/
│   ├── __init__.py
│   ├── main.py          # FastAPI application entry point
│   ├── core/            # Core system utilities, config, security
│   │   └── __init__.py
│   └── models/          # Data schemas and database models
│       └── __init__.py
├── tests/               # Test suite
│   └── __init__.py
├── .env.example         # Template for environment variables
├── README.md            # Project documentation
└── requirements.txt     # Python dependencies
```

## Getting Started

### Prerequisites

- Python 3.10 or higher

### Installation

1. Clone the repository:
   ```bash
   git clone <repository-url>
   cd inferguard
   ```

2. Create and activate a virtual environment:
   ```bash
   # On Windows
   python -m venv .venv
   .venv\Scripts\activate

   # On macOS/Linux
   python3 -m venv .venv
   source .venv/bin/activate
   ```

3. Install dependencies:
   ```bash
   pip install -r requirements.txt
   ```

4. Create configuration file from template:
   ```bash
   copy .env.example .env
   ```

### Running the Application

To start the local development server:

```bash
uvicorn app.main:app --reload
```

The API will be available at `http://127.0.0.1:8000`.
You can view the interactive documentation at `http://127.0.0.1:8000/docs` (Swagger UI) or `http://127.0.0.1:8000/redoc`.
