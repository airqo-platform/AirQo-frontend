import 'dart:io';

import 'package:app/constants/config.dart';
import 'package:app/models/kya.dart';
import 'package:app/models/notification.dart';
import 'package:app/models/place_details.dart';
import 'package:app/models/profile.dart';
import 'package:app/utils/extensions.dart';
import 'package:app/widgets/dialogs.dart';
import 'package:cloud_firestore/cloud_firestore.dart';
import 'package:firebase_analytics/firebase_analytics.dart';
import 'package:firebase_auth/firebase_auth.dart';
import 'package:firebase_messaging/firebase_messaging.dart';
import 'package:firebase_storage/firebase_storage.dart' as firebase_storage;
import 'package:flutter/cupertino.dart';
import 'package:flutter/foundation.dart';
import 'package:hive_flutter/hive_flutter.dart';

import '../models/analytics.dart';
import '../models/enum_constants.dart';
import '../utils/exception.dart';
import '../utils/network.dart';
import 'hive_service.dart';

class CloudAnalytics {
  static Future<void> logEvent(AnalyticsEvent analyticsEvent) async {
    await FirebaseAnalytics.instance.logEvent(
      name: analyticsEvent.getName(),
    );
  }
}

class CloudStore {
  static Future<void> addFavPlace(
    String userId,
    PlaceDetails placeDetails,
  ) async {
    final hasConnection = await hasNetworkConnection();
    if (!hasConnection || userId.trim().isEmpty) {
      return;
    }

    try {
      await FirebaseFirestore.instance
          .collection(Config.favPlacesCollection)
          .doc(userId)
          .collection(userId)
          .doc(placeDetails.placeId)
          .set(
            placeDetails.toJson(),
          );
    } catch (exception, stackTrace) {
      await logException(
        exception,
        stackTrace,
      );
    }
  }

  static Future<void> deleteAccount() async {
    try {
      final id = CustomAuth.getUser()?.uid;
      await Future.wait([
        FirebaseFirestore.instance
            .collection(Config.usersCollection)
            .doc(id)
            .delete(),
        FirebaseFirestore.instance
            .collection(Config.usersKyaCollection)
            .doc(id)
            .delete(),
        FirebaseFirestore.instance
            .collection(Config.usersNotificationCollection)
            .doc(id)
            .delete(),
      ]);
    } catch (exception, stackTrace) {
      await logException(
        exception,
        stackTrace,
      );
    }
  }

  static Future<List<PlaceDetails>> getFavPlaces(String userId) async {
    if (userId == '') {
      return [];
    }

    final hasConnection = await hasNetworkConnection();
    if (!hasConnection) {
      return [];
    }

    try {
      final placesJson = await FirebaseFirestore.instance
          .collection('${Config.favPlacesCollection}/$userId/$userId')
          .get();

      final favPlaces = <PlaceDetails>[];

      final placesDocs = placesJson.docs;
      for (final doc in placesDocs) {
        final data = doc.data();
        if (!data.keys.contains('placeId')) {
          data['placeId'] = doc.id;
        }
        final place = await compute(PlaceDetails.parsePlaceDetails, data);
        if (place != null) {
          favPlaces.add(place);
        }
      }

      return favPlaces;
    } catch (exception, stackTrace) {
      await logException(
        exception,
        stackTrace,
      );
    }

    return [];
  }

  static Future<List<Kya>> _getReferenceKya() async {
    final referenceKyaCollection =
        await FirebaseFirestore.instance.collection(Config.kyaCollection).get();
    final referenceKya = <Kya>[];
    for (final kyaDoc in referenceKyaCollection.docs) {
      try {
        final kyaData = kyaDoc.data();
        if (kyaData.isEmpty) {
          continue;
        }
        referenceKya.add(Kya.fromJson(kyaData));
      } catch (exception, stackTrace) {
        debugPrint('$exception\n$stackTrace');
      }
    }

    return referenceKya;
  }

