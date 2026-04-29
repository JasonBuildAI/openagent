#!/usr/bin/env bash
# OpenAgent one-step install: download the release binary for your platform.
# Usage:
#   curl -fsSL --proto '=https' --tlsv1.2 \
#     https://raw.githubusercontent.com/the-open-agent/openagent/master/scripts/install.sh | bash
#
# Optional environment variables:
#   OPENAGENT_VERSION   e.g. v1.777.3  (default: latest release)
#   INSTALL_DIR         installation directory (default: /usr/local/bin)

set -euo pipefail

OPENAGENT_VERSION="${OPENAGENT_VERSION:-latest}"
INSTALL_DIR="${INSTALL_DIR:-/usr/local/bin}"

REPO="the-open-agent/openagent"

info() { printf '%s\n' "$*"; }
die()  { printf '[openagent] %s\n' "$*" >&2; exit 1; }

need_cmd() {
	command -v "$1" >/dev/null 2>&1 || die "required command not found: $1"
}

need_cmd curl
need_cmd tar

# ── resolve version ────────────────────────────────────────────────────────────
if [[ "${OPENAGENT_VERSION}" == "latest" ]]; then
	info "Fetching latest release version..."
	OPENAGENT_VERSION="$(curl -fsSL "https://api.github.com/repos/${REPO}/releases/latest" \
		| grep '"tag_name"' | head -1 | sed 's/.*"tag_name": *"\([^"]*\)".*/\1/')"
	[[ -n "${OPENAGENT_VERSION}" ]] || die "Failed to fetch latest version from GitHub API."
fi
info "Installing openagent ${OPENAGENT_VERSION}"

# ── detect OS / arch ───────────────────────────────────────────────────────────
OS="$(uname -s)"
ARCH="$(uname -m)"

case "${OS}" in
	Linux)  OS_NAME="Linux" ;;
	Darwin) OS_NAME="Darwin" ;;
	*)      die "Unsupported OS: ${OS}. Download manually from https://github.com/${REPO}/releases" ;;
esac

case "${ARCH}" in
	x86_64|amd64) ARCH_NAME="x86_64" ;;
	aarch64|arm64) ARCH_NAME="arm64" ;;
	*) die "Unsupported architecture: ${ARCH}. Download manually from https://github.com/${REPO}/releases" ;;
esac

FILENAME="openagent_${OS_NAME}_${ARCH_NAME}.tar.gz"
URL="https://github.com/${REPO}/releases/download/${OPENAGENT_VERSION}/${FILENAME}"

# ── download & extract ─────────────────────────────────────────────────────────
TMPDIR="$(mktemp -d)"
trap 'rm -rf "${TMPDIR}"' EXIT

info "Downloading ${URL} ..."
curl -fsSL --proto '=https' --tlsv1.2 -o "${TMPDIR}/${FILENAME}" "${URL}"

info "Extracting..."
tar -xzf "${TMPDIR}/${FILENAME}" -C "${TMPDIR}"

BINARY="$(find "${TMPDIR}" -maxdepth 2 -type f -name "openagent" | head -1)"
[[ -n "${BINARY}" ]] || die "openagent binary not found in archive."

# ── install ───────────────────────────────────────────────────────────────────
if [[ ! -w "${INSTALL_DIR}" ]]; then
	info "Writing to ${INSTALL_DIR} requires sudo..."
	sudo install -m 755 "${BINARY}" "${INSTALL_DIR}/openagent"
else
	install -m 755 "${BINARY}" "${INSTALL_DIR}/openagent"
fi

info ""
info "openagent ${OPENAGENT_VERSION} installed to ${INSTALL_DIR}/openagent"
info ""
info "Next steps:"
info "  1. Edit conf/app.conf to point to your MySQL/MariaDB database."
info "  2. Run: openagent serve"
info "  3. Open:  http://127.0.0.1:14000/"
info ""
info "For more information visit https://github.com/${REPO}"
info ""
