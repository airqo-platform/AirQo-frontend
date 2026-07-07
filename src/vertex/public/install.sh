#!/usr/bin/env bash
#
# AirQo Vertex Desktop installer for Linux.
#
# Usage:
#   curl -fsSL https://vertex.airqo.net/install.sh | bash
#
# This script never re-execs itself as root. It only escalates via `sudo`
# for the single `apt install` step, and only when not already running as
# root. Everything else (fetching release metadata, downloading, checksum
# verification) runs as the invoking user.
set -euo pipefail

REPO="airqo-platform/AirQo-frontend"
APP_NAME="AirQo Vertex"
GITHUB_API="https://api.github.com/repos/${REPO}/releases/latest"
USER_AGENT="vertex-desktop-installer"
DOWNLOAD_PAGE="https://vertex.airqo.net/download"

log() { printf '\033[1;34m==>\033[0m %s\n' "$1"; }
warn() { printf '\033[1;33mwarning:\033[0m %s\n' "$1" >&2; }
err() {
  printf '\033[1;31merror:\033[0m %s\n' "$1" >&2
  exit 1
}

require_cmd() {
  command -v "$1" >/dev/null 2>&1 ||
    err "'$1' is required but not installed. Please install it and try again."
}

usage() {
  cat <<EOF
AirQo Vertex Desktop installer (Linux)

Usage: curl -fsSL https://vertex.airqo.net/install.sh | bash

Detects whether apt/dpkg is available and installs the .deb package;
otherwise falls back to a portable .AppImage in ~/.local/bin.

For macOS/Windows, download from ${DOWNLOAD_PAGE} instead.
EOF
}

fetch_latest_release() {
  local tmp_response http_code body
  tmp_response="$(mktemp)"

  http_code="$(curl -sSL -A "$USER_AGENT" -H "Accept: application/vnd.github+json" \
    -o "$tmp_response" -w '%{http_code}' "$GITHUB_API")" || {
    rm -f "$tmp_response"
    err "Failed to reach GitHub. Check your network connection and try again."
  }

  case "$http_code" in
  200) ;;
  403 | 429)
    rm -f "$tmp_response"
    err "GitHub API rate limit reached. Try again later, or download manually from ${DOWNLOAD_PAGE}."
    ;;
  *)
    rm -f "$tmp_response"
    err "Failed to fetch the latest release info from GitHub (HTTP ${http_code})."
    ;;
  esac

  body="$(cat "$tmp_response")"
  rm -f "$tmp_response"
  printf '%s' "$body"
}

# Extracts the value of the first top-level "key": "value" match in a JSON
# blob. Good enough for GitHub's release API without requiring jq.
json_string_field() {
  local key="$1"
  grep -oP "\"${key}\"\\s*:\\s*\"\\K[^\"]+" | head -n1
}

verify_checksum() {
  local tag="$1" asset_name="$2" file_path="$3"

  if ! command -v openssl >/dev/null 2>&1; then
    warn "openssl not found; skipping checksum verification (download is still HTTPS-verified)."
    return 0
  fi

  local manifest_url manifest_body expected_sha512
  manifest_url="https://github.com/${REPO}/releases/download/${tag}/latest-linux.yml"
  if ! manifest_body="$(curl -fsSL -A "$USER_AGENT" "$manifest_url" 2>/dev/null)"; then
    warn "Could not fetch latest-linux.yml to verify the checksum; skipping (download is still HTTPS-verified)."
    return 0
  fi

  expected_sha512="$(printf '%s\n' "$manifest_body" | awk -v want="$asset_name" '
    { line = $0; gsub(/^[ \t]+|[ \t]+$/, "", line); sub(/^-[ \t]+/, "", line) }
    line == "url: " want { found = 1; next }
    found && line ~ /^sha512:/ { sub(/^sha512:[ \t]*/, "", line); print line; exit }
  ')"

  if [ -z "$expected_sha512" ]; then
    warn "No checksum entry for ${asset_name} in the release manifest; skipping verification."
    return 0
  fi

  local actual_sha512
  actual_sha512="$(openssl dgst -sha512 -binary "$file_path" | openssl base64 -A)"

  [ "$actual_sha512" = "$expected_sha512" ] ||
    err "Checksum verification failed for ${asset_name}. Refusing to install a file that doesn't match the published release manifest."

  log "Checksum verified."
}

install_deb() {
  local deb_path="$1"
  log "Installing via apt (you may be prompted for your password)..."
  if [ "$(id -u)" -eq 0 ]; then
    apt install -y "$deb_path"
  else
    require_cmd sudo
    sudo apt install -y "$deb_path"
  fi
  log "${APP_NAME} installed. Launch it from your applications menu."
}

install_appimage() {
  local appimage_path="$1"
  local install_dir="${HOME}/.local/bin"
  local dest="${install_dir}/AirQo-Vertex.AppImage"

  mkdir -p "$install_dir"
  install -m 755 "$appimage_path" "$dest"
  log "${APP_NAME} installed to ${dest}."

  case ":${PATH}:" in
  *":${install_dir}:"*) ;;
  *)
    warn "${install_dir} is not on your PATH. Add 'export PATH=\"\$HOME/.local/bin:\$PATH\"' to your shell rc file, or run it directly: ${dest}"
    ;;
  esac
}

main() {
  case "${1:-}" in
  -h | --help)
    usage
    exit 0
    ;;
  esac

  [ "$(uname -s)" = "Linux" ] ||
    err "This installer only supports Linux. For macOS/Windows, download from ${DOWNLOAD_PAGE}."

  require_cmd curl

  local arch
  arch="$(uname -m)"
  case "$arch" in
  x86_64 | amd64) : ;;
  aarch64 | arm64)
    err "arm64 Linux builds aren't published yet. Please download an amd64 build from ${DOWNLOAD_PAGE}, or check back later."
    ;;
  *)
    err "Unsupported architecture: ${arch}."
    ;;
  esac

  log "Looking up the latest ${APP_NAME} Desktop release..."
  local release_json tag
  release_json="$(fetch_latest_release)"
  tag="$(printf '%s' "$release_json" | json_string_field "tag_name")"
  [ -n "$tag" ] || err "Could not determine the latest release tag from GitHub's response."

  local install_kind asset_name
  if command -v apt >/dev/null 2>&1 || command -v dpkg >/dev/null 2>&1; then
    install_kind="deb"
    asset_name="$(printf '%s' "$release_json" | grep -oP '"name"\s*:\s*"\K[^"]+_amd64\.deb' | head -n1)"
  else
    install_kind="appimage"
    asset_name="$(printf '%s' "$release_json" | grep -oP '"name"\s*:\s*"\K[^"]+\.AppImage' | head -n1)"
  fi
  [ -n "$asset_name" ] || err "No Linux ${install_kind} asset found in the latest release (${tag})."

  log "Latest release: ${tag} (${asset_name})"

  local workdir asset_url
  workdir="$(mktemp -d)"
  trap 'rm -rf "${workdir}"' EXIT
  asset_url="https://github.com/${REPO}/releases/download/${tag}/${asset_name}"

  log "Downloading ${asset_name}..."
  curl -fsSL -A "$USER_AGENT" -o "${workdir}/${asset_name}" "$asset_url" ||
    err "Download failed: ${asset_url}"

  verify_checksum "$tag" "$asset_name" "${workdir}/${asset_name}"

  case "$install_kind" in
  deb) install_deb "${workdir}/${asset_name}" ;;
  appimage) install_appimage "${workdir}/${asset_name}" ;;
  esac
}

main "$@"
