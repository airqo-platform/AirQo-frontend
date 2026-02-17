# Push Notifications Setup Guide

This guide will help you complete the setup for Firebase Cloud Messaging (FCM) push notifications in the AirQo mobile app.

## Prerequisites

1. Add the following dependencies to `pubspec.yaml`:
```yaml
dependencies:
  firebase_core: ^3.10.0
  firebase_messaging: ^15.3.0
  flutter_local_notifications: ^18.0.1
```

2. Run `flutter pub get` to install the packages.

## Step 1: Create Firebase Project

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Click "Add project" or select an existing project
3. Follow the setup wizard
4. Enable Google Analytics (optional)

## Step 2: Register Your Apps

### For iOS App

1. In Firebase Console, click "Add app" and select iOS
2. Enter your iOS Bundle ID (found in `ios/Runner.xcodeproj` or Xcode)
   - Usually something like: `com.airqo.mobile`
3. Download `GoogleService-Info.plist`
4. Add it to your project:
   ```bash
   # Copy the file to ios/Runner/
   cp GoogleService-Info.plist ios/Runner/
   ```
5. Open `ios/Runner.xcodeproj` in Xcode
6. Drag `GoogleService-Info.plist` into the Runner folder in Xcode
7. Ensure "Copy items if needed" is checked

### For Android App

1. In Firebase Console, click "Add app" and select Android
2. Enter your Android package name (found in `android/app/build.gradle`)
   - Usually something like: `com.airqo.mobile`
3. Download `google-services.json`
4. Add it to your project:
   ```bash
   # Copy the file to android/app/
   cp google-services.json android/app/
   ```

## Step 3: Configure iOS

### 3.1 Update Podfile

Edit `ios/Podfile` and ensure the platform version is at least 13.0:
```ruby
platform :ios, '13.0'
```

### 3.2 Install Pods

```bash
cd ios
pod install
cd ..
```

### 3.3 Enable Push Notifications Capability

1. Open `ios/Runner.xcworkspace` in Xcode
2. Select the Runner target
3. Go to "Signing & Capabilities" tab
4. Click "+ Capability" and add:
   - **Push Notifications**
   - **Background Modes** (check "Remote notifications")

### 3.4 Configure APNs Authentication Key

