import 'dart:convert';
import 'package:airqo/src/app/shared/repository/base_repository.dart';
import 'package:airqo/src/app/shared/repository/hive_repository.dart';
import 'package:airqo/src/meta/utils/api_utils.dart';
import 'package:http/http.dart' as http;

// Extension to add PUT request functionality to BaseRepository
extension BaseRepositoryExtension on BaseRepository {
  // Method to create authenticated PUT requests
  Future<http.Response> createAuthenticatedPutRequest({
    required String path, 
    required dynamic data
  }) async {
    final token = await HiveRepository.getData("token", HiveBoxNames.authBox);
    if (token == null) {
      throw Exception('Authentication token not found');
    }
    
    String url = ApiUtils.baseUrl + path;
    print(url);
    
    http.Response response = await http.put(
      Uri.parse(url),
      body: json.encode(data),
      headers: {
        "Authorization": "JWT $token",
        "Accept": "*/*",
        "Content-Type": "application/json"
      }
    );
    
    print(response.statusCode);
    
    if (response.statusCode != 200) {
      final responseBody = json.decode(response.body);
      final errorMessage = responseBody is Map && responseBody.containsKey('message')
          ? responseBody['message'] 
          : 'An error occurred';
      throw new Exception(errorMessage);
    }
    
    return response;
  }
}