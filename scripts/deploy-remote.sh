#!/usr/bin/env bash
set -euo pipefail

MODE="${MODE:-deploy}"
: "${DEPLOY_PATH:?DEPLOY_PATH is required}"
: "${ENV_NAME:?ENV_NAME is required}"
: "${BLUE_PORT:?BLUE_PORT is required}"
: "${GREEN_PORT:?GREEN_PORT is required}"
: "${GHCR_USER:?GHCR_USER is required}"
: "${GHCR_TOKEN:?GHCR_TOKEN is required}"
DRAIN_SECONDS="${DRAIN_SECONDS:-10}"
NGINX_UPSTREAM_DIR="${NGINX_UPSTREAM_DIR:-/etc/nginx/holodle}"
NGINX_BIN="${NGINX_BIN:-/usr/sbin/nginx}"

export DEPLOY_PATH ENV_NAME BLUE_PORT GREEN_PORT GHCR_USER GHCR_TOKEN MODE DRAIN_SECONDS NGINX_UPSTREAM_DIR NGINX_BIN
export PATH="/usr/local/bin:/usr/bin:/bin:/usr/sbin:/sbin:$PATH"

log() { printf '[deploy] %s\n' "$*"; }
fail() { printf '[deploy] ERROR: %s\n' "$*" >&2; exit 1; }

case "$ENV_NAME" in
  staging|production) ;;
  *) fail "ENV_NAME must be staging or production" ;;
esac
case "$MODE" in
  deploy|rollback) ;;
  *) fail "MODE must be deploy or rollback" ;;
