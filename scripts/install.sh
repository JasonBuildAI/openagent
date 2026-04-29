#!/usr/bin/env bash
# OpenAgent one-step install: download the release archive for your platform.
# Usage:
#   curl -fsSL --proto '=https' --tlsv1.2 \
#     https://raw.githubusercontent.com/the-open-agent/openagent/master/scripts/install.sh | bash
#
# Optional environment variables:
#   OPENAGENT_VERSION   e.g. v1.777.3  (default: latest release)
#   INSTALL_DIR         installation directory (default: $HOME/.local/share/openagent)
#   BIN_DIR             directory for the openagent symlink on PATH (default: $HOME/.local/bin)

set -euo pipefail

OPENAGENT_VERSION="${OPENAGENT_VERSION:-latest}"
INSTALL_DIR="${INSTALL_DIR:-$HOME/.local/share/openagent}"
BIN_DIR="${BIN_DIR:-$HOME/.local/bin}"

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
	x86_64|amd64)  ARCH_NAME="x86_64" ;;
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

# Remove the tarball so it is never copied into INSTALL_DIR
rm -f "${TMPDIR}/${FILENAME}"

# Locate the binary anywhere in the extraction tree, then use its parent as
# the source root (handles both flat and subdirectory archives).
BINARY="$(find "${TMPDIR}" -type f -name "openagent" | head -1)"
[[ -n "${BINARY}" ]] || die "openagent binary not found in archive."
SOURCE_DIR="$(dirname "${BINARY}")"

# ── install all files ────────────────────────────────────────────────────────
info "Installing all files to ${INSTALL_DIR} ..."

if [[ ! -d "${INSTALL_DIR}" ]]; then
	mkdir -p "${INSTALL_DIR}" 2>/dev/null || sudo mkdir -p "${INSTALL_DIR}"
fi

# Use sudo when the target directory is not writable
if [[ -w "${INSTALL_DIR}" ]]; then
	cp -r "${SOURCE_DIR}/." "${INSTALL_DIR}/"
	chmod 755 "${INSTALL_DIR}/openagent"
else
	info "Writing to ${INSTALL_DIR} requires sudo..."
	sudo cp -r "${SOURCE_DIR}/." "${INSTALL_DIR}/"
	sudo chmod 755 "${INSTALL_DIR}/openagent"
fi

# ── add binary to PATH via BIN_DIR symlink ────────────────────────────────────
mkdir -p "${BIN_DIR}"
if [[ -w "${BIN_DIR}" ]]; then
	ln -sf "${INSTALL_DIR}/openagent" "${BIN_DIR}/openagent"
else
	info "Creating symlink in ${BIN_DIR} requires sudo..."
	sudo ln -sf "${INSTALL_DIR}/openagent" "${BIN_DIR}/openagent"
fi

# Ensure BIN_DIR is on PATH in the current shell profile (best-effort)
SHELL_RC=""
case "${SHELL:-}" in
	*/zsh)  SHELL_RC="$HOME/.zshrc" ;;
	*/bash) SHELL_RC="$HOME/.bashrc" ;;
esac

if [[ -n "${SHELL_RC}" ]] && ! grep -q "${BIN_DIR}" "${SHELL_RC}" 2>/dev/null; then
	printf '\nexport PATH="%s:$PATH"\n' "${BIN_DIR}" >> "${SHELL_RC}"
	info "Added ${BIN_DIR} to PATH in ${SHELL_RC}."
fi

info ""
info "openagent ${OPENAGENT_VERSION} installed to ${INSTALL_DIR}"
info ""
info "Next steps:"
info "  1. Edit ${INSTALL_DIR}/conf/app.conf to point to your MySQL/MariaDB database."
info "  2. cd \"${INSTALL_DIR}\""
info "  3. Run: ./openagent serve   (or just: openagent serve)"
info "  4. Open:  http://127.0.0.1:14000/"
info ""
info "For more information visit https://github.com/${REPO}"
info ""
