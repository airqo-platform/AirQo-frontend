import 'dart:io';

import 'package:app/constants/config.dart';
import 'package:app/models/kya.dart';
import 'package:app/models/notification.dart';
import 'package:app/models/place_details.dart';
import 'package:app/models/user_details.dart';
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
import 'package:provider/provider.dart';
import 'package:sentry_flutter/sentry_flutter.dart';

import 'local_storage.dart';

enum AnalyticsEvent {
  browserAsAppGuest,
  createUserProfile,
  rateApp,
  shareAirQualityInformation,
  allowLocation,
  allowNotification,
  uploadProfilePic,
  completeKyaLesson,
  saveFavoritePlace
}

class CloudAnalytics {
  final FirebaseAnalytics analytics = FirebaseAnalytics.instance;

  Future<void> logEvent(AnalyticsEvent analyticsEvent) async {
    await analytics.logEvent(
      name: analyticsEvent.getString(),
    );
  }
}

class CloudStore {
  final FirebaseFirestore _firebaseFirestore = FirebaseFirestore.instance;
  final SharedPreferencesHelper _preferencesHelper = SharedPreferencesHelper();
  final firebase_storage.FirebaseStorage storage =
      firebase_storage.FirebaseStorage.instance;

  Future<void> addFavPlace(String userId, PlaceDetails placeDetails) async {
    var hasConnection = await isConnected();
    if (!hasConnection || userId.trim().isEmpty) {
      return;
    }

    try {
      await _firebaseFirestore
          .collection(Config.favPlacesCollection)
          .doc(userId)
          .collection(userId)
          .doc(placeDetails.placeId)
          .set(placeDetails.toJson());
    } catch (exception, stackTrace) {
      debugPrint('$exception\n$stackTrace');
      await Sentry.captureException(
        exception,
        stackTrace: stackTrace,
      );
    }
  }

  Future<bool> credentialsExist(String? phoneNumber, String? email) async {
    var hasConnection = await isConnected();
    if (!hasConnection) {
      return false;
    }

    try {
      var users =
          await _firebaseFirestore.collection(Config.usersCollection).get();
      for (var doc in users.docs) {
        try {
          if (phoneNumber != null && doc.data()['phoneNumber'] == phoneNumber) {
            return true;
          }
          if (email != null && doc.data()['emailAddress'] == email) {
            return true;
          }
        } on Error catch (exception, stackTrace) {
          debugPrint(exception.toString());
          debugPrint(stackTrace.toString());
          await Sentry.captureException(
            exception,
            stackTrace: stackTrace,
          );
          continue;
        }
      }
      return false;
    } on Error catch (exception, stackTrace) {
      debugPrint('$exception\n$stackTrace');
      await Sentry.captureException(
        exception,
        stackTrace: stackTrace,
      );
    }
    return false;
  }

  Future<void> deleteAccount(id) async {
    var hasConnection = await isConnected();
    if (!hasConnection) {
      return;
    }

    /// TODO IMPLEMENT DELETE NOTIFICATIONS
    /// TODO IMPLEMENT DELETE KYA
    try {
      await _firebaseFirestore
          .collection(Config.usersCollection)
          .doc(id)
          .delete();
    } on Error catch (exception, stackTrace) {
      debugPrint('$exception\n$stackTrace');
      await Sentry.captureException(
        exception,
        stackTrace: stackTrace,
      );
    }
  }

  Future<List<PlaceDetails>> getFavPlaces(String userId) async {
    if (userId == '') {
      return [];
    }

    var hasConnection = await isConnected();
    if (!hasConnection) {
      return [];
    }

    try {
      var placesJson = await _firebaseFirestore
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
    } on Error catch (exception, stackTrace) {
      debugPrint('$exception\n$stackTrace');
      await Sentry.captureException(
        exception,
        stackTrace: stackTrace,
      );
    }

    return [];
  }

