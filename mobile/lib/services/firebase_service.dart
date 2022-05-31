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

class CloudAnalytics {
  static Future<void> logEvent(AnalyticsEvent analyticsEvent) async {
    await FirebaseAnalytics.instance.logEvent(
      name: analyticsEvent.getName(),
    );
  }
}

class CloudStore {
  static Future<void> addFavPlace(
      String userId, PlaceDetails placeDetails) async {
    var hasConnection = await hasNetworkConnection();
    if (!hasConnection || userId.trim().isEmpty) {
      return;
    }

    try {
      await FirebaseFirestore.instance
          .collection(Config.favPlacesCollection)
          .doc(userId)
          .collection(userId)
          .doc(placeDetails.placeId)
          .set(placeDetails.toJson());
    } catch (exception, stackTrace) {
      await logException(exception, stackTrace);
    }
  }

  static Future<void> deleteAccount() async {
    try {
      var id = CustomAuth.getUser()?.uid;
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
            .delete()
      ]);
    } catch (exception, stackTrace) {
      await logException(exception, stackTrace);
    }
  }

  static Future<List<PlaceDetails>> getFavPlaces(String userId) async {
    if (userId == '') {
      return [];
    }

    var hasConnection = await hasNetworkConnection();
    if (!hasConnection) {
      return [];
    }

    try {
      var placesJson = await FirebaseFirestore.instance
          .collection('${Config.favPlacesCollection}/$userId/$userId')
          .get();

      var favPlaces = <PlaceDetails>[];

      var placesDocs = placesJson.docs;
      for (var doc in placesDocs) {
        var data = doc.data();
        if (!data.keys.contains('placeId')) {
          data['placeId'] = doc.id;
        }
        var place = await compute(PlaceDetails.parsePlaceDetails, data);
        if (place != null) {
          favPlaces.add(place);
        }
      }
      return favPlaces;
    } catch (exception, stackTrace) {
      await logException(exception, stackTrace);
    }

    return [];
  }

  static Future<List<Kya>> getKya() async {
    // TODO fix kya
    final userId = CustomAuth.getUserId();
    if (userId.isEmpty) {
      return [];
    }

    try {
      var userKyas = <UserKya>[];

      var userKyaJson = await FirebaseFirestore.instance
          .collection(Config.usersKyaCollection)
          .doc(userId)
          .collection(userId)
          .get();

      for (var userKyaDoc in userKyaJson.docs) {
        try {
          var userKyaData = userKyaDoc.data();
          if (userKyaData.isEmpty) {
            continue;
          }
          UserKya kya;
          try {
            kya = UserKya.fromJson(userKyaData);
          } catch (e) {
            userKyaData['progress'] =
                (userKyaData['progress'] as double).ceil();
            kya = UserKya.fromJson(userKyaData);
          }

          userKyas.add(kya);
        } catch (exception, stackTrace) {
          debugPrint('$exception\n$stackTrace');
        }
      }

      var kyasJson = await FirebaseFirestore.instance
          .collection(Config.kyaCollection)
          .get();
      var kyas = <Kya>[];
      for (var kyaDoc in kyasJson.docs) {
        try {
          var kyaData = kyaDoc.data();
          if (kyaData.isEmpty) {
            continue;
          }
          var kya = Kya.fromJson(kyaData);
          var userKya = userKyas.firstWhere((element) => element.id == kya.id,
              orElse: () => UserKya(kya.id, 0));

          kya.progress = userKya.progress;
          kyas.add(kya);
        } catch (exception, stackTrace) {
          debugPrint('$exception\n$stackTrace');
        }
      }

      return kyas;
    } catch (exception, stackTrace) {
      debugPrint('$exception\n$stackTrace');
    }
    return [];
  }

  static Future<List<AppNotification>> getNotifications() async {
    final uid = CustomAuth.getUserId();
    if (uid.isEmpty) {
      return [];
    }

    try {
      var notificationsJson = await FirebaseFirestore.instance
          .collection('${Config.usersNotificationCollection}/$uid/$uid')
          .get();

      final notifications = <AppNotification>[];

      for (var doc in notificationsJson.docs) {
        var notification = AppNotification.parseAppNotification(doc.data());
        if (notification != null) {
          notifications.add(notification);
        }
      }

      await AppNotification.load(notifications);

      return notifications;
    } catch (exception, stackTrace) {
      await logException(exception, stackTrace);
    }
    return [];
  }

  static Future<Profile> getProfile() async {
    try {
      final uuid = CustomAuth.getUserId();

      var userJson = await FirebaseFirestore.instance
          .collection(Config.usersCollection)
          .doc(uuid)
          .get();
      return await compute(Profile.parseUserDetails, userJson.data());
    } on FirebaseException catch (exception, _) {
      if (exception.code == 'not-found') {
        var profile = await CustomAuth.createProfile();
        return profile;
      } else {
        rethrow;
      }
    } catch (exception, stackTrace) {
      await logException(exception, stackTrace);
    }

    return Profile.getProfile();
  }

  static Future<void> removeFavPlace(
      String userId, PlaceDetails placeDetails) async {
    var hasConnection = await hasNetworkConnection();
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
      await logException(exception, stackTrace);
    }
  }

  static Future<void> updateFavPlaces(
      String userId, List<PlaceDetails> favPlaces) async {
    var hasConnection = await hasNetworkConnection();
    if (!hasConnection || userId.trim().isEmpty) {
      return;
    }
    var batch = FirebaseFirestore.instance.batch();

    for (var place in favPlaces) {
      try {
        var document = FirebaseFirestore.instance
            .collection(Config.favPlacesCollection)
            .doc(userId)
            .collection(userId)
            .doc(place.placeId);
        batch.set(document, place.toJson());
      } catch (exception, stackTrace) {
        await logException(exception, stackTrace);
      }
    }
    return batch.commit();
  }

  static Future<void> updateCloudProfile() async {
    var currentUser = FirebaseAuth.instance.currentUser;
    if (currentUser != null) {
      try {
        var profile = await Profile.getProfile();
        try {
          await Future.wait([
            currentUser.updateDisplayName(profile.firstName),
            FirebaseFirestore.instance
                .collection(Config.usersCollection)
                .doc(profile.userId)
                .update(profile.toJson())
          ]);
        } catch (exception) {
          await Future.wait([
            currentUser.updateDisplayName(profile.firstName),
            FirebaseFirestore.instance
                .collection(Config.usersCollection)
                .doc(profile.userId)
                .set(profile.toJson())
          ]);
        }
      } catch (exception, stackTrace) {
        await logException(exception, stackTrace);
      }
    }
  }

  static Future<void> updateCloudAnalytics() async {
    var currentUser = FirebaseAuth.instance.currentUser;
    if (currentUser != null) {
      try {
        var analytics = Hive.box<Analytics>(HiveBox.analytics)
            .values
            .toList()
            .cast<Analytics>();
        var profile = await Profile.getProfile();
        for (var x in analytics) {
          try {
            await FirebaseFirestore.instance
                .collection(Config.usersAnalyticsCollection)
                .doc(profile.userId)
                .collection(profile.userId)
                .doc(x.id)
                .update(x.toJson());
          } catch (exception) {
            await FirebaseFirestore.instance
                .collection(Config.usersAnalyticsCollection)
                .doc(profile.userId)
                .collection(profile.userId)
                .doc(x.id)
                .set(x.toJson());
          }
        }
      } catch (exception, stackTrace) {
        await logException(exception, stackTrace);
      }
    }
  }

  static Future<void> updateCloudNotification(
      AppNotification notification) async {
    var currentUser = FirebaseAuth.instance.currentUser;
    if (currentUser != null) {
      try {
        var profile = await Profile.getProfile();
        try {
          await FirebaseFirestore.instance
              .collection(Config.usersNotificationCollection)
              .doc(profile.userId)
              .collection(profile.userId)
              .doc(notification.id)
              .update(notification.toJson());
        } catch (exception) {
          await FirebaseFirestore.instance
              .collection(Config.usersNotificationCollection)
              .doc(profile.userId)
              .collection(profile.userId)
              .doc(notification.id)
              .set(notification.toJson());
        }
      } catch (exception, stackTrace) {
        await logException(exception, stackTrace);
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
          .update(userKya.toJson());
    } on FirebaseException catch (exception, stackTrace) {
      if (exception.code.contains('not-found')) {
        await FirebaseFirestore.instance
            .collection(Config.usersKyaCollection)
            .doc(userId)
            .collection(userId)
            .doc(kya.id)
            .set(userKya.toJson());
      } else {
        await logException(exception, stackTrace);
      }
    } catch (exception, stackTrace) {
      await logException(exception, stackTrace);
    }
  }

  static Future<String> uploadProfilePicture(String filePath) async {
    try {
      var userId = CustomAuth.getUserId();
      var file = File(filePath);

      var docRef = '${Config.usersProfilePictureStorage}/'
          '$userId/avatar${file.getExtension()}';

      var task = await firebase_storage.FirebaseStorage.instance
          .ref(docRef)
          .putFile(file);

      var downloadUrl = await task.storage.ref(docRef).getDownloadURL();
      return downloadUrl;
    } on Exception catch (exception, stackTrace) {
      await logException(exception, stackTrace);
    }

    return '';
  }
}

