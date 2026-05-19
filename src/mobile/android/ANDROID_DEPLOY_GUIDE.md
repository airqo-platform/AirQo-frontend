# AirQo Android Play Store Deployment Guide

This guide walks through deploying the AirQo Flutter app to the Google Play Store.

---

## App Details

| Field | Value |
|---|---|
| App name | AirQo |
| Application ID | `com.airqo.app` |
| Firebase Project | `airqo-250220` |
| Min SDK version | 23 (Android 6.0) |
| Target / Compile SDK | 36 |
| Build flavor (production) | `airqo` |

---

## How Deployment Works

Deployment is fully automated via GitHub Actions. There is no manual build step.

**Workflow file:** `.github/workflows/deploy-android-to-play-store.yml`

The workflow:
1. Pulls secrets (keystore, `.env`, Play Store service account) from **GCP Secret Manager**
2. Builds a signed `.aab` using `flutter build appbundle --flavor airqo`
3. Uploads it to the Play Store via **Fastlane** (`android/fastlane/Fastfile` → `play_store` lane)
4. The build is submitted to the Play Store — you then **publish it manually** from the Play Console

---

## Before Every Release

### 1. Update the version number
In `pubspec.yaml`:
```yaml
version: 3.0.4+105   # marketing_version+build_number
```
- `3.0.4` → shown to users on the Play Store (`versionName`)
- `+105` → must be **strictly higher than the last uploaded build** (`versionCode`)

The Fastlane `play_store` lane auto-increments the build number by fetching the current production version from the Play Store and adding 1 — so you do **not** need to manually bump `+N` in `pubspec.yaml` for the build number. However, keep `versionName` (`3.x.x`) up to date before triggering the workflow.

### 2. Update the release notes
Edit `android/fastlane/release_notes.txt` with what's new in this version. The workflow copies this into the Play Store changelog automatically.

### 3. Pull latest from `staging`
```bash
git checkout staging
git pull origin staging
```

---

## Triggering the Deployment

1. Go to the repository on GitHub
2. Navigate to **Actions** → **deploy-android-to-play-store**
3. Click **Run workflow**
4. Select the `staging` branch
5. Check the **"Deploy android to play store"** checkbox → click **Run workflow**

The workflow takes roughly **10–15 minutes** to complete.

---

## After the Workflow Completes

Once the workflow succeeds, the build is uploaded to the Play Store but **not yet live**.

1. Go to https://play.google.com/console
2. Select the **AirQo** app
3. Navigate to **Release → Production**
4. The new build will appear as a draft release
5. Review it, then click **Start rollout to Production** to publish

Google's review typically takes a few hours to a couple of days.

---

## Secrets (managed in GCP — no local setup needed)

The workflow pulls all secrets automatically. For reference, these are the GCP secrets used:

| Secret name | Purpose |
|---|---|
| `prod-key-mobile-upload-keystore-encrypted` | Release keystore (`.jks`) |
| `prod-key-mobile-app` | `prod-key.properties` (keystore credentials) |
| `prod-key-mobile-properties-CI` | `key.properties` (Maps API keys etc.) |
| `prod-env-mobile-app` | `.env.prod` |
| `prod-env-mobile-CI` | `.env.dev` |
| `MOBILE_ANDROID_PLAYSTORE_SA` | Play Store service account JSON (GitHub secret) |
| `GCP_SA_CREDENTIALS` | GCP service account for Secret Manager access (GitHub secret) |

Contact the admin if any secrets need to be rotated.

---

## Common Issues

| Problem | Fix |
|---|---|
| Workflow fails at "Add keystore" step | GCP service account (`GCP_SA_CREDENTIALS`) may be expired — check with admin |
| `versionCode X has already been used` | The Fastlane lane auto-increments, but if the Play Store API call fails it may reuse an old number — re-run the workflow |
| `flutter build appbundle` fails | Check the workflow logs for the exact error; usually a dependency or SDK version issue in CI |
| Build doesn't appear in Play Console | Wait a few minutes after the workflow completes — uploads can take time to process |
| Fastlane `play_store` lane fails | Verify `MOBILE_ANDROID_PLAYSTORE_SA` GitHub secret is valid and the service account has Play Store API access |


---

## Quick Reference Checklist

- [ ] `versionName` updated in `pubspec.yaml`
- [ ] `android/fastlane/release_notes.txt` updated
- [ ] Changes pushed to `staging`
- [ ] GitHub Actions → **deploy-android-to-play-store** → **Run workflow** (on `staging`, checkbox checked)
- [ ] Workflow completes successfully (~10–15 min)
- [ ] Build appears in Play Console → Production → draft release
- [ ] Reviewed and rolled out from Play Console
