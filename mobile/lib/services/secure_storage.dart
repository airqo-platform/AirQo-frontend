import 'package:app/models/user_details.dart';
import 'package:flutter_secure_storage/flutter_secure_storage.dart';
import 'package:sentry_flutter/sentry_flutter.dart';

class SecureStorage {
  final _secureStorage = const FlutterSecureStorage();

  Future<void> clearUserDetails() async {
    await _secureStorage.deleteAll();
  }

  Future<UserDetails> getUserDetails() async {
    var userInfo = await _secureStorage.readAll();
    var userDetails = UserDetails.initialize()
      ..title = userInfo['title'] ?? ''
      ..firstName = userInfo['firstName'] ?? ''
      ..lastName = userInfo['lastName'] ?? ''
      ..photoUrl = userInfo['photoUrl'] ?? ''
      ..userId = userInfo['userId'] ?? ''
      ..device = userInfo['device'] ?? ''
      ..emailAddress = userInfo['emailAddress'] ?? ''
      ..phoneNumber = userInfo['phoneNumber'] ?? '';

    return userDetails;
  }

  Future<void> updateUserDetails(UserDetails userDetails) async {
    try {
      await _secureStorage.write(
          key: 'firstName', value: userDetails.firstName);
      await _secureStorage.write(key: 'lastName', value: userDetails.lastName);
      await _secureStorage.write(key: 'photoUrl', value: userDetails.photoUrl);
      await _secureStorage.write(key: 'title', value: userDetails.title);
      await _secureStorage.write(key: 'userId', value: userDetails.userId);
      await _secureStorage.write(key: 'device', value: userDetails.device);
      await _secureStorage.write(
          key: 'emailAddress', value: userDetails.emailAddress);
      await _secureStorage.write(
          key: 'phoneNumber', value: userDetails.phoneNumber);
    } on Error catch (exception, stackTrace) {
      await Sentry.captureException(
        exception,
        stackTrace: stackTrace,
      );
    }
  }

  Future<void> updateUserDetailsField(String key, String value) async {
    try {
      await _secureStorage.write(key: key, value: value);
    } on Error catch (exception, stackTrace) {
      await Sentry.captureException(
        exception,
        stackTrace: stackTrace,
      );
    }
  }
}