  Future<List<Kya>> getKya(String userId) async {
    try {
      var kyasJson =
          await _firebaseFirestore.collection(Config.kyaCollection).get();
      var userKyas = <UserKya>[];

      if (userId.isNotEmpty && userId.trim() != '') {
        var userKyaJson = await _firebaseFirestore
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

  Future<List<UserNotification>> getNotifications(String id) async {
    if (id == '') {
      return [];
    }

    var hasConnection = await isConnected();
    if (!hasConnection) {
      return [];
    }

    try {
      var notificationsJson = await _firebaseFirestore
          .collection('${Config.notificationCollection}/$id/$id')
          .get();

      var notifications = <UserNotification>[];

      var notificationDocs = notificationsJson.docs;
      for (var doc in notificationDocs) {
        var notification =
            await compute(UserNotification.parseNotification, doc.data());
        if (notification != null) {
          notifications.add(notification);
        }
      }

      return notifications;
    } on Error catch (exception, stackTrace) {
      debugPrint('$exception\n$stackTrace');
      await Sentry.captureException(
        exception,
        stackTrace: stackTrace,
      );
    }

    return [];
  }

  Future<UserDetails?> getProfile(String id) async {
    if (id == '') {
      return null;
    }

    var hasConnection = await isConnected();
    if (!hasConnection) {
      return UserDetails.initialize();
    }

    try {
      var userJson = await _firebaseFirestore
          .collection(Config.usersCollection)
          .doc(id)
          .get();
      return await compute(UserDetails.parseUserDetails, userJson.data());
    } on Error catch (exception, stackTrace) {
      debugPrint('$exception\n$stackTrace');
      await Sentry.captureException(
        exception,
        stackTrace: stackTrace,
      );
    }

    return null;
  }

  Future<bool> isConnected() async {
    try {
      final result = await InternetAddress.lookup('firebase.google.com');
      if (result.isNotEmpty && result[0].rawAddress.isNotEmpty) {
        return true;
      }
    } on Exception catch (_) {}
    return false;
  }

  Future<bool> markNotificationAsRead(
      String userId, String notificationId) async {
    if (userId == '' || notificationId == '') {
      return false;
    }

    var hasConnection = await isConnected();
    if (!hasConnection) {
      return false;
    }

    try {
      var updated = false;
      await _firebaseFirestore
          .collection('${Config.notificationCollection}/$userId/$userId')
          .doc(notificationId)
          .update({'isNew': false}).then((value) => {updated = true});

      return updated;
    } on Error catch (exception, stackTrace) {
      debugPrint('$exception\n$stackTrace');
      await Sentry.captureException(
        exception,
        stackTrace: stackTrace,
      );
    }

    return false;
  }

  Future<void> monitorNotifications(context, String id) async {
    var notifications = await getNotifications(id);

    if (notifications.isEmpty) {
      return;
    }

    try {
      _firebaseFirestore
          .collection('${Config.notificationCollection}/$id/$id')
          .where('isNew', isEqualTo: true)
          .snapshots()
          .listen((result) async {
        for (var result in result.docs) {
          var notification =
              await compute(UserNotification.parseNotification, result.data());
          if (notification != null) {
            Provider.of<NotificationModel>(context, listen: false)
                .add(notification);
          }
        }
      });
    } catch (exception, stackTrace) {
      debugPrint('$exception\n$stackTrace');
      await Sentry.captureException(
        exception,
        stackTrace: stackTrace,
      );
    }
  }

  Future<bool> profileExists(String id) async {
    var hasConnection = await isConnected();

    if (!hasConnection) {
      return false;
    }

    try {
      var data = await _firebaseFirestore
          .collection(Config.usersCollection)
          .doc(id)
          .get();
      return data.exists;
    } catch (exception, stackTrace) {
      debugPrint('$exception\n$stackTrace');
      await Sentry.captureException(
        exception,
        stackTrace: stackTrace,
      );
    }

    return false;
  }

  Future<void> removeFavPlace(String userId, PlaceDetails placeDetails) async {
    var hasConnection = await isConnected();
    if (!hasConnection || userId.trim().isEmpty) {
      return;
    }
    try {
      await _firebaseFirestore
          .collection(Config.favPlacesCollection)
          .doc(userId)
          .collection(userId)
          .doc(placeDetails.placeId)
          .delete();
    } catch (exception, stackTrace) {
      debugPrint('$exception\n$stackTrace');
      await Sentry.captureException(
        exception,
        stackTrace: stackTrace,
      );
    }
  }

  Future<void> updateFavPlaces(
      String userId, List<PlaceDetails> favPlaces) async {
    var hasConnection = await isConnected();
    if (!hasConnection || userId.trim().isEmpty) {
      return;
    }

    for (var place in favPlaces) {
      try {
        await _firebaseFirestore
            .collection(Config.favPlacesCollection)
            .doc(userId)
            .collection(userId)
            .doc(place.placeId)
            .set(place.toJson());
      } catch (exception, stackTrace) {
        debugPrint('$exception\n$stackTrace');
        await Sentry.captureException(
          exception,
          stackTrace: stackTrace,
        );
      }
    }
  }

  Future<void> updateKyaProgress(String userId, Kya kya) async {
    if (userId.isEmpty || userId.trim() == '') {
      return;
    }

    try {
      await _firebaseFirestore
          .collection(Config.usersKyaCollection)
          .doc(userId)
          .collection(userId)
          .doc(kya.id)
          .update({'progress': kya.progress});
    } on FirebaseException catch (exception, stackTrace) {
      if (exception.code == 'not-found') {
        await _firebaseFirestore
            .collection(Config.usersKyaCollection)
            .doc(userId)
            .collection(userId)
            .doc(kya.id)
            .set({'progress': kya.progress, 'id': kya.id});
      } else {
        debugPrint('$exception\n$stackTrace');
        await Sentry.captureException(
          exception,
          stackTrace: stackTrace,
        );
      }
    } on Error catch (exception, stackTrace) {
      debugPrint('$exception\n$stackTrace');
      await Sentry.captureException(
        exception,
        stackTrace: stackTrace,
      );
    }
  }

  Future<void> updatePreferenceFields(
      String id, String field, dynamic value, String type) async {
    await _preferencesHelper.updatePreference(field, value, type);
    var hasConnection = await isConnected();
    if (!hasConnection) {
      return;
    }

    try {
      DocumentSnapshot userDoc = await _firebaseFirestore
          .collection(Config.usersCollection)
          .doc(id)
          .get();
      var data = userDoc.data();

      if (data != null) {
        var userDetails = UserDetails.fromJson(data as Map<String, dynamic>);
        if (field == 'notifications') {
          userDetails.preferences.notifications = value as bool;
        } else if (field == 'location') {
          userDetails.preferences.location = value as bool;
        } else if (field == 'aqShares') {
          userDetails.preferences.aqShares = value as int;
        }
        var userJson = userDetails.toJson();

        await _firebaseFirestore
            .collection(Config.usersCollection)
            .doc(id)
            .update(userJson);
      }
    } catch (exception, stackTrace) {
      debugPrint('$exception\n$stackTrace');
      await Sentry.captureException(
        exception,
        stackTrace: stackTrace,
      );
    }
  }

  Future<void> updateProfile(UserDetails userDetails, String id) async {
    var hasConnection = await isConnected();
    if (!hasConnection) {
      return;
    }

    try {
      var _userJson = userDetails.toJson();
      try {
        await _firebaseFirestore
            .collection(Config.usersCollection)
            .doc(id)
            .update(_userJson);
      } catch (exception) {
        await _firebaseFirestore
            .collection(Config.usersCollection)
            .doc(id)
            .set(_userJson);
      }
    } catch (exception, stackTrace) {
      debugPrint('$exception\n$stackTrace');
      await Sentry.captureException(
        exception,
        stackTrace: stackTrace,
      );
    }
  }

  Future<void> updateProfileFields(
      String id, Map<String, Object?> fields) async {
    var hasConnection = await isConnected();
    if (!hasConnection) {
      return;
    }

    try {
      await _firebaseFirestore
          .collection(Config.usersCollection)
          .doc(id)
          .update(fields);
    } catch (exception, stackTrace) {
      if (exception.toString().contains('not-found')) {
        await _firebaseFirestore
            .collection(Config.usersCollection)
            .doc(id)
            .set(fields);
      }
      debugPrint('$exception\n$stackTrace');
      await Sentry.captureException(
        exception,
        stackTrace: stackTrace,
      );
    }
  }

  Future<String?> uploadProfilePicture(String filePath, String userId) async {
    try {
      var file = File(filePath);

      var docRef = '${Config.usersProfilePictureCollection}/'
          '$userId/avatar${file.getExtension()}';

      var task = await firebase_storage.FirebaseStorage.instance
          .ref(docRef)
          .putFile(file);

      var downloadURL = await task.storage.ref(docRef).getDownloadURL();

      return downloadURL;
    } on Exception catch (exception, stackTrace) {
      debugPrint('$exception\n$stackTrace');
      await Sentry.captureException(
        exception,
        stackTrace: stackTrace,
      );
    }

    return null;
  }
}

class CustomAuth {
  final FirebaseAuth _firebaseAuth = FirebaseAuth.instance;
  final CloudStore _cloudStore = CloudStore();
  final SecureStorage _secureStorage = SecureStorage();
  final FirebaseMessaging _firebaseMessaging = FirebaseMessaging.instance;

  FirebaseAuth get firebaseAuth => _firebaseAuth;

  Future<UserDetails?> createProfile() async {
    var hasConnection = await isConnected();
    if (!hasConnection) {
      return null;
    }

    try {
      var firebaseUser = _firebaseAuth.currentUser;
      if (firebaseUser != null) {
        var userDetails = UserDetails.initialize();

        var device = await getDeviceToken() ?? '';
        userDetails
          ..device = device
          ..userId = firebaseUser.uid;

        await firebaseUser.updateDisplayName(userDetails.firstName);

        if (firebaseUser.phoneNumber != null) {
          userDetails.phoneNumber = firebaseUser.phoneNumber!;
        }

        if (firebaseUser.email != null) {
          userDetails.emailAddress = firebaseUser.email!;
        }

        return userDetails;
      }
    } catch (exception, stackTrace) {
      debugPrint('$exception\n$stackTrace');
      await Sentry.captureException(
        exception,
        stackTrace: stackTrace,
      );
    }
    return null;
  }

  Future<bool> emailAuthentication(
      String emailAddress, String link, BuildContext context) async {
    try {
      var userCredential = await _firebaseAuth.signInWithEmailLink(
          emailLink: link, email: emailAddress);
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
        await Sentry.captureException(
          exception,
          stackTrace: stackTrace,
        );
      }
      return false;
    }
  }

  Future<String?> getDeviceToken() async {
    var token = await _firebaseMessaging.getToken();
    return token;
  }

  String getDisplayName() {
    if (_firebaseAuth.currentUser == null) {
      return '';
    }
    return _firebaseAuth.currentUser!.displayName ?? 'Guest';
  }

  User? getUser() {
    return _firebaseAuth.currentUser;
  }

  String getUserId() {
    if (!isLoggedIn()) {
      return '';
    }
    return _firebaseAuth.currentUser!.uid;
  }

  Future<bool> isConnected() async {
    try {
      final result = await InternetAddress.lookup('firebase.google.com');
      if (result.isNotEmpty && result[0].rawAddress.isNotEmpty) {
        return true;
      }
      return false;
    } catch (_) {}

    return false;
  }

  bool isLoggedIn() {
    return _firebaseAuth.currentUser != null;
  }

  Future<bool> isValidEmailCode(
      String subjectCode, String verificationLink) async {
    try {
      final signInLink = Uri.parse(verificationLink);
      var code = signInLink.queryParameters['oobCode'];
      if (code != null && code == subjectCode) {
        return true;
      }
      return false;
    } catch (exception, stackTrace) {
      debugPrint('$exception\n$stackTrace');
      await Sentry.captureException(
        exception,
        stackTrace: stackTrace,
      );
    }
    return false;
  }

  Future<void> logOut(context) async {
    try {
      await _firebaseAuth.signOut();
    } catch (exception, stackTrace) {
      debugPrint('$exception\n$stackTrace');
      await Sentry.captureException(
        exception,
        stackTrace: stackTrace,
      );
    }
  }

  Future<bool> phoneNumberAuthentication(
      AuthCredential authCredential, BuildContext context) async {
    try {
      var userCredential =
          await _firebaseAuth.signInWithCredential(authCredential);
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
        await Sentry.captureException(
          exception,
          stackTrace: stackTrace,
        );
      }
      return false;
    }
  }

  Future<bool> reAuthenticateWithEmailAddress(
      String emailAddress, String link, BuildContext context) async {
    var hasConnection = await isConnected();
    if (!hasConnection) {
      return false;
    }

    try {
      var userCredential = await _firebaseAuth.signInWithEmailLink(
          emailLink: link, email: emailAddress);

      return userCredential.user != null;
    } catch (exception, stackTrace) {
      debugPrint('$exception\n$stackTrace');
      await Sentry.captureException(
        exception,
        stackTrace: stackTrace,
      );
    }
    return false;
  }

  Future<bool> reAuthenticateWithPhoneNumber(
      AuthCredential authCredential, BuildContext context) async {
    var hasConnection = await isConnected();
    if (!hasConnection) {
      return false;
    }

    try {
      var userCredentials = await _firebaseAuth.currentUser!
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
      debugPrint('$exception\n$stackTrace');
      await Sentry.captureException(
        exception,
        stackTrace: stackTrace,
      );
    }
    return false;
  }

  @Deprecated('To be replaced with functionality in the app service')
  Future<bool> requestPhoneVerification(
      phoneNumber, context, callBackFn, autoVerificationFn) async {
    var hasConnection = await isConnected();
    if (!hasConnection) {
      await showSnackBar(context, Config.connectionErrorMessage);
      return false;
    }

    try {
      await _firebaseAuth.verifyPhoneNumber(
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
      debugPrint('$exception\n$stackTrace');
      await Sentry.captureException(
        exception,
        stackTrace: stackTrace,
      );
      return false;
    }
  }

  Future<void> updateCredentials(String? phone, String? email) async {
    var hasConnection = await isConnected();
    if (!hasConnection) {
      return;
    }

    try {
      var id = getUserId();
      if (phone != null) {
        await _cloudStore.updateProfileFields(id, {'phoneNumber': phone});
        await _secureStorage.updateUserDetailsField('phoneNumber', phone);
      }
      if (email != null) {
        await _cloudStore.updateProfileFields(id, {'emailAddress': email});
        await _secureStorage.updateUserDetailsField('emailAddress', email);
      }
    } catch (exception, stackTrace) {
      debugPrint('$exception\n$stackTrace');
      await Sentry.captureException(
        exception,
        stackTrace: stackTrace,
      );
    }
  }

  Future<bool> updateEmailAddress(
      String emailAddress, BuildContext context) async {
    var hasConnection = await isConnected();
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
      debugPrint('$exception\n$stackTrace');
      await Sentry.captureException(
        exception,
        stackTrace: stackTrace,
      );
    }

    return false;
  }

  Future<bool> updatePhoneNumber(
      PhoneAuthCredential authCredential, BuildContext context) async {
    var hasConnection = await isConnected();
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
      debugPrint('$exception\n$stackTrace');
      await Sentry.captureException(
        exception,
        stackTrace: stackTrace,
      );
    }

    return false;
  }