  static Future<List<UserKya>> _getUserKya() async {
    final userId = CustomAuth.getUserId();
    if (userId.isEmpty) {
      return [];
    }

    final userOnGoingKya = <UserKya>[];

    try {
      final userKyaCollection = await FirebaseFirestore.instance
          .collection(Config.usersKyaCollection)
          .doc(userId)
          .collection(userId)
          .get();

      for (final userKyaDoc in userKyaCollection.docs) {
        try {
          if (userKyaDoc.data().isEmpty) {
            continue;
          }
          try {
            userOnGoingKya.add(
              UserKya.fromJson(
                userKyaDoc.data(),
              ),
            );
          } catch (e) {
            final userKyaData = userKyaDoc.data();
            userKyaData['progress'] =
                (userKyaData['progress'] as double).ceil();
            userOnGoingKya.add(UserKya.fromJson(userKyaData));
          }
        } catch (exception, stackTrace) {
          debugPrint('$exception\n$stackTrace');
        }
      }
    } catch (exception, stackTrace) {
      debugPrint('$exception\n$stackTrace');
    }

    return userOnGoingKya;
  }

  static Future<List<Kya>> getKya() async {
    final userId = CustomAuth.getUserId();
    if (userId.isEmpty) {
      return [];
    }
    final userKya = <Kya>[];
    final userOnGoingKya = await _getUserKya();
    final referenceKya = await _getReferenceKya();

    if (userOnGoingKya.isEmpty) {
      for (final kya in referenceKya) {
        kya.progress = 0;
        userKya.add(kya);
      }
    } else {
      for (final kya in referenceKya) {
        try {
          final onGoingKya = userOnGoingKya.firstWhere(
            (element) => element.id == kya.id,
            orElse: () => UserKya(kya.id, 0),
          );

          kya.progress = onGoingKya.progress;
          userKya.add(kya);
        } catch (exception, stackTrace) {
          debugPrint('$exception\n$stackTrace');
        }
      }
    }

    return userKya;
  }

  static Future<List<AppNotification>> getNotifications() async {
    final uid = CustomAuth.getUserId();
    if (uid.isEmpty) {
      return [];
    }

    try {
      final notificationsJson = await FirebaseFirestore.instance
          .collection('${Config.usersNotificationCollection}/$uid/$uid')
          .get();

      final notifications = <AppNotification>[];

      for (final doc in notificationsJson.docs) {
        final notification = AppNotification.parseAppNotification(
          doc.data(),
        );
        if (notification != null) {
          notifications.add(notification);
        }
      }
      await AppNotification.load(notifications);

      return notifications;
    } catch (exception, stackTrace) {
      await logException(
        exception,
        stackTrace,
      );
    }

    return [];
  }

  static Future<List<Analytics>> getCloudAnalytics() async {
    final uid = CustomAuth.getUserId();
    if (uid.isEmpty) {
      return [];
    }

    try {
      final analyticsCollection = await FirebaseFirestore.instance
          .collection('${Config.usersAnalyticsCollection}/$uid/$uid')
          .get();

      final cloudAnalytics = <Analytics>[];

      for (final doc in analyticsCollection.docs) {
        final analytics = Analytics.parseAnalytics(
          doc.data(),
        );
        if (analytics != null) {
          cloudAnalytics.add(analytics);
        }
      }
      await Analytics.load(cloudAnalytics);

      return cloudAnalytics;
    } catch (exception, stackTrace) {
      await logException(
        exception,
        stackTrace,
      );
    }

    return [];
  }

  static Future<Profile> getProfile() async {
    try {
      final uuid = CustomAuth.getUserId();

      final userJson = await FirebaseFirestore.instance
          .collection(Config.usersCollection)
          .doc(uuid)
          .get();

      return Profile.parseUserDetails(
        userJson.data(),
      );
    } on FirebaseException catch (exception, _) {
      if (exception.code == 'not-found') {
        return await CustomAuth.createProfile();
      } else {
        rethrow;
      }
    } catch (exception, stackTrace) {
      await logException(
        exception,
        stackTrace,
      );
    }

    return Profile.getProfile();
  }

  static Future<void> removeFavPlace(
    String userId,
    PlaceDetails placeDetails,
  ) async {
    final hasConnection = await hasNetworkConnection();
    if (!hasConnection || userId.trim().isEmpty) {
      return;
    }
    try {
      await FirebaseFirestore.instance
          .collection(Config.favPlacesCollection)
          .doc(userId)
          .collection(userId)
          .doc(placeDetails.placeId)
          .delete();
    } catch (exception, stackTrace) {
      await logException(
        exception,
        stackTrace,
      );
    }
  }

