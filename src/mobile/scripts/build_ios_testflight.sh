#!/usr/bin/env bash
# Builds an iOS release IPA ready for TestFlight upload:
# pull staging -> clean -> pub get -> pod install -> bump build number -> flutter build ipa.
# Run from anywhere: ./scripts/build_ios_testflight.sh

set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
MOBILE_DIR="$(dirname "$SCRIPT_DIR")"
cd "$MOBILE_DIR"

echo "==> Pulling latest staging"
git pull origin staging

echo "==> Cleaning build folder"
flutter clean

echo "==> Fetching Dart dependencies"
flutter pub get

echo "==> Installing iOS pods"
(cd ios && pod install)

echo "==> Bumping build number in pubspec.yaml"
current_version="$(grep '^version:' pubspec.yaml | awk '{print $2}')"
name_part="${current_version%+*}"
build_part="${current_version##*+}"
new_build=$((build_part + 1))
new_version="${name_part}+${new_build}"
sed -i '' "s/^version: .*/version: ${new_version}/" pubspec.yaml
echo "    ${current_version} -> ${new_version}"

echo "==> Building release IPA"
flutter build ipa --release

echo
echo "Done. IPA at: build/ios/ipa/airqo.ipa"
echo "Version: ${new_version}"
echo "Remember to match Build/Version in Xcode (Runner target -> General) if uploading via Organizer."
