#!/usr/bin/env bash
set -euo pipefail

BASE_URL="${SITE_AUDIT_BASE_URL:-http://127.0.0.1:3000}"
SERVER_LOG="${SITE_AUDIT_LOG:-/tmp/samurai-next.log}"
SERVER_PID=""

cleanup() {
  if [[ -n "${SERVER_PID}" ]] && kill -0 "${SERVER_PID}" 2>/dev/null; then
    kill "${SERVER_PID}"
    wait "${SERVER_PID}" 2>/dev/null || true
  fi
}

trap cleanup EXIT

: > "${SERVER_LOG}"
pnpm start --hostname 127.0.0.1 --port 3000 > "${SERVER_LOG}" 2>&1 &
SERVER_PID=$!

READY=0
for _ in $(seq 1 60); do
  if curl --fail --silent --show-error "${BASE_URL}/sitemap.xml" > /dev/null; then
    READY=1
    break
  fi

  if ! kill -0 "${SERVER_PID}" 2>/dev/null; then
    echo "Next.js server stopped before becoming ready." >&2
    cat "${SERVER_LOG}" >&2
    exit 1
  fi

  sleep 1
done

if [[ "${READY}" -ne 1 ]]; then
  echo "Timed out waiting for ${BASE_URL}/sitemap.xml." >&2
  cat "${SERVER_LOG}" >&2
  exit 1
fi

pnpm audit:internal-links "${BASE_URL}"
pnpm audit:page-quality "${BASE_URL}"
