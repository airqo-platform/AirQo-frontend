import 'dart:io';

import 'package:app/constants/constants.dart';
import 'package:app/models/models.dart';
import 'package:app/services/services.dart';
import 'package:app/utils/utils.dart';
import 'package:cloud_firestore/cloud_firestore.dart';
import 'package:firebase_analytics/firebase_analytics.dart';
import 'package:firebase_auth/firebase_auth.dart';
import 'package:firebase_messaging/firebase_messaging.dart';
import 'package:firebase_storage/firebase_storage.dart' as firebase_storage;
import 'package:firebase_storage/firebase_storage.dart';
import 'package:flutter/cupertino.dart';

class CloudAnalytics {
  static Future<bool> logEvent(CloudAnalyticsEvent analyticsEvent) async {
    try {
      await FirebaseAnalytics.instance.logEvent(
        name: analyticsEvent.snakeCase(),
      );
    } catch (exception, stackTrace) {
      await logException(
        exception,
        stackTrace,
      );

      return false;
    }
    return true;
  }

  static Future<void> logAppRating() async {
    await CloudAnalytics.logEvent(
      CloudAnalyticsEvent.rateApp,
    );
  }

  static Future<void> logSignOutEvents() async {
    try {
      await Future.wait([]);
    } catch (exception, stackTrace) {
      debugPrint('$exception\n$stackTrace');
    }
  }

  static Future<void> logSignInEvents(Profile profile) async {
    try {
      await Future.wait([
        logPlatformType(),
        logEvent(CloudAnalyticsEvent.createUserProfile),
        logNetworkProvider(profile),
        logGender(profile),
      ]);
    } catch (exception, stackTrace) {
      debugPrint('$exception\n$stackTrace');
    }
  }

  static Future<void> logAirQualitySharing(Profile profile) async {
    if (profile.aqShares >= 5) {
      await CloudAnalytics.logEvent(
        CloudAnalyticsEvent.shareAirQualityInformation,
      );
    }
  }

  static Future<void> logNetworkProvider(Profile profile) async {
    final carrier = await AirqoApiClient().getCarrier(profile.phoneNumber);
    if (carrier.toLowerCase().contains('airtel')) {
      await logEvent(CloudAnalyticsEvent.airtelUser);
    } else if (carrier.toLowerCase().contains('mtn')) {
      await logEvent(CloudAnalyticsEvent.mtnUser);
    } else {
      await logEvent(
        CloudAnalyticsEvent.otherNetwork,
      );
    }
  }

  static Future<void> logPlatformType() async {
    if (Platform.isAndroid) {
      await logEvent(
        CloudAnalyticsEvent.androidUser,
      );
    } else if (Platform.isIOS) {
      await logEvent(
        CloudAnalyticsEvent.iosUser,
      );
    } else {
      debugPrint('Unknown Platform');
    }
  }

  static Future<void> logGender(Profile profile) async {
    if (profile.gender() == Gender.male) {
      await logEvent(
        CloudAnalyticsEvent.maleUser,
      );
    } else if (profile.gender() == Gender.female) {
      await logEvent(
        CloudAnalyticsEvent.femaleUser,
      );
    } else {
      await logEvent(
        CloudAnalyticsEvent.undefinedGender,
      );
    }
  }
}

class CloudStore {
  static Future<List<AppNotification>> getNotifications() async {
    final userId = CustomAuth.getUserId();
    if (userId.isEmpty) {
      return [];
    }

    try {
      final notificationsJson = await FirebaseFirestore.instance
          .collection(Config.usersNotificationCollection)
          .doc(userId)
          .collection(userId)
          .get();

      final notifications = <AppNotification>[];

      for (final doc in notificationsJson.docs) {
        try {
          notifications.add(AppNotification.fromJson(
            doc.data(),
          ));
        } catch (e) {
          debugPrint(e.toString());
        }
      }

      return notifications;
    } catch (exception, stackTrace) {
      await logException(
        exception,
        stackTrace,
      );
    }

    return [];
  }

  static Future<Profile> getProfile() async {
    final userId = CustomAuth.getUserId();
    Profile profile = Profile.initialize();
    if (userId.isEmpty) {
      return profile;
    }

    try {
      final userJson = await FirebaseFirestore.instance
          .collection(Config.usersCollection)
          .doc(userId)
          .get();

      profile = Profile.fromJson(
        userJson.data()!,
      );
    } catch (exception, stackTrace) {
      await logException(
        exception,
        stackTrace,
      );
    }

    final User? user = CustomAuth.getUser();
    profile = profile.copyWith(isSignedIn: user != null);

    if (user != null) {
      profile = profile.copyWith(
        phoneNumber: user.phoneNumber ?? "",
        emailAddress: user.email ?? "",
        userId: user.uid,
        isAnonymous: user.isAnonymous,
      );

      if (profile.lastRated == null) {
        profile = profile.copyWith(
          lastRated: user.metadata.creationTime ?? DateTime.now(),
        );
      }
    }

    String? device = await CloudMessaging.getDeviceToken();
    profile = profile.copyWith(device: device);

    return profile;
  }