class CloudMessaging {
  static Future<String?> getDeviceToken() async {
    var token = await FirebaseMessaging.instance.getToken();
    return token;
  }
}

class CustomAuth {
  static Future<Profile> createProfile() async {
    var profile = await Profile.getProfile();
    try {
      await FirebaseAuth.instance.currentUser
          ?.updateDisplayName(profile.firstName);
    } catch (exception, stackTrace) {
      await logException(exception, stackTrace);
    }
    return profile;
  }

  static Future<void> deleteAccount() async {
    try {
      var user = getUser();
      await user?.delete();
    } catch (exception, stackTrace) {
      await logException(exception, stackTrace);
    }
  }

  static Future<bool> emailAuthentication(
      String emailAddress, String link, BuildContext context) async {
    try {
      var userCredential = await FirebaseAuth.instance
          .signInWithEmailLink(emailLink: link, email: emailAddress);
      return userCredential.user != null;
    } on FirebaseAuthException catch (exception, stackTrace) {
      if (exception.code == 'invalid-email') {
        await showSnackBar(context, 'Invalid Email. Try again');
      } else if (exception.code == 'expired-action-code') {
        await showSnackBar(
            context, 'Your verification has timed out. Try again later');
      } else if (exception.code == 'user-disabled') {
        await showSnackBar(
            context, 'Account has been disabled. PLease contact support');
      } else {
        await showSnackBar(context, Config.appErrorMessage);
      }
      debugPrint('$exception\n$stackTrace');
      if (!['invalid-email', 'expired-action-code'].contains(exception.code)) {
        await logException(exception, stackTrace);
      }
      return false;
    }
  }

