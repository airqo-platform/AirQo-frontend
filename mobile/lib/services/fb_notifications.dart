import 'dart:io';

import 'package:app/constants/app_constants.dart';
import 'package:app/models/kya.dart';
import 'package:app/models/notification.dart';
import 'package:app/models/place_details.dart';
import 'package:app/models/user_details.dart';
import 'package:app/services/secure_storage.dart';
import 'package:app/utils/dialogs.dart';
import 'package:app/utils/string_extension.dart';
import 'package:cloud_firestore/cloud_firestore.dart';
import 'package:firebase_analytics/firebase_analytics.dart';
import 'package:firebase_auth/firebase_auth.dart';
import 'package:firebase_messaging/firebase_messaging.dart';
import 'package:flutter/cupertino.dart';
import 'package:flutter/foundation.dart';
import 'package:provider/provider.dart';
import 'package:sentry_flutter/sentry_flutter.dart';
import 'package:shared_preferences/shared_preferences.dart';

import 'local_notifications.dart';
import 'local_storage.dart';

class CloudAnalytics {
  final FirebaseAnalytics analytics = FirebaseAnalytics();

  Future<void> logEvent(String name) async {
    // await analytics.logEvent(
    //   name: name,
    // );
  }

  void logScreenTransition(String screen) {
    // analytics
    //   ..setCurrentScreen(
    //     screenName: screen,
    //   )
    //   ..logEvent(
    //     name: 'Navigated to $screen'.replaceAll(' ', '_'),
    //   );
  }
}

class CloudStore {
  final FirebaseFirestore _firebaseFirestore = FirebaseFirestore.instance;
  final SharedPreferencesHelper _preferencesHelper = SharedPreferencesHelper();

