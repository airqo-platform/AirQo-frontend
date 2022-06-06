# AirQo mobile app

## Prerequisites

- [Flutter](https://docs.flutter.dev/get-started/install). Make sure all checks pass when you run `flutter doctor`

### Set the secret keys

Add [.env.dev file](https://drive.google.com/file/d/1ff6PUDjWJw_uiIC-oYoBOqiUiTyPzRho/view?usp=sharing) to this directory

### Set Google maps Key

For IOS, add the [GOOGLE MAPS API Key](https://docs.google.com/document/d/1QawFn5Sfp3eOUODb38dLFsIVrU-erFpJeC7OEbWS_9Q/edit?usp=sharing),  in  `ios/Runner/AppDelegate.swift`
`GMSServices.provideAPIKey("<INSERT KEY HERE>")`

### Running the application

```bash
cd AirQo-frontend/mobile
flutter run
```

### Useful commands

#### Code formatting and analysis

```bash
flutter packages pub run build_runner build --delete-conflicting-outputs
dart fix --dry-run
dart fix --apply
flutter format lib/
flutter pub run dart_code_metrics:metrics analyze lib --reporter=html
flutter pub run dart_code_metrics:metrics check-unused-files lib
flutter pub run dart_code_metrics:metrics check-unused-code lib
```

#### Building for release

```bash
flutter build appbundle --obfuscate --split-debug-info=${PWD}/obfuscate
flutter build ipa --obfuscate --split-debug-info=${PWD}/obfuscate
flutter build appbundle [--analyze-size]
flutter build ipa [--analyze-size]
```

#### Keystore SHA values

```bash
keytool -list -v -keystore ~/.android/debug.keystore -alias androiddebugkey -storepass android -keypass android
```
