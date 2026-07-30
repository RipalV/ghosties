#!/usr/bin/env bash
# Release an orphaned Azure backend lock left by a cancelled CI run.
# Requires terraform init in this directory.
set -euo pipefail

STALE_MINUTES="${STALE_MINUTES:-20}"

output="$(terraform plan -input=false -no-color -lock-timeout=30s 2>&1)" && {
  echo "Terraform state is not locked."
  exit 0
}

if ! echo "$output" | grep -q "Error acquiring the state lock"; then
  echo "$output"
  exit 1
fi

lock_id="$(echo "$output" | sed -n 's/^  ID: *//p' | head -1 | tr -d '[:space:]')"
created_raw="$(echo "$output" | sed -n 's/^  Created: *//p' | head -1 | sed 's/ UTC$//')"
who="$(echo "$output" | sed -n 's/^  Who: *//p' | head -1)"
operation="$(echo "$output" | sed -n 's/^  Operation: *//p' | head -1)"

if [ -z "$lock_id" ]; then
  echo "State is locked but lock ID could not be parsed:"
  echo "$output"
  exit 1
fi

# Created example: 2026-07-30 15:56:49.788541102 +0000
created_trimmed="$(echo "$created_raw" | sed -E 's/\.[0-9]+ / /')"
created_epoch="$(python3 - <<PY
import re
import sys
from datetime import datetime

raw = """${created_trimmed}""".strip()
if not raw:
    sys.exit(1)
try:
    print(int(datetime.strptime(raw, "%Y-%m-%d %H:%M:%S %z").timestamp()))
except ValueError:
    sys.exit(1)
PY
)" || created_epoch=0
now_epoch="$(date -u +%s)"

if [ "$created_epoch" -eq 0 ]; then
  echo "State locked by ${who} (${operation}) but Created timestamp could not be parsed."
  echo "Lock ID: ${lock_id}"
  exit 1
fi

age_minutes=$(( (now_epoch - created_epoch) / 60 ))
echo "Terraform lock ${lock_id} from ${who} (${operation}), age ${age_minutes}m."

if [ "$age_minutes" -lt "$STALE_MINUTES" ]; then
  echo "Lock is newer than ${STALE_MINUTES}m; another run may still be active."
  exit 1
fi

echo "Releasing stale lock (older than ${STALE_MINUTES}m)…"
terraform force-unlock -force "$lock_id"
echo "Stale lock released."
