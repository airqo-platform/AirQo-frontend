import 'dart:convert';
import 'package:airqo/src/app/shared/repository/base_repository.dart';
import 'package:airqo/src/app/shared/repository/secure_storage_repository.dart';
import 'package:http/http.dart' as http;
import 'package:loggy/loggy.dart';

class AccountDeletionService extends BaseRepository with UiLoggy {
  final http.Client? _httpClient;
  final SecureStorageRepository? _storageRepository;

  AccountDeletionService({
    http.Client? httpClient,
    SecureStorageRepository? storageRepository,
  }) : _httpClient = httpClient,
       _storageRepository = storageRepository;

  AccountDeletionService.test({
    required http.Client httpClient,
    required SecureStorageRepository storageRepository,
  }) : _httpClient = httpClient,
       _storageRepository = storageRepository;

  @override
  Future<http.Response> createPostRequest({required String path, dynamic data}) async {
    if (_httpClient != null && _storageRepository != null) {
      final token = await _storageRepository.getSecureData(SecureStorageKeys.authToken);
      if (token == null || token.trim().isEmpty) {
        throw Exception('Authentication token not found');
      }

      final response = await _httpClient.post(
        Uri.parse('https://api.test$path'),
        body: jsonEncode(data),
        headers: {
          "Authorization": "JWT $token",
          "Accept": "*/*",
          "Content-Type": "application/json"
        },
      );
      
      return response;
    }
    return super.createPostRequest(path: path, data: data);
  }

  static String maskEmail(String email) {
    final parts = email.split('@');
    if (parts.length != 2 || parts[0].isEmpty || parts[1].isEmpty) {
      return '***@***';
    }

    final localPart = parts[0];
    final domain = parts[1];

    if (localPart.length <= 2) {
      return '${localPart[0]}*@$domain';
    } else {
      final masked = localPart[0] + '*' * (localPart.length - 2) + localPart[localPart.length - 1];
      return '$masked@$domain';
    }
  }
  Future<Map<String, dynamic>> initiateAccountDeletion(String email) async {
    try {
      final storage = _storageRepository ?? SecureStorageRepository.instance;
      final token = await storage.getSecureData(SecureStorageKeys.authToken);
      if (token == null || token.isEmpty) {
        throw Exception('Authentication token not found');
      }

      loggy.debug('Initiating account deletion for email: ${maskEmail(email)}');

      final response = await createPostRequest(
        path: '/api/v2/users/delete/mobile/initiate',
        data: {'email': email},
      );

      loggy.info('Initiate deletion response status: ${response.statusCode}');

      final result = jsonDecode(response.body);

      if (response.statusCode >= 200 && response.statusCode < 300) {
        return result;
      } else if (response.statusCode == 400) {
        throw Exception(result['message'] ?? 'Invalid request');
      } else if (response.statusCode == 401) {
        throw Exception(result['message'] ?? 'Unauthorized');
      } else if (response.statusCode == 404) {
        throw Exception(result['message'] ?? 'User not found');
      } else {
        throw Exception('Failed to initiate account deletion (${response.statusCode}): ${result['message'] ?? 'Unknown error'}');
      }
    } catch (e) {
      loggy.error('Error initiating account deletion: $e');
      rethrow;
    }
  }

  Future<Map<String, dynamic>> confirmAccountDeletion(String token) async {
    try {
      if (token.length != 5 || !RegExp(r'^\d{5}$').hasMatch(token)) {
        throw Exception('Verification code must be a 5-digit number');
      }

      loggy.info('Confirming account deletion with token');

      final response = await createPostRequest(
        path: '/api/v2/users/delete/mobile/confirm',
        data: {'token': token},
      );

      loggy.info('Confirm deletion response status: ${response.statusCode}');

      final result = jsonDecode(response.body);

      if (response.statusCode >= 200 && response.statusCode < 300) {
        return result;
      } else if (response.statusCode == 400) {
        throw Exception(result['message'] ?? 'Invalid or expired token');
      } else {
        throw Exception('Failed to confirm account deletion');
      }
    } catch (e) {
      loggy.error('Error confirming account deletion: $e');
      rethrow;
    }
  }

}