import 'package:flutter_secure_storage/flutter_secure_storage.dart';
import 'package:loggy/loggy.dart';

class SecureStorageRepository with UiLoggy {
  static SecureStorageRepository? _instance;
  late final FlutterSecureStorage _secureStorage;

  SecureStorageRepository._() {
    _secureStorage = const FlutterSecureStorage(
      aOptions: AndroidOptions(
        encryptedSharedPreferences: true,
      ),
      iOptions: IOSOptions(
        accessibility: KeychainAccessibility.first_unlock_this_device,
      ),
    );
  }

  static SecureStorageRepository get instance {
    _instance ??= SecureStorageRepository._();
    return _instance!;
  }

  Future<void> saveSecureData(String key, String value) async {
    try {
      await _secureStorage.write(key: key, value: value);
      loggy.info('Saved secure data with key: $key');
    } catch (e) {
      loggy.error('Error saving secure data with key $key: $e');
      rethrow;
    }
  }

  Future<String?> getSecureData(String key) async {
    try {
      final value = await _secureStorage.read(key: key);
      if (value != null) {
        loggy.info('Retrieved secure data with key: $key');
      } else {
        loggy.info('No secure data found for key: $key');
      }
      return value;
    } catch (e) {
      loggy.error('Error retrieving secure data with key $key: $e');
      return null;
    }
  }

  Future<void> deleteSecureData(String key) async {
    try {
      await _secureStorage.delete(key: key);
      loggy.info('Deleted secure data with key: $key');
    } catch (e) {
      loggy.error('Error deleting secure data with key $key: $e');
      rethrow;
    }
  }

  Future<void> deleteAllSecureData() async {
    try {
      await _secureStorage.deleteAll();
      loggy.info('Deleted all secure data');
    } catch (e) {
      loggy.error('Error deleting all secure data: $e');
      rethrow;
    }
  }
}

class SecureStorageKeys {
  const SecureStorageKeys._();
  static const String authToken = 'auth_token';
  static const String userId = 'user_id';
}