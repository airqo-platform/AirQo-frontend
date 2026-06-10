import 'package:airqo/src/app/shared/repository/secure_storage_repository.dart';
import 'package:flutter_secure_storage/flutter_secure_storage.dart';
import 'package:flutter_test/flutter_test.dart';

void main() {
  setUp(() {
    FlutterSecureStorage.setMockInitialValues({});
  });

  group('SecureStorageRepository', () {
    // My current hypothesis is that auth can appear unstable if the storage
    // layer does not give back exactly what was written. Before we blame token
    // refresh or lifecycle logic, we need to prove the storage wrapper can do
    // a calm round-trip for auth values.
    //
    // If this test passes, we have confirmed that the repository can save and
    // later retrieve a stored auth token in the expected form.
    test('saves and retrieves a secure value', () async {
      await SecureStorageRepository.instance.saveSecureData(
        SecureStorageKeys.authToken,
        'stored-token-value',
      );

      final storedValue = await SecureStorageRepository.instance
          .getSecureData(SecureStorageKeys.authToken);

      expect(storedValue, 'stored-token-value');
    });

    // Session-expiry and logout paths both rely on secure values actually
    // disappearing when the app asks for cleanup. If delete fails silently,
    // later startup checks can look like random re-authentication bugs.
    test('deletes a stored secure value', () async {
      await SecureStorageRepository.instance.saveSecureData(
        SecureStorageKeys.authToken,
        'stored-token-value',
      );

      await SecureStorageRepository.instance
          .deleteSecureData(SecureStorageKeys.authToken);

      final storedValue = await SecureStorageRepository.instance
          .getSecureData(SecureStorageKeys.authToken);

      expect(storedValue, isNull);
    });
  });
}
