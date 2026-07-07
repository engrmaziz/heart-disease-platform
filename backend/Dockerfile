FROM python:3.10-slim

WORKDIR /app

# Install dependencies
RUN pip install --no-cache-dir fastapi uvicorn scikit-learn==1.6.1 pandas xgboost supabase evidently groq python-dotenv

# Copy the local /backend directory contents into the container's /app directory
COPY . /app

EXPOSE 7860

CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "7860"]
