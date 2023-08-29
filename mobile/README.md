# AirQo mobile app

[![codecov](https://codecov.io/gh/airqo-platform/AirQo-frontend/graph/badge.svg?token=LsBcFL42rz)](https://codecov.io/gh/airqo-platform/AirQo-frontend)

<a href="https://github.com/airqo-platform/AirQo-frontend/actions">
<img src="https://github.com/airqo-platform/AirQo-frontend/workflows/mobile-app-code-tests/badge.svg" alt="Build Status">
</a>

<a href="https://github.com/airqo-platform/AirQo-frontend/actions">
<img src="https://github.com/airqo-platform/AirQo-frontend/workflows/mobile-app-code-analysis/badge.svg" alt="Build Status">
</a>

## **Prerequisites**

- [Flutter](https://docs.flutter.dev/get-started/install). Make sure all checks pass when you run `flutter doctor`
- [Android Sdk Tools](https://developer.android.com/studio)
- An emulator or phyiscal device. This app isn't configured to run in the browser.

## **Setup**

### **Add the configuration files**

| File                          | Directory                                                                                       |
|-------------------------------|-------------------------------------------------------------------------------------------------|
| [google-services.json]()      | `app` directory under android folder (`android/app/`)                                           |
| [google-services.json]()      | `app/src/airqodev` directory under android folder (`android/app/`)(For the staging environment) |
| [firebase_app_id_file.json]() | Android folder (`android/`)                                                                     |
| [key.properties]()            | Android folder (`android/`)                                                                     |
| [local.properties]()          | Android folder (`android/`)                                                                     |
| [.env.dev]()                  | App root directory (this directory)                                                             |
| **.env.prod**                 | App root directory (this directory). Create an empty file named `.env.prod`.                    |
| [airqo-dev-keystore.jks]()    | Place it in any secure directory on your computer                                               |
| [GoogleService-Info.plist]()  | `airqo` directory `ios/config` folder (`ios/config/`)                                           |
| [GoogleService-Info.plist]()  | `airqodev` directory under `ios/config` folder (`ios/config/`)(For the staging environment)     |

### **Update variables in configuration files**

- Change `sdk.dir` and `flutter.sdk` to point to the correct paths for your android Sdk anf flutter respectively
  - Path for `flutter.sdk` can be gotten from running `flutter doctor -v`.
    \
    For example `flutter.sdk=/opt/homebrew/Caskroom/flutter/2.5.1/flutter`
    \
    \
    ![Project structure](resources/flutter-path.png)
- Change `storeFile` variable in `key.properties` file to point to where you put `airqo-dev-keystore.jks`.
  For example if `airqo-dev-keystore.jks` is located under `/Users/example/` then `storeFile=/Users/example/airqo-dev-keystore.jks`

### **For Contributors:**

- It's important to first read our guidelines [here](/CONTRIBUTING.md).
- Thereafter, proceed to create your own necessary configuration files. These include;

  - Add an `.env file`, which contain credentials in key-value format for services used by the app. For development, save the file as `.env.dev` while for production, save it as `.env.prod`.

    - Here's what your .env file would look like;

      ```bash
      AIRQO_API_URL= https://api.airqo.net/api/v1/
      AIRQO_API_TOKEN = Get this token by following the respective links below.
      SEARCH_API_KEY =
      AIRQO_API_USER_EXISTS_URL = https://europe-west1-airqo-250220.cloudfunctions.net/airqo-app-check-user

      FAV_PLACES_COLLECTION =
      KYA_COLLECTION =
      USERS_NOTIFICATION_COLLECTION =
      USERS_ANALYTICS_COLLECTION =
      USERS_COLLECTION =
      USERS_KYA_COLLECTION =
      USERS_PROFILE_PICTURE_COLLECTION =

      PREF_ON_BOARDING_PAGE =
      SENTRY_DSN =
      ```

    - Get the following keys by following documentation from the respective sources;
      - [AIRQO_API_TOKEN](https://wiki.airqo.net/#/../api/users?id=login)
    - Use the corresponding database collection names for the collection variables.
      - You can create a collection using the following [guide.](https://firebase.google.com/docs/firestore/data-model#collections)
    - We restricted the search API to only call 3 other APIs, the Geocoding API, GeoLocation API, and the Places API. It should therefore have access to those above APIs. You can then get the api key from the GCP [credentials page.](https://console.cloud.google.com/apis/credentials)

### **Complete Setup**

Your project structure should be similar the the following after adding all the required configuration files.

- #### **Android folder**

  ![Project structure](resources/android.png)

- #### **iOS folder**

  ![Project structure](resources/ios.png)

- #### **Root folder**

  ![Project structure](resources/mobile.png)

### **Android signing certificates**

Run the command below to get your SHA-1 signing-certificate fingerprint. Share the Key with an AirQo team member to add it to the application restricted fingerprints.

```bash
keytool -list -v -keystore ~/.android/debug.keystore -alias androiddebugkey -storepass android -keypass android
```

## **Running the application**

### **To simply run the app, Use the following:**

```bash
flutter run
```

```bash
task r
```

### **To run the staging environment, Use the following:**

#### **Staging in debug mode.**

```bash
flutter run --flavor airqodev -t lib/main_dev.dart
```

#### **Staging in release mode.**

```bash
flutter run --flavor airqodev -t lib/main_dev.dart --release
```

### **To run the Production environment, You can use the following:**

#### **Production in debug mode.**

```bash
flutter run --flavor airqo -t lib/main.dart
```

#### **Production in release mode.**

```bash
flutter run --flavor airqo -t lib/main.dart --release
```

### **Running the application in Github Actions - Firebase App Distribution(CI/CD)**

- Fastlane is triggered to update FirebaseApp app distribution every time a PR is merged
- To modify the workflow, open the .github/workflows folder, and navigate to deploy-mobile-android-to-firebase-app-distribuion.yml
- The uploaded artifact can also be downloaded from the summary of the workflow as a zip folder and tested.
- After making changes locally, specify what feature you wish to be tested in mobile/android/release-notes.txt and open a pull request
- To create a final build that can be used for production, increment the version number in pubspec.yaml file

## **Useful commands**

### **Code formatting and analysis**

```bash
bash upgrade-dependencies.sh
dart run build_runner build --delete-conflicting-outputs
dart fix --dry-run && dart fix --apply && dart format lib/
flutter pub run dart_code_metrics:metrics analyze lib --reporter=html
flutter pub run dart_code_metrics:metrics check-unused-files lib
flutter pub run dart_code_metrics:metrics check-unused-code lib
```

### **Building for release**

```bash
flutter build appbundle --build-name 1.0.0 --build-number 20025 --flavor airqo
flutter build ipa --build-name 1.0.0 --build-number 1 --flavor airqo
flutter build appbundle --obfuscate --split-debug-info=${PWD}/obfuscate
flutter build ipa --obfuscate --split-debug-info=${PWD}/obfuscate
flutter build appbundle [--analyze-size]
flutter build ipa [--analyze-size]
flutter gen-l10n
```

## **Security Guidelines**

We strive to follow an established industry standard for mobile application security from the OWASP (the Open Web Application Security Project), The OWASP Mobile Application Security Verification Standard (MASVS) provides a set of baseline security criteria for developers. For a detailed security guide. Check out the [MASVS Level 1 requirements.](https://github.com/appdefensealliance/ASA/blob/main/MobileAppSecurityAssessment/MobileSecurityGuide.md)
