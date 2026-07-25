#!/usr/bin/env bash
set -euo pipefail

BASE_URL="${SITE_AUDIT_BASE_URL:-http://127.0.0.1:3000}"
SITEMAP_URL="${BASE_URL}/sitemap.xml"
SERVER_LOG="${SITE_AUDIT_LOG:-/tmp/samurai-next.log}"
INTERNAL_LINK_LOG="${INTERNAL_LINK_AUDIT_LOG:-/tmp/internal-links-audit.log}"
PAGE_QUALITY_LOG="${PAGE_QUALITY_AUDIT_LOG:-/tmp/page-quality-audit.log}"
SERVER_PID=""

cleanup() {
  if [[ -n "${SERVER_PID}" ]] && kill -0 "${SERVER_PID}" 2>/dev/null; then
    kill "${SERVER_PID}"
    wait "${SERVER_PID}" 2>/dev/null || true
  fi
}

trap cleanup EXIT

: > "${SERVER_LOG}"
: > "${INTERNAL_LINK_LOG}"
: > "${PAGE_QUALITY_LOG}"
pnpm start --hostname 127.0.0.1 --port 3000 > "${SERVER_LOG}" 2>&1 &
SERVER_PID=$!

READY=0
for _ in $(seq 1 60); do
  if curl --fail --silent --show-error "${SITEMAP_URL}" > /dev/null; then
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
  echo "Timed out waiting for ${SITEMAP_URL}." >&2
  cat "${SERVER_LOG}" >&2
  exit 1
fi

set +e
pnpm audit:internal-links "${BASE_URL}" 2>&1 | tee "${INTERNAL_LINK_LOG}"
INTERNAL_LINK_STATUS=${PIPESTATUS[0]}
pnpm audit:page-quality "${BASE_URL}" 2>&1 | tee "${PAGE_QUALITY_LOG}"
PAGE_QUALITY_STATUS=${PIPESTATUS[0]}
set -e

if [[ "${INTERNAL_LINK_STATUS}" -ne 0 || "${PAGE_QUALITY_STATUS}" -ne 0 ]]; then
  echo "Site audits failed: internal-links=${INTERNAL_LINK_STATUS}, page-quality=${PAGE_QUALITY_STATUS}." >&2
  exit 1
fi
