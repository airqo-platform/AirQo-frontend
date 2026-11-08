# AirQo iOS App Store Deployment Guide

This guide walks through everything needed to build and submit the AirQo Flutter app to the Apple App Store.

---

## App Details

| Field | Value |
|---|---|
| App name | AirQo - Air Quality |
| Bundle ID | `com.airqo.net` |
| Apple Team ID | `DFMDF9D6NT` |
| Apple team name | Engineer Bainomugisha (Individual membership) |
| Account Holder | Engineer Bainomugisha |
| Firebase Project | `airqo-250220` |
| Min iOS version | 16.0 |
| Release notes file | `ios/release_notes.txt` |

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

### 4. App Store Connect access
The team (`DFMDF9D6NT`) is an **Individual** membership owned by Engineer Bainomugisha. Other people work on it as **App Store Connect users**, not as members of the developer website.

1. Ask Engineer Bainomugisha to add your Apple ID at https://appstoreconnect.apple.com → **Users and Access**, with the **App Manager** role (or **Developer** at minimum, which can upload builds). To export builds yourself, also ask for **Access to Cloud Managed Distribution Certificate** (see [Signing & Certificates](#signing--certificates)).
2. Accept the invitation email, then sign in at https://appstoreconnect.apple.com/apps. Your name at the top right should show **Engineer Bainomugisha** as the team, and **AirQo - Air Quality** should be listed.
3. Sign into Xcode: **Xcode → Settings → Accounts → `+`** → your Apple ID. Pick the **Engineer Bainomugisha** team, not your **(Personal Team)**.

> If you sign in at https://developer.apple.com/account with your own Apple ID, you may see **Join the Apple Developer Program / Enroll today**. That's expected for App Store Connect users. **Don't enroll**: it starts a new paid membership that doesn't own the AirQo app.

### 5. Transporter
Install **Transporter** from the Mac App Store: https://apps.apple.com/us/app/transporter/id1450874784. It's the simplest way to upload the IPA. Sign in with your Apple ID.

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

### 1. Check for Apple notices
Open https://appstoreconnect.apple.com/apps. If a yellow **Apple Developer Program License Agreement Updated** banner is showing, builds can't be exported or uploaded until the **Account Holder** signs in at https://developer.apple.com/account and accepts it. Only the Account Holder can do this, so ask Engineer Bainomugisha.

### 2. Choose the version number
In `pubspec.yaml` (project root):
```yaml
version: 3.0.9+0   # format is: marketing_version+build_number
```
- `3.0.9` → shown to users on the App Store (`CFBundleShortVersionString`)
- `+0` → build number (`CFBundleVersion`). The build script adds 1 before building, so `+0` produces build `1`.

Check the current status under **Apps** in App Store Connect. If the version in `pubspec.yaml` already shows **Ready for Distribution** (approved or live), Apple rejects any new upload with that version. Raise the marketing version (for example `3.0.8` → `3.0.9`) and reset the build number to `+0`, then commit it to `staging`.

You don't need to change anything in Xcode. `ios/Runner/Info.plist` reads both values from Flutter's build settings, so `pubspec.yaml` is the only source. Xcode's General tab may still show an old value from the project file; ignore it.

### 3. Write the release notes
Update `ios/release_notes.txt` with what's new for users in this version, and commit it to `staging`. The script prints it at the end for pasting into **What's New in This Version**. Review the mobile commits since the last release:
```bash
git log origin/staging --since=<last release date> --no-merges --format='%h %ad %s' --date=short -- src/mobile
```
Write for app users, not developers: leave out build, test and tooling changes. Keep it consistent with `android/fastlane/release_notes.txt` where the same features ship on both platforms.

---

## Building the App

### Option A: One-command script (recommended)
```bash
# From the mobile/ directory
./scripts/build_ios_testflight.sh
```
The script needs a clean working tree. It then:

