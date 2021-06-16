# Airqo mobile application

## How to Get Started

### **Install flutter on your computer**

[Installing Flutter on Windows](https://flutter.dev/docs/get-started/install/windows)

[Installing Flutter on macOS](https://flutter.dev/docs/get-started/install/macos)

```bash
cd AirQo-frontend/mobile-app
```

### **Set the secret keys**

Add [secret.dart](https://airqo.slack.com/archives/GTHGHCB4G/p1622123891004200) to `lib/config` folder

### **Set Google maps Key**

For android, add [app.properties](https://drive.google.com/file/d/1Bktg3ckv-yO4X8Hu5QqVN7qp9LVqzWJG/view?usp=sharing) file to `AirQo-frontend/mobile-app/android` directory

For IOS, add the [GOOGLE MAPS API Key](https://airqo.slack.com/archives/GTHGHCB4G/p1622124272004700),  in  `ios/Runner/AppDelegate.swift`
`GMSServices.provideAPIKey("<INSERT KEY HERE>")`

### **Run the application**

   `flutter run --no-sound-null-safety`
