import 'dart:io';

import 'package:app/constants/app_constants.dart';
import 'package:app/models/alert.dart';
import 'package:app/models/notification.dart';
import 'package:app/models/place_details.dart';
import 'package:app/models/site.dart';
import 'package:app/models/topicData.dart';
import 'package:app/models/user_details.dart';
import 'package:app/utils/dialogs.dart';
import 'package:app/utils/string_extension.dart';
import 'package:cloud_firestore/cloud_firestore.dart';
import 'package:firebase_analytics/firebase_analytics.dart';
import 'package:firebase_auth/firebase_auth.dart';
import 'package:firebase_messaging/firebase_messaging.dart';
import 'package:flutter/foundation.dart';
import 'package:provider/provider.dart';
import 'package:shared_preferences/shared_preferences.dart';

import 'local_notifications.dart';
import 'local_storage.dart';

class CloudAnalytics {
  final FirebaseAnalytics analytics = FirebaseAnalytics();

  void sendScreenToAnalytics(String screen) {
    analytics.setCurrentScreen(
      screenName: screen,
    );
  }
}

class CloudStore {
  final FirebaseFirestore _firebaseFirestore = FirebaseFirestore.instance;
  final SharedPreferencesHelper _preferencesHelper = SharedPreferencesHelper();

  Future<bool> credentialsExist(String? phoneNumber, String? email) async {
    var hasConnection = await isConnected();
    if (hasConnection) {
      try {
        var users = await _firebaseFirestore
            .collection(CloudStorage.usersCollection)
            .get();
        for (var doc in users.docs) {
          try {
            if (phoneNumber != null &&
                doc.data()['phoneNumber'] == phoneNumber) {
              return true;
            }
            if (email != null && doc.data()['emailAddress'] == email) {
              return true;
            }
          } catch (e) {
            continue;
          }
        }
        return false;
      } catch (e) {
        debugPrint(e.toString());
      }
    }
    return false;
  }

  Future<void> deleteAccount(id) async {
    // TODO DELETE NOTIFICATIONS
    try {
      await _firebaseFirestore
          .collection(CloudStorage.usersCollection)
          .doc(id)
          .delete();
    } catch (e) {
      debugPrint(e.toString());
    }
  }

  Future<bool> deleteAlert(Alert alert) async {
    var hasConnection = await isConnected();
    if (hasConnection) {
      await _firebaseFirestore
          .collection(CloudStorage.alertsCollection)
          .doc(alert.getAlertDbId())
          .delete();

      return true;
    } else {
      return false;
    }
  }

  Future<List<UserNotification>> getNotifications(String id) async {
    if (id == '') {
      return [];
    }

    var hasConnection = await isConnected();
    if (hasConnection) {
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
    } else {
      return [];
    }
  }

  Future<UserDetails> getProfile(String id) async {
    if (id == '') {
      return UserDetails.initialize();
    }

    var hasConnection = await isConnected();
    if (hasConnection) {
      var userJson = await _firebaseFirestore
          .collection(CloudStorage.usersCollection)
          .doc(id)
          .get();
      return await compute(UserDetails.parseUserDetails, userJson.data());
    } else {
      // TODO Implement no internet access
      return UserDetails.initialize();
    }
  }

  Future<bool> isConnected() async {
    try {
      final result = await InternetAddress.lookup('firebase.google.com');
      if (result.isNotEmpty && result[0].rawAddress.isNotEmpty) {
        return true;
      }
      return false;
    } on SocketException catch (_) {
      return false;
    }
  }

  Future<bool> markNotificationAsRead(
      String userId, String notificationId) async {
    if (userId == '' || notificationId == '') {
      return false;
    }

    var hasConnection = await isConnected();
    if (hasConnection) {
      var updated = false;
      await _firebaseFirestore
          .collection('${CloudStorage.notificationCollection}/$userId/$userId')
          .doc(notificationId)
          .update({'isNew': false}).then((value) => {updated = true});

      return updated;
    } else {
      return false;
    }
  }

