# AirQo mobile application

## Get Started

### **Install flutter on your computer**

[Installing Flutter on Windows](https://flutter.dev/docs/get-started/install/windows)

[Installing Flutter on macOS](https://flutter.dev/docs/get-started/install/macos)

```bash
cd AirQo-frontend/mobile-app
```

### **Set the secret keys**

Add [secret.dart](https://drive.google.com/file/d/1ZAjdw_phpsxBFWpz6e02tDFF4xx411V1/view?usp=sharing) to `lib/config` folder

### **Set Google maps Key**

For android, add [app.properties](https://drive.google.com/file/d/1Bktg3ckv-yO4X8Hu5QqVN7qp9LVqzWJG/view?usp=sharing) file to `AirQo-frontend/mobile-app/android` directory

For IOS, add the [GOOGLE MAPS API Key](https://docs.google.com/document/d/1QawFn5Sfp3eOUODb38dLFsIVrU-erFpJeC7OEbWS_9Q/edit?usp=sharing),  in  `ios/Runner/AppDelegate.swift`
`GMSServices.provideAPIKey("<INSERT KEY HERE>")`

### **Run the application**

```bash
flutter run --no-sound-null-safety
```

```bash
flutter pub run build_runner build
```