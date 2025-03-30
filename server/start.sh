#!/bin/bash

# Load environment variables from .env file
if [ -f .env ]; then
  export $(cat .env | xargs)
  echo "Environment variables loaded from .env file"
else
  echo "Warning: .env file not found, using default values"
fi

# Make sure the API key is set
if [ -z "$API_KEY" ]; then
  echo "Error: API_KEY is not set in the .env file"
  exit 1
fi

# Start the server
echo "Starting server on port ${PORT:-5006}..."
node index.js 