  void monitorNotifications(context, String id) {
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
    } catch (e) {
      debugPrint(e.toString());
    }
  }

  Future<bool> profileExists(String id) async {
    var hasConnection = await isConnected();
    if (hasConnection) {
      try {
        var data = await _firebaseFirestore
            .collection(CloudStorage.usersCollection)
            .doc(id)
            .get();
        return data.exists;
      } catch (e) {
        debugPrint(e.toString());
      }
    }
    return false;
  }

  Future<bool> saveAlert(Alert alert) async {
    var hasConnection = await isConnected();
    if (hasConnection) {
      var alertJson = alert.toJson();
      alertJson['platform'] = Platform.isIOS ? 'ios' : 'android';
      await _firebaseFirestore
          .collection(CloudStorage.alertsCollection)
          .doc(alert.getAlertDbId())
          .set(alertJson);
      return true;
    } else {
      return false;
    }
  }

  Future<void> sendWelcomeNotification(String id) async {
    var hasConnection = await isConnected();
    if (hasConnection) {
      try {
        var notificationId = DateTime.now().millisecondsSinceEpoch.toString();
        var notification = UserNotification(
            notificationId,
            'Welcome to AirQo!',
            'Begin your journey to Knowing Your Air and Breathe Clean... ',
            true);
        await _firebaseFirestore
            .collection('${CloudStorage.notificationCollection}/$id/$id')
            .doc(notificationId)
            .set(notification.toJson());
      } catch (e) {
        debugPrint(e.toString());
      }
    }
  }

  Future<void> updateFavouritePlaces(
      String id, List<PlaceDetails> places) async {
    var hasConnection = await isConnected();
    if (hasConnection) {
      await _firebaseFirestore
          .collection(CloudStorage.usersCollection)
          .doc(id)
          .update({'favPlaces': PlaceDetails.listToJson(places)});
    }
  }

  Future<void> updatePreferenceFields(
      String id, String field, dynamic value, String type) async {
    await _preferencesHelper.updatePreference(field, value, type);
    var hasConnection = await isConnected();
    if (hasConnection) {
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
    }
  }

  Future<void> updateProfile(UserDetails userDetails, String id) async {
    var hasConnection = await isConnected();
    if (hasConnection) {
      var _userJson = userDetails.toJson();
      try {
        await _firebaseFirestore
            .collection(CloudStorage.usersCollection)
            .doc(id)
            .update(_userJson);
      } catch (e) {
        await _firebaseFirestore
            .collection(CloudStorage.usersCollection)
            .doc(id)
            .set(_userJson);
      }
    }
  }

  Future<void> updateProfileFields(
      String id, Map<String, Object?> fields) async {
    var hasConnection = await isConnected();
    if (hasConnection) {
      await _firebaseFirestore
          .collection(CloudStorage.usersCollection)
          .doc(id)
          .update(fields);
    }
  }
}

class CustomAuth {
  final FirebaseAuth _firebaseAuth = FirebaseAuth.instance;
  final CloudStore _cloudStore = CloudStore();
  final SecureStorageHelper _secureStorageHelper = SecureStorageHelper();
  final FirebaseMessaging _firebaseMessaging = FirebaseMessaging.instance;
  final SharedPreferencesHelper _preferencesHelper = SharedPreferencesHelper();

