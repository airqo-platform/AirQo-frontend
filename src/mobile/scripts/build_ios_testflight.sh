#!/usr/bin/env bash
# Builds an iOS release IPA ready for App Store Connect:
# preflight -> pull staging -> clean -> pub get -> pod install -> flutter build ipa
# -> verify IPA -> bump build number -> upload (optional) or open Transporter.
# pubspec.yaml is only updated once a verified IPA exists, so a failed build leaves the working tree clean.
# Run from anywhere: ./scripts/build_ios_testflight.sh
#
# Optional environment variables:
#   ASC_API_KEY_ID, ASC_API_ISSUER_ID  Upload the IPA with an App Store Connect API key.
#                                      The key file must be at ~/.appstoreconnect/private_keys/AuthKey_<ASC_API_KEY_ID>.p8
#   IOS_BUILD_NO_OPEN=1                Don't reveal the IPA in Finder or open Transporter at the end.

set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
MOBILE_DIR="$(dirname "$SCRIPT_DIR")"
cd "$MOBILE_DIR"

EXPECTED_BUNDLE_ID="com.airqo.net"
RELEASE_NOTES="ios/release_notes.txt"

echo "==> Checking required tools"
for tool in git flutter pod xcodebuild unzip security; do
  if ! command -v "$tool" >/dev/null 2>&1; then
    echo "Error: '$tool' was not found on PATH. See ios/IOS_DEPLOY_GUIDE.md prerequisites." >&2
    exit 1
  fi
done

# Upload needs both API key values; one alone is almost certainly a typo, so stop before building.
if { [[ -n "${ASC_API_KEY_ID:-}" ]] && [[ -z "${ASC_API_ISSUER_ID:-}" ]]; } ||
   { [[ -z "${ASC_API_KEY_ID:-}" ]] && [[ -n "${ASC_API_ISSUER_ID:-}" ]]; }; then
  echo "Error: set both ASC_API_KEY_ID and ASC_API_ISSUER_ID to upload, or neither to upload manually." >&2
  exit 1
fi

echo "==> Pulling latest staging"
if [[ -n "$(git status --porcelain)" ]]; then
  echo "Error: working tree has uncommitted changes. Commit or stash them, then rerun." >&2
  exit 1
fi
git checkout staging
git pull --ff-only origin staging

current_version="$(grep '^version:' pubspec.yaml | awk '{print $2}')"
if [[ ! "$current_version" =~ ^[0-9]+(\.[0-9]+)*\+[0-9]+$ ]]; then
  echo "Error: pubspec.yaml version '${current_version}' must look like 3.0.9+0 (version+build number)." >&2
  exit 1
