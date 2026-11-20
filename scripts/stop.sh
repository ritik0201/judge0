#!/usr/bin/env bash
set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
cd "$SCRIPT_DIR/.."

echo "[Judge0] Stopping Judge0 services..."
docker compose down
echo "[Judge0] Services stopped successfully."
