# Base image
FROM python:3.10-slim

# Working directory
WORKDIR /app

# Install dependencies
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Copy the rest of the application code
COPY src/ .

# Intended to run the application on port 5000
EXPOSE 5000

# Execute commands
CMD [ "python", "app.py" ]