  static Future<void> updateFavPlaces(
    String userId,
    List<PlaceDetails> favPlaces,
  ) async {
    final hasConnection = await hasNetworkConnection();
    if (!hasConnection || userId.trim().isEmpty) {
      return;
    }
    final batch = FirebaseFirestore.instance.batch();

    for (final place in favPlaces) {
      try {
        final document = FirebaseFirestore.instance
            .collection(Config.favPlacesCollection)
            .doc(userId)
            .collection(userId)
            .doc(place.placeId);
        batch.set(
          document,
          place.toJson(),
        );
      } catch (exception, stackTrace) {
        await logException(
          exception,
          stackTrace,
        );
      }
    }

    return batch.commit();
  }

  static Future<void> updateCloudProfile() async {
    final currentUser = FirebaseAuth.instance.currentUser;
    if (currentUser != null) {
      try {
        final profile = await Profile.getProfile();
        try {
          await Future.wait([
            currentUser.updateDisplayName(profile.firstName),
            FirebaseFirestore.instance
                .collection(Config.usersCollection)
                .doc(profile.userId)
                .update(
                  profile.toJson(),
                ),
          ]);
        } catch (exception) {
          await Future.wait([
            currentUser.updateDisplayName(profile.firstName),
            FirebaseFirestore.instance
                .collection(Config.usersCollection)
                .doc(profile.userId)
                .set(
                  profile.toJson(),
                ),
          ]);
        }
      } catch (exception, stackTrace) {
        await logException(
          exception,
          stackTrace,
        );
      }
    }
  }

  static Future<void> updateCloudAnalytics() async {
    final currentUser = FirebaseAuth.instance.currentUser;
    if (currentUser != null) {
      try {
        final analytics = Hive.box<Analytics>(HiveBox.analytics)
            .values
            .toList()
            .cast<Analytics>();
        final profile = await Profile.getProfile();
        for (final x in analytics) {
          try {
            await FirebaseFirestore.instance
                .collection(Config.usersAnalyticsCollection)
                .doc(profile.userId)
                .collection(profile.userId)
                .doc(x.site)
                .set(
                  x.toJson(),
                );
          } catch (exception) {
            debugPrint(exception.toString());
          }
        }
      } catch (exception, stackTrace) {
        await logException(
          exception,
          stackTrace,
        );
      }
    }
  }

  static Future<void> updateCloudNotification(
    AppNotification notification,
  ) async {
    final currentUser = FirebaseAuth.instance.currentUser;
    if (currentUser != null) {
      try {
        final profile = await Profile.getProfile();
        try {
          await FirebaseFirestore.instance
              .collection(Config.usersNotificationCollection)
              .doc(profile.userId)
              .collection(profile.userId)
              .doc(notification.id)
              .update(
                notification.toJson(),
              );
        } catch (exception) {
          await FirebaseFirestore.instance
              .collection(Config.usersNotificationCollection)
              .doc(profile.userId)
              .collection(profile.userId)
              .doc(notification.id)
              .set(
                notification.toJson(),
              );
        }
      } catch (exception, stackTrace) {
        await logException(
          exception,
          stackTrace,
        );
      }
    }
  }

  static Future<void> updateKyaProgress(Kya kya) async {
    final userId = CustomAuth.getUserId();

    if (userId.isEmpty) {
      return;
    }
    final userKya = UserKya(kya.id, kya.progress);
    try {
      await FirebaseFirestore.instance
          .collection(Config.usersKyaCollection)
          .doc(userId)
          .collection(userId)
          .doc(kya.id)
          .update(
            userKya.toJson(),
          );
    } on FirebaseException catch (exception, stackTrace) {
      if (exception.code.contains('not-found')) {
        await FirebaseFirestore.instance
            .collection(Config.usersKyaCollection)
            .doc(userId)
            .collection(userId)
            .doc(kya.id)
            .set(
              userKya.toJson(),
            );
      } else {
        await logException(
          exception,
          stackTrace,
        );
      }
    } catch (exception, stackTrace) {
      await logException(
        exception,
        stackTrace,
      );
    }
  }

  static Future<String> uploadProfilePicture(String filePath) async {
    try {
      final userId = CustomAuth.getUserId();
      final file = File(filePath);

      final docRef = '${Config.usersProfilePictureStorage}/'
          '$userId/avatar${file.getExtension()}';

      final task = await firebase_storage.FirebaseStorage.instance
          .ref(docRef)
          .putFile(file);

      return await task.storage.ref(docRef).getDownloadURL();
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
    return await FirebaseMessaging.instance.getToken();
  }
}

class CustomAuth {
  static Future<Profile> createProfile() async {
    final profile = await Profile.getProfile();
    try {
      await FirebaseAuth.instance.currentUser
          ?.updateDisplayName(profile.firstName);
    } catch (exception, stackTrace) {
      await logException(
        exception,
        stackTrace,
      );
    }

    return profile;
  }

