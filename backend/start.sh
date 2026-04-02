#!/bin/bash
# Whizan AI — Backend Start Script
# Launches Node.js Express server + Python Flask ML microservice in parallel

set -e

echo "[start.sh] Starting Whizan Backend Services..."

# Start Python ML microservice in background
echo "[start.sh] Starting Python ML microservice on port ${ML_PORT:-5001}..."
python3 ml/recommend.py &
ML_PID=$!

# Give Python a few seconds to initialize Firebase + dataset
sleep 3

echo "[start.sh] Starting Node.js Express server..."
node server.js &
NODE_PID=$!

# Handle termination: kill both when the script exits
cleanup() {
    echo "[start.sh] Shutting down services..."
    kill $ML_PID 2>/dev/null || true
    kill $NODE_PID 2>/dev/null || true
}
trap cleanup EXIT INT TERM

# Wait for either process to exit
wait -n $ML_PID $NODE_PID

# If one died, kill the other
EXIT_CODE=$?
echo "[start.sh] A service exited with code $EXIT_CODE. Cleaning up..."
cleanup
exit $EXIT_CODE
