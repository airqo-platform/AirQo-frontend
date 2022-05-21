import 'package:flutter_secure_storage/flutter_secure_storage.dart';

import '../utils/exception.dart';

class SecureStorage {
  final _secureStorage = const FlutterSecureStorage();

  static Future<void> clearUserData() async {
    const secureStorage = FlutterSecureStorage();
    await secureStorage.deleteAll();
  }

  Future<void> updateUserDetailsField(String key, String value) async {
    try {
      await _secureStorage.write(key: key, value: value);
    } catch (exception, stackTrace) {
      await logException(exception, stackTrace);
    }
  }
}