1. Checks the required tools are installed, and pulls `staging`
2. Prints the version it will build, and warns if `ios/release_notes.txt` is missing or empty
3. Runs `flutter clean` → `flutter pub get` → `pod install`
4. Runs `flutter build ipa --release` using the next build number
5. Checks that an IPA exists, then verifies inside it that the version, build number and bundle ID match, and that it's signed with an **App Store** provisioning profile
6. Bumps the build number in `pubspec.yaml`
7. Uploads the IPA if an App Store Connect API key is set (see [Option C](#option-c-api-key-upload-from-the-script)); otherwise it reveals the IPA in Finder and opens Transporter
8. Prints the release notes and the next steps

Output IPA is at `build/ios/ipa/airqo.ipa`.

`pubspec.yaml` only changes once a verified IPA exists. A failed build, export or verification leaves the version unchanged, so a rerun reuses the same build number. The script output shows the build number used by each run, including a failed one.

Set `IOS_BUILD_NO_OPEN=1` to stop the script opening Finder and Transporter.

**Warnings you can ignore:** messages that targets such as `GoogleMLKit`, `MLImage` or `MLKitTranslate` "do not support arm64 architecture" only affect running on Apple Silicon simulators, not App Store builds.

### Option B: Command Line (manual)
```bash
# From the mobile/ directory
flutter build ipa --release --build-number=<next build number>
```

The `.ipa` file will be at:
```text
build/ios/ipa/airqo.ipa
```

`flutter build ipa` can exit successfully even when the IPA export fails, so check that the file exists. When you build manually, update `pubspec.yaml` to the version you built yourself.

### Option C: Xcode Archive (if command line fails)
1. Open `ios/Runner.xcworkspace` in Xcode
2. Select **Any iOS Device (arm64)** as the build target (not a simulator)
3. Menu: **Product → Archive**
4. Wait for the archive to complete — the Organizer window will open automatically

---

## Signing & Certificates

Xcode handles this automatically if "Automatically manage signing" is checked:
- Runner target → Signing & Capabilities → check **Automatically manage signing**
- Team: **Engineer Bainomugisha** (`DFMDF9D6NT`)

Exporting the IPA needs **one** of these:
- **Cloud signing permission:** Xcode signs with a cloud-managed distribution certificate, so no Apple Distribution certificate is needed in your keychain. The Account Holder and Admins have this permission. Other roles need **Access to Cloud Managed Distribution Certificate** turned on for their user in **Users and Access**, and the **Developer** role doesn't include it by default.
- **A local Apple Distribution identity** in your keychain, created by someone allowed to manage certificates.

If you have neither, the export fails with `No signing certificate "iOS Distribution" found`. Ask the Account Holder (Engineer Bainomugisha) to turn on the permission for you, or to export and upload the build from the archive the script leaves behind.

If you see a provisioning profile error:
1. Xcode → Settings → Accounts → select your Apple ID → **Download Manual Profiles**
2. Or regenerate at: https://developer.apple.com → Certificates, IDs & Profiles (Account Holder)

---

## Uploading to App Store Connect

### Option A: Transporter (recommended)
1. Open Transporter (the build script opens it for you) and sign in with your Apple ID
2. Drag in `build/ios/ipa/airqo.ipa`
3. Click **Deliver** and wait for **Delivered**

### Option B: Xcode Organizer
Use this when the script built an archive but the IPA export failed, or after an Xcode archive.
1. Open the archive. After the script, run `open build/ios/archive/Runner.xcarchive` (the script prints the full command)
2. Select the archive → **Distribute App**
3. Choose **App Store Connect** → **Upload**
4. Keep the default signing options and click **Upload**

### Option C: API key upload from the script
The build script can upload for you with an App Store Connect API key:
1. An Admin creates a team key in App Store Connect under **Users and Access → Integrations → App Store Connect API**, with the **App Manager** role, and shares the key ID, issuer ID and `.p8` file securely
2. Save the key as `~/.appstoreconnect/private_keys/AuthKey_<KEY_ID>.p8`. Never commit it
3. Run the script with both IDs set:
   ```bash
   ASC_API_KEY_ID=<KEY_ID> ASC_API_ISSUER_ID=<ISSUER_ID> ./scripts/build_ios_testflight.sh
   ```

The script uploads with `xcrun altool` after bumping the build number. If the upload fails, the IPA is still valid: upload it with Transporter instead.

---

## Submitting for Review on App Store Connect

Once the build is uploaded and processed (usually 5–30 minutes, Apple will email you):

1. Go to https://appstoreconnect.apple.com/apps and select **AirQo - Air Quality**
2. On the **TestFlight** tab, wait for the build to finish processing, and answer the export compliance question if asked. Optionally test it with TestFlight
3. On the **Distribution** tab, click **+** next to **iOS App** to create the new version (or select an existing draft)
4. Fill in:
   - **What's New in This Version**: paste from `ios/release_notes.txt`
   - Screenshots (if changed — 6.5" and 5.5" iPhone sizes required)
5. Scroll to **Build** section → click **+** → select the uploaded build
6. Review all metadata is correct
7. Click **Add for Review**, then **Submit for Review**, and choose manual or automatic release after approval

Apple review typically takes **1–3 business days**.

### After the upload succeeds
Commit the build number bump in `pubspec.yaml` to `staging`. The next script run needs a clean working tree, and reusing an uploaded build number is rejected.

---

## Account Holder Tasks

Some App Store Connect actions can only be done by the Account Holder (Engineer Bainomugisha) or an Admin:
- Accepting updated Apple agreements (see [Before Every Release](#1-check-for-apple-notices))
- Adding users and changing roles in **Users and Access**
- Creating App Store Connect API keys
- The **Regulated Medical Device** declaration for the EU/EEA, UK and US, due by early 2027

---

## Firebase / GoogleService-Info.plist

The Firebase config file is already in the repo at:
```text
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
| `exportArchive Unable to process request - PLA Update available` | The Account Holder must accept the updated agreement at https://developer.apple.com/account. Check for the banner at https://appstoreconnect.apple.com/apps |
| `No signing certificate "iOS Distribution" found` | Often caused by the agreement above. If not, check your role and that Xcode is signed in with the **Engineer Bainomugisha** team; an Admin can create the certificate under Xcode → Settings → Accounts → Manage Certificates |
| Script says `no IPA was created` | Read the export errors above it. Fix them, then rerun, or upload the printed archive with Xcode Organizer |
| Script says `the IPA failed verification` | Don't upload it. Fix the listed mismatch and rerun; `pubspec.yaml` is unchanged |
| Upload rejected because the version is closed or already approved | That version shows **Ready for Distribution**. Raise the marketing version in `pubspec.yaml` and rebuild |
| `Build number already exists` | Bump the build number in `pubspec.yaml` (`+N` must be higher than previous upload) |
| developer.apple.com shows **Enroll today** | You're signed in as an App Store Connect user, not the Account Holder. Don't enroll; use App Store Connect |
| `Pod install fails` | Run `cd ios && pod repo update && pod install` |
| `flutter build ipa` fails with Xcode error | Run `flutter clean && flutter pub get && cd ios && pod install` then retry |
| Build processes fine but crashes on device | Make sure you built with `--release`, not `--debug` |
| Xcode can't find the simulator for archive | Change build target to **Any iOS Device (arm64)** |
| Warnings that ML Kit targets don't support arm64 | Simulator-only; App Store builds aren't affected |


---

## Quick Reference Checklist

- [ ] On a Mac with Xcode and Transporter installed
- [ ] App Store Connect user on team `DFMDF9D6NT` with App Manager or Developer role
- [ ] No agreement banner at https://appstoreconnect.apple.com/apps
- [ ] `pubspec.yaml` version isn't already **Ready for Distribution** in App Store Connect
- [ ] `ios/release_notes.txt` updated and committed to `staging`
- [ ] `./scripts/build_ios_testflight.sh` run and finished with `Done` (or manually: `git pull`, `flutter clean`, `flutter pub get`, `pod install`, `flutter build ipa --release --build-number=<N>`, then update `pubspec.yaml`)
- [ ] `.ipa` uploaded via Transporter, the script's API key upload, or Xcode Organizer
- [ ] Build appears in App Store Connect (wait up to 30 min after upload)
- [ ] Release notes pasted into **What's New in This Version**
- [ ] Submitted for review
- [ ] `pubspec.yaml` build number bump committed to `staging`
