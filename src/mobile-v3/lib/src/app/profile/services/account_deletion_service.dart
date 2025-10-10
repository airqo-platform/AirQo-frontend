import 'dart:convert';
import 'package:airqo/src/app/shared/repository/base_repository.dart';
import 'package:airqo/src/app/shared/repository/secure_storage_repository.dart';
import 'package:airqo/src/meta/utils/api_utils.dart';
import 'package:http/http.dart' as http;
import 'package:loggy/loggy.dart';

class AccountDeletionService extends BaseRepository with UiLoggy {
  Future<Map<String, dynamic>> initiateAccountDeletion(String email) async {
    try {
      final token = await SecureStorageRepository.instance.getSecureData(SecureStorageKeys.authToken);
      if (token == null || token.isEmpty) {
        throw Exception('Authentication token not found');
      }

      loggy.info('Initiating account deletion for email: $email');

      final response = await createPostRequest(
        path: '/api/v2/users/delete/mobile/initiate',
        data: {'email': email},
      );

      loggy.info('Initiate deletion response status: ${response.statusCode}');

      final result = jsonDecode(response.body);
      return result;
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

      final response = await http.post(
        Uri.parse('${ApiUtils.baseUrl}/api/v2/users/delete/mobile/confirm'),
        headers: {
          'Content-Type': 'application/json',
        },
        body: jsonEncode({'token': token}),
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