# AirQo Android Play Store Deployment Guide

This guide walks through deploying the AirQo Flutter app to the Google Play Store.

---

## App Details

| Field | Value |
|---|---|
| App name | AirQo |
| Application ID | `com.airqo.app` |
| Firebase Project | `airqo-250220` |
| Min SDK version | 24 (Android 7.0) |
| Target / Compile SDK | 36 |
| Build flavor (production) | `airqo` |

---

## How Deployment Works

Deployment is fully automated via GitHub Actions. There is no manual build step.

**Current workflow:** `.github/workflows/deploy-android-to-play-store-azure.yml`  
GitHub Actions name: **deploy-android-to-play-store-azure**

The workflow:
1. Logs into Azure with the `AZURE_CREDENTIALS` GitHub secret
2. Pulls keystore, `key.properties`, and `.env` files from **Azure Key Vault** (`airqo-kv-prod`)
3. Builds a signed `.aab` using `flutter build appbundle --flavor airqo`
4. Uploads it to the Play Store via **Fastlane** (`android/fastlane/Fastfile` → `play_store` lane)

Fastlane sets `release_status: "completed"`. If Play Console **managed publishing** is on, the upload still waits for a human to send it live. If managed publishing is off, the production release can go live as soon as Google processes the upload — check that setting before you run the workflow.

> Do **not** use `.github/workflows/deploy-android-to-play-store.yml` (the older GCP Secret Manager path). Azure is the current production deploy.

---

## Before Every Release

### 1. Update the version number
In `pubspec.yaml`:
```yaml
version: 3.0.8+2   # marketing_version+build_number
```
- `3.0.8` → shown to users on the Play Store (`versionName`). Must be higher than the live store version (currently **3.0.4**).
- `+2` → local/dev build number. The Fastlane `play_store` lane **ignores** this for Play uploads: it fetches the current production `versionCode` and adds 1.

You do **not** need to manually bump `+N` in `pubspec.yaml` for Play Store. Keep `versionName` (`3.x.x`) ahead of the live store version before triggering the workflow.

### 2. Update the release notes
Edit `android/fastlane/release_notes.txt` with what's new in this version. The Azure workflow copies this into `fastlane/metadata/android/en-US/changelogs/default.txt`. If the file is missing, CI writes a stale `App release version 3.0.2` placeholder.

### 3. Pull latest from `staging`
```bash
git checkout staging
git pull origin staging
```

---

## Triggering the Deployment

1. Go to the repository on GitHub
2. Navigate to **Actions** → **deploy-android-to-play-store-azure**
3. Click **Run workflow**
4. Select the `staging` branch
5. Check the **"Deploy android to play store"** checkbox → click **Run workflow**

The workflow takes roughly **10–15 minutes** to complete.

---

## After the Workflow Completes

1. Go to https://play.google.com/console
2. Select the **AirQo** app
3. Navigate to **Release → Production**
4. Confirm the new `3.x.x` build is there
5. If managed publishing is on (or the release is still a draft), review it and send it to production

Google's review typically takes a few hours to a couple of days.

---

## Secrets (managed in Azure — no local setup needed)

The workflow pulls app secrets from Key Vault automatically. GitHub still holds the Azure login and Play Store service account.

| Secret | Where | Purpose |
|---|---|---|
| `AZURE_CREDENTIALS` | GitHub Actions secret | Azure login for Key Vault access |
| `MOBILE_ANDROID_PLAYSTORE_SA` | GitHub Actions secret | Play Store service account JSON |
| `prod-key-mobile-upload-keystore-encrypted` | Key Vault `airqo-kv-prod` | Release keystore (`.jks`) |
| `prod-key-mobile-airqo-dev-keystore` | Key Vault `airqo-kv-prod` | Dev flavor keystore |
| `prod-key-mobile-app` | Key Vault `airqo-kv-prod` | `prod-key.properties` (keystore credentials) |
| `prod-key-mobile-properties-CI` | Key Vault `airqo-kv-prod` | `key.properties` (Maps API keys etc.) |
| `prod-env-mobile-app` | Key Vault `airqo-kv-prod` | `.env.prod` |
| `prod-env-mobile-CI` | Key Vault `airqo-kv-prod` | `.env.dev` |

Contact the admin if any secrets need to be rotated.

---

## Common Issues

| Problem | Fix |
|---|---|
| Workflow fails at "Login to Azure" | `AZURE_CREDENTIALS` GitHub secret may be expired or missing Key Vault access — check with admin |
| Workflow fails at "Add keystore" | Secret names in Key Vault `airqo-kv-prod` may have changed — compare with the table above |
| `versionCode X has already been used` | The Fastlane lane auto-increments, but if the Play Store API call fails it may reuse an old number — re-run the workflow |
| `flutter build appbundle` fails | Check the workflow logs for the exact error; usually a dependency or SDK version issue in CI |
| Build doesn't appear in Play Console | Wait a few minutes after the workflow completes — uploads can take time to process |
| Fastlane `play_store` lane fails | Verify `MOBILE_ANDROID_PLAYSTORE_SA` GitHub secret is valid and the service account has Play Store API access |


---

## Quick Reference Checklist

- [ ] `versionName` in `pubspec.yaml` is higher than the live Play Store version
- [ ] `android/fastlane/release_notes.txt` updated
- [ ] Changes pushed to `staging`
- [ ] GitHub Actions → **deploy-android-to-play-store-azure** → **Run workflow** (on `staging`, checkbox checked)
- [ ] Workflow completes successfully (~10–15 min)
- [ ] Build appears in Play Console → Production
- [ ] Reviewed and rolled out (if managed publishing / draft still requires it)
