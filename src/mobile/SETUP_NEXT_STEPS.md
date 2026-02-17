# Push Notifications - Next Steps

## ✅ What's Been Implemented (UPDATED)

### 1. Service Layer (`lib/src/app/shared/services/push_notification_service.dart`)
   - ✓ FCM integration
   - ✓ Token management
   - ✓ Foreground/background/terminated message handling
   - ✓ Topic subscriptions
   - ✓ **NEW: Android 13+ runtime permission handling**
   - ✓ **NEW: Permission permanently denied detection**
   - ✓ **NEW: App settings navigation for denied permissions**

### 2. Helper Layer (`lib/src/app/shared/services/notification_helper.dart`)
   - ✓ Integration with existing NotificationManager
   - ✓ Message routing based on type
   - ✓ User-friendly permission dialogs
   - ✓ Backend sync utilities
   - ✓ **NEW: Enhanced permission flow with permanently denied handling**

### 3. Android Configuration (PRODUCTION READY ✨)
   - ✓ build.gradle updated with google-services plugin
   - ✓ **AndroidManifest.xml fully configured:**
     - ✓ POST_NOTIFICATIONS permission (Android 13+)
     - ✓ FirebaseMessagingService declared
     - ✓ Default notification channel and icon configured
   - ✓ **Runtime permission handling for Android 13+**
   - ✓ All dependencies correct (firebase_core, firebase_messaging, flutter_local_notifications)

### 4. iOS Configuration (CODE COMPLETE ✨)
   - ✓ **Info.plist** configured with FCM flags
   - ✓ **AppDelegate.swift** fully implemented:
     - ✓ Firebase initialization
     - ✓ UNUserNotificationCenter delegate
     - ✓ Remote notification registration
     - ✓ MessagingDelegate implementation
     - ✓ APNs token mapping
     - ✓ Notification handlers (foreground, background, tap)
   - ✓ Podfile set to iOS 16.0+
   - ⏳ **Requires Xcode setup** (see IOS_FCM_SETUP.md)

### 5. Main App Integration
   - ✓ Firebase initialization in main.dart
   - ✓ Background message handler configured
   - ✓ Push notification service initialization

---

## 🎯 Quick Start Summary

### Android (Ready to Test!)
✅ All code configuration is complete. Just need to:
1. Run `flutter pub get`
2. Build and test on Android 13+ device
3. Send test notification from Firebase Console

### iOS (Requires Xcode Setup)
✅ All code configuration is complete. Need to:
1. Run `pod install` in ios folder
2. Open Xcode and enable capabilities (see **IOS_FCM_SETUP.md**)
3. Upload APNs key to Firebase Console
4. Build and test on physical iOS device

---

## 🚀 What You Need To Do

### 1. Dependencies (Already Added ✅)

Dependencies are already in `pubspec.yaml`:
```yaml
dependencies:
  firebase_core: ^4.4.0
  firebase_messaging: ^16.1.1
  flutter_local_notifications: ^19.5.0
  permission_handler: ^11.4.0  # For Android 13+ runtime permissions
```

Run to ensure installed:
```bash
flutter pub get
```

### 2. Set Up Firebase Project

#### Option A: Using FlutterFire CLI (Recommended)
```bash
# Install CLI
dart pub global activate flutterfire_cli

# Configure Firebase (will create firebase_options.dart automatically)
flutterfire configure
```

This will:
- Create or select Firebase project
- Register iOS and Android apps
- Download config files automatically
- Generate `lib/firebase_options.dart`

#### Option B: Manual Setup

1. Go to https://console.firebase.google.com
2. Create/select project
3. Add iOS app:
   - Bundle ID: `com.airqo.app` (or yours from Xcode)
   - Download `GoogleService-Info.plist` → place in `ios/Runner/`
4. Add Android app:
   - Package: `com.airqo.app`
   - Download `google-services.json` → place in `android/app/`
5. Update `lib/firebase_options.dart` with your project details

### 3. iOS Setup (📖 See IOS_FCM_SETUP.md for detailed guide)

**Quick Steps:**

1. **Install CocoaPods Dependencies:**
   ```bash
   cd ios
   pod install
   cd ..
   ```

2. **Enable Capabilities in Xcode:**
   - Open `ios/Runner.xcworkspace`
   - Add Push Notifications capability
   - Add Background Modes > Remote notifications

