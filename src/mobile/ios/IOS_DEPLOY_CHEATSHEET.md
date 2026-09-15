# iOS Deploy Cheatsheet — AirQo

Quick reference. Full detail lives in [`IOS_DEPLOY_GUIDE.md`](./IOS_DEPLOY_GUIDE.md).

**App:** bundle ID `com.airqo.net` · Apple Team `DFMDF9D6NT` · Firebase project `airqo-250220`

---

## 1. Manual Deployment (no fastlane)

### Files you edit by hand
| File | What to change |
|---|---|
| `src/mobile/pubspec.yaml` | `version: X.Y.Z+N` — bump marketing version **and** build number. `+N` must be higher than the last build ever uploaded to App Store Connect, or the upload gets rejected. |
| `ios/Runner.xcworkspace` → Runner target → **General** tab | Confirm **Version** and **Build** fields match `pubspec.yaml` (only matters if you build via Xcode Archive instead of the CLI). |
| `ios/ExportOptions.plist` | Only touch this if `flutter build ipa` hits a signing error. |
| `ios/Runner/GoogleService-Info.plist` | Only if it's missing/regenerated — download from Firebase console, project `airqo-250220`. |

### Commands, in order

```bash
# One-time machine setup (Mac only)
sudo xcodebuild -license accept
xcode-select --install
sudo gem install cocoapods

# Every release: pull latest code
git checkout staging
git pull origin staging

# Install dependencies
flutter pub get
cd ios && pod install && cd ..

# --- Now manually edit pubspec.yaml version: X.Y.Z+N ---

# Build the signed .ipa
flutter build ipa --release

# If you hit a signing error, retry with:
flutter build ipa --release --export-options-plist=ios/ExportOptions.plist
```

Output: `build/ios/ipa/airqo.ipa`

**If the CLI build fails**, fall back to Xcode:
1. Open `ios/Runner.xcworkspace` (not `.xcodeproj`)
2. Select **Any iOS Device (arm64)** as the build target
3. **Product → Archive**, wait for the Organizer window

### Upload to App Store Connect

Pick one:
```bash
# CLI
xcrun altool --upload-app \
  --type ios \
  --file build/ios/ipa/airqo.ipa \
  --username "your-apple-id@example.com" \
  --password "@keychain:AC_PASSWORD"
```
- Or: Xcode Organizer → select archive → **Distribute App** → App Store Connect → Upload
- Or: drag `airqo.ipa` into the **Transporter** app

### Submit for review
1. https://appstoreconnect.apple.com → AirQo → iOS App
2. **+** next to the version number (or open the existing draft)
3. Fill in "What's New" + screenshots if changed
4. **Build** section → **+** → select the uploaded build
5. **Add for Review** / **Submit for Review**

### Common issues (manual route)

| Problem | Fix |
|---|---|
| `Build number already exists` | Bump `+N` in `pubspec.yaml` higher than the last upload |
| `No signing certificate` | Xcode → Settings → Accounts → Download Manual Profiles |
| `Provisioning profile doesn't include bundle ID` | Confirm bundle ID is `com.airqo.net` in Signing & Capabilities |
| `Pod install fails` | `cd ios && pod repo update && pod install` |
| `flutter build ipa` fails with an Xcode error | `flutter clean && flutter pub get && cd ios && pod install` then retry |
| Builds fine but crashes on device | Confirm you built with `--release`, not `--debug` |

---

## 2. Fastlane Approach (automated, recommended)

Auto-increments the build number for you — you never touch `+N` again.

### One-time setup
```bash
cd src/mobile/ios
bundle install
```
Get an App Store Connect API key from the admin (Key ID, Issuer ID, `.p8` file), then:
```bash
export ASC_KEY_ID="XXXXXXXXXX"
export ASC_ISSUER_ID="xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx"
export ASC_KEY_PATH="/absolute/path/to/AuthKey_XXXXXXXXXX.p8"
```

### File you still edit by hand
| File | What to change |
|---|---|
| `src/mobile/pubspec.yaml` | Only the marketing version, e.g. `3.0.5+1` → `3.0.6+1`. Leave the `+N` build number alone — fastlane overrides it at build time. |

### Command
```bash
cd src/mobile/ios
git checkout staging && git pull origin staging
flutter pub get && (cd ios && pod install)
bundle exec fastlane ios release
```
This one command: looks up the last build number from App Store Connect → increments it → runs `flutter build ipa --release --build-number=<n>` → uploads to TestFlight.

### Recommended dry run before first real use
```bash
bundle exec fastlane run app_store_build_number app_identifier:com.airqo.net
```
Confirms the API key and lookup work before you trust it with a real build.

Then proceed exactly as in the manual route's "Submit for review" section — fastlane only handles the build + TestFlight upload, not the App Store Connect review submission.
