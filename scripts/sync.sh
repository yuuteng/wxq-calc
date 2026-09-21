#!/usr/bin/env bash
# Refresh the data snapshot and the mirrored list images. Run, then commit and push.
set -euo pipefail
cd "$(dirname "$0")/.."
scripts/snapshot.sh
python3 scripts/mirror.py
