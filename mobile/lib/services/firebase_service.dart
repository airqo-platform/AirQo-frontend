import 'dart:io';

import 'package:app/constants/config.dart';
import 'package:app/models/kya.dart';
import 'package:app/models/notification.dart';
import 'package:app/models/place_details.dart';
import 'package:app/models/profile.dart';
import 'package:app/services/secure_storage.dart';
import 'package:app/utils/dialogs.dart';
import 'package:app/utils/extensions.dart';
import 'package:cloud_firestore/cloud_firestore.dart';
import 'package:firebase_analytics/firebase_analytics.dart';
import 'package:firebase_auth/firebase_auth.dart';
import 'package:firebase_messaging/firebase_messaging.dart';
import 'package:firebase_storage/firebase_storage.dart' as firebase_storage;
import 'package:flutter/cupertino.dart';
import 'package:flutter/foundation.dart';

import '../models/enum_constants.dart';
import '../utils/exception.dart';
import '../utils/network.dart';
import 'local_storage.dart';

class CloudAnalytics {
  static Future<void> logEvent(
      AnalyticsEvent analyticsEvent, bool loggedInUser) async {
    await FirebaseAnalytics.instance.logEvent(
      name: analyticsEvent.getName(''),
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

  static Future<List<Kya>> getKya(String userId) async {
    try {
      var kyasJson = await FirebaseFirestore.instance
          .collection(Config.kyaCollection)
          .get();
      var userKyas = <UserKya>[];

      if (userId.isNotEmpty && userId.trim() != '') {
        var userKyaJson = await FirebaseFirestore.instance
            .collection(Config.usersKyaCollection)
            .doc(userId)
            .collection(userId)
            .get();

        var userKyaDocs = userKyaJson.docs;
        for (var userKyaDoc in userKyaDocs) {
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
      }

      var kyaDocs = kyasJson.docs;
      var kyas = <Kya>[];
      for (var kyaDoc in kyaDocs) {
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

  static String getUserId() {
    final uid = FirebaseAuth.instance.currentUser?.uid;
    if (uid == null || uid.isEmpty) {
      throw UserException('Not Logged in. Missing uuid');
    }
    return uid;
  }

  static Future<List<AppNotification>> getNotifications() async {
    try {
      final uid = CloudStore.getUserId();
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
      final uuid = CloudStore.getUserId();

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

  static Future<void> updateKyaProgress(String userId, Kya kya) async {
    if (userId.isEmpty || userId.trim() == '') {
      return;
    }

    try {
      await FirebaseFirestore.instance
          .collection(Config.usersKyaCollection)
          .doc(userId)
          .collection(userId)
          .doc(kya.id)
          .update({'progress': kya.progress});
    } on FirebaseException catch (exception, stackTrace) {
      if (exception.code == 'not-found') {
        await FirebaseFirestore.instance
            .collection(Config.usersKyaCollection)
            .doc(userId)
            .collection(userId)
            .doc(kya.id)
            .set({'progress': kya.progress, 'id': kya.id});
      } else {
        await logException(exception, stackTrace);
      }
    } catch (exception, stackTrace) {
      await logException(exception, stackTrace);
    }
  }

  static Future<void> updatePreferenceFields(
      String id, String field, dynamic value, String type) async {
    await SharedPreferencesHelper.updatePreference(field, value, type);
    var hasConnection = await hasNetworkConnection();
    if (!hasConnection) {
      return;
    }

    try {
      DocumentSnapshot userDoc = await FirebaseFirestore.instance
          .collection(Config.usersCollection)
          .doc(id)
          .get();
      var data = userDoc.data();

      if (data != null) {
        var userDetails = Profile.fromJson(data as Map<String, dynamic>);
        if (field == 'notifications') {
          userDetails.preferences.notifications = value as bool;
        } else if (field == 'location') {
          userDetails.preferences.location = value as bool;
        } else if (field == 'aqShares') {
          userDetails.preferences.aqShares = value as int;
        }
        var userJson = userDetails.toJson();

        await FirebaseFirestore.instance
            .collection(Config.usersCollection)
            .doc(id)
            .update(userJson);
      }
    } catch (exception, stackTrace) {
      await logException(exception, stackTrace);
    }
  }

  static Future<void> updateProfileFields(
      String id, Map<String, Object?> fields) async {
    var hasConnection = await hasNetworkConnection();
    if (!hasConnection) {
      return;
    }

    try {
      await FirebaseFirestore.instance
          .collection(Config.usersCollection)
          .doc(id)
          .update(fields);
    } catch (exception, _) {
      try {
        await FirebaseFirestore.instance
            .collection(Config.usersCollection)
            .doc(id)
            .set(fields);
      } catch (exception, stackTrace) {
        await logException(exception, stackTrace);
      }
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

  static Future<void> updateCredentials(String? phone, String? email) async {
    var hasConnection = await hasNetworkConnection();
    if (!hasConnection) {
      return;
    }

    try {
      var id = getUserId();
      if (phone != null) {
        await CloudStore.updateProfileFields(id, {'phoneNumber': phone});
        await SecureStorage().updateUserDetailsField('phoneNumber', phone);
      }
      if (email != null) {
        await CloudStore.updateProfileFields(id, {'emailAddress': email});
        await SecureStorage().updateUserDetailsField('emailAddress', email);
      }
    } catch (exception, stackTrace) {
      await logException(exception, stackTrace);
    }
  }

  static Future<bool> updateEmailAddress(
      String emailAddress, BuildContext context) async {
    var hasConnection = await hasNetworkConnection();
    if (!hasConnection) {
      return false;
    }
    try {
      await FirebaseAuth.instance.currentUser!.updateEmail(emailAddress);
      await updateCredentials(null, emailAddress);
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
      await FirebaseAuth.instance.currentUser!
          .updatePhoneNumber(authCredential);
      await updateCredentials(
          FirebaseAuth.instance.currentUser!.phoneNumber, null);
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
