import 'dart:io';

import 'package:app/constants/app_constants.dart';
import 'package:app/models/alert.dart';
import 'package:app/models/notification.dart';
import 'package:app/models/site.dart';
import 'package:app/models/topicData.dart';
import 'package:app/models/user_details.dart';
import 'package:app/utils/dialogs.dart';
import 'package:cloud_firestore/cloud_firestore.dart';
import 'package:firebase_auth/firebase_auth.dart';
import 'package:firebase_messaging/firebase_messaging.dart';
import 'package:flutter/foundation.dart';
import 'package:provider/provider.dart';
import 'package:shared_preferences/shared_preferences.dart';

import 'local_notifications.dart';

class CloudStore {
  final FirebaseFirestore _firebaseFirestore = FirebaseFirestore.instance;

  CloudStore();

  Future<void> deleteAccount(id) async {
    try {
      await _firebaseFirestore
          .collection(CloudStorage.usersCollection)
          .doc(id)
          .delete();
    } catch (e) {
      print(e);
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
          .update({'isNew': false})
          .then((value) => {updated = true})
          .catchError((error) => print('Failed to update notification'));

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
        result.docs.forEach((result) async {
          var notification =
              await compute(UserNotification.parseNotification, result.data());
          if (notification != null) {
            Provider.of<NotificationModel>(context, listen: false)
                .add(notification);
          }
        });
      });
    } catch (e) {
      print(e);
    }
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

  Future<bool> signUpProfile(UserDetails userDetails) async {
    var hasConnection = await isConnected();
    if (hasConnection) {
      try {
        var savedUser = userDetails;
        var createdUser = await FirebaseAuth.instance
            .createUserWithEmailAndPassword(
                email: userDetails.emailAddress,
                password: userDetails.emailAddress);

        if (createdUser.user != null) {
          await createdUser.user!.updatePhotoURL(userDetails.photoUrl);
          savedUser.emailAddress = createdUser.user!.email ?? '';
          savedUser.lastName = userDetails.lastName;
          savedUser.firstName = userDetails.firstName;
          savedUser.phoneNumber = createdUser.user!.phoneNumber ?? '';
          savedUser.emailAddress = createdUser.user!.email ?? '';
          savedUser.photoUrl = createdUser.user!.photoURL ?? '';
          // savedUser.id = createdUser.user!.uid ?? '';
        }
        await FirebaseFirestore.instance
            .collection(CloudStorage.alertsCollection)
            .doc(savedUser.userId)
            .set(savedUser.toJson());
        return true;
      } catch (e) {
        print(e);
        return false;
      }
    } else {
      return false;
    }
  }

  Future<void> updateProfile(UserDetails userDetails, String id) async {
    var hasConnection = await isConnected();
    if (hasConnection) {
      var _userJson = userDetails.toJson();
      await _firebaseFirestore
          .collection(CloudStorage.usersCollection)
          .doc(id)
          .set(_userJson);
    } else {
      throw Exception(ErrorMessages.timeoutException);
    }
  }
}

class CustomAuth {
  final FirebaseAuth _firebaseAuth = FirebaseAuth.instance;

  final CloudStore _firebaseFirestore = CloudStore();

  CustomAuth();

  Future<void> deleteAccount() async {
    var currentUser = _firebaseAuth.currentUser;
    if (currentUser != null) {
      try {
        await currentUser.delete().then((value) =>
            {logOut(), _firebaseFirestore.deleteAccount(currentUser.uid)});
      } catch (e) {
        print(e);
      }
    }
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

  Future<UserDetails> getProfile() async {
    var _preferences = await SharedPreferences.getInstance();

    var userDetails = UserDetails.initialize()
      ..userId = _preferences.getString('userId') ?? ''
      ..title = _preferences.getString('title') ?? ''
      ..firstName = _preferences.getString('firstName') ?? ''
      ..lastName = _preferences.getString('lastName') ?? ''
      ..phoneNumber = _preferences.getString('phoneNumber') ?? ''
      ..emailAddress = _preferences.getString('emailAddress') ?? ''
      ..photoUrl = _preferences.getString('photoUrl') ?? '';

    return userDetails;
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

  Future<void> logIn(AuthCredential authCredential) async {
    await _firebaseAuth.signInWithCredential(authCredential);
  }

  Future<void> logOut() async {
    var _preferences = await SharedPreferences.getInstance();

    await _firebaseAuth.signOut().then((value) => {
          _preferences.remove('title'),
          _preferences.remove('firstName'),
          _preferences.remove('lastName'),
          _preferences.remove('phoneNumber'),
          _preferences.remove('emailAddress'),
          _preferences.remove('photoUrl'),
          _preferences.remove('userId'),
        });
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

  Future<void> updateProfile(UserDetails userDetails) async {
    var hasConnection = await isConnected();
    if (hasConnection) {
      var firebaseUser = _firebaseAuth.currentUser;
      if (firebaseUser == null) {
        throw Exception('You are not signed in');
      } else {
        await firebaseUser.updateDisplayName(userDetails.firstName);
        await firebaseUser.updatePhotoURL(userDetails.photoUrl);
        // await firebaseUser.updateEmail(userDetails.emailAddress);
        userDetails.userId = firebaseUser.uid;

        var _preferences = await SharedPreferences.getInstance();
        await _preferences.setString('title', userDetails.title);
        await _preferences.setString('firstName', userDetails.firstName);
        await _preferences.setString('lastName', userDetails.lastName);
        await _preferences.setString(
            'phoneNumber', firebaseUser.phoneNumber ?? '');
        await _preferences.setString('emailAddress', firebaseUser.email ?? '');
        await _preferences.setString('photoUrl', firebaseUser.photoURL ?? '');
        await _preferences.setString('userId', firebaseUser.uid);

        await _firebaseFirestore.updateProfile(userDetails, firebaseUser.uid);
      }
    } else {
      throw Exception(ErrorMessages.timeoutException);
    }
  }

  Future<void> verifyPhone(
      phoneNumber, context, callBackFn, autoVerificationFn) async {
    var hasConnection = await isConnected();
    if (!hasConnection) {
      await showSnackBar(context, ErrorMessages.timeoutException);
      throw Exception(ErrorMessages.timeoutException);
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
            print(e);
          }
        },
        codeSent: (String verificationId, int? resendToken) async {
          callBackFn(verificationId);
        },
        codeAutoRetrievalTimeout: (String verificationId) async {
          // TODO Implement auto code retrieval timeout
          await showSnackBar(context, 'codeAutoRetrievalTimeout');
        },
        timeout: const Duration(minutes: 2));
  }
}

class NotificationService {
  final FirebaseMessaging _firebaseMessaging = FirebaseMessaging.instance;

  Future<bool> checkPermission() async {
    try {
      var settings = await _firebaseMessaging.getNotificationSettings();

      if (settings.authorizationStatus == AuthorizationStatus.authorized) {
        return true;
      }
    } catch (e) {
      print(e);
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
      if (settings.authorizationStatus == AuthorizationStatus.authorized) {
        return true;
      }
    } catch (e) {
      print(e);
    }

    return false;
  }

  Future<bool> revokePermission() async {
    // TODO: implement revoke permission
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
      print(e);
    }
  }

  static Future<void> foregroundMessageHandler(RemoteMessage message) async {
    try {
      var notificationMessage = AppNotification().composeNotification(message);
      if (!notificationMessage.isEmpty()) {
        await LocalNotifications().showAlertNotification(notificationMessage);
      }
    } catch (e) {
      print(e);
    }
  }
}