  static Future<void> deleteAccount() async {
    try {
      await getUser()?.delete();
    } catch (exception, stackTrace) {
      await logException(
        exception,
        stackTrace,
      );
    }
  }

  static Future<bool> emailAuthentication(
    String emailAddress,
    String link,
    BuildContext context,
  ) async {
    try {
      final userCredential = await FirebaseAuth.instance
          .signInWithEmailLink(emailLink: link, email: emailAddress);

      return userCredential.user != null;
    } on FirebaseAuthException catch (exception, stackTrace) {
      if (exception.code == 'invalid-email') {
        await showSnackBar(
          context,
          'Invalid Email. Try again',
        );
      } else if (exception.code == 'expired-action-code') {
        await showSnackBar(
          context,
          'Your verification has timed out. Try again later',
        );
      } else if (exception.code == 'user-disabled') {
        await showSnackBar(
          context,
          'Account has been disabled. PLease contact support',
        );
      } else {
        await showSnackBar(
          context,
          Config.appErrorMessage,
        );
      }
      debugPrint('$exception\n$stackTrace');
      if (!['invalid-email', 'expired-action-code'].contains(exception.code)) {
        await logException(
          exception,
          stackTrace,
        );
      }

      return false;
    }
  }

  static String getDisplayName() {
    final authInstance = FirebaseAuth.instance;

    if (authInstance.currentUser == null) {
      return '';
    }

    return authInstance.currentUser!.displayName ?? 'Guest';
  }

  static User? getUser() {
    return FirebaseAuth.instance.currentUser;
  }

  static String getUserId() {
    if (!isLoggedIn()) {
      return '';
    }

    return FirebaseAuth.instance.currentUser!.uid;
  }

  static bool isLoggedIn() {
    return FirebaseAuth.instance.currentUser != null;
  }

  static Future<bool> isValidEmailCode(
    String subjectCode,
    String verificationLink,
  ) async {
    try {
      final signInLink = Uri.parse(verificationLink);
      final code = signInLink.queryParameters['oobCode'];
      if (code != null && code == subjectCode) {
        return true;
      }

      return false;
    } catch (exception, stackTrace) {
      await logException(
        exception,
        stackTrace,
      );
    }

    return false;
  }

  static Future<void> logOut() async {
    try {
      await FirebaseAuth.instance.signOut();
    } catch (exception, stackTrace) {
      await logException(
        exception,
        stackTrace,
      );
    }
  }

  static Future<bool> phoneNumberAuthentication(
    AuthCredential authCredential,
    BuildContext context,
  ) async {
    try {
      final userCredential =
          await FirebaseAuth.instance.signInWithCredential(authCredential);

      return userCredential.user != null;
    } on FirebaseAuthException catch (exception, stackTrace) {
      if (exception.code == 'invalid-verification-code') {
        await showSnackBar(
          context,
          'Invalid Code',
        );
      } else if (exception.code == 'session-expired') {
        await showSnackBar(
          context,
          'Your verification has timed out. Try again later',
        );
      } else if (exception.code == 'account-exists-with-different-credential') {
        await showSnackBar(
          context,
          'Phone number is already linked to an email.',
        );
      } else if (exception.code == 'user-disabled') {
        await showSnackBar(
          context,
          'Account has been disabled. PLease contact support',
        );
      } else {
        await showSnackBar(
          context,
          Config.appErrorMessage,
        );
      }

      debugPrint('$exception\n$stackTrace');
      if (![
        'invalid-verification-code',
        'invalid-verification-code',
        'account-exists-with-different-credential',
      ].contains(exception.code)) {
        await logException(
          exception,
          stackTrace,
        );
      }

      return false;
    }
  }

  static Future<bool> reAuthenticateWithEmailAddress(
    String emailAddress,
    String link,
    BuildContext context,
  ) async {
    final hasConnection = await hasNetworkConnection();
    if (!hasConnection) {
      return false;
    }

    try {
      final userCredential = await FirebaseAuth.instance.signInWithEmailLink(
        emailLink: link,
        email: emailAddress,
      );

      return userCredential.user != null;
    } catch (exception, stackTrace) {
      await logException(
        exception,
        stackTrace,
      );
    }

    return false;
  }

