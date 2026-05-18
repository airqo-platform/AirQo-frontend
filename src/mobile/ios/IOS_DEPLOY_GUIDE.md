# AirQo iOS App Store Deployment Guide

This guide walks through everything needed to build and submit the AirQo Flutter app to the Apple App Store.

---

## App Details

| Field | Value |
|---|---|
| App name | AirQo |
| Bundle ID | `com.airqo.net` |
| Apple Team ID | `DFMDF9D6NT` |
| Firebase Project | `airqo-250220` |
| Min iOS version | 16.0 |

---

## Prerequisites (one-time setup)

### 1. Mac with Xcode
- Must use a **Mac** — iOS builds cannot be done on Linux or Windows
- Install Xcode from the Mac App Store (latest stable version)
- After install, accept the license: `sudo xcodebuild -license accept`
- Install command-line tools: `xcode-select --install`

### 2. Flutter SDK
```bash
# Install Flutter (if not already installed)
# https://docs.flutter.dev/get-started/install/macos
flutter --version   # confirm it's installed
flutter doctor      # fix any issues shown
```
Required Flutter version: **>=3.27.0**

### 3. CocoaPods
```bash
sudo gem install cocoapods
pod --version   # should print a version number
```

### 4. Apple Developer Account Access
You need to be added to the **AirQo Apple Developer team** (`DFMDF9D6NT`).

Contact the team admin to invite your Apple ID at:
**https://developer.apple.com** → Users and Access

Once added, sign into Xcode:
- Xcode → Settings → Accounts → `+` → sign in with your Apple ID

### 5. App Store Connect Access
You also need access to App Store Connect:
**https://appstoreconnect.apple.com**

Ask the admin to add you with at least **App Manager** role.

---

## First-Time Repository Setup

```bash
# Clone the repo (if not done)
git clone <repo-url>
cd AirQo-frontend/src/mobile

# Install Flutter dependencies
flutter pub get

# Install iOS pods
cd ios
pod install
cd ..
```

> Always open `ios/Runner.xcworkspace` in Xcode — **not** `Runner.xcodeproj`.

---

## Before Every Release

### 1. Confirm the version number
In `pubspec.yaml` (project root):
```yaml
version: 3.0.4+1   # format is: marketing_version+build_number
```
- `3.0.4` → shown to users on the App Store (`CFBundleShortVersionString`)
- `+1` → build number, must be **higher than the last uploaded build** (`CFBundleVersion`)

The build number in Xcode must also be bumped. Open `ios/Runner.xcworkspace` → Runner target → General tab → confirm both Version and Build match `pubspec.yaml`.

### 2. Pull the latest code from `staging`
```bash
git checkout staging
git pull origin staging
flutter pub get
cd ios && pod install && cd ..
```

---

## Building the App

### Option A: Command Line (recommended)
```bash
# From the mobile/ directory
flutter build ipa --release
```

The `.ipa` file will be at:
```
build/ios/ipa/airqo.ipa
```

If you get signing errors, use:
```bash
flutter build ipa --release --export-options-plist=ios/ExportOptions.plist
```

### Option B: Xcode Archive (if command line fails)
1. Open `ios/Runner.xcworkspace` in Xcode
2. Select **Any iOS Device (arm64)** as the build target (not a simulator)
3. Menu: **Product → Archive**
4. Wait for the archive to complete — the Organizer window will open automatically

---

## Signing & Certificates

Xcode handles this automatically if "Automatically manage signing" is checked:
- Runner target → Signing & Capabilities → check **Automatically manage signing**
- Team: **AirQo** (`DFMDF9D6NT`)

If you see a provisioning profile error:
1. Xcode → Settings → Accounts → select your Apple ID → **Download Manual Profiles**
2. Or regenerate at: https://developer.apple.com → Certificates, IDs & Profiles

---

## Uploading to App Store Connect

### Option A: From Xcode Organizer
1. After archiving, the Organizer opens automatically
2. Select the archive → **Distribute App**
3. Choose **App Store Connect** → **Upload**
4. Leave all defaults checked (include symbols, upload bitcode if asked)
5. Click **Upload** and wait (~5 minutes)

### Option B: From Command Line (after `flutter build ipa`)
```bash
xcrun altool --upload-app \
  --type ios \
  --file build/ios/ipa/airqo.ipa \
  --username "your-apple-id@example.com" \
  --password "@keychain:AC_PASSWORD"
```

Or use **Transporter** app (free on Mac App Store) — just drag and drop the `.ipa`.

---

## Submitting for Review on App Store Connect

Once the build is uploaded and processed (usually 5–15 minutes, Apple will email you):

1. Go to https://appstoreconnect.apple.com
2. Select the **AirQo** app
3. Go to the relevant platform: **iOS App**
4. Click **+** next to the version number to create a new version (or select an existing draft)
5. Fill in:
   - **What's New in This Version** (release notes)
   - Screenshots (if changed — 6.5" and 5.5" iPhone sizes required)
6. Scroll to **Build** section → click **+** → select the uploaded build
7. Review all metadata is correct
8. Click **Add for Review** (or **Submit for Review** if all sections are complete)

Apple review typically takes **1–3 business days**.

---

## Firebase / GoogleService-Info.plist

The Firebase config file is already in the repo at:
```
ios/Runner/GoogleService-Info.plist
```
Firebase project: `airqo-250220`

If you need to regenerate it (e.g., it was accidentally deleted):
1. Go to https://console.firebase.google.com → Project `airqo-250220`
2. Project settings → Your apps → iOS app (`com.airqo.net`)
3. Download `GoogleService-Info.plist`
4. Place it at `ios/Runner/GoogleService-Info.plist`

---

## Common Issues

| Problem | Fix |
|---|---|
| `No signing certificate` | Xcode → Settings → Accounts → Download Manual Profiles |
| `Provisioning profile doesn't include bundle ID` | Check bundle ID is `com.airqo.net` in Xcode signing settings |
| `Build number already exists` | Bump the build number in `pubspec.yaml` (`+N` must be higher than previous upload) |
| `Pod install fails` | Run `cd ios && pod repo update && pod install` |
| `flutter build ipa` fails with Xcode error | Run `flutter clean && flutter pub get && cd ios && pod install` then retry |
| Build processes fine but crashes on device | Make sure you built with `--release`, not `--debug` |
| Xcode can't find the simulator for archive | Change build target to **Any iOS Device (arm64)** |


---

## Quick Reference Checklist

- [ ] On a Mac with Xcode installed
- [ ] Added to Apple Developer team (`DFMDF9D6NT`)
- [ ] Added to App Store Connect with App Manager role
- [ ] `pubspec.yaml` version and build number updated
- [ ] `git pull` latest from `staging`
- [ ] `flutter pub get` + `pod install` done
- [ ] `flutter build ipa --release` succeeds
- [ ] `.ipa` uploaded via Xcode Organizer or Transporter
- [ ] Build appears in App Store Connect (wait ~15 min after upload)
- [ ] Release notes written
- [ ] Submitted for review