  Future<void> updateProfile(UserDetails userDetails) async {
    var hasConnection = await isConnected();
    if (!hasConnection) {
      return;
    }

    try {
      var firebaseUser = _firebaseAuth.currentUser;
      if (firebaseUser == null) {
        throw Exception('You are not signed in');
      } else {
        if (!userDetails.photoUrl.isValidUri()) {
          userDetails.photoUrl = '';
        }

        await firebaseUser.updateDisplayName(userDetails.firstName);
        await firebaseUser.updatePhotoURL(userDetails.photoUrl);

        userDetails.userId = firebaseUser.uid;

        if (firebaseUser.phoneNumber != null) {
          userDetails.phoneNumber = firebaseUser.phoneNumber ?? '';
        }

        if (firebaseUser.email != null) {
          userDetails.emailAddress = firebaseUser.email ?? '';
        }

        await _secureStorage.updateUserDetails(userDetails);

        var fields = {
          'title': userDetails.title,
          'firstName': userDetails.firstName,
          'lastName': userDetails.lastName,
          'photoUrl': userDetails.photoUrl,
          'emailAddress': userDetails.emailAddress,
          'phoneNumber': userDetails.phoneNumber,
        };

        await _cloudStore.updateProfileFields(firebaseUser.uid, fields);
      }
    } catch (exception, stackTrace) {
      debugPrint('$exception\n$stackTrace');
      await Sentry.captureException(
        exception,
        stackTrace: stackTrace,
      );
    }
  }