  static String getDisplayName() {
    var authInstance = FirebaseAuth.instance;

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
      String subjectCode, String verificationLink) async {
    try {
      final signInLink = Uri.parse(verificationLink);
      var code = signInLink.queryParameters['oobCode'];
      if (code != null && code == subjectCode) {
        return true;
      }
      return false;
    } catch (exception, stackTrace) {
      await logException(exception, stackTrace);
    }
    return false;
  }

  static Future<void> logOut() async {
    try {
      await FirebaseAuth.instance.signOut();
    } catch (exception, stackTrace) {
      await logException(exception, stackTrace);
    }
  }

  static Future<bool> phoneNumberAuthentication(
      AuthCredential authCredential, BuildContext context) async {
    try {
      var userCredential =
          await FirebaseAuth.instance.signInWithCredential(authCredential);
      return userCredential.user != null;
    } on FirebaseAuthException catch (exception, stackTrace) {
      if (exception.code == 'invalid-verification-code') {
        await showSnackBar(context, 'Invalid Code');
      } else if (exception.code == 'session-expired') {
        await showSnackBar(
            context, 'Your verification has timed out. Try again later');
      } else if (exception.code == 'account-exists-with-different-credential') {
        await showSnackBar(
            context, 'Phone number is already linked to an email.');
      } else if (exception.code == 'user-disabled') {
        await showSnackBar(
            context, 'Account has been disabled. PLease contact support');
      } else {
        await showSnackBar(context, Config.appErrorMessage);
      }

      debugPrint('$exception\n$stackTrace');
      if (![
        'invalid-verification-code',
        'invalid-verification-code',
        'account-exists-with-different-credential'
      ].contains(exception.code)) {
        await logException(exception, stackTrace);
      }
      return false;
    }
  }

