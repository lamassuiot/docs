#!/usr/bin/env bash
set -euo pipefail
cd "$(dirname "$0")"
docker compose up --build -d
printf '\nTerminal: http://localhost:8088/\n'