  Future<void> updateUserProfile(UserDetails userDetails) async {
    var hasConnection = await isConnected();
    if (!hasConnection) {
      return;
    }

    try {
      var firebaseUser = _firebaseAuth.currentUser;
      if (firebaseUser == null) {
        throw Exception('You are not signed in');
      } else {
        if (!userDetails.photoUrl.isValidUri()) {
          userDetails.photoUrl = '';
        }

        await firebaseUser.updateDisplayName(userDetails.firstName);
        await firebaseUser.updatePhotoURL(userDetails.photoUrl);
      }
    } catch (exception, stackTrace) {
      debugPrint('$exception\n$stackTrace');
      await Sentry.captureException(
        exception,
        stackTrace: stackTrace,
      );
    }
  }
}

extension AnalyticsEventExtension on AnalyticsEvent {
  String getString() {
    var prefix = '';
    if (!kReleaseMode) {
      prefix = 'stage_';
    }
    switch (this) {
      case AnalyticsEvent.browserAsAppGuest:
        return '${prefix}browser_as_guest';
      case AnalyticsEvent.createUserProfile:
        return '${prefix}created_a_profile';
      case AnalyticsEvent.rateApp:
        return '${prefix}rate_app';
      case AnalyticsEvent.shareAirQualityInformation:
        return '${prefix}share_air_quality_information';
      case AnalyticsEvent.allowLocation:
        return '${prefix}allow_location';
      case AnalyticsEvent.allowNotification:
        return '${prefix}allow_notification';
      case AnalyticsEvent.uploadProfilePic:
        return '${prefix}upload_profile_pic';
      case AnalyticsEvent.completeKyaLesson:
        return '${prefix}complete_kya_lesson';
      case AnalyticsEvent.saveFavoritePlace:
        return '${prefix}save_favorite_place';
      default:
        return '';
    }
  }
}