3. **Configure APNs Authentication Key:**
   - Create key in Apple Developer Console
   - Upload `.p8` file to Firebase Console

4. **Test on Physical Device:**
   - Simulators don't support push notifications
   - Build and run: `flutter run --release`

**📚 For complete iOS setup instructions, see [IOS_FCM_SETUP.md](./IOS_FCM_SETUP.md)**

### 4. Test the Implementation

```bash
# Run on device (not simulator for iOS push notifications)
flutter run --release
```

Check console logs for:
- "Firebase initialized successfully"
- "Push notification service initialized successfully"
- "FCM token obtained: ..." (copy this token for testing)

### 5. Send Test Notification

1. Go to Firebase Console → Engage → Messaging
2. Click "Send your first message"
3. Enter title and text
4. Click "Send test message"
5. Paste your FCM token
6. Send and verify it appears on device

### 6. Integrate into Your App

#### Request Permission (e.g., after login)
```dart
import 'package:airqo/src/app/shared/services/notification_helper.dart';

// With dialog
final granted = await NotificationHelper().requestPermissionWithDialog(context);

// Or direct
final granted = await PushNotificationService().requestPermission();
```

#### Initialize Handler (in your Decider widget)
```dart
@override
void initState() {
  super.initState();
  WidgetsBinding.instance.addPostFrameCallback((_) {
    NotificationHelper().initialize(context);
  });
}
```

#### Sync Token with Backend (after login)
```dart
await NotificationHelper().syncTokenWithBackend(userId);
```

#### Subscribe to Topics
```dart
await PushNotificationService().subscribeToTopic('air_quality_alerts');
```

## 📱 Platform Notes

### Android (UPDATED ✨)
- **Minimum SDK:** 23 (already set in build.gradle)
- **Requires:** `google-services.json` in `android/app/`
- **Android 13+ (API 33+):** Runtime permission now handled automatically
  - POST_NOTIFICATIONS permission added to manifest
  - Runtime permission request in PushNotificationService
  - Handles permanently denied state with settings redirect
- **Testing:** Works on both emulator and physical device
- **Notification Icon:** Currently using launcher icon (consider custom white icon)

### iOS (CODE COMPLETE ✨)
- **Minimum iOS:** 16.0 (set in Podfile)
- **Requires physical device:** Simulator cannot receive push notifications
- **Requires APNs:** Must upload APNs authentication key to Firebase
- **Capabilities Required:**
  - Push Notifications
  - Background Modes > Remote notifications
- **Testing:** Must be on physical device with proper signing

## 🔧 Troubleshooting

### "Target of URI doesn't exist: firebase_options.dart"
- Run `flutterfire configure` OR
- Manually create/update the file with your Firebase config

### No FCM Token Generated
- Check Firebase initialization logs
- Ensure google-services files are in place
- Wait a few seconds after app launch
- For iOS: must be on physical device with APNs configured

### Notifications Not Showing
- Check permission is granted
- Verify `NotificationHelper().initialize(context)` is called
- Check Firebase Console for delivery status
- Review console logs for errors

## 📚 Backend Integration

See TODOs in code for backend integration points:
- `push_notification_service.dart:217` - Send token to backend
- `notification_helper.dart:256` - Update token API call
- `notification_helper.dart:276` - Remove token API call

## 📖 Additional Documentation

- **Android & General Setup:** [PUSH_NOTIFICATIONS_SETUP.md](./PUSH_NOTIFICATIONS_SETUP.md)
- **iOS Detailed Setup:** [IOS_FCM_SETUP.md](./IOS_FCM_SETUP.md) ⭐ NEW
- **Firebase Official Docs:** https://firebase.google.com/docs/cloud-messaging
- **FlutterFire Docs:** https://firebase.flutter.dev/docs/messaging/overview
- **Android FCM Guide:** https://firebase.google.com/docs/cloud-messaging/android/client
- **iOS FCM Guide:** https://firebase.google.com/docs/cloud-messaging/ios/client

## ⚠️ Important Notes

1. **iOS requires physical device** for push notifications (simulator won't work)
2. **APNs configuration is mandatory** for iOS push notifications
3. **Test all three states**: foreground, background, terminated
4. **Update firebase_options.dart** with your actual Firebase config
5. **Implement navigation logic** in notification_helper.dart TODOs
6. **Add backend integration** to sync tokens with your server
