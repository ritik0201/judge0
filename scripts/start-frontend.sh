#!/usr/bin/env bash
# Launch Judge0 Light Studio Frontend
echo "================================================="
echo "   Starting Judge0 Light Studio Frontend...      "
echo "   URL: http://127.0.0.1:5174                    "
echo "================================================="

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
FRONTEND_DIR="$SCRIPT_DIR/../frontend"

cd "$FRONTEND_DIR" || exit 1

if [ ! -d "node_modules" ]; then
    echo "Installing frontend dependencies..."
    npm install
fi

npm run dev
