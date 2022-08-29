import 'package:flutter_secure_storage/flutter_secure_storage.dart';

import '../utils/exception.dart';

class SecureStorage {
  factory SecureStorage() {
    return _instance;
  }
  SecureStorage._internal();
  static final SecureStorage _instance = SecureStorage._internal();

  final _secureStorage = const FlutterSecureStorage(
    aOptions: AndroidOptions(
      encryptedSharedPreferences: true,
    ),
  );

  Future<void> clearUserData() async {
    await _secureStorage.deleteAll();
  }

  Future<String?> getValue(String key) async {
    return _secureStorage.read(key: key);
  }

  Future<void> setValue({required String key, required String value}) async {
    await _secureStorage.write(
      key: key,
      value: value,
    );
  }

  Future<void> updateUserDetailsField(String key, String value) async {
    try {
      await _secureStorage.write(key: key, value: value);
    } catch (exception, stackTrace) {
      await logException(
        exception,
        stackTrace,
      );
    }
  }
}
