#!/usr/bin/env bash
set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
cd "$SCRIPT_DIR/.."

echo "[Judge0] Starting Judge0 services..."

if [ ! -f .env ]; then
  if [ -f .env.example ]; then
    echo "[Judge0] Creating .env from .env.example..."
    cp .env.example .env
  fi
fi

# Bring up DB and Redis first
docker compose up -d db redis

echo "[Judge0] Waiting for database and Redis healthchecks..."
sleep 5

# Bring up server and workers
docker compose up -d

echo "[Judge0] All services started. Checking status..."
docker compose ps