  Future<void> createProfile() async {
    var hasConnection = await isConnected();
    if (hasConnection) {
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
        await _secureStorageHelper.updateUserDetails(userDetails);
        await _preferencesHelper.updatePreferences(userDetails.preferences);
      }
    }
  }

  Future<void> deleteAccount(context) async {
    var currentUser = _firebaseAuth.currentUser;
    if (currentUser != null) {
      try {
        var id = currentUser.uid;
        await Provider.of<PlaceDetailsModel>(context, listen: false)
            .clearFavouritePlaces();
        Provider.of<NotificationModel>(context, listen: false).removeAll();
        await _secureStorageHelper.clearUserDetails();
        await _preferencesHelper.clearPreferences();
        await _cloudStore.deleteAccount(id);
        await currentUser.delete();
      } catch (e) {
        debugPrint(e.toString());
      }
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
    } on SocketException catch (_) {
      return false;
    }
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
    return _firebaseAuth.currentUser == null ? false : true;
  }

  Future<bool> isValidEmailCode(
      String subjectCode, String verificationLink) async {
    final signInLink = Uri.parse(verificationLink);
    var code = signInLink.queryParameters['oobCode'];
    if (code != null && code == subjectCode) {
      return true;
    }
    return false;
  }

  Future<void> logIn(AuthCredential authCredential, context) async {
    // TODO check connectivity
    var userCredential =
        await _firebaseAuth.signInWithCredential(authCredential);
    if (userCredential.user != null) {
      var user = userCredential.user;
      try {
        if (user != null) {
          var device = await getDeviceToken();
          if (device != null) {
            await _cloudStore.updateProfileFields(user.uid, {'device': device});
          }
          var userDetails = await _cloudStore.getProfile(user.uid);
          await _secureStorageHelper.updateUserDetails(userDetails);
          await _preferencesHelper.updatePreferences(userDetails.preferences);
          await Provider.of<PlaceDetailsModel>(context, listen: false)
              .loadFavouritePlaces(userDetails.favPlaces);
        }
      } catch (e) {
        debugPrint(e.toString());
      }
    }
  }

  Future<void> logOut(context) async {
    var userId = getId();
    await _cloudStore.updateProfileFields(userId, {'device': ''});
    await Provider.of<PlaceDetailsModel>(context, listen: false)
        .clearFavouritePlaces();
    Provider.of<NotificationModel>(context, listen: false).removeAll();
    await _secureStorageHelper.clearUserDetails();
    await _preferencesHelper.clearPreferences();
    await _firebaseAuth.signOut();
  }

  Future<bool> saveAlert(Alert alert) async {
    var hasConnection = await isConnected();
    if (hasConnection) {
      var alertJson = alert.toJson();
      alertJson['platform'] = Platform.isIOS ? 'ios' : 'android';
      await FirebaseFirestore.instance
          .collection(CloudStorage.alertsCollection)
          .doc(alert.getAlertDbId())
          .set(alertJson);
      return true;
    } else {
      return false;
    }
  }

  Future<void> signUp(AuthCredential authCredential) async {
    var userCredential =
        await _firebaseAuth.signInWithCredential(authCredential);
    if (userCredential.user != null) {
      var user = userCredential.user;
      try {
        if (user != null) {
          await createProfile();
          await _cloudStore.sendWelcomeNotification(user.uid);
        }
      } catch (e) {
        debugPrint(e.toString());
      }
    }
  }

  Future<bool> signUpWithEmailAddress(String emailAddress, String link) async {
    var confirmation = await FirebaseAuth.instance
        .signInWithEmailLink(emailLink: link, email: emailAddress);

    if (confirmation.user == null) {
      return false;
    } else {
      return true;
    }
  }

  Future<bool> signUpWithPhoneNumber(String phoneNumber) async {
    var confirmation =
        await FirebaseAuth.instance.signInWithPhoneNumber(phoneNumber);
    if (confirmation.verificationId.isEmpty) {
      return false;
    } else {
      return true;
    }
  }

  Future<void> updateCredentials(String? phone, String? email) async {
    var id = getId();
    if (phone != null) {
      await _cloudStore.updateProfileFields(id, {'phoneNumber': phone});
      await _secureStorageHelper.updateUserDetailsField('phoneNumber', phone);
    }
    if (email != null) {
      await _cloudStore.updateProfileFields(id, {'emailAddress': email});
      await _secureStorageHelper.updateUserDetailsField('emailAddress', email);
    }
  }

  Future<void> updateProfile(UserDetails userDetails) async {
    var hasConnection = await isConnected();
    if (hasConnection) {
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

        await _secureStorageHelper.updateUserDetails(userDetails);

        var fields = {
          'title': userDetails.title,
          'firstName': userDetails.firstName,
          'lastName': userDetails.lastName,
          'photoUrl': userDetails.photoUrl,
        };

        await _cloudStore.updateProfileFields(firebaseUser.uid, fields);
      }
    }
  }

  Future<void> verifyPhone(
      phoneNumber, context, callBackFn, autoVerificationFn) async {
    var hasConnection = await isConnected();
    if (!hasConnection) {
      await showSnackBar(context, ErrorMessages.timeoutException);
    }

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
    var token = await _firebaseMessaging.getToken();
    return token;
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
    } catch (e) {
      debugPrint(e.toString());
      return false;
    }
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

  Future<void> subscribeToNewsFeed(
      Site site, PollutantLevel pollutantLevel) async {
    await _firebaseMessaging.subscribeToTopic(site.getTopic(pollutantLevel));
  }

  Future<void> subscribeToSite(Site site, PollutantLevel pollutantLevel) async {
    await _firebaseMessaging.subscribeToTopic(site.getTopic(pollutantLevel));
  }

  Future<void> subscribeToUpdates(
      Site site, PollutantLevel pollutantLevel) async {
    await _firebaseMessaging.subscribeToTopic(site.getTopic(pollutantLevel));
  }

  Future<void> unSubscribeFromSite(
      Site site, PollutantLevel pollutantLevel) async {
    await _firebaseMessaging
        .unsubscribeFromTopic(site.getTopic(pollutantLevel));
  }

  Future<void> unSubscribeFromSites(
      List<Site> sites, List<PollutantLevel> pollutantLevels) async {
    for (var site in sites) {
      for (var pollutantLevel in pollutantLevels) {
        await unSubscribeFromSite(site, pollutantLevel);
      }
    }
  }

  static Future<void> backgroundMessageHandler(RemoteMessage message) async {
    try {
      var notificationMessage = AppNotification().composeNotification(message);
      if (!notificationMessage.isEmpty()) {
        await LocalNotifications().showAlertNotification(notificationMessage);
      }
    } catch (e) {
      debugPrint(e.toString());
    }
  }

  static Future<void> foregroundMessageHandler(RemoteMessage message) async {
    try {
      var notificationMessage = AppNotification().composeNotification(message);
      if (!notificationMessage.isEmpty()) {
        await LocalNotifications().showAlertNotification(notificationMessage);
      }
    } catch (e) {
      debugPrint(e.toString());
    }
  }
}
