# iOS Firebase Cloud Messaging Setup - Remaining Steps

This document covers the remaining manual steps required to complete iOS FCM setup. The code configuration has been completed, but some steps require Xcode or Apple Developer Console access.

## ✅ Already Completed

The following has been automatically configured for you:

1. ✓ **Info.plist** - Added FCM configuration flags
2. ✓ **AppDelegate.swift** - Added complete FCM implementation including:
   - Firebase initialization
   - UNUserNotificationCenter delegate setup
   - Remote notification registration
   - MessagingDelegate implementation
   - APNs token mapping
   - Notification handling (foreground, background, tap)
3. ✓ **GoogleService-Info.plist** - Firebase configuration file exists
4. ✓ **Podfile** - iOS platform version set to 16.0 (meets requirements)

## 🔧 Manual Steps Required

### Step 1: Install CocoaPods Dependencies

Run the following commands to install iOS dependencies:

```bash
cd ios
pod install
cd ..
```

This will install Firebase and FCM pods required for push notifications.

### Step 2: Enable Push Notifications Capability in Xcode

1. Open the iOS project in Xcode:
   ```bash
   open ios/Runner.xcworkspace
   ```

2. Select the **Runner** target in the project navigator

3. Go to the **Signing & Capabilities** tab

4. Click the **+ Capability** button

5. Add **Push Notifications** capability

6. Add **Background Modes** capability

7. Under Background Modes, check:
   - ☑ **Remote notifications**

### Step 3: Configure APNs Authentication Key

You need to create and upload an APNs authentication key to Firebase Console.

#### 3.1 Create APNs Key (If you don't have one)

