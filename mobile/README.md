# AirQo mobile app

## Get Started

### Install flutter

[Installing Flutter on Windows](https://flutter.dev/docs/get-started/install/windows)

[Installing Flutter on macOS](https://flutter.dev/docs/get-started/install/macos)

```bash
cd AirQo-frontend/mobile
```

### Set the secret keys

Add [.env.dev file](https://drive.google.com/file/d/1ff6PUDjWJw_uiIC-oYoBOqiUiTyPzRho/view?usp=sharing) to this directory

### Set Google maps Key

For IOS, add the [GOOGLE MAPS API Key](https://docs.google.com/document/d/1QawFn5Sfp3eOUODb38dLFsIVrU-erFpJeC7OEbWS_9Q/edit?usp=sharing),  in  `ios/Runner/AppDelegate.swift`
`GMSServices.provideAPIKey("<INSERT KEY HERE>")`

### Run the app

```bash
flutter run
```

### Some useful commands

```bash
flutter pub run build_runner build --delete-conflicting-outputs
flutter build appbundle [--analyze-size]
flutter build ipa
dart fix --dry-run
dart fix --apply
flutter pub run dart_code_metrics:metrics analyze lib
flutter pub run dart_code_metrics:metrics check-unused-files lib
flutter format lib/
```
