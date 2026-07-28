#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
cd "$ROOT_DIR"

# Expanded/full workflow selection (custom profile).
# See: https://github.com/Fission-AI/OpenSpec/blob/main/docs/workflows.md#expandedfull-workflow-custom-selection
EXPANDED_WORKFLOWS=(
  propose
  explore
  new
  continue
  apply
  update
  ff
  sync
  archive
  bulk-archive
  verify
  onboard
)

load_nvm() {
  export NVM_DIR="${NVM_DIR:-$HOME/.nvm}"
  if [[ -s "$NVM_DIR/nvm.sh" ]]; then
    # shellcheck source=/dev/null
    source "$NVM_DIR/nvm.sh"
    if [[ -f .nvmrc ]]; then
      nvm install
      nvm use
    fi
  fi
}

require_node() {
  if ! command -v node >/dev/null 2>&1; then
    echo "error: Node.js is required. Install Node 20.19+ or use nvm (see README)." >&2
    exit 1
  fi

  local required_major=20
  local required_minor=19
  local node_major node_minor
  node_major="$(node -p "process.versions.node.split('.')[0]")"
  node_minor="$(node -p "process.versions.node.split('.')[1]")"

  if (( node_major < required_major )) || \
     (( node_major == required_major && node_minor < required_minor )); then
    echo "error: Node.js $(node -v) is too old. This project requires >=20.19.0." >&2
    exit 1
  fi
}

build_workflows_json() {
  # Build one JSON array string via Node so brackets/commas never depend on shell word-splitting.
  node -e 'process.stdout.write(JSON.stringify(process.argv.slice(1)))' -- "${EXPANDED_WORKFLOWS[@]}"
}

enable_expanded_profile() {
  echo "Enabling OpenSpec expanded/full workflow profile..."
  # Global config drives --profile custom; interactive `openspec config profile`
  # is documented at the workflows link above. Set the same selection non-interactively.
  local workflows_json
  workflows_json="$(build_workflows_json)"
  npx openspec config set workflows "$workflows_json"
  npx openspec config set profile custom
  npx openspec config set delivery both
}

main() {
  load_nvm
  require_node

  echo "Installing npm dependencies..."
  npm install

  enable_expanded_profile

  echo "Initializing OpenSpec for Cursor (expanded workflows)..."
  npx openspec init --tools cursor --force --profile custom

  echo "Updating OpenSpec Cursor commands and skills..."
  npx openspec update --force

  cat <<EOF

OpenSpec setup complete (expanded/full workflow).

Cursor slash commands installed:
  Core path:
    /opsx:propose       Create change + all planning artifacts
    /opsx:explore       Think through ideas before implementing
    /opsx:apply         Implement tasks from a change
    /opsx:update        Refresh change artifacts
    /opsx:sync          Sync delta specs into main specs
    /opsx:archive       Archive a completed change

  Expanded path:
    /opsx:new           Start a change scaffold
    /opsx:continue      Create the next planning artifact
    /opsx:ff            Create all planning artifacts at once
    /opsx:verify        Validate implementation before archive
    /opsx:bulk-archive  Archive multiple completed changes
    /opsx:onboard       Onboarding / guided setup workflow

Restart Cursor (or reload the window) for slash commands to take effect.
Then try: /opsx:explore
EOF
}

main "$@"
