#!/usr/bin/env bash
set -euo pipefail

# One-time cluster bootstrap. Sets up a kind cluster called 'plugin-dev' and
# deploys Headlamp with volume mounts for all known plugins pre-declared.
#
# For day-to-day iteration (rebuild + re-apply this plugin only) use:
#   ./apply-plugin.sh

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
REPO_DIR="$(cd "${SCRIPT_DIR}/.." && pwd)"

CLUSTER_NAME="headlamp-dev"
NAMESPACE="headlamp"
HEADLAMP_VERSION="0.42.0"
PORT=8090
CROSSPLANE_REPO_DIR="/Users/I551674/SAPDevelop/CO/legacy-plugins/headlamp-plugin-crossplane"

CLUSTER_CREATED=false

cleanup() {
  echo ""
  echo "✗ Setup failed — cleaning up..."
  lsof -ti :"$PORT" | xargs kill -9 2>/dev/null || true
  if $CLUSTER_CREATED; then
    echo "→ deleting kind cluster '${CLUSTER_NAME}'..."
    kind delete cluster --name "$CLUSTER_NAME" 2>/dev/null || true
  fi
}
trap cleanup ERR

# ── Prerequisites ─────────────────────────────────────────────────────────────
for cmd in kind kubectl helm npm curl; do
  if ! command -v "$cmd" &>/dev/null; then
    echo "error: '$cmd' is required but not installed." >&2
    exit 1
  fi
done

# ── Kind cluster ──────────────────────────────────────────────────────────────
if kind get clusters 2>/dev/null | grep -q "^${CLUSTER_NAME}$"; then
  echo "✓ kind cluster '${CLUSTER_NAME}' already exists"
else
  echo "→ creating kind cluster '${CLUSTER_NAME}'..."
  kind create cluster --name "$CLUSTER_NAME"
  CLUSTER_CREATED=true
fi

kubectl config use-context "kind-${CLUSTER_NAME}"

# ── Namespace ─────────────────────────────────────────────────────────────────
kubectl create namespace "$NAMESPACE" --dry-run=client -o yaml | kubectl apply -f -

# ── Plugin ConfigMaps ─────────────────────────────────────────────────────────
# Both main.js AND package.json must be present — Headlamp rejects plugins that
# are missing package.json with "Incompatible plugins disabled".

echo "→ building kiosk plugin..."
(cd "$REPO_DIR" && npm install && npm run build)

echo "→ applying kiosk-plugin ConfigMap (main.js + package.json)..."
kubectl create configmap kiosk-plugin \
  --from-file=main.js="${REPO_DIR}/dist/main.js" \
  --from-file=package.json="${REPO_DIR}/package.json" \
  -n "$NAMESPACE" --dry-run=client -o yaml | kubectl apply -f -

echo "→ building crossplane plugin..."
(cd "$CROSSPLANE_REPO_DIR" && npm install && npm run build)

echo "→ applying crossplane-plugin ConfigMap (main.js + package.json)..."
kubectl create configmap crossplane-plugin \
  --from-file=main.js="${CROSSPLANE_REPO_DIR}/dist/main.js" \
  --from-file=package.json="${CROSSPLANE_REPO_DIR}/package.json" \
  -n "$NAMESPACE" --dry-run=client -o yaml | kubectl apply -f -

# ── Headlamp via Helm ─────────────────────────────────────────────────────────
helm repo add headlamp https://kubernetes-sigs.github.io/headlamp/ --force-update &>/dev/null

echo "→ deploying Headlamp ${HEADLAMP_VERSION}..."
helm upgrade --install headlamp headlamp/headlamp \
  --version "$HEADLAMP_VERSION" \
  --namespace "$NAMESPACE" \
  --values - \
  --wait --timeout 300s <<'EOF'
replicaCount: 1
config:
  pluginsDir: /headlamp/plugins
  watchPlugins: false
  extraArgs:
    - -enable-dynamic-clusters
    - -session-ttl=86400
    - -in-cluster-context-name=main
initContainers:
  - name: flux-plugin
    image: ghcr.io/headlamp-k8s/headlamp-plugin-flux:latest
    imagePullPolicy: Always
    command:
      - /bin/sh
      - -c
      - mkdir -p /headlamp/plugins && cp -r /plugins/* /headlamp/plugins/
    volumeMounts:
      - name: headlamp-plugins
        mountPath: /headlamp/plugins
volumeMounts:
  - name: headlamp-plugins
    mountPath: /headlamp/plugins
  - name: kiosk-plugin
    mountPath: /headlamp/plugins/kiosk-plugin
  - name: crossplane-plugin
    mountPath: /headlamp/plugins/crossplane-plugin
volumes:
  - name: headlamp-plugins
    emptyDir: {}
  - name: kiosk-plugin
    configMap:
      name: kiosk-plugin
  - name: crossplane-plugin
    configMap:
      name: crossplane-plugin
EOF

# ── Restart pod ───────────────────────────────────────────────────────────────
echo "→ restarting Headlamp pod..."
kubectl rollout restart deployment headlamp -n "$NAMESPACE"
kubectl rollout status deployment headlamp -n "$NAMESPACE" --timeout=120s

# ── Port-forward with auto-restart watcher ───────────────────────────────────
# kubectl port-forward dies when the pod restarts (e.g. after kubectl rollout
# restart). A watcher loop keeps it alive without requiring manual intervention.

if lsof -ti :"$PORT" &>/dev/null; then
  echo "→ stopping existing process on port ${PORT}..."
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

# Wait for port to be ready
for i in $(seq 1 20); do
  if curl -s -o /dev/null -w "%{http_code}" "http://localhost:${PORT}/" | grep -qE "^(200|301|302)"; then
    break
  fi
  sleep 1
done

echo ""
echo "✓ Headlamp is running at http://localhost:${PORT}/"
echo "  Port-forward watcher PID: ${WATCHER_PID} (auto-restarts on pod restart)"
echo "  Logs: /tmp/headlamp-portforward.log"
echo "  To stop watcher: pkill -f headlamp-pf-watch-${PORT}"
