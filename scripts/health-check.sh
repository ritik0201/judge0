#!/usr/bin/env bash
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
cd "$SCRIPT_DIR/.."

echo "[Judge0] Running health check..."

if curl -s -f http://127.0.0.1:2358/health > /dev/null; then
  echo " Judge0 API Server is HEALTHY (http://127.0.0.1:2358/health responded HTTP 200)"
  curl -s http://127.0.0.1:2358/system_info | jq . 2>/dev/null || curl -s http://127.0.0.1:2358/system_info
  exit 0
else
  echo "❌ Judge0 API Server is UNHEALTHY or still starting up."
  exit 1
fi
