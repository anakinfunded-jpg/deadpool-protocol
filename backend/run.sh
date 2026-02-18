#!/usr/bin/env bash
set -e

cd "$(dirname "$0")"

echo "=== DEADPOOL Backend ==="

# Install dependencies
echo "Installing requirements..."
pip install -r requirements.txt --quiet

# Start the server
echo "Starting death engine on port 5000..."
python death_engine.py
