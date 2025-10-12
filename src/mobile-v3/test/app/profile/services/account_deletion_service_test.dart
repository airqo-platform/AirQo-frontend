import 'dart:convert';
import 'package:flutter_test/flutter_test.dart';
import 'package:http/http.dart' as http;
import 'package:mockito/annotations.dart';
import 'package:mockito/mockito.dart';
import 'package:airqo/src/app/profile/services/account_deletion_service.dart';
import 'package:airqo/src/app/shared/repository/secure_storage_repository.dart';

@GenerateMocks([http.Client, SecureStorageRepository])
import 'account_deletion_service_test.mocks.dart';

void main() {
  group('AccountDeletionService', () {
    late AccountDeletionService service;
    late MockClient mockHttpClient;
    late MockSecureStorageRepository mockStorage;

    setUp(() {
      mockHttpClient = MockClient();
      mockStorage = MockSecureStorageRepository();
      service = AccountDeletionService.test(
        httpClient: mockHttpClient,
        storageRepository: mockStorage,
      );
    });

    tearDown(() {
      reset(mockHttpClient);
      reset(mockStorage);
    });

    group('maskEmail', () {
      test('masks normal email correctly', () {
        expect(AccountDeletionService.maskEmail('john.doe@example.com'), 
               equals('j******e@example.com'));
      });

      test('masks short local part correctly', () {
        expect(AccountDeletionService.maskEmail('ab@example.com'), 
               equals('a*@example.com'));
      });

      test('masks single character local part', () {
        expect(AccountDeletionService.maskEmail('a@example.com'), 
               equals('a*@example.com'));
      });

      test('handles invalid email format', () {
        expect(AccountDeletionService.maskEmail('invalid-email'), 
               equals('***@***'));
      });

      test('handles empty local part', () {
        expect(AccountDeletionService.maskEmail('@example.com'), 
               equals('***@***'));
      });

      test('handles empty domain', () {
        expect(AccountDeletionService.maskEmail('user@'), 
               equals('***@***'));
      });

      test('preserves domain intact', () {
        expect(AccountDeletionService.maskEmail('user@subdomain.example.org'), 
               equals('u**r@subdomain.example.org'));
      });
    });

    group('initiateAccountDeletion', () {
      test('succeeds with valid 200 response', () async {
        when(mockStorage.getSecureData(SecureStorageKeys.authToken))
            .thenAnswer((_) async => 'valid-token');
        
        final responseBody = {'success': true, 'message': 'Deletion initiated'};
        when(mockHttpClient.post(any, headers: anyNamed('headers'), body: anyNamed('body')))
            .thenAnswer((_) async => http.Response(jsonEncode(responseBody), 200));

        final result = await service.initiateAccountDeletion('test@example.com');

        expect(result['success'], isTrue);
        expect(result['message'], equals('Deletion initiated'));
        
        verify(mockStorage.getSecureData(SecureStorageKeys.authToken)).called(2);
        verify(mockHttpClient.post(
          Uri.parse('https://api.test/api/v2/users/delete/mobile/initiate'),
          headers: {
            "Authorization": "JWT valid-token",
            "Accept": "*/*",
            "Content-Type": "application/json"
          },
          body: jsonEncode({'email': 'test@example.com'}),
        )).called(1);
      });

      test('throws when no auth token', () async {
        when(mockStorage.getSecureData(SecureStorageKeys.authToken))
            .thenAnswer((_) async => null);

        await expectLater(
          service.initiateAccountDeletion('test@example.com'),
          throwsA(predicate((e) => e is Exception && e.toString().contains('Authentication token not found'))),
        );

        verifyNever(mockHttpClient.post(any, headers: anyNamed('headers'), body: anyNamed('body')));
      });

      test('throws when empty auth token', () async {
        when(mockStorage.getSecureData(SecureStorageKeys.authToken))
            .thenAnswer((_) async => '');

        await expectLater(
          service.initiateAccountDeletion('test@example.com'),
          throwsA(predicate((e) => e is Exception && e.toString().contains('Authentication token not found'))),
        );
      });

      test('handles 400 error with server message', () async {
        when(mockStorage.getSecureData(SecureStorageKeys.authToken))
            .thenAnswer((_) async => 'valid-token');
        
        final responseBody = {'message': 'Invalid email format'};
        when(mockHttpClient.post(any, headers: anyNamed('headers'), body: anyNamed('body')))
            .thenAnswer((_) async => http.Response(jsonEncode(responseBody), 400));

        await expectLater(
          service.initiateAccountDeletion('test@example.com'),
          throwsA(predicate((e) => e is Exception && e.toString().contains('Invalid email format'))),
        );
      });

      test('handles 401 error with server message', () async {
        when(mockStorage.getSecureData(SecureStorageKeys.authToken))
            .thenAnswer((_) async => 'invalid-token');
        
        final responseBody = {'message': 'Token expired'};
        when(mockHttpClient.post(any, headers: anyNamed('headers'), body: anyNamed('body')))
            .thenAnswer((_) async => http.Response(jsonEncode(responseBody), 401));

        await expectLater(
          service.initiateAccountDeletion('test@example.com'),
          throwsA(predicate((e) => e is Exception && e.toString().contains('Token expired'))),
        );
      });

      test('handles 404 error with server message', () async {
        when(mockStorage.getSecureData(SecureStorageKeys.authToken))
            .thenAnswer((_) async => 'valid-token');
        
        final responseBody = {'message': 'User not found'};
        when(mockHttpClient.post(any, headers: anyNamed('headers'), body: anyNamed('body')))
            .thenAnswer((_) async => http.Response(jsonEncode(responseBody), 404));

        await expectLater(
          service.initiateAccountDeletion('test@example.com'),
          throwsA(predicate((e) => e is Exception && e.toString().contains('User not found'))),
        );
      });

      test('handles 500 error with status code and server message', () async {
        when(mockStorage.getSecureData(SecureStorageKeys.authToken))
            .thenAnswer((_) async => 'valid-token');
        
        final responseBody = {'message': 'Internal server error'};
        when(mockHttpClient.post(any, headers: anyNamed('headers'), body: anyNamed('body')))
            .thenAnswer((_) async => http.Response(jsonEncode(responseBody), 500));

        await expectLater(
          service.initiateAccountDeletion('test@example.com'),
          throwsA(predicate((e) => e is Exception && 
            e.toString().contains('Failed to initiate account deletion (500)') &&
            e.toString().contains('Internal server error'))),
        );
      });

      test('handles error without server message', () async {
        when(mockStorage.getSecureData(SecureStorageKeys.authToken))
            .thenAnswer((_) async => 'valid-token');
        
        final responseBody = <String, dynamic>{};
        when(mockHttpClient.post(any, headers: anyNamed('headers'), body: anyNamed('body')))
            .thenAnswer((_) async => http.Response(jsonEncode(responseBody), 400));

        await expectLater(
          service.initiateAccountDeletion('test@example.com'),
          throwsA(predicate((e) => e is Exception && e.toString().contains('Invalid request'))),
        );
      });
    });

    group('confirmAccountDeletion', () {
      test('succeeds with valid 200 response', () async {
        when(mockStorage.getSecureData(SecureStorageKeys.authToken))
            .thenAnswer((_) async => 'valid-token');
        
        final responseBody = {'success': true, 'message': 'Account deleted'};
        when(mockHttpClient.post(any, headers: anyNamed('headers'), body: anyNamed('body')))
            .thenAnswer((_) async => http.Response(jsonEncode(responseBody), 200));

        final result = await service.confirmAccountDeletion('12345');

        expect(result['success'], isTrue);
        expect(result['message'], equals('Account deleted'));
        
        verify(mockHttpClient.post(
          Uri.parse('https://api.test/api/v2/users/delete/mobile/confirm'),
          headers: {
            "Authorization": "JWT valid-token",
            "Accept": "*/*",
            "Content-Type": "application/json"
          },
          body: jsonEncode({'token': '12345'}),
        )).called(1);
      });

      test('throws for invalid token format - too short', () async {
        expect(
          () => service.confirmAccountDeletion('123'),
          throwsA(predicate((e) => e is Exception && 
            e.toString().contains('Verification code must be a 5-digit number'))),
        );

        verifyNever(mockStorage.getSecureData(any));
        verifyNever(mockHttpClient.post(any, headers: anyNamed('headers'), body: anyNamed('body')));
      });

      test('throws for invalid token format - too long', () async {
        expect(
          () => service.confirmAccountDeletion('123456'),
          throwsA(predicate((e) => e is Exception && 
            e.toString().contains('Verification code must be a 5-digit number'))),
        );
      });

      test('throws for invalid token format - contains letters', () async {
        expect(
          () => service.confirmAccountDeletion('1234a'),
          throwsA(predicate((e) => e is Exception && 
            e.toString().contains('Verification code must be a 5-digit number'))),
        );
      });

      test('handles 400 error with server message', () async {
        when(mockStorage.getSecureData(SecureStorageKeys.authToken))
            .thenAnswer((_) async => 'valid-token');
        
        final responseBody = {'message': 'Invalid verification code'};
        when(mockHttpClient.post(any, headers: anyNamed('headers'), body: anyNamed('body')))
            .thenAnswer((_) async => http.Response(jsonEncode(responseBody), 400));

        await expectLater(
          service.confirmAccountDeletion('12345'),
          throwsA(predicate((e) => e is Exception && e.toString().contains('Invalid verification code'))),
        );
      });

      test('handles 400 error without server message', () async {
        when(mockStorage.getSecureData(SecureStorageKeys.authToken))
            .thenAnswer((_) async => 'valid-token');
        
        final responseBody = <String, dynamic>{};
        when(mockHttpClient.post(any, headers: anyNamed('headers'), body: anyNamed('body')))
            .thenAnswer((_) async => http.Response(jsonEncode(responseBody), 400));

        await expectLater(
          service.confirmAccountDeletion('12345'),
          throwsA(predicate((e) => e is Exception && e.toString().contains('Invalid or expired token'))),
        );
      });

      test('handles other errors with generic message', () async {
        when(mockStorage.getSecureData(SecureStorageKeys.authToken))
            .thenAnswer((_) async => 'valid-token');
        
        final responseBody = {'message': 'Server error'};
        when(mockHttpClient.post(any, headers: anyNamed('headers'), body: anyNamed('body')))
            .thenAnswer((_) async => http.Response(jsonEncode(responseBody), 500));

        await expectLater(
          service.confirmAccountDeletion('12345'),
          throwsA(predicate((e) => e is Exception && e.toString().contains('Failed to confirm account deletion'))),
        );
      });
    });

    group('HTTP network errors', () {
      test('handles network timeout in initiate', () async {
        when(mockStorage.getSecureData(SecureStorageKeys.authToken))
            .thenAnswer((_) async => 'valid-token');
        
        when(mockHttpClient.post(any, headers: anyNamed('headers'), body: anyNamed('body')))
            .thenThrow(Exception('Network timeout'));

        await expectLater(
          service.initiateAccountDeletion('test@example.com'),
          throwsA(predicate((e) => e is Exception && e.toString().contains('Network timeout'))),
        );
      });

      test('handles network timeout in confirm', () async {
        when(mockStorage.getSecureData(SecureStorageKeys.authToken))
            .thenAnswer((_) async => 'valid-token');
        
        when(mockHttpClient.post(any, headers: anyNamed('headers'), body: anyNamed('body')))
            .thenThrow(Exception('Network timeout'));

        await expectLater(
          service.confirmAccountDeletion('12345'),
          throwsA(predicate((e) => e is Exception && e.toString().contains('Network timeout'))),
        );
      });
    });
  });
}