  static Future<bool> reAuthenticateWithEmailAddress(
      String emailAddress, String link, BuildContext context) async {
    var hasConnection = await hasNetworkConnection();
    if (!hasConnection) {
      return false;
    }

    try {
      var userCredential = await FirebaseAuth.instance
          .signInWithEmailLink(emailLink: link, email: emailAddress);

      return userCredential.user != null;
    } catch (exception, stackTrace) {
      await logException(exception, stackTrace);
    }
    return false;
  }

  static Future<bool> reAuthenticateWithPhoneNumber(
      AuthCredential authCredential, BuildContext context) async {
    var hasConnection = await hasNetworkConnection();
    if (!hasConnection) {
      return false;
    }

    try {
      var userCredentials = await FirebaseAuth.instance.currentUser!
          .reauthenticateWithCredential(authCredential);

      // var userCredential =
      //     await _firebaseAuth.signInWithCredential(authCredential);
      return userCredentials.user != null;
    } on FirebaseAuthException catch (exception) {
      if (exception.code == 'invalid-verification-code') {
        await showSnackBar(context, 'Invalid Code');
      }
      if (exception.code == 'session-expired') {
        await showSnackBar(
            context,
            'Your verification '
            'has timed out. we have sent your'
            ' another verification code');
      }
    } catch (exception, stackTrace) {
      await logException(exception, stackTrace);
    }
    return false;
  }

  static Future<bool> requestPhoneVerification(
      phoneNumber, context, callBackFn, autoVerificationFn) async {
    var hasConnection = await checkNetworkConnection(context, notifyUser: true);
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
              await showSnackBar(context, 'Invalid phone number.');
            } else {
              await showSnackBar(
                  context,
                  'Cannot process your request.'
                  ' Try again later');
              debugPrint(exception.toString());
            }
          },
          codeSent: (String verificationId, int? resendToken) async {
            callBackFn(verificationId);
          },
          codeAutoRetrievalTimeout: (String verificationId) async {
            // TODO Implement auto code retrieval timeout
            // await showSnackBar(context, 'codeAutoRetrievalTimeout');
          },
          timeout: const Duration(minutes: 2));
      return true;
    } catch (exception, stackTrace) {
      await logException(exception, stackTrace);
      return false;
    }
  }

  static Future<bool> updateEmailAddress(
      String emailAddress, BuildContext context) async {
    var hasConnection = await hasNetworkConnection();
    if (!hasConnection) {
      return false;
    }
    try {
      final profile = await Profile.getProfile();
      await FirebaseAuth.instance.currentUser!
          .updateEmail(emailAddress)
          .then((_) {
        profile.saveProfile();
      });
      return true;
    } on FirebaseAuthException catch (exception) {
      if (exception.code == 'email-already-in-use') {
        await showSnackBar(context, 'Email Address already taken');
        return false;
      }
      if (exception.code == 'invalid-email') {
        await showSnackBar(context, 'Invalid email address');
        return false;
      }
    } catch (exception, stackTrace) {
      await logException(exception, stackTrace);
    }

    return false;
  }

  static Future<bool> updatePhoneNumber(
      PhoneAuthCredential authCredential, BuildContext context) async {
    var hasConnection = await hasNetworkConnection();
    if (!hasConnection) {
      return false;
    }

    try {
      final profile = await Profile.getProfile();
      await FirebaseAuth.instance.currentUser!
          .updatePhoneNumber(authCredential)
          .then((_) {
        profile.saveProfile();
      });
      return true;
    } on FirebaseAuthException catch (exception) {
      if (exception.code == 'credential-already-in-use') {
        await showSnackBar(context, 'Phone number already taken');
        return false;
      } else if (exception.code == 'invalid-verification-id') {
        await showSnackBar(
            context, 'Failed to change phone number. Try again later');
        return false;
      } else if (exception.code == 'session-expired') {
        await showSnackBar(context, 'Your code has expired. Try again later');
        return false;
      }
    } catch (exception, stackTrace) {
      await logException(exception, stackTrace);
    }

    return false;
  }
}
