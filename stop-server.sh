#!/usr/bin/env bash

# Stop PSM Test Web Server
# This script stops the HTTP server running on port 8080

set -u

echo
echo "==================================="
echo "  Stopping PSM Test Web Server"
echo "==================================="
echo

# Find process IDs listening on port 8080
PIDS="$(lsof -tiTCP:8080 -sTCP:LISTEN 2>/dev/null || true)"

if [ -z "$PIDS" ]; then
    echo "No server found running on port 8080"
    echo
    exit 0
fi

echo "Finding and stopping server on port 8080..."

STOPPED_ANY=0
for PID in $PIDS; do
    if kill -9 "$PID" >/dev/null 2>&1; then
        echo "Successfully stopped server (PID: $PID)"
        STOPPED_ANY=1
    else
        echo "Failed to stop server (PID: $PID)"
        exit 1
    fi
done

echo
if [ "$STOPPED_ANY" -eq 1 ]; then
    echo "Server stopped successfully!"
else
    echo "No server found running on port 8080"
fi
echo
