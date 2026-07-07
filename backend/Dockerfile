FROM python:3.10-slim

WORKDIR /app

# Generate requirements.txt and install dependencies
RUN echo "fastapi\nuvicorn\nscikit-learn\npandas\nxgboost\nsupabase\nevidently\ngroq\npython-dotenv" > requirements.txt \
    && pip install --no-cache-dir -r requirements.txt

# Copy the local /backend directory contents into the container's /app directory
COPY . /app

EXPOSE 7860

CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "7860"]
