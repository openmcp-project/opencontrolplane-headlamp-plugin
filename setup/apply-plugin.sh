#!/usr/bin/env bash
set -euo pipefail

# Fast iteration: rebuild the kiosk plugin and push it into the running cluster.
# Does not touch Helm or the cluster setup.
# Run setup-headlamp-dev.sh first if the cluster doesn't exist yet.
#
# Usage:
#   ./apply-plugin.sh   — rebuild + redeploy kiosk plugin

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
REPO_DIR="$(cd "${SCRIPT_DIR}/.." && pwd)"

CLUSTER_NAME="headlamp-dev"
NAMESPACE="headlamp"
PORT=8090

# ── Sanity check ──────────────────────────────────────────────────────────────
if ! kind get clusters 2>/dev/null | grep -q "^${CLUSTER_NAME}$"; then
  echo "error: kind cluster '${CLUSTER_NAME}' does not exist." >&2
  echo "       Run ./setup-headlamp-dev.sh first." >&2
  exit 1
fi

# ── Build & deploy kiosk plugin ───────────────────────────────────────────────
echo "→ building kiosk plugin..."
(cd "$REPO_DIR" && npm run build)

echo "→ updating kiosk-plugin ConfigMap (main.js + package.json)..."
kubectl create configmap kiosk-plugin \
  --from-file=main.js="${REPO_DIR}/dist/main.js" \
  --from-file=package.json="${REPO_DIR}/package.json" \
  -n "$NAMESPACE" --context "kind-${CLUSTER_NAME}" \
  --dry-run=client -o yaml | kubectl apply -f - --context "kind-${CLUSTER_NAME}"

# ── Restart pod ───────────────────────────────────────────────────────────────
echo "→ restarting Headlamp pod..."
kubectl rollout restart deployment headlamp -n "$NAMESPACE" --context "kind-${CLUSTER_NAME}"
kubectl rollout status deployment headlamp -n "$NAMESPACE" --context "kind-${CLUSTER_NAME}" --timeout=60s

# ── Re-establish port-forward with auto-restart watcher ──────────────────────
# Pod restart kills the port-forward; the watcher loop keeps it alive.

if lsof -ti :"$PORT" &>/dev/null; then
  lsof -ti :"$PORT" | xargs kill -9 2>/dev/null || true
fi

# Kill any existing watcher for this port
pkill -f "headlamp-pf-watch-${PORT}" 2>/dev/null || true

WATCH_SCRIPT="/tmp/headlamp-pf-watch-${PORT}.sh"
cat > "$WATCH_SCRIPT" <<WATCHER
#!/usr/bin/env bash
# headlamp-pf-watch-${PORT}
while true; do
  kubectl port-forward svc/headlamp ${PORT}:80 -n ${NAMESPACE} --context kind-${CLUSTER_NAME} \
    >>/tmp/headlamp-portforward.log 2>&1
  echo "\$(date): port-forward exited, restarting in 2s..." >> /tmp/headlamp-portforward.log
  sleep 2
done
WATCHER
chmod +x "$WATCH_SCRIPT"

nohup bash "$WATCH_SCRIPT" &>/dev/null &
WATCHER_PID=$!

for i in $(seq 1 20); do
  if curl -s -o /dev/null -w "%{http_code}" "http://localhost:${PORT}/" | grep -qE "^(200|301|302)"; then
    break
  fi
  sleep 1
done

echo ""
echo "✓ plugin(s) updated — http://localhost:${PORT}/"
echo "  Port-forward watcher PID: ${WATCHER_PID} (auto-restarts on pod restart)"
echo "  Logs: /tmp/headlamp-portforward.log"
echo "  To stop watcher: pkill -f headlamp-pf-watch-${PORT}"
