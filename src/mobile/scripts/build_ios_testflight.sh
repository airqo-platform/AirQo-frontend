#!/usr/bin/env bash
# Builds an iOS release IPA ready for TestFlight upload:
# pull staging -> clean -> pub get -> pod install -> flutter build ipa -> verify IPA -> bump build number.
# pubspec.yaml is only updated once an IPA exists, so a failed build leaves the working tree clean.
# Run from anywhere: ./scripts/build_ios_testflight.sh

set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
MOBILE_DIR="$(dirname "$SCRIPT_DIR")"
cd "$MOBILE_DIR"

echo "==> Pulling latest staging"
if [[ -n "$(git status --porcelain)" ]]; then
  echo "Error: working tree has uncommitted changes. Commit or stash them, then rerun." >&2
  exit 1
fi
git checkout staging
git pull --ff-only origin staging

echo "==> Cleaning build folder"
flutter clean

echo "==> Fetching Dart dependencies"
flutter pub get

echo "==> Installing iOS pods"
(cd ios && pod install)

current_version="$(grep '^version:' pubspec.yaml | awk '{print $2}')"
name_part="${current_version%+*}"
build_part="${current_version##*+}"
new_build=$((build_part + 1))
new_version="${name_part}+${new_build}"

echo "==> Building release IPA (${new_version})"
flutter build ipa --release --build-number="${new_build}"

# flutter build ipa can exit 0 when the archive succeeds but the IPA export
# fails (e.g. signing errors), so check for the IPA itself.
ipa_path="$(find build/ios/ipa -maxdepth 1 -name '*.ipa' -print -quit 2>/dev/null || true)"
if [[ -z "$ipa_path" ]]; then
  archive_path="build/ios/archive/Runner.xcarchive"
  {
    echo
    echo "Error: no IPA was created. Check the export errors above."
    echo "pubspec.yaml was not changed; it is still ${current_version}."
    if [[ -d "$archive_path" ]]; then
      echo "The archive was built as ${new_version} and can be uploaded from Xcode:"
      printf '  open %q\n' "${MOBILE_DIR}/${archive_path}"
      echo "If you upload it, set 'version: ${new_version}' in pubspec.yaml and commit it,"
      echo "otherwise the next run will reuse this build number and be rejected."
    fi
  } >&2
  exit 1
fi

echo "==> Bumping build number in pubspec.yaml"
sed -i '' "s/^version: .*/version: ${new_version}/" pubspec.yaml
echo "    ${current_version} -> ${new_version}"

echo
echo "Done. IPA at: ${ipa_path}"
echo "Version: ${new_version}"
echo "Commit the pubspec.yaml change once the upload succeeds; the next run needs a clean working tree."