esac
case "$DEPLOY_PATH" in
  /*) ;;
  *) fail "DEPLOY_PATH must be absolute: $DEPLOY_PATH" ;;
esac
case "$BLUE_PORT" in
  *[!0-9]*) fail "BLUE_PORT must be numeric: $BLUE_PORT" ;;
esac
case "$GREEN_PORT" in
  *[!0-9]*) fail "GREEN_PORT must be numeric: $GREEN_PORT" ;;
esac
case "$DRAIN_SECONDS" in
  *[!0-9]*) fail "DRAIN_SECONDS must be numeric: $DRAIN_SECONDS" ;;
esac
[ "$BLUE_PORT" != "$GREEN_PORT" ] || fail "BLUE_PORT and GREEN_PORT must differ"

if [ "$MODE" = "deploy" ]; then
  : "${IMAGE:?IMAGE is required for deploy mode}"
  case "$IMAGE" in
    ghcr.io/*@sha256:*) ;;
    *) fail "IMAGE must be pinned by digest: $IMAGE" ;;
  esac
fi

[ -d "$DEPLOY_PATH" ] || fail "missing deploy path: $DEPLOY_PATH"
[ -f "$DEPLOY_PATH/compose.yaml" ] || fail "missing compose.yaml"
[ -f "$DEPLOY_PATH/scripts/deploy-remote.sh" ] || fail "missing deploy script"
[ -d "$NGINX_UPSTREAM_DIR" ] || fail "missing Nginx upstream dir: $NGINX_UPSTREAM_DIR"
[ -w "$NGINX_UPSTREAM_DIR" ] || fail "Nginx upstream dir is not writable: $NGINX_UPSTREAM_DIR"
[ -x "$NGINX_BIN" ] || fail "nginx is not executable: $NGINX_BIN"
NGINX_UPSTREAM_FILE="$NGINX_UPSTREAM_DIR/$ENV_NAME-upstream.conf"
[ -f "$NGINX_UPSTREAM_FILE" ] || fail "missing Nginx upstream file: $NGINX_UPSTREAM_FILE"

APP_ENV_FILE="$DEPLOY_PATH/.env.$ENV_NAME"
[ -f "$APP_ENV_FILE" ] || fail "missing app env file: $APP_ENV_FILE"
chmod 600 "$APP_ENV_FILE" 2>/dev/null || true

for cmd in docker curl flock mktemp; do
  command -v "$cmd" >/dev/null 2>&1 || fail "required command not found: $cmd"
done
docker compose version >/dev/null 2>&1 || fail "docker compose plugin not found"

exec 9>"$DEPLOY_PATH/.deploy.lock"
flock -n 9 || fail "another deploy is running for $DEPLOY_PATH"

DOCKER_CONFIG="$(mktemp -d)"
export DOCKER_CONFIG
cleanup() { rm -rf "$DOCKER_CONFIG"; }
trap cleanup EXIT

printf '%s' "$GHCR_TOKEN" | docker login ghcr.io -u "$GHCR_USER" --password-stdin >/dev/null

COMPOSE_PROJECT_NAME="holodle-$ENV_NAME"
COMPOSE_FILE="$DEPLOY_PATH/compose.yaml"
COMPOSE_ENV="$DEPLOY_PATH/compose.env"
STATE_DIR="$DEPLOY_PATH/state"
mkdir -p "$STATE_DIR"

cat > "$COMPOSE_ENV" <<EOF
BLUE_PORT=$BLUE_PORT
GREEN_PORT=$GREEN_PORT
APP_ENV_FILE=$APP_ENV_FILE
EOF

compose() {
  docker compose \
    --project-name "$COMPOSE_PROJECT_NAME" \
    --env-file "$COMPOSE_ENV" \
    -f "$COMPOSE_FILE" \
    "$@"
}

port_for_color() {
  case "$1" in
    blue) printf '%s' "$BLUE_PORT" ;;
    green) printf '%s' "$GREEN_PORT" ;;
    *) fail "unknown color: $1" ;;
  esac
}

other_color() {
  case "$1" in
    blue) printf 'green' ;;
    green) printf 'blue' ;;
    *) fail "unknown color: $1" ;;
  esac
}

restore_upstream() {
  local backup="$NGINX_UPSTREAM_DIR/.$ENV_NAME-upstream.bak"
  if [ -f "$backup" ]; then
    mv -f "$backup" "$NGINX_UPSTREAM_FILE"
  fi
}

switch_upstream() {
  local port="$1"
  local backup="$NGINX_UPSTREAM_DIR/.$ENV_NAME-upstream.bak"
  local tmp
  cp -f "$NGINX_UPSTREAM_FILE" "$backup" 2>/dev/null || fail "could not back up Nginx upstream"
  tmp="$(mktemp "$NGINX_UPSTREAM_DIR/.$ENV_NAME.XXXXXX")"
  cat > "$tmp" <<EOF
upstream holodle_${ENV_NAME}_app {
    server 127.0.0.1:$port;
}
EOF
  chmod 644 "$tmp"
  mv -f "$tmp" "$NGINX_UPSTREAM_FILE"

  if ! sudo -n "$NGINX_BIN" -t; then
    log "nginx config test failed"
    restore_upstream
    return 1
  fi
  if ! sudo -n "$NGINX_BIN" -s reload; then
    log "nginx reload failed"
    restore_upstream
    sudo -n "$NGINX_BIN" -s reload || true
    return 1
  fi
  rm -f "$backup"
}

active_color="$(cat "$STATE_DIR/active-color" 2>/dev/null || true)"
case "$active_color" in
  blue|green) ;;
  *) active_color="blue" ;;
esac

if [ "$MODE" = "deploy" ]; then
  target_color="$(other_color "$active_color")"
  target_image="$IMAGE"
  previous_image="$(cat "$STATE_DIR/image" 2>/dev/null || true)"
else
  target_color="$(cat "$STATE_DIR/previous-color" 2>/dev/null || true)"
  target_image="$(cat "$STATE_DIR/previous-image" 2>/dev/null || true)"
  previous_image="$(cat "$STATE_DIR/image" 2>/dev/null || true)"
  case "$target_color" in
    blue|green) ;;
    *) fail "no previous color to roll back to" ;;
  esac
  [ -n "$target_image" ] || fail "no previous image to roll back to"
  case "$target_image" in
    ghcr.io/*@sha256:*) ;;
    *) fail "previous image is not pinned by digest: $target_image" ;;
  esac
fi

old_color="$active_color"
target_port="$(port_for_color "$target_color")"
[ "$target_color" != "$old_color" ] || fail "target and active colors must differ"

log "mode=$MODE env=$ENV_NAME active=$old_color target=$target_color port=$target_port image=$target_image"

IMAGE="$target_image" compose config >/dev/null

log "pulling $target_image"
docker pull "$target_image"

start_target() {
  IMAGE="$target_image" compose up -d --wait --wait-timeout 90 --no-deps "app-$target_color"
}

remove_target() {
  IMAGE="$target_image" compose stop "app-$target_color" >/dev/null 2>&1 || true
  IMAGE="$target_image" compose rm -f "app-$target_color" >/dev/null 2>&1 || true
}

stop_old() {
  IMAGE="$target_image" compose stop "app-$old_color" >/dev/null 2>&1 || true
  IMAGE="$target_image" compose rm -f "app-$old_color" >/dev/null 2>&1 || true
}

log "starting app-$target_color"
if ! start_target; then
  log "new color failed to become healthy"
  remove_target
  exit 1
fi

log "post-start health check on port $target_port"
sleep 5
if ! curl -fsS --max-time 5 -o /dev/null "http://127.0.0.1:$target_port/"; then
  log "post-start health check failed"
  remove_target
  exit 1
fi

log "switching Nginx upstream to port $target_port"
if ! switch_upstream "$target_port"; then
  log "Nginx switch failed; app-$old_color remains live"
  remove_target
  exit 1
fi

log "draining app-$old_color for ${DRAIN_SECONDS}s"
sleep "$DRAIN_SECONDS"
stop_old

printf '%s\n' "$target_color" > "$STATE_DIR/active-color"
printf '%s\n' "$target_image" > "$STATE_DIR/image"
printf '%s\n' "$old_color" > "$STATE_DIR/previous-color"
if [ -n "$previous_image" ]; then
  printf '%s\n' "$previous_image" > "$STATE_DIR/previous-image"
else
  rm -f "$STATE_DIR/previous-image"
fi

log "deployed $ENV_NAME: active=$target_color image=$target_image"
docker image prune -af --filter "until=168h" >/dev/null 2>&1 || true