  static Future<bool> reAuthenticateWithPhoneNumber(
    AuthCredential authCredential,
    BuildContext context,
  ) async {
    final hasConnection = await hasNetworkConnection();
    if (!hasConnection) {
      return false;
    }

    try {
      final userCredentials = await FirebaseAuth.instance.currentUser!
          .reauthenticateWithCredential(authCredential);

      // final userCredential =
      //     await _firebaseAuth.signInWithCredential(authCredential);
      return userCredentials.user != null;
    } on FirebaseAuthException catch (exception) {
      if (exception.code == 'invalid-verification-code') {
        await showSnackBar(
          context,
          'Invalid Code',
        );
      }
      if (exception.code == 'session-expired') {
        await showSnackBar(
          context,
          'Your verification '
          'has timed out. we have sent your'
          ' another verification code',
        );
      }
    } catch (exception, stackTrace) {
      await logException(
        exception,
        stackTrace,
      );
    }

    return false;
  }

  static Future<bool> requestPhoneVerification(
    phoneNumber,
    context,
    callBackFn,
    autoVerificationFn,
  ) async {
    final hasConnection = await checkNetworkConnection(
      context,
      notifyUser: true,
    );
    if (!hasConnection) {
      return false;
    }

    try {
      await FirebaseAuth.instance.verifyPhoneNumber(
        phoneNumber: phoneNumber,
        verificationCompleted: (PhoneAuthCredential credential) {
          autoVerificationFn(credential);
        },
        verificationFailed: (FirebaseAuthException exception) async {
          if (exception.code == 'invalid-phone-number') {
            await showSnackBar(
              context,
              'Invalid phone number.',
            );
          } else {
            await showSnackBar(
              context,
              'Cannot process your request.'
              ' Try again later',
            );
            debugPrint(exception.toString());
          }
        },
        codeSent: (String verificationId, int? resendToken) async {
          callBackFn(verificationId);
        },
        codeAutoRetrievalTimeout: (String verificationId) async {
          // TODO Implement auto code retrieval timeout
        },
        timeout: const Duration(minutes: 2),
      );

      return true;
    } catch (exception, stackTrace) {
      await logException(
        exception,
        stackTrace,
      );

      return false;
    }
  }

  static Future<bool> updateEmailAddress(
    String emailAddress,
    BuildContext context,
  ) async {
    final hasConnection = await hasNetworkConnection();
    if (!hasConnection) {
      return false;
    }
    try {
      final profile = await Profile.getProfile();
      await FirebaseAuth.instance.currentUser!.updateEmail(emailAddress).then(
        (_) {
          profile.update();
        },
      );

      return true;
    } on FirebaseAuthException catch (exception) {
      if (exception.code == 'email-already-in-use') {
        await showSnackBar(
          context,
          'Email Address already taken',
        );

        return false;
      }
      if (exception.code == 'invalid-email') {
        await showSnackBar(
          context,
          'Invalid email address',
        );

        return false;
      }
    } catch (exception, stackTrace) {
      await logException(
        exception,
        stackTrace,
      );
    }

    return false;
  }

  static Future<bool> updatePhoneNumber(
    PhoneAuthCredential authCredential,
    BuildContext context,
  ) async {
    final hasConnection = await hasNetworkConnection();
    if (!hasConnection) {
      return false;
    }

    try {
      final profile = await Profile.getProfile();
      await FirebaseAuth.instance.currentUser!
          .updatePhoneNumber(authCredential)
          .then(
        (_) {
          profile.update();
        },
      );

      return true;
    } on FirebaseAuthException catch (exception) {
      if (exception.code == 'credential-already-in-use') {
        await showSnackBar(
          context,
          'Phone number already taken',
        );

        return false;
      } else if (exception.code == 'invalid-verification-id') {
        await showSnackBar(
          context,
          'Failed to change phone number. Try again later',
        );

        return false;
      } else if (exception.code == 'session-expired') {
        await showSnackBar(
          context,
          'Your code has expired. Try again later',
        );

        return false;
      }
    } catch (exception, stackTrace) {
      await logException(
        exception,
        stackTrace,
      );
    }

    return false;
  }
}