  Future<bool> credentialsExist(String? phoneNumber, String? email) async {
    var hasConnection = await isConnected();
    if (!hasConnection) {
      return false;
    }

    try {
      var users = await _firebaseFirestore
          .collection(CloudStorage.usersCollection)
          .get();
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
          await Sentry.captureException(
            exception,
            stackTrace: stackTrace,
          );
          continue;
        }
      }
      return false;
    } on Error catch (exception, stackTrace) {
      debugPrint(exception.toString());
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

    // TODO DELETE NOTIFICATIONS
    try {
      await _firebaseFirestore
          .collection(CloudStorage.usersCollection)
          .doc(id)
          .delete();
    } on Error catch (exception, stackTrace) {
      debugPrint(exception.toString());
      await Sentry.captureException(
        exception,
        stackTrace: stackTrace,
      );
    }
  }

  Future<Kya?> getIncompleteKya(String id) async {
    if (id == '') {
      return null;
    }

    var hasConnection = await isConnected();
    if (!hasConnection) {
      // TODO Implement no internet access
      return null;
    }

    try {
      var userKya = (await getProfile(id)).kya;

      var incomplete =
          userKya.where((element) => element.progress < 100.0).toList();

      if (incomplete.isEmpty) {
        var allKyaJson = await _firebaseFirestore
            .collection(CloudStorage.kyaCollection)
            .get();

        var allKya = <Kya>[];

        var kyaDocs = allKyaJson.docs;
        for (var doc in kyaDocs) {
          var kya = await compute(Kya.parseKya, doc.data());
          if (kya != null) {
            allKya.add(kya);
          }
        }

        for (var x in allKya) {
          var y = userKya.where((element) => element.id == x.id);
          if (y.isEmpty) {
            userKya.add(x);
            await _firebaseFirestore
                .collection(CloudStorage.usersCollection)
                .doc(id)
                .update({'kya': Kya.listToJson(userKya)});
            break;
          }
        }

        return null;
      }

      return incomplete.first;
    } on Error catch (exception, stackTrace) {
      debugPrint(exception.toString());
      await Sentry.captureException(
        exception,
        stackTrace: stackTrace,
      );
    }
    return null;
  }

  @Deprecated('Substituted with get user details function')
  Future<List<Kya>> getKya(String id) async {
    if (id == '') {
      return [];
    }

    var hasConnection = await isConnected();
    if (!hasConnection) {
      return [];
    }

    try {
      var userJson = await _firebaseFirestore
          .collection(CloudStorage.usersCollection)
          .doc(id)
          .get();
      var userData = userJson.data();

      if (userData == null) {
        return [];
      }
      var userDetails = UserDetails.fromJson(userData);

      return userDetails.kya;
    } on Error catch (exception, stackTrace) {
      debugPrint(exception.toString());
      await Sentry.captureException(
        exception,
        stackTrace: stackTrace,
      );
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
          .collection('${CloudStorage.notificationCollection}/$id/$id')
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
      debugPrint(exception.toString());
      await Sentry.captureException(
        exception,
        stackTrace: stackTrace,
      );
    }

    return [];
  }

  Future<UserDetails> getProfile(String id) async {
    if (id == '') {
      return UserDetails.initialize();
    }

    var hasConnection = await isConnected();
    if (!hasConnection) {
      return UserDetails.initialize();
    }

    try {
      var userJson = await _firebaseFirestore
          .collection(CloudStorage.usersCollection)
          .doc(id)
          .get();
      return await compute(UserDetails.parseUserDetails, userJson.data());
    } on Error catch (exception, stackTrace) {
      debugPrint(exception.toString());
      await Sentry.captureException(
        exception,
        stackTrace: stackTrace,
      );
    }

    return UserDetails.initialize();
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

  Future<bool> loadKya(String id) async {
    if (id == '') {
      return false;
    }

    var hasConnection = await isConnected();
    if (!hasConnection) {
      return false;
    }

    try {
      var allKyaJson =
          await _firebaseFirestore.collection(CloudStorage.kyaCollection).get();

      var allKya = <Kya>[];

      var kyaDocs = allKyaJson.docs;
      for (var doc in kyaDocs) {
        var kya = await compute(Kya.parseKya, doc.data());
        if (kya != null) {
          allKya.add(kya);
        }
      }

      var userKya = (await getProfile(id)).kya;
      var updatedUserKya = userKya;

      for (var kya in allKya) {
        var existingKya =
            userKya.where((element) => element.id == kya.id).toList();

        if (existingKya.isNotEmpty) {
          continue;
        }
        var newKya = kya..progress = 0.0;
        updatedUserKya.add(newKya);
      }

      await _firebaseFirestore
          .collection(CloudStorage.usersCollection)
          .doc(id)
          .update({'kya': Kya.listToJson(updatedUserKya)});

      return true;
    } catch (exception, stackTrace) {
      debugPrint(exception.toString());
      await Sentry.captureException(
        exception,
        stackTrace: stackTrace,
      );
    }

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
          .collection('${CloudStorage.notificationCollection}/$userId/$userId')
          .doc(notificationId)
          .update({'isNew': false}).then((value) => {updated = true});

      return updated;
    } on Error catch (exception, stackTrace) {
      debugPrint(exception.toString());
      await Sentry.captureException(
        exception,
        stackTrace: stackTrace,
      );
    }

    return false;
  }

  Future<bool> migrateKya(Kya kya, String id) async {
    if (id == '') {
      return false;
    }

    var hasConnection = await isConnected();
    if (!hasConnection) {
      return false;
    }

    try {
      var userKya = (await getProfile(id)).kya;

      var incomplete =
          userKya.where((element) => element.id == kya.id).toList();

      if (incomplete.isEmpty) {
        return false;
      }

      userKya.removeWhere((element) => element.id == kya.id);
      kya.progress = 100.0;
      userKya.add(kya);

      await _firebaseFirestore
          .collection(CloudStorage.usersCollection)
          .doc(id)
          .update({'kya': Kya.listToJson(userKya)});

      return true;
    } catch (exception, stackTrace) {
      debugPrint(exception.toString());
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
          .collection('${CloudStorage.notificationCollection}/$id/$id')
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
      debugPrint(exception.toString());
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
          .collection(CloudStorage.usersCollection)
          .doc(id)
          .get();
      return data.exists;
    } catch (exception, stackTrace) {
      debugPrint(exception.toString());
      await Sentry.captureException(
        exception,
        stackTrace: stackTrace,
      );
    }

    return false;
  }

  Future<void> sendWelcomeNotification(String id) async {
    var hasConnection = await isConnected();
    if (!hasConnection) {
      return;
    }

    try {
      var notificationId = DateTime.now().millisecondsSinceEpoch.toString();
      var notification = UserNotification(
          notificationId,
          'Welcome to AirQo!',
          'Begin your journey to Knowing Your Air and Breathe Clean... ',
          true,
          DateTime.now().toUtc().toString());
      await _firebaseFirestore
          .collection('${CloudStorage.notificationCollection}/$id/$id')
          .doc(notificationId)
          .set(notification.toJson());
    } catch (exception, stackTrace) {
      debugPrint(exception.toString());
      await Sentry.captureException(
        exception,
        stackTrace: stackTrace,
      );
    }
  }

  Future<void> updateFavouritePlaces(
      String id, List<PlaceDetails> places) async {
    var hasConnection = await isConnected();
    if (!hasConnection) {
      return;
    }

    try {
      await _firebaseFirestore
          .collection(CloudStorage.usersCollection)
          .doc(id)
          .update({'favPlaces': PlaceDetails.listToJson(places)});
    } catch (exception, stackTrace) {
      debugPrint(exception.toString());
      await Sentry.captureException(
        exception,
        stackTrace: stackTrace,
      );
    }
  }

  Future<void> updateKyaProgress(String id, Kya kya, double progress) async {
    if (id == '') {
      return;
    }

    var hasConnection = await isConnected();
    if (!hasConnection) {
      return;
    }

    try {
      var userKya = (await getProfile(id)).kya;

      var incomplete =
          userKya.where((element) => element.id == kya.id).toList();

      if (incomplete.isEmpty) {
        return;
      }

      userKya.removeWhere((element) => element.id == kya.id);
      kya.progress = progress;
      userKya.add(kya);

      await _firebaseFirestore
          .collection(CloudStorage.usersCollection)
          .doc(id)
          .update({'kya': Kya.listToJson(userKya)});

      return;
    } catch (exception, stackTrace) {
      debugPrint(exception.toString());
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
          .collection(CloudStorage.usersCollection)
          .doc(id)
          .get();
      var data = userDoc.data();

      if (data != null) {
        var userDetails = UserDetails.fromJson(data as Map<String, dynamic>);
        if (field == 'notifications') {
          userDetails.preferences.notifications = value as bool;
        } else if (field == 'location') {
          userDetails.preferences.location = value as bool;
        }
        var userJson = userDetails.toJson();

        await _firebaseFirestore
            .collection(CloudStorage.usersCollection)
            .doc(id)
            .update(userJson);
      }
    } catch (exception, stackTrace) {
      debugPrint(exception.toString());
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
            .collection(CloudStorage.usersCollection)
            .doc(id)
            .update(_userJson);
      } catch (exception) {
        await _firebaseFirestore
            .collection(CloudStorage.usersCollection)
            .doc(id)
            .set(_userJson);
      }
    } catch (exception, stackTrace) {
      debugPrint(exception.toString());
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
          .collection(CloudStorage.usersCollection)
          .doc(id)
          .update(fields);
    } catch (exception, stackTrace) {
      debugPrint(exception.toString());
      await Sentry.captureException(
        exception,
        stackTrace: stackTrace,
      );
    }
  }
}

