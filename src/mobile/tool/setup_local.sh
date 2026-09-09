#!/usr/bin/env bash
# One-time local files so `flutter run --debug --flavor airqodev` can start.
set -euo pipefail

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
cd "$ROOT"

copy_if_missing() {
  local src="$1"
  local dest="$2"
  if [[ -f "$dest" ]]; then
    echo "keep  $dest"
    return
  fi
  cp "$src" "$dest"
  echo "create $dest"
}

copy_if_missing ".env.example" ".env.prod"
copy_if_missing ".env.example" ".env.dev"
copy_if_missing "android/local.defaults.properties" "android/secrets.properties"
copy_if_missing "ios/Flutter/ApiKeys.xcconfig.example" "ios/Flutter/ApiKeys.xcconfig"

echo
echo "Local placeholder files are in place."
echo "For live API data, replace placeholders in .env.prod and .env.dev"
echo "with values from GCP Secret Manager."
echo
echo "Next:"
echo "  flutter pub get"
echo "  flutter devices"
echo "  flutter run --debug --flavor airqodev"
