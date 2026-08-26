# Base image
FROM python:3.10-slim

# Working directory
WORKDIR /app

# Install dependencies
COPY requierements.txt .
RUN pip install --no-cache-dir -r requierements.txt

# Copy the rest of the application code
COPY src/ .

# Execute commands
CMD [ "python", "app.py" ]