# ---- Stage 1: Build the React frontend ----
FROM node:20-slim AS frontend-build

WORKDIR /frontend

# Copy package files first (for better Docker caching)
COPY frontend/package.json frontend/package-lock.json ./

# Install dependencies
RUN npm ci

# Copy the rest of the frontend source code
COPY frontend/ .

# Build the production bundle (outputs to /frontend/dist)
RUN npm run build


# ---- Stage 2: Python backend (final image) ----
FROM python:3.12-slim

WORKDIR /app

RUN apt-get update && apt-get install -y git && rm -rd /var/lib/apt/lists/*

RUN pip install uv

COPY requirements.txt .

RUN uv pip install --system -r requirements.txt

COPY . .

# Copy the built frontend from Stage 1 into /app/static
COPY --from=frontend-build /frontend/dist /app/static

EXPOSE 8000

CMD ["python","main.py"]