1. Go to [Apple Developer Console](https://developer.apple.com/account/)

2. Navigate to **Certificates, Identifiers & Profiles**

3. Select **Keys** from the sidebar

4. Click the **+** button to create a new key

5. Enter a key name (e.g., "AirQo Push Notifications")

6. Check **Apple Push Notifications service (APNs)**

7. Click **Continue**, then **Register**

8. **Download the .p8 key file** (you can only download once!)

9. Note your **Key ID** and **Team ID** (found on the download page)

#### 3.2 Upload APNs Key to Firebase

1. Go to [Firebase Console](https://console.firebase.google.com/)

2. Select your AirQo project

3. Click the gear icon → **Project Settings**

4. Go to the **Cloud Messaging** tab

5. Scroll to **Apple app configuration**

6. Under **APNs authentication key**, click **Upload**

7. Upload your `.p8` file

8. Enter your **Key ID** and **Team ID**

9. Click **Upload**

### Step 4: Verify Bundle ID Matches

Ensure your iOS Bundle ID in Xcode matches the one registered in Firebase:

1. In Xcode, select the **Runner** target

2. Go to **General** tab

3. Check **Bundle Identifier** (e.g., `com.airqo.app`)

4. In Firebase Console, verify this matches:
   - Project Settings → Your apps → iOS app
   - Should match the Bundle ID shown there

### Step 5: Build and Test

1. **Clean and rebuild** the iOS app:
   ```bash
   flutter clean
   flutter pub get
   cd ios
   pod install
   cd ..
   flutter build ios
   ```

2. **Run on a physical iOS device** (push notifications don't work on simulator):
   ```bash
   flutter run --release
   ```

3. **Check the Xcode console** for the FCM token:
   - Look for: `Firebase registration token: <your-token>`
   - Copy this token for testing

### Step 6: Send Test Notification

1. Go to Firebase Console → **Engage** → **Messaging**

2. Click **Create your first campaign** or **New campaign**

3. Select **Firebase Notification messages**

4. Enter a notification title and text

5. Click **Send test message**

6. Paste your FCM token from Step 5

7. Click **Test**

## 📱 Testing Different App States

Test notifications in all three states:

### 1. Foreground (App Open)
- Notification should appear as banner at top
- Handled by `willPresent notification` in AppDelegate.swift:62-76

### 2. Background (App Minimized)
- Notification should appear in notification center
- Tapping should open app
- Handled by `didReceive response` in AppDelegate.swift:79-88

### 3. Terminated (App Closed)
- Notification should appear in notification center
- Tapping should launch app
- Handled by Flutter's `FirebaseMessaging.onMessageOpenedApp`

## 🔍 Troubleshooting

### Issue: No FCM Token Generated

**Possible Causes:**
- APNs key not uploaded to Firebase
- Running on simulator instead of physical device
- Bundle ID mismatch between Xcode and Firebase
- Push Notifications capability not enabled

**Solutions:**
1. Verify APNs key is uploaded to Firebase Console
2. Run on a physical iOS device
3. Check Bundle IDs match in Xcode and Firebase
4. Verify capabilities are enabled in Xcode

### Issue: APNs Token Not Available

**Error in logs:** `APNs token not available yet`

**Solution:**
- This is normal on first launch
- Token should be available after a few seconds
- Run on physical device (not simulator)
- Ensure proper signing and provisioning profile

### Issue: Notifications Not Showing

**Possible Causes:**
- Device in Do Not Disturb mode
- Notification permissions denied
- APNs certificate/key issue

**Solutions:**
1. Check notification permissions in iOS Settings
2. Disable Do Not Disturb mode
3. Verify APNs key is correctly uploaded
4. Check Xcode console for error messages

### Issue: Build Errors After Pod Install

**Error:** `Firebase module not found` or similar

**Solution:**
```bash
cd ios
rm -rf Pods
rm Podfile.lock
pod cache clean --all
pod install
cd ..
flutter clean
flutter pub get
```

### Issue: Duplicate Symbols or Linking Errors

**Solution:**
1. Clean build folder in Xcode: Product → Clean Build Folder
2. Delete derived data
3. Run:
   ```bash
   cd ios
   rm -rf ~/Library/Developer/Xcode/DerivedData
   pod deintegrate
   pod install
   cd ..
   flutter clean
   ```

## 🔐 Security Best Practices

1. **Never commit** the `.p8` APNs key file to version control
2. **Store securely** - Keep your APNs key in a secure location
3. **Restrict access** - Only upload to Firebase Console when needed
4. **Use separate keys** - Consider different keys for development and production

## 📊 Monitoring and Analytics

### View Notification Statistics

1. Go to Firebase Console → **Engage** → **Messaging**
2. Select **Campaigns** tab
3. View metrics:
   - Messages sent
   - Messages opened
   - Impressions

### Debug Logging

The AppDelegate is configured to print:
- FCM token generation/refresh
- Notification received in foreground
- Notification taps

Check Xcode console output for these logs.

## 🚀 Next Steps After iOS Setup

1. **Backend Integration**:
   - Update `AppDelegate.swift:104` to send token to your backend
   - Store iOS FCM tokens in your database
   - Send notifications from your backend using Firebase Admin SDK

2. **Topic Subscriptions**:
   - Subscribe users to topics using your Flutter code:
     ```dart
     await PushNotificationService().subscribeToTopic('ios_users');
     ```

3. **Rich Notifications (Optional)**:
   - Add Notification Service Extension for images
   - Follow Apple's guide for notification content extensions

4. **Custom Notification Sounds**:
   - Add custom sound files to Xcode project
   - Reference in notification payload

5. **Deep Linking**:
   - Implement custom URL schemes
   - Handle notification navigation in Flutter

## 📚 Additional Resources

- [Firebase iOS Setup](https://firebase.google.com/docs/ios/setup)
- [FCM for iOS](https://firebase.google.com/docs/cloud-messaging/ios/client)
- [Apple Push Notifications](https://developer.apple.com/documentation/usernotifications)
- [APNs Overview](https://developer.apple.com/library/archive/documentation/NetworkingInternet/Conceptual/RemoteNotificationsPG/APNSOverview.html)

## ✅ Completion Checklist

Before considering iOS FCM setup complete:

- [ ] CocoaPods dependencies installed (`pod install`)
- [ ] Push Notifications capability enabled in Xcode
- [ ] Background Modes > Remote notifications enabled in Xcode
- [ ] APNs authentication key created in Apple Developer Console
- [ ] APNs key uploaded to Firebase Console
- [ ] Bundle ID matches between Xcode and Firebase
- [ ] App built and run on physical iOS device
- [ ] FCM token successfully generated (check logs)
- [ ] Test notification sent from Firebase Console
- [ ] Notification received in foreground state
- [ ] Notification received in background state
- [ ] Notification received in terminated state
- [ ] Notification tap opens app correctly

---

**Note:** iOS push notifications require a physical device with a valid provisioning profile. Simulators do not support APNs and will not receive notifications.
