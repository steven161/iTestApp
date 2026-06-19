#!/usr/bin/env bash

# Start PSM Test Web Server
# This script starts the HTTP server on port 8080

set -u

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
cd "$SCRIPT_DIR" || exit 1

echo
echo "==================================="
echo "  PSM Test Web Server"
echo "==================================="
echo
echo "Starting HTTP server on port 8080..."
echo

# Check if server is already running on port 8080
if lsof -iTCP:8080 -sTCP:LISTEN -n -P >/dev/null 2>&1; then
    echo "WARNING: Port 8080 is already in use!"
    echo "Please close the existing server or use a different port."
    echo
    exit 1
fi

# Prefer python3 on macOS; fall back to python
if command -v python3 >/dev/null 2>&1; then
    PYTHON_CMD="python3"
elif command -v python >/dev/null 2>&1; then
    PYTHON_CMD="python"
else
    echo "ERROR: Failed to start server!"
    echo "Please ensure Python is installed and in your PATH."
    echo
    exit 1
fi

"$PYTHON_CMD" -m http.server 8080
EXIT_CODE=$?

if [ "$EXIT_CODE" -ne 0 ]; then
    echo
    echo "ERROR: Failed to start server!"
    echo "Please ensure Python is installed and in your PATH."
    echo
    exit "$EXIT_CODE"
fi
