import 'dart:convert';
import 'package:airqo/src/app/shared/exceptions/session_expired_exception.dart';
import 'package:airqo/src/app/shared/repository/global_auth_manager.dart';
import 'package:airqo/src/app/shared/repository/secure_storage_repository.dart';
import 'package:airqo/src/app/shared/repository/session_expiry_notifier.dart';
import 'package:airqo/src/meta/utils/api_utils.dart';
import 'package:http/http.dart' as http;
import 'package:http/http.dart';
import 'package:loggy/loggy.dart';

class BaseRepository with UiLoggy {
  /// Injected notifier — defaults to the app-wide [GlobalAuthManager].
  /// Swap out in tests without touching production code (DIP).
  final SessionExpiryNotifier _sessionExpiryNotifier;

  BaseRepository({SessionExpiryNotifier? sessionExpiryNotifier})
      : _sessionExpiryNotifier = sessionExpiryNotifier ?? GlobalAuthManager.instance;

  // ---------------------------------------------------------------------------
  // Private helpers
  // ---------------------------------------------------------------------------

  Future<String?> _getToken() async {
    return SecureStorageRepository.instance.getSecureData(SecureStorageKeys.authToken);
  }

  Future<void> _handleTokenRefresh(Response response) async {
    final newToken = response.headers['x-access-token'];
    if (newToken != null && newToken.isNotEmpty) {
      try {
        await SecureStorageRepository.instance.saveSecureData(SecureStorageKeys.authToken, newToken);
        loggy.info('Successfully refreshed and stored new auth token.');
      } catch (e) {
        loggy.error('Failed to save refreshed token: $e');
      }
    }
  }

  /// Single path for all response processing — fixes the OCP violation where
  /// each HTTP method duplicated the same success/401/error branching.
  ///
  /// Throws [SessionExpiredException] on 401.
  /// Storage cleanup is owned by [AuthBloc._onSessionExpired], not here (SRP).
  Future<Response> _processResponse(Response response, String url, {bool hasToken = true}) async {
    if (response.statusCode >= 200 && response.statusCode < 300) {
      if (hasToken) await _handleTokenRefresh(response);
      return response;
    }

    if (response.statusCode == 401 && hasToken) {
      loggy.warning('401 received — notifying session expiry for $url');
      _sessionExpiryNotifier.notifySessionExpired();
      throw const SessionExpiredException();
    }

    throw _buildHttpException(response, url);
  }

  Exception _buildHttpException(Response response, String url) {
    String errorMessage = 'An error occurred';
    try {
      final contentType = response.headers['content-type'] ?? '';
      if (contentType.toLowerCase().contains('application/json') && response.body.isNotEmpty) {
        final body = json.decode(response.body);
        if (body is Map && body.containsKey('message')) {
          errorMessage = body['message'];
        }
      } else if (response.body.isNotEmpty) {
        final raw = response.body;
        errorMessage = raw.length > 200 ? '${raw.substring(0, 200)}...' : raw;
      }
    } catch (_) {
      if (response.body.isNotEmpty) {
        final raw = response.body;
        errorMessage = raw.length > 200 ? '${raw.substring(0, 200)}...' : raw;
      }
    }
    return Exception('$errorMessage (status=${response.statusCode}, url=$url)');
  }

  // ---------------------------------------------------------------------------
  // Public HTTP methods
  // ---------------------------------------------------------------------------

  Future<Response> createAuthenticatedPutRequest({
    required String path,
    required dynamic data,
  }) async {
    final token = await _getToken();
    if (token == null) throw Exception('Authentication token not found');

    final url = ApiUtils.baseUrl + path;
    loggy.info('PUT → $url');

    final response = await http.put(
      Uri.parse(url),
      body: json.encode(data),
      headers: {
        'Authorization': 'JWT $token',
        'Accept': '*/*',
        'Content-Type': 'application/json',
      },
    );

    loggy.info('PUT ← ${response.statusCode}');
    return _processResponse(response, url);
  }

  Future<Response> createPostRequest({required String path, dynamic data}) async {
    final token = await _getToken();
    if (token == null) throw Exception('Authentication token not found');

    final url = ApiUtils.baseUrl + path;
    loggy.info('POST → $url');

    final response = await http.post(
      Uri.parse(url),
      body: json.encode(data),
      headers: {
        'Authorization': 'JWT $token',
        'Accept': '*/*',
        'Content-Type': 'application/json',
      },
    );

    loggy.info('POST ← ${response.statusCode}');
    return _processResponse(response, url);
  }

  Future<Response> createGetRequest(String path, Map<String, String> queryParams) async {
    final token = await _getToken();
    final url = ApiUtils.baseUrl + path;

    final headers = <String, String>{
      'Accept': '*/*',
      'Content-Type': 'application/json',
      if (token != null) 'Authorization': 'JWT $token',
    };

    loggy.info('GET → $url');
    final response = await http.get(
      Uri.parse(url).replace(queryParameters: queryParams),
      headers: headers,
    );

    loggy.info('GET ← ${response.statusCode}');
    return _processResponse(response, url, hasToken: token != null);
  }

  Future<Response> createAuthenticatedGetRequest(
    String path,
    Map<String, String> queryParams,
  ) async {
    final token = await _getToken();
    if (token == null) throw Exception('Authentication token not found');

    final url = ApiUtils.baseUrl + path;
    loggy.info('GET (auth) → $url');

    final response = await http.get(
      Uri.parse(url).replace(queryParameters: queryParams),
      headers: {
        'Accept': '*/*',
        'Authorization': 'JWT $token',
        'Content-Type': 'application/json',
      },
    );

    loggy.info('GET (auth) ← ${response.statusCode}');
    return _processResponse(response, url);
  }
}
