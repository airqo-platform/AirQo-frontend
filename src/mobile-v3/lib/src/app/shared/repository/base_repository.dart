import 'dart:convert';
import 'package:airqo/src/app/shared/repository/global_auth_manager.dart';
import 'package:airqo/src/app/shared/repository/secure_storage_repository.dart';
import 'package:airqo/src/meta/utils/api_utils.dart';
import 'package:http/http.dart' as http;
import 'package:http/http.dart';
import 'package:loggy/loggy.dart';

class BaseRepository with UiLoggy {
  Future<String?> _getToken() async {
    return await SecureStorageRepository.instance.getSecureData(SecureStorageKeys.authToken);
  }

  Future<void> _handleTokenRefresh(Response response) async {
    final newToken = response.headers['x-access-token'];
    if (newToken != null && newToken.isNotEmpty) {
      try {
        await SecureStorageRepository.instance.saveSecureData(SecureStorageKeys.authToken, newToken);
        loggy.info("Successfully refreshed and stored new auth token.");
      } catch (e) {
        loggy.error("Failed to save refreshed token: $e");
      }
    }
  }

  Future<void> _handleSessionExpiry() async {
    try {
      await SecureStorageRepository.instance.deleteSecureData(SecureStorageKeys.authToken);
      await SecureStorageRepository.instance.deleteSecureData(SecureStorageKeys.userId);
      loggy.warning("Session expired. All auth data cleared.");
      
      GlobalAuthManager.instance.notifySessionExpired();
    } catch (e) {
      loggy.error("Failed to clear auth data on session expiry: $e");
    }
  }

  Exception _httpError(Response response, String url) {
    String errorMessage = 'An error occurred';
    
    try {
      // Check if response has JSON content type
      final contentType = response.headers['content-type'] ?? '';
      if (contentType.toLowerCase().contains('application/json') && response.body.isNotEmpty) {
        final responseBody = json.decode(response.body);
        if (responseBody is Map && responseBody.containsKey('message')) {
          errorMessage = responseBody['message'];
        }
      } else if (response.body.isNotEmpty) {
        // Use raw body for non-JSON responses, but limit length to avoid huge error messages
        final rawBody = response.body.length > 200 
            ? '${response.body.substring(0, 200)}...' 
            : response.body;
        errorMessage = rawBody;
      }
    } catch (e) {
      // JSON parsing failed, use raw body if available
      if (response.body.isNotEmpty) {
        final rawBody = response.body.length > 200 
            ? '${response.body.substring(0, 200)}...' 
            : response.body;
        errorMessage = rawBody;
      }
    }
    
    return Exception('$errorMessage (status=${response.statusCode}, url=$url)');
  }

  Future<Response> createAuthenticatedPutRequest({
  required String path, 
  required dynamic data
}) async {
  String? token = await _getToken();
  if (token == null) {
    throw Exception('Authentication token not found');
  }
  
  String url = ApiUtils.baseUrl + path;
  loggy.info("Making PUT request to: $url");
  
  Response response = await http.put(
    Uri.parse(url),
    body: json.encode(data),
    headers: {
      "Authorization": "JWT $token",
      "Accept": "*/*",
      "Content-Type": "application/json"
    }
  );
  
  loggy.info("PUT response status: ${response.statusCode}");
  
  if (response.statusCode >= 200 && response.statusCode < 300) {
    await _handleTokenRefresh(response);
    return response;
  } else if (response.statusCode == 401) {
    await _handleSessionExpiry();
    throw Exception('Your session has expired. Please log in again.');
  } else {
    throw _httpError(response, url);
  }
}

  Future<Response> createPostRequest(
      {required String path, dynamic data}) async {
    final token = await _getToken();
    if (token == null) {
      throw Exception('Authentication token not found');
    }

    String url = ApiUtils.baseUrl + path;

    loggy.info("Making POST request to: $url");

    Response response = await http.post(Uri.parse(url),
        body: json.encode(data),
        headers: {
          "Authorization": "JWT $token",
          "Accept": "*/*",
          "Content-Type": "application/json"
        });

    loggy.info("POST response status: ${response.statusCode}");

    if (response.statusCode >= 200 && response.statusCode < 300) {
      await _handleTokenRefresh(response);
      return response;
    } else if (response.statusCode == 401) {
      await _handleSessionExpiry();
      throw Exception('Your session has expired. Please log in again.');
    } else {
      throw _httpError(response, url);
    }
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
      headers["Authorization"] = "JWT $token";
    }

    loggy.info("Making GET request to: $url");

    Response response = await http.get(
        Uri.parse(url).replace(queryParameters: queryParams),
        headers: headers);

    loggy.info("GET response status: ${response.statusCode}");

    if (response.statusCode >= 200 && response.statusCode < 300) {
      if (token != null) {
        await _handleTokenRefresh(response);
      }
      return response;
    } else if (response.statusCode == 401 && token != null) {
      await _handleSessionExpiry();
      throw Exception('Your session has expired. Please log in again.');
    } else {
      throw _httpError(response, url);
    }
  }

  Future<Response> createAuthenticatedGetRequest(
      String path, Map<String, String> queryParams) async {
    String? token = await _getToken();
    if (token == null) {
      throw Exception('Authentication token not found');
    }

    loggy.info("Auth token present: true - using authenticated request");

    String url = ApiUtils.baseUrl + path;

    loggy.info("Making authenticated GET request to: $url");

    Response response = await http
        .get(Uri.parse(url).replace(queryParameters: queryParams), headers: {
      "Accept": "*/*",
      "Authorization": "JWT $token",
      "Content-Type": "application/json",
    });

    loggy.info("Authenticated GET response status: ${response.statusCode}");

    if (response.statusCode >= 200 && response.statusCode < 300) {
      await _handleTokenRefresh(response);
      return response;
    } else if (response.statusCode == 401) {
      await _handleSessionExpiry();
      throw Exception('Your session has expired. Please log in again.');
    } else {
      throw _httpError(response, url);
    }
  }

  Future<Response> createDeleteRequest({
    required String path,
    dynamic data,
  }) async {
    final token = await _getToken();
    if (token == null) {
      throw Exception('Authentication token not found');
    }

    String url = ApiUtils.baseUrl + path;

    loggy.info("Making DELETE request to: $url");

    final headers = {
      "Authorization": "JWT $token",
      "Accept": "*/*",
      "Content-Type": "application/json"
    };

    Response response;
    if (data != null) {
      response = await http.delete(
        Uri.parse(url),
        body: json.encode(data),
        headers: headers,
      );
    } else {
      response = await http.delete(
        Uri.parse(url),
        headers: headers,
      );
    }

    loggy.info("DELETE response status: ${response.statusCode}");

    if (response.statusCode >= 200 && response.statusCode < 300) {
      await _handleTokenRefresh(response);
      return response;
    } else if (response.statusCode == 401) {
      await _handleSessionExpiry();
      throw Exception('Your session has expired. Please log in again.');
    } else {
      throw _httpError(response, url);
    }
  }
}
