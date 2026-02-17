import 'dart:convert';
import 'package:airqo/src/app/shared/repository/base_repository.dart';
import 'package:airqo/src/app/shared/repository/secure_storage_repository.dart';
import 'package:airqo/src/meta/utils/api_utils.dart';
import 'package:http/http.dart' as http;
import 'package:loggy/loggy.dart';

// Extension to add PUT request functionality to BaseRepository
extension BaseRepositoryExtension on BaseRepository {
  static final _logger = Loggy('BaseRepositoryExtension');
  // Method to create authenticated PUT requests
  Future<http.Response> createAuthenticatedPutRequest(
      {required String path, required dynamic data}) async {
    final token = await SecureStorageRepository.instance
        .getSecureData(SecureStorageKeys.authToken);
    if (token == null) {
      throw Exception('Authentication token not found');
    }

    String url = ApiUtils.baseUrl + path;
    _logger.info("Making PUT request to: $url");

    http.Response response =
        await http.put(Uri.parse(url), body: json.encode(data), headers: {
      "Authorization": "JWT $token",
      "Accept": "*/*",
      "Content-Type": "application/json"
    });

    _logger.info("PUT response status: ${response.statusCode}");

    if (response.statusCode != 200) {
      final responseBody = json.decode(response.body);
      final errorMessage =
          responseBody is Map && responseBody.containsKey('message')
              ? responseBody['message']
              : 'An error occurred';
      throw Exception(errorMessage);
    }

    return response;
  }
}
