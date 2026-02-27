# ── Backend ──────────────────────────────────────────
FROM python:3.13-slim AS backend

WORKDIR /app

# Deps d'abord (cache Docker)
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Code source
COPY . .

EXPOSE 8000

CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8000", "--reload"]