  static Future<bool> updateProfile(Profile profile) async {
    final User? currentUser = CustomAuth.getUser();
    if (!profile.isSignedIn || currentUser == null) {
      return false;
    }

    try {
      await Future.wait([
        currentUser.updateDisplayName(profile.firstName),
        FirebaseFirestore.instance
            .collection(Config.usersCollection)
            .doc(currentUser.uid)
            .set(profile.toJson()),
      ]);
    } catch (exception, stackTrace) {
      await logException(
        exception,
        stackTrace,
      );

      return false;
    }

    return true;
  }

  static Future<String> uploadProfilePicture(String filePath) async {
    try {
      final userId = CustomAuth.getUserId();
      final file = File(filePath);

      final storageRef = firebase_storage.FirebaseStorage.instance.ref();
      final avatarRef = storageRef.child(
        "${Config.usersProfilePictureStorage}/$userId/avatar${file.getExtension()}",
      );

      TaskSnapshot taskSnapshot = await avatarRef.putFile(file);

      return await taskSnapshot.ref.getDownloadURL();
    } on Exception catch (exception, stackTrace) {
      await logException(
        exception,
        stackTrace,
      );
    }

    return '';
  }
}

class CloudMessaging {
  static Future<String?> getDeviceToken() async {
    try {
      return await FirebaseMessaging.instance.getToken();
    } catch (exception, stackTrace) {
      await logException(
        exception,
        stackTrace,
      );
    }

    return null;
  }
}

class CustomAuth {
  static Future<bool> guestSignIn() async {
    UserCredential userCredential;
    User? user = getUser();
    if (user != null && user.isAnonymous) {
      return true;
    }

    userCredential = await FirebaseAuth.instance.signInAnonymously();

    return userCredential.user != null;
  }

  static Future<bool> signOut() async {
    try {
      await FirebaseAuth.instance.signOut();

      return true;
    } catch (exception, stackTrace) {
      await logException(
        exception,
        stackTrace,
      );

      return false;
    }
  }

  static Future<bool> deleteAccount() async {
    try {
      await FirebaseAuth.instance.currentUser?.delete();

      return true;
    } catch (exception, stackTrace) {
      await logException(
        exception,
        stackTrace,
      );
    }

    return false;
  }

  static Future<bool> firebaseSignIn(
    AuthCredential? authCredential,
  ) async {
    final UserCredential userCredential = authCredential == null
        ? await FirebaseAuth.instance.signInAnonymously()
        : await FirebaseAuth.instance.signInWithCredential(authCredential);

    return userCredential.user != null;
  }

  static User? getUser() {
    return FirebaseAuth.instance.currentUser;
  }

  static String getUserId() {
    final user = getUser();

    if (user == null) {
      return '';
    }

    return user.uid;
  }

  static Future<bool> reAuthenticate(AuthCredential authCredential) async {
    final userCredential = await FirebaseAuth.instance.currentUser!
        .reauthenticateWithCredential(authCredential);

    return userCredential.user != null;
  }

  static FirebaseAuthError getFirebaseErrorCodeMessage(String code) {
    switch (code) {
      case 'invalid-email':
        return FirebaseAuthError.invalidEmailAddress;
      case 'email-already-in-use':
        return FirebaseAuthError.emailTaken;
      case 'credential-already-in-use':
      case 'account-exists-with-different-credential':
        return FirebaseAuthError.accountTaken;
      case 'invalid-verification-code':
        return FirebaseAuthError.invalidAuthCode;
      case 'invalid-phone-number':
        return FirebaseAuthError.invalidPhoneNumber;
      case 'session-expired':
      case 'expired-action-code':
        return FirebaseAuthError.authSessionTimeout;
      case 'user-disabled':
      case 'user-mismatch':
      case 'user-not-found':
        return FirebaseAuthError.accountInvalid;
      case 'requires-recent-login':
        return FirebaseAuthError.logInRequired;
      case 'invalid-verification-id':
      case 'invalid-credential':
      case 'missing-client-identifier':
      default:
        return FirebaseAuthError.authFailure;
    }
  }
}