1. Go to [Apple Developer Console](https://developer.apple.com/account/)
2. Navigate to "Certificates, Identifiers & Profiles"
3. Select "Keys" and create a new key
4. Enable "Apple Push Notifications service (APNs)"
5. Download the `.p8` key file
6. Note the Key ID and Team ID
7. Upload this to Firebase Console:
   - Go to Project Settings → Cloud Messaging → iOS app configuration
   - Upload APNs Authentication Key

### 3.5 Update Info.plist (Optional)

If you want to customize notification behavior, add to `ios/Runner/Info.plist`:
```xml
<key>FirebaseMessagingAutoInitEnabled</key>
<true/>
<key>FirebaseAppDelegateProxyEnabled</key>
<false/>
```

## Step 4: Configure Android

### 4.1 Update Project-level build.gradle

Edit `android/build.gradle`:
```gradle
buildscript {
    dependencies {
        // ... other dependencies
        classpath 'com.google.gms:google-services:4.4.2'
    }
}
```

### 4.2 Update App-level build.gradle

Edit `android/app/build.gradle`:

1. Add plugin at the top (after other plugins):
```gradle
plugins {
    id "com.android.application"
    id "kotlin-android"
    id "dev.flutter.flutter-gradle-plugin"
}

apply plugin: 'com.google.gms.google-services'
```

2. Ensure minSdkVersion is at least 21:
```gradle
android {
    defaultConfig {
        minSdkVersion 21
        // ...
    }
}
```

### 4.3 Update AndroidManifest.xml

Edit `android/app/src/main/AndroidManifest.xml` and add inside `<application>`:

```xml
<meta-data
    android:name="com.google.firebase.messaging.default_notification_channel_id"
    android:value="airqo_notifications" />

<meta-data
    android:name="com.google.firebase.messaging.default_notification_icon"
    android:resource="@mipmap/ic_launcher" />
```

Optionally, add a custom notification icon by creating a drawable and referencing it instead of `ic_launcher`.

## Step 5: Generate firebase_options.dart

Run the FlutterFire CLI to auto-generate configuration:

```bash
# Install FlutterFire CLI
dart pub global activate flutterfire_cli

# Generate configuration
flutterfire configure
```

This will:
- Create `lib/firebase_options.dart`
- Link your Flutter app to Firebase projects
- Configure both iOS and Android automatically

## Step 6: Update main.dart

Update your Firebase initialization to use the generated options:

```dart
import 'firebase_options.dart';

// In main() function:
await Firebase.initializeApp(
  options: DefaultFirebaseOptions.currentPlatform,
);
```

## Step 7: Testing Push Notifications

### Test from Firebase Console

1. Go to Firebase Console → Engage → Messaging
2. Click "Send your first message"
3. Enter a notification title and text
4. Click "Send test message"
5. Enter your FCM token (check app logs for the token)
6. Send the notification

### Get FCM Token

The token is logged when the app starts. You can also retrieve it programmatically:

```dart
final token = await PushNotificationService().currentToken;
print('FCM Token: $token');
```

### Test All States

1. **Foreground**: App is open - should show in-app notification
2. **Background**: App is minimized - should show system notification
3. **Terminated**: App is closed - should show system notification and handle tap

## Step 8: Backend Integration

To send notifications from your backend:

### Store FCM Tokens

When a user logs in or the token refreshes, send it to your backend:

```dart
// In push_notification_service.dart, update _onTokenRefresh:
void _onTokenRefresh(String newToken) async {
  loggy.info('FCM token refreshed: $newToken');
  _currentToken = newToken;
  _saveToken(newToken);

  // Send to your backend
  try {
    await yourApiService.updateFcmToken(newToken);
  } catch (e) {
    loggy.error('Failed to update token on server', e);
  }
}
```

### Send Notifications from Backend

Use Firebase Admin SDK or REST API. Example with Node.js:

```javascript
const admin = require('firebase-admin');

await admin.messaging().send({
  token: userFcmToken,
  notification: {
    title: 'Air Quality Alert',
    body: 'Air quality in your area is unhealthy'
  },
  data: {
    type: 'air_quality_alert',
    location: 'Kampala',
    pollutionLevel: '85.5'
  },
  android: {
    priority: 'high'
  },
  apns: {
    headers: {
      'apns-priority': '10'
    }
  }
});
```

### Notification Payload Structure

For proper handling in the app, use this structure:

```json
{
  "notification": {
    "title": "Title here",
    "body": "Message here"
  },
  "data": {
    "type": "survey|air_quality_alert|general",
    "survey_id": "optional_survey_id",
    "location": "optional_location",
    "pollutionLevel": "optional_pm25_value"
  }
}
```

## Step 9: Topic Subscriptions (Optional)

Subscribe users to topics for targeted notifications:

```dart
// Subscribe to topic
await PushNotificationService().subscribeToTopic('air_quality_alerts');
await PushNotificationService().subscribeToTopic('kampala_updates');

// Unsubscribe
await PushNotificationService().unsubscribeFromTopic('kampala_updates');
```

Send to topics from backend:
```javascript
await admin.messaging().send({
  topic: 'air_quality_alerts',
  notification: {
    title: 'Air Quality Alert',
    body: 'Check the air quality in your area'
  }
});
```

## Troubleshooting

### iOS Issues

1. **No notifications on iOS**:
   - Verify APNs key is uploaded to Firebase
   - Check Push Notifications capability is enabled in Xcode
   - Ensure device is not in Do Not Disturb mode
   - Check notification permissions are granted

2. **APNs token not available**:
   - Run on a physical device (not simulator)
   - Ensure proper provisioning profile

3. **Token is null**:
   - Wait a few seconds after app launch
   - Check console logs for errors

### Android Issues

1. **No notifications on Android**:
   - Verify `google-services.json` is in `android/app/`
   - Check notification permissions are granted
   - Ensure Google Play Services is installed

2. **Build errors**:
   - Clean and rebuild: `flutter clean && flutter pub get`
   - Check gradle files have correct plugin configuration

3. **Notifications not appearing**:
   - Check notification channel is created
   - Verify app is not in battery optimization mode

### General Issues

1. **Token not generating**:
   - Check internet connection
   - Verify Firebase project is set up correctly
   - Check console logs for initialization errors

2. **Background handler not working**:
   - Ensure handler is a top-level function
   - Check it has `@pragma('vm:entry-point')` annotation

3. **Navigation not working from notification**:
   - Implement navigation logic in `_handleNotificationNavigation()`
   - Use `navigatorKey` for global navigation

## Usage in App

### Request Permission

```dart
final hasPermission = await PushNotificationService().requestPermission();
if (hasPermission) {
  print('Notifications enabled');
}
```

### Check Permission Status

```dart
final hasPermission = await PushNotificationService().hasPermission();
```

### Get Current Token

```dart
final token = PushNotificationService().currentToken;
```

### Handle Custom Actions

```dart
PushNotificationService().onNotificationTap = (data) {
  // Handle notification tap
  final type = data['type'];
  if (type == 'survey') {
    // Navigate to survey
    navigatorKey.currentState?.pushNamed(
      '/survey',
      arguments: data['survey_id'],
    );
  }
};
```

## Next Steps

1. Set up your backend to send notifications
2. Store FCM tokens in your database
3. Implement notification preferences in user settings
4. Add analytics to track notification engagement
5. Test on both iOS and Android devices
6. Set up notification scheduling for air quality alerts

## Resources

- [Firebase Cloud Messaging Documentation](https://firebase.google.com/docs/cloud-messaging)
- [FlutterFire Documentation](https://firebase.flutter.dev/docs/messaging/overview/)
- [APNs Documentation](https://developer.apple.com/documentation/usernotifications)
- [Android Notification Channels](https://developer.android.com/develop/ui/views/notifications/channels)
