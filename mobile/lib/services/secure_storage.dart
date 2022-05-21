import 'package:app/models/profile.dart';
import 'package:flutter_secure_storage/flutter_secure_storage.dart';

import '../utils/exception.dart';

class SecureStorage {
  final _secureStorage = const FlutterSecureStorage();

  Future<void> clearUserDetails() async {
    await _secureStorage.deleteAll();
  }

  Future<Profile> getUserDetails() async {
    var userInfo = await _secureStorage.readAll();
    var userDetails = await Profile.getProfile()
      ..title = userInfo['title'] ?? 'Ms.'
      ..firstName = userInfo['firstName'] ?? ''
      ..lastName = userInfo['lastName'] ?? ''
      ..photoUrl = userInfo['photoUrl'] ?? ''
      ..userId = userInfo['userId'] ?? ''
      ..device = userInfo['device'] ?? ''
      ..emailAddress = userInfo['emailAddress'] ?? ''
      ..phoneNumber = userInfo['phoneNumber'] ?? '';

    return userDetails;
  }

  Future<void> updateUserDetailsField(String key, String value) async {
    try {
      await _secureStorage.write(key: key, value: value);
    } catch (exception, stackTrace) {
      await logException(exception, stackTrace);
    }
  }
}