fi
name_part="${current_version%+*}"
build_part="${current_version##*+}"
# 10# forces base 10, so a build number like 09 isn't read as octal.
new_build=$((10#$build_part + 1))
new_version="${name_part}+${new_build}"

echo "==> Building version ${name_part}, build ${new_build}"
echo "    App Store Connect rejects a version that is already approved or live."
echo "    If ${name_part} shows 'Ready for Distribution', stop and raise the version in pubspec.yaml."
if [[ ! -s "$RELEASE_NOTES" ]]; then
  echo "Warning: ${RELEASE_NOTES} is missing or empty. Add this version's release notes before submitting." >&2
fi

# Flutter writes the IPA and archive under its build directory, which
# `flutter config --build-dir` can move away from the default "build".
build_dir="$(flutter config --machine 2>/dev/null | plutil -extract build-dir raw -o - - 2>/dev/null || true)"
build_dir="${build_dir:-build}"
ipa_dir="${build_dir}/ios/ipa"
archive_path="${build_dir}/ios/archive/Runner.xcarchive"

echo "==> Cleaning build folder (${build_dir})"
flutter clean
# Make sure an IPA from an earlier run can't be picked up as this run's output.
rm -rf "$ipa_dir"

echo "==> Fetching Dart dependencies"
flutter pub get

echo "==> Installing iOS pods"
(cd ios && pod install)

echo "==> Building release IPA (${new_version})"
flutter build ipa --release --build-number="${new_build}"

# flutter build ipa can exit 0 when the archive succeeds but the IPA export
# fails (e.g. signing errors), so check for the IPA itself.
ipa_path="$(find "$ipa_dir" -maxdepth 1 -name '*.ipa' -print -quit 2>/dev/null || true)"
if [[ -z "$ipa_path" ]]; then
  {
    echo
    echo "Error: no IPA was created. Check the export errors above."
    echo "pubspec.yaml was not changed; it is still ${current_version}."
    echo "'PLA Update available' means the Account Holder must accept Apple's updated agreement."
    if [[ -d "$archive_path" ]]; then
      echo "The archive was built as ${new_version} and can be uploaded from Xcode:"
      printf '  open %q\n' "${MOBILE_DIR}/${archive_path}"
      echo "If you upload it, set 'version: ${new_version}' in pubspec.yaml and commit it,"
      echo "otherwise the next run will reuse this build number and be rejected."
    fi
  } >&2
  exit 1
fi

echo "==> Verifying IPA"
# Read the version, bundle ID and provisioning profile from inside the IPA, so a
# wrong build number or a development-signed build is caught before upload.
verify_dir="$(mktemp -d)"
unzip -q -o "$ipa_path" 'Payload/*.app/Info.plist' 'Payload/*.app/embedded.mobileprovision' -d "$verify_dir" >/dev/null 2>&1 || true
app_dir="$(find "$verify_dir/Payload" -maxdepth 1 -name '*.app' -print -quit 2>/dev/null || true)"
app_dir="${app_dir:-$verify_dir/missing.app}"
# PlistBuddy prints errors to stdout, so only read files that exist and are non-empty.
plist_get() { [[ -s "$1" ]] || return 0; /usr/libexec/PlistBuddy -c "Print :$2" "$1" 2>/dev/null || true; }
ipa_version="$(plist_get "$app_dir/Info.plist" CFBundleShortVersionString)"
ipa_build="$(plist_get "$app_dir/Info.plist" CFBundleVersion)"
ipa_bundle_id="$(plist_get "$app_dir/Info.plist" CFBundleIdentifier)"
security cms -D -i "$app_dir/embedded.mobileprovision" > "$verify_dir/profile.plist" 2>/dev/null || true
profile_name="$(plist_get "$verify_dir/profile.plist" Name)"
profile_team="$(plist_get "$verify_dir/profile.plist" TeamName)"
# Development and ad hoc profiles list devices; App Store profiles don't.
if /usr/libexec/PlistBuddy -c 'Print :ProvisionedDevices' "$verify_dir/profile.plist" >/dev/null 2>&1; then
  profile_kind="development or ad hoc"
elif [[ -n "$profile_name" ]]; then
  profile_kind="App Store"
else
  profile_kind="unreadable"
fi
rm -rf "$verify_dir"

echo "    Version ${ipa_version} (${ipa_build}), ${ipa_bundle_id}"
echo "    Profile: ${profile_name:-unknown} (${profile_kind}), team ${profile_team:-unknown}"
problems=()
[[ "$ipa_version" == "$name_part" ]] || problems+=("version is '${ipa_version}', expected '${name_part}'")
[[ "$ipa_build" == "$new_build" ]] || problems+=("build number is '${ipa_build}', expected '${new_build}'")
[[ "$ipa_bundle_id" == "$EXPECTED_BUNDLE_ID" ]] || problems+=("bundle ID is '${ipa_bundle_id}', expected '${EXPECTED_BUNDLE_ID}'")
[[ "$profile_kind" == "App Store" ]] || problems+=("provisioning profile is ${profile_kind}, expected App Store")
if (( ${#problems[@]} > 0 )); then
  {
    echo
    echo "Error: the IPA failed verification:"
    printf '  - %s\n' "${problems[@]}"
    echo "pubspec.yaml was not changed; it is still ${current_version}. Don't upload this IPA."
  } >&2
  exit 1
fi

echo "==> Bumping build number in pubspec.yaml"
sed -i '' "s/^version: .*/version: ${new_version}/" pubspec.yaml
echo "    ${current_version} -> ${new_version}"

uploaded=0
if [[ -n "${ASC_API_KEY_ID:-}" && -n "${ASC_API_ISSUER_ID:-}" ]]; then
  echo "==> Uploading to App Store Connect"
  if ! xcrun altool --upload-app --type ios -f "$ipa_path" \
      --apiKey "$ASC_API_KEY_ID" --apiIssuer "$ASC_API_ISSUER_ID"; then
    {
      echo
      echo "Error: the upload failed. The IPA is fine: upload ${ipa_path} with Transporter instead."
      echo "pubspec.yaml is now ${new_version}; commit it once the upload succeeds."
    } >&2
    exit 1
  fi
  uploaded=1
elif [[ -z "${IOS_BUILD_NO_OPEN:-}" ]]; then
  # Hand off to the manual upload: show the IPA and open Transporter if installed.
  open -R "$ipa_path" || true
  open -a Transporter 2>/dev/null || echo "    Transporter isn't installed: https://apps.apple.com/us/app/transporter/id1450874784"
fi

echo
echo "Done. IPA at: ${ipa_path}"
echo "Version: ${new_version}"
if (( uploaded )); then
  echo "Uploaded. Wait for build ${name_part} (${new_build}) to finish processing in App Store Connect."
else
  echo "Next: drag the IPA into Transporter and click Deliver."
fi
if [[ -s "$RELEASE_NOTES" ]]; then
  echo
  echo "Release notes for 'What's New in This Version' (${RELEASE_NOTES}):"
  sed 's/^/    /' "$RELEASE_NOTES"
fi
echo
echo "Commit the pubspec.yaml change once the upload succeeds; the next run needs a clean working tree."
