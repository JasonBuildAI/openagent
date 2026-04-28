#!/usr/bin/env bash
# OpenAgent one-step install: pull and run the all-in-one Docker image (includes database).
# Usage:
#   curl -fsSL --proto '=https' --tlsv1.2 \
#     https://raw.githubusercontent.com/the-open-agent/openagent/master/scripts/install.sh | bash
#
# Optional environment variables:
#   OPENAGENT_IMAGE           default: casbin/openagent-all-in-one
#   OPENAGENT_TAG             default: latest
#   OPENAGENT_PORT            host port, default 14000 (container listens on 14000)
#   OPENAGENT_CONTAINER_NAME  default: openagent
#   MYSQL_ROOT_PASSWORD       MariaDB root password, default 123456
#   OPENAGENT_FORCE           set to 1 to remove an existing container with the same name

set -euo pipefail

OPENAGENT_IMAGE="${OPENAGENT_IMAGE:-casbin/openagent-all-in-one}"
OPENAGENT_TAG="${OPENAGENT_TAG:-latest}"
OPENAGENT_PORT="${OPENAGENT_PORT:-14000}"
OPENAGENT_CONTAINER_NAME="${OPENAGENT_CONTAINER_NAME:-openagent}"
MYSQL_ROOT_PASSWORD="${MYSQL_ROOT_PASSWORD:-123456}"
OPENAGENT_FORCE="${OPENAGENT_FORCE:-0}"

CONTAINER_HTTP_PORT=14000

info() { printf '%s\n' "$*"; }
warn() { printf '[openagent] %s\n' "$*" >&2; }
die() { warn "$*"; exit 1; }

need_cmd() {
	command -v "$1" >/dev/null 2>&1 || die "command not found: $1 (install and start Docker first)"
}

need_cmd docker

if ! docker info >/dev/null 2>&1; then
	die "Docker is not running or this user cannot access Docker. Start Docker Desktop or the docker daemon."
fi

FULL_IMAGE="${OPENAGENT_IMAGE}:${OPENAGENT_TAG}"

if docker ps -a --format '{{.Names}}' | grep -qx "${OPENAGENT_CONTAINER_NAME}"; then
	if [[ "${OPENAGENT_FORCE}" == "1" ]]; then
		warn "Removing existing container: ${OPENAGENT_CONTAINER_NAME}"
		docker rm -f "${OPENAGENT_CONTAINER_NAME}" >/dev/null
	else
		die "Container ${OPENAGENT_CONTAINER_NAME} already exists. Remove it, set OPENAGENT_CONTAINER_NAME, or OPENAGENT_FORCE=1."
	fi
fi

info "Pulling image ${FULL_IMAGE} ..."
docker pull "${FULL_IMAGE}"

info "Starting container ${OPENAGENT_CONTAINER_NAME} (first start may take tens of seconds for DB init) ..."
docker run -d \
	--name "${OPENAGENT_CONTAINER_NAME}" \
	--restart unless-stopped \
	-p "${OPENAGENT_PORT}:${CONTAINER_HTTP_PORT}" \
	-e MYSQL_ROOT_PASSWORD="${MYSQL_ROOT_PASSWORD}" \
	"${FULL_IMAGE}"

info ""
info "OpenAgent is running."
info "  Web UI:  http://127.0.0.1:${OPENAGENT_PORT}/"
info "  Logs:     docker logs -f ${OPENAGENT_CONTAINER_NAME}"
info "  Stop:     docker rm -f ${OPENAGENT_CONTAINER_NAME}"
info ""
