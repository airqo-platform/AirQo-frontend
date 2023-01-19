import 'package:app/services/services.dart';
import 'package:app/utils/utils.dart';
import 'package:flutter_secure_storage/flutter_secure_storage.dart';

class SecureStorage {
  factory SecureStorage() {
    return _instance;
  }
  SecureStorage._internal();
  static final SecureStorage _instance = SecureStorage._internal();

  final _secureStorage = const FlutterSecureStorage();

  AndroidOptions _getAndroidOptions() => const AndroidOptions(
        encryptedSharedPreferences: true,
      );

  Future<void> clearUserData() async {
    try {
      final data = await _secureStorage.readAll(aOptions: _getAndroidOptions());
      for (final key in data.keys) {
        if (key == HiveBox.encryptionKey) {
          continue;
        }
        await _secureStorage.delete(
          key: key,
          aOptions: _getAndroidOptions(),
        );
      }
    } catch (exception, stackTrace) {
      await logException(
        exception,
        stackTrace,
      );
    }
  }

  Future<String?> getValue(String key) async {
    try {
      return _secureStorage.read(
        key: key,
        aOptions: _getAndroidOptions(),
      );
    } catch (exception, stackTrace) {
      await logException(
        exception,
        stackTrace,
      );
    }

    return null;
  }

  Future<void> setValue({required String key, required String value}) async {
    try {
      await _secureStorage.write(
        key: key,
        value: value,
        aOptions: _getAndroidOptions(),
      );
    } catch (exception, stackTrace) {
      await logException(
        exception,
        stackTrace,
      );
    }
  }
}
