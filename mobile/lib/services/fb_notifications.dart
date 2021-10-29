import 'dart:io';

import 'package:app/constants/app_constants.dart';
import 'package:app/models/alert.dart';
import 'package:app/models/site.dart';
import 'package:app/models/topicData.dart';
import 'package:app/models/userDetails.dart';
import 'package:app/utils/dialogs.dart';
import 'package:cloud_firestore/cloud_firestore.dart';
import 'package:firebase_auth/firebase_auth.dart';
import 'package:firebase_messaging/firebase_messaging.dart';
import 'package:shared_preferences/shared_preferences.dart';

import 'local_notifications.dart';

class CloudStore {
  FirebaseFirestore _firestore;

  CloudStore(this._firestore);

  Future<bool> deleteAlert(Alert alert) async {
    var hasConnection = await isConnected();
    if (hasConnection) {
      await FirebaseFirestore.instance
          .collection(CloudStorage.alertsCollection)
          .doc(alert.getAlertDbId())
          .delete();

      return true;
    } else {
      return false;
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

  Future<bool> saveAlert(Alert alert) async {
    var hasConnection = await isConnected();
    if (hasConnection) {
      var alertJson = alert.toJson();
      alertJson['platform'] = Platform.isIOS ? 'ios' : 'android';
      await _firestore
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
}

class CustomAuth {
  final FirebaseAuth _firebaseAuth;

  CustomAuth(this._firebaseAuth);

  Future<void> deleteAccount() async {
    var currentUser = _firebaseAuth.currentUser;
    if (currentUser != null) {
      try {
        await currentUser.delete().then((value) => {logOut()});
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
      throw Exception('Not logged in');
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
      }
      await firebaseUser.updateDisplayName(userDetails.firstName);
      await firebaseUser.updatePhotoURL(userDetails.photoUrl);
      // await firebaseUser.updateEmail(userDetails.emailAddress);

      var _preferences = await SharedPreferences.getInstance();
      await _preferences.setString('title', userDetails.title);
      await _preferences.setString('firstName', userDetails.firstName);
      await _preferences.setString('lastName', userDetails.lastName);
      await _preferences.setString('phoneNumber', userDetails.phoneNumber);
      await _preferences.setString('emailAddress', userDetails.emailAddress);
      await _preferences.setString('photoUrl', userDetails.photoUrl);
      await _preferences.setString('userId', firebaseUser.uid);

      userDetails.userId = firebaseUser.uid;

      var _userJson = userDetails.toJson();
      await FirebaseFirestore.instance
          .collection(CloudStorage.usersCollection)
          .doc(firebaseUser.uid)
          .set(_userJson);
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
          // TODO Implement auto code retrieval
          // await showSnackBar(context, 'codeAutoRetrievalTimeout');
        },
        timeout: const Duration(minutes: 1));
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
