import 'dart:convert';

import 'package:airqo/src/app/profile/repository/user_repository.dart';
import 'package:airqo/src/app/shared/repository/secure_storage_repository.dart';
import 'package:flutter_secure_storage/flutter_secure_storage.dart';
import 'package:flutter_test/flutter_test.dart';

void main() {
  TestWidgetsFlutterBinding.ensureInitialized();

  String tokenFor(Map<String, dynamic> payload) {
    String encode(Map<String, dynamic> value) =>
        base64Url.encode(utf8.encode(jsonEncode(value))).replaceAll('=', '');

    return '${encode({'alg': 'none', 'typ': 'JWT'})}.${encode(payload)}.';
  }

  setUp(() {
    FlutterSecureStorage.setMockInitialValues({});
  });

  group('UserImpl.loadUserProfileFromToken', () {
    test('throws when token does not contain a user id claim', () async {
      FlutterSecureStorage.setMockInitialValues({
        SecureStorageKeys.authToken: tokenFor({
          'email': 'test@example.com',
        }),
      });

      await expectLater(
        UserImpl().loadUserProfileFromToken(),
        throwsA(
          isA<Exception>().having(
            (error) => error.toString(),
            'message',
            contains('Failed to extract user profile from token'),
          ),
        ),
      );
    });

    test('throws when token does not contain an email claim', () async {
      FlutterSecureStorage.setMockInitialValues({
        SecureStorageKeys.authToken: tokenFor({
          'id': 'user-1',
        }),
      });

      await expectLater(
        UserImpl().loadUserProfileFromToken(),
        throwsA(
          isA<Exception>().having(
            (error) => error.toString(),
            'message',
            contains('Failed to extract user profile from token'),
          ),
        ),
      );
    });

    test('falls back to current time when token date claims are invalid',
        () async {
      FlutterSecureStorage.setMockInitialValues({
        SecureStorageKeys.authToken: tokenFor({
          'id': 'user-1',
          'email': 'test@example.com',
          'lastLogin': 'not-a-date',
          'updatedAt': 'also-not-a-date',
        }),
      });

      final before = DateTime.now();
      final profile = await UserImpl().loadUserProfileFromToken();
      final after = DateTime.now();
      final user = profile.users.single;

      expect(user.id, 'user-1');
      expect(user.email, 'test@example.com');
      expect(user.lastLogin.isBefore(before), isFalse);
      expect(user.lastLogin.isAfter(after), isFalse);
      expect(user.updatedAt.isBefore(before), isFalse);
      expect(user.updatedAt.isAfter(after), isFalse);
    });
  });
}