class CustomAuth {
  final FirebaseAuth _firebaseAuth = FirebaseAuth.instance;
  final CloudStore _cloudStore = CloudStore();
  final SecureStorage _secureStorage = SecureStorage();
  final FirebaseMessaging _firebaseMessaging = FirebaseMessaging.instance;
  final SharedPreferencesHelper _preferencesHelper = SharedPreferencesHelper();

  Future<void> createProfile() async {
    var hasConnection = await isConnected();
    if (!hasConnection) {
      return;
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
        await _cloudStore.updateProfile(userDetails, firebaseUser.uid);
        await _secureStorage.updateUserDetails(userDetails);
        await _preferencesHelper.updatePreferences(userDetails.preferences);
      }
    } catch (exception, stackTrace) {
      debugPrint(exception.toString());
      await Sentry.captureException(
        exception,
        stackTrace: stackTrace,
      );
    }
  }

  Future<void> deleteAccount(context) async {
    var currentUser = _firebaseAuth.currentUser;
    var hasConnection = await isConnected();
    if (currentUser == null || !hasConnection) {
      return;
    }

    try {
      var id = currentUser.uid;
      await Provider.of<PlaceDetailsModel>(context, listen: false)
          .clearFavouritePlaces();
      Provider.of<NotificationModel>(context, listen: false).removeAll();
      await _secureStorage.clearUserDetails();
      await _preferencesHelper.clearPreferences();
      await _cloudStore.deleteAccount(id);
      await currentUser.delete();
    } catch (exception, stackTrace) {
      debugPrint(exception.toString());
      await Sentry.captureException(
        exception,
        stackTrace: stackTrace,
      );
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

  String getId() {
    if (!isLoggedIn()) {
      return '';
    }
    return _firebaseAuth.currentUser!.uid;
  }

  User? getUser() {
    return _firebaseAuth.currentUser;
  }

  Future<bool> isConnected() async {
    try {
      final result = await InternetAddress.lookup('firebase.google.com');
      if (result.isNotEmpty && result[0].rawAddress.isNotEmpty) {
        return true;
      }
      return false;
    } catch (exception) {
      debugPrint(exception.toString());
    }

    return false;
  }

  Future<bool> isFirstUse() async {
    var _preferences = await SharedPreferences.getInstance();
    var firstUse = _preferences.getBool(PrefConstant.firstUse) ?? true;
    if (firstUse) {
      await _preferences.setBool(PrefConstant.firstUse, false);
    }
    return firstUse;
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
      debugPrint(exception.toString());
      await Sentry.captureException(
        exception,
        stackTrace: stackTrace,
      );
    }

    return false;
  }

  Future<void> logIn(
      AuthCredential authCredential, BuildContext context) async {
    var hasConnection = await isConnected();
    if (!hasConnection) {
      return;
    }

    try {
      var userCredential =
          await _firebaseAuth.signInWithCredential(authCredential);
      if (userCredential.user == null) {
        return;
      }

      var user = userCredential.user;

      if (user == null) {
        return;
      }
      updateLocalStorage(user, context);
    } catch (exception, stackTrace) {
      debugPrint(exception.toString());
      await Sentry.captureException(
        exception,
        stackTrace: stackTrace,
      );
    }
  }

  Future<void> logOut(context) async {
    var hasConnection = await isConnected();
    if (!hasConnection) {
      return;
    }

    try {
      var userId = getId();
      await _cloudStore.updateProfileFields(userId, {'device': ''});
      await Provider.of<PlaceDetailsModel>(context, listen: false)
          .clearFavouritePlaces();
      Provider.of<NotificationModel>(context, listen: false).removeAll();
      await _secureStorage.clearUserDetails();
      await _preferencesHelper.clearPreferences();
      await _firebaseAuth.signOut();
    } catch (exception, stackTrace) {
      debugPrint(exception.toString());
      await Sentry.captureException(
        exception,
        stackTrace: stackTrace,
      );
    }
  }

  Future<bool> signInWithEmailAddress(
      String emailAddress, String link, BuildContext context) async {
    var hasConnection = await isConnected();
    if (!hasConnection) {
      return false;
    }

    var userCredential = await FirebaseAuth.instance
        .signInWithEmailLink(emailLink: link, email: emailAddress);

    if (userCredential.user == null) {
      return false;
    }

    var user = userCredential.user;
    try {
      if (user == null) {
        return false;
      }

      updateLocalStorage(user, context);

      return true;
    } catch (exception, stackTrace) {
      debugPrint(exception.toString());
      await Sentry.captureException(
        exception,
        stackTrace: stackTrace,
      );
    }
    return false;
  }

  Future<bool> signUpWithEmailAddress(String emailAddress, String link) async {
    var hasConnection = await isConnected();
    if (!hasConnection) {
      return false;
    }

    var userCredential = await FirebaseAuth.instance
        .signInWithEmailLink(emailLink: link, email: emailAddress);

    if (userCredential.user == null) {
      return false;
    }

    var user = userCredential.user;
    try {
      if (user == null) {
        return false;
      }
      await createProfile();
      await _cloudStore.sendWelcomeNotification(user.uid);
      return true;
    } catch (exception, stackTrace) {
      debugPrint(exception.toString());
      await Sentry.captureException(
        exception,
        stackTrace: stackTrace,
      );
    }
    return false;
  }

  Future<void> signUpWithPhoneNumber(AuthCredential authCredential) async {
    var hasConnection = await isConnected();
    if (!hasConnection) {
      return;
    }

    var userCredential =
        await _firebaseAuth.signInWithCredential(authCredential);
    if (userCredential.user != null) {
      var user = userCredential.user;
      try {
        if (user != null) {
          await createProfile();
          await _cloudStore.sendWelcomeNotification(user.uid);
        }
      } catch (exception, stackTrace) {
        debugPrint(exception.toString());
        await Sentry.captureException(
          exception,
          stackTrace: stackTrace,
        );
      }
    }
  }

  Future<void> updateCredentials(String? phone, String? email) async {
    var hasConnection = await isConnected();
    if (!hasConnection) {
      return;
    }

    try {
      var id = getId();
      if (phone != null) {
        await _cloudStore.updateProfileFields(id, {'phoneNumber': phone});
        await _secureStorage.updateUserDetailsField('phoneNumber', phone);
      }
      if (email != null) {
        await _cloudStore.updateProfileFields(id, {'emailAddress': email});
        await _secureStorage.updateUserDetailsField('emailAddress', email);
      }
    } catch (exception, stackTrace) {
      debugPrint(exception.toString());
      await Sentry.captureException(
        exception,
        stackTrace: stackTrace,
      );
    }
  }

  Future<bool> updateEmailAddress(
      User user, String emailAddress, String link) async {
    var hasConnection = await isConnected();
    if (!hasConnection) {
      return false;
    }

    var userCredential = await FirebaseAuth.instance
        .signInWithEmailLink(emailLink: link, email: emailAddress);

    if (userCredential.user != null) {
      try {
        await updateCredentials(null, userCredential.user!.email);
      } catch (exception, stackTrace) {
        debugPrint(exception.toString());
        await Sentry.captureException(
          exception,
          stackTrace: stackTrace,
        );
      }
    }
    return false;
  }

  void updateLocalStorage(User user, BuildContext context) async {
    try {
      var device = await getDeviceToken();
      if (device != null) {
        await _cloudStore.updateProfileFields(user.uid, {'device': device});
      }
      var userDetails = await _cloudStore.getProfile(user.uid);
      await _secureStorage.updateUserDetails(userDetails);
      await _preferencesHelper.updatePreferences(userDetails.preferences);
      if (userDetails.favPlaces.isNotEmpty) {
        await Provider.of<PlaceDetailsModel>(context, listen: false)
            .loadFavouritePlaces(userDetails.favPlaces);
      }
    } catch (e) {
      debugPrint(e.toString());
    }
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
        };

        await _cloudStore.updateProfileFields(firebaseUser.uid, fields);
      }
    } catch (exception, stackTrace) {
      debugPrint(exception.toString());
      await Sentry.captureException(
        exception,
        stackTrace: stackTrace,
      );
    }
  }

  Future<void> verifyPhone(
      phoneNumber, context, callBackFn, autoVerificationFn) async {
    var hasConnection = await isConnected();
    if (!hasConnection) {
      await showSnackBar(context, ErrorMessages.timeoutException);
    }

    try {
      await _firebaseAuth.verifyPhoneNumber(
          phoneNumber: phoneNumber,
          verificationCompleted: (PhoneAuthCredential credential) {
            autoVerificationFn(credential);
          },
          verificationFailed: (FirebaseAuthException e) async {
            if (e.code == 'invalid-phone-number') {
              await showSnackBar(context, 'Invalid phone number.');
            } else {
              await showSnackBar(
                  context,
                  'Cannot process your request.'
                  ' Try again later');
              debugPrint(e.toString());
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
    } catch (exception, stackTrace) {
      debugPrint(exception.toString());
      await Sentry.captureException(
        exception,
        stackTrace: stackTrace,
      );
    }
  }
}

class NotificationService {
  final FirebaseMessaging _firebaseMessaging = FirebaseMessaging.instance;
  final CustomAuth _customAuth = CustomAuth();
  final CloudStore _cloudStore = CloudStore();

  Future<bool> checkPermission() async {
    try {
      var settings = await _firebaseMessaging.getNotificationSettings();

      if (settings.authorizationStatus == AuthorizationStatus.authorized) {
        return true;
      }
    } catch (e) {
      debugPrint(e.toString());
    }

    return false;
  }

  Future<String?> getToken() async {
    try {
      var token = await _firebaseMessaging.getToken();
      return token;
    } catch (exception, stackTrace) {
      debugPrint(exception.toString());
      await Sentry.captureException(
        exception,
        stackTrace: stackTrace,
      );
    }

    return null;
  }

  Future<bool> requestPermission() async {
    try {
      var settings = await _firebaseMessaging.requestPermission(
        alert: true,
        announcement: false,
        badge: true,
        carPlay: false,
        criticalAlert: false,
        provisional: false,
        sound: true,
      );
      var status =
          settings.authorizationStatus == AuthorizationStatus.authorized;

      var id = _customAuth.getId();

      if (id != '') {
        await _cloudStore.updatePreferenceFields(
            id, 'notifications', status, 'bool');
      }
      return status;
    } catch (exception, stackTrace) {
      debugPrint(exception.toString());
      await Sentry.captureException(
        exception,
        stackTrace: stackTrace,
      );
    }

    return false;
  }

  Future<bool> revokePermission() async {
    // TODO: implement revoke permission
    var id = _customAuth.getId();

    if (id != '') {
      await _cloudStore.updatePreferenceFields(
          id, 'notifications', false, 'bool');
    }
    return false;
  }

  static Future<void> backgroundNotificationHandler(
      RemoteMessage message) async {
    try {
      var notificationMessage = UserNotification.composeNotification(message);
      if (notificationMessage != null) {
        await LocalNotifications().showAlertNotification(notificationMessage);
      }
    } catch (e) {
      debugPrint(e.toString());
    }
  }

  static Future<void> foregroundMessageHandler(RemoteMessage message) async {
    try {
      var notificationMessage = UserNotification.composeNotification(message);
      if (notificationMessage != null) {
        await LocalNotifications().showAlertNotification(notificationMessage);
      }
    } catch (e) {
      debugPrint(e.toString());
    }
  }
}
