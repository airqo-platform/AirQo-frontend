# AirQo Mobile App Version 3

AirQo is a Flutter app that provides air quality information.

## Key Features

- Real-time air quality data for your location
- Easy-to-understand AQI (Air Quality Index) readings
- Current pollutant levels and health recommendations

## Run the latest staging build on your device

Use this from your machine with a phone connected (USB debugging on Android, or a trusted iPhone). `--flavor airqodev` installs as `com.airqo.app.dev` on Android, so it sits next to the Play Store app instead of overwriting it.

Work from `src/mobile` (that directory has `pubspec.yaml`). The app loads `src/mobile/.env.prod`.

```bash
git fetch origin staging && git checkout staging && git pull origin staging
cd src/mobile
flutter pub get
flutter devices
flutter run --debug --flavor airqodev
```

If Gradle still asks for Maps keys, run `bash tool/setup_local.sh` once (creates `android/secrets.properties` from defaults). It will not overwrite env files you already have.

If `flutter devices` shows more than one device, pick one:

```bash
flutter run --debug --flavor airqodev -d <deviceId>
```

### Android

1. Enable **Developer options** → **USB debugging**.
2. Unlock the phone and accept the USB debugging prompt.
3. Confirm the device appears in `flutter devices`.

### iOS

1. Open `ios/Runner.xcworkspace` in Xcode once and select a development team.
2. Trust the computer on the iPhone.
3. `--flavor airqodev` needs the shared `airqodev` Xcode scheme (checked in with this repo).

### Live API data

`.env.prod` and `.env.dev` ship as empty placeholders so Flutter has an asset to bundle. Login, maps, and measurements need real tokens from GCP Secret Manager (`prod-env-mobile-app` or `sta-env-mobile-app`). Put those values in `.env.prod` / `.env.dev` and do not commit the filled files.

## One-time developer setup

1. Install [Flutter](https://docs.flutter.dev/get-started/install) **>= 3.27**.
2. From `src/mobile`, run `flutter pub get`. If Android Gradle fails on Maps keys, run `bash tool/setup_local.sh` first.
3. Run `flutter doctor` and fix anything it reports for your platform.

Store deployment (not local device runs) is covered in:

- [Android Play Store](android/ANDROID_DEPLOY_GUIDE.md)
- [iOS App Store](ios/IOS_DEPLOY_GUIDE.md)

## Contributing

Contributions are welcome. See the [contributing guide](../../CONTRIBUTING.md).

## License

This project is open-source and licensed under the MIT License.
