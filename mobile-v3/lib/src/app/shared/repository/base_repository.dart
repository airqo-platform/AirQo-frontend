import 'dart:convert';
import 'package:airqo/src/app/shared/repository/hive_repository.dart';
import 'package:airqo/src/meta/utils/api_utils.dart';
import 'package:http/http.dart' as http;
import 'package:http/http.dart';

class BaseRepository {
  String? _cachedToken;

  Future<String?> _getToken() async {
    if (_cachedToken == null) {
      _cachedToken = await HiveRepository.getData("token", HiveBoxNames.authBox);
    }
    return _cachedToken;
  }

  Future<Response> createPostRequest(
      {required String path, dynamic data}) async {
    final token = await _getToken();
    if (token == null) {
      throw Exception('Authentication token not found');
    }

    String url = ApiUtils.baseUrl + path;

    Response response = await http.post(Uri.parse(url),
        body: json.encode(data),
        headers: {
          "Authorization": "Bearer ${token}",
          "Accept": "*/*",
          "contentType": "application/json"
        });

    if (response.statusCode != 200) {
      final responseBody = json.decode(response.body);
      final errorMessage = responseBody is Map && responseBody.containsKey('message')
          ? responseBody['message']
          : 'An error occurred';
      throw new Exception(errorMessage);
    }
    return response;
  }

  Future<Response> createGetRequest(
      String path, Map<String, String> queryParams) async {
    String? token = await _getToken();

    String url = ApiUtils.baseUrl + path;

    Map<String, String> headers = {
      "Accept": "*/*",
      "Content-Type": "application/json",
    };

    if (token != null) {
      headers["Authorization"] = "Bearer $token";
    }

    Response response = await http.get(
        Uri.parse(url).replace(queryParameters: queryParams),
        headers: headers);

    if (response.statusCode != 200) {
      final responseBody = json.decode(response.body);
      final errorMessage = responseBody is Map && responseBody.containsKey('message')
          ? responseBody['message']
          : 'An error occurred';
      throw new Exception(errorMessage);
    }

    return response;
  }

  Future<Response> createAuthenticatedGetRequest(
      String path, Map<String, String> queryParams) async {
    String? token = await _getToken();
    if (token == null) {
      throw Exception('Authentication token not found');
    }

    String url = ApiUtils.baseUrl + path;

    Response response = await http
        .get(Uri.parse(url).replace(queryParameters: queryParams), headers: {
      "Accept": "*/*",
      "Authorization": "${token}",
      "Content-Type": "application/json",
    });

    if (response.statusCode != 200) {
      throw new Exception(json.decode(response.body)['message']);
    }

    return response;
  }
}
