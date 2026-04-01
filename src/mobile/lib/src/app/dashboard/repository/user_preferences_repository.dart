import 'dart:convert';
import 'package:http/http.dart' as http;
import 'package:flutter_dotenv/flutter_dotenv.dart';
import 'package:loggy/loggy.dart';
import 'package:airqo/src/app/shared/repository/hive_repository.dart';
import 'package:airqo/src/app/shared/repository/secure_storage_repository.dart';

abstract class UserPreferencesRepository {
  Future<Map<String, dynamic>> getUserPreferences(String userId, {String? groupId});
  Future<Map<String, dynamic>> replacePreference(Map<String, dynamic> data);
}

class UserPreferencesImpl extends UserPreferencesRepository with NetworkLoggy {
  final String apiBaseUrl = '${dotenv.env["AIRQO_API_URL"]}/api/v2';
  final String preferencesEndpoint = '/users/preferences';

  String _cacheKey(String userId, String groupId) => 'user_preferences_${userId}_$groupId';

  Future<Map<String, String>> _getHeaders({bool useAppToken = false}) async {
    final headers = {
      "Accept": "application/json",
      "Content-Type": "application/json"
    };

    if (!useAppToken) {
      final userToken = await SecureStorageRepository.instance.getSecureData(SecureStorageKeys.authToken);
      if (userToken != null && userToken.isNotEmpty) {
        loggy.info('Using user authentication token');
        headers["Authorization"] = "JWT $userToken";
      } else {
        loggy.warning('No user session token available');
      }
      return headers;
    }

    loggy.info('Using application token from environment');
    final appToken = dotenv.env["AIRQO_MOBILE_TOKEN"];
    if (appToken != null && appToken.isNotEmpty) {
      headers["Authorization"] = "JWT $appToken";
    } else {
      loggy.warning('No authentication token available');
    }

    return headers;
  }

  static dynamic _deepConvert(dynamic value) {
    if (value is Map) {
      return Map<String, dynamic>.fromEntries(
        value.entries.map((e) => MapEntry(e.key.toString(), _deepConvert(e.value))),
      );
    }
    if (value is List) {
      return value.map(_deepConvert).toList();
    }
    return value;
  }

  Future<Map<String, dynamic>?> _getCachedPreferences(String userId, String groupId) async {
    try {
      final cached = await HiveRepository.getCache(_cacheKey(userId, groupId));
      if (cached != null && cached is Map) {
        loggy.info('Serving preferences from local cache for user: $userId');
        return _deepConvert(cached) as Map<String, dynamic>;
      }
    } catch (e) {
      loggy.warning('Error reading cached preferences: $e');
    }
    return null;
  }

  Future<void> _cachePreferences(String userId, String groupId, Map<String, dynamic> data) async {
    try {
      await HiveRepository.saveCache(_cacheKey(userId, groupId), data);
      loggy.info('Cached preferences for user: $userId');
    } catch (e) {
      loggy.warning('Error caching preferences: $e');
    }
  }

  @override
  Future<Map<String, dynamic>> getUserPreferences(String userId, {String? groupId}) async {
    String url = '$apiBaseUrl$preferencesEndpoint/$userId';

    if (groupId != null && groupId.isNotEmpty) {
      url += '?group_id=$groupId';
    }

    try {
      loggy.info('Fetching user preferences for user ID: $userId');
      if (groupId != null) loggy.info('With group ID: $groupId');

      final headers = await _getHeaders();
      final response = await http.get(Uri.parse(url), headers: headers);

      loggy.info('Response status code: ${response.statusCode}');

      if (response.statusCode == 401) {
        loggy.warning('GET preferences returned 401 with user token, retrying with app token');
        final appHeaders = await _getHeaders(useAppToken: true);
        final retryResponse = await http.get(Uri.parse(url), headers: appHeaders);
        loggy.info('App token retry status: ${retryResponse.statusCode}');

        if (retryResponse.statusCode == 200) {
          final retryData = json.decode(retryResponse.body) as Map<String, dynamic>;
          await _cachePreferences(userId, groupId ?? '', retryData);
          return retryData;
        }

        loggy.warning('App token retry also failed, falling back to local cache');
        final cached = await _getCachedPreferences(userId, groupId ?? '');
        if (cached != null) return cached;
        return {
          'success': false,
          'message': 'Authentication failed. Please log in again.',
          'auth_error': true
        };
      }

      if (response.body.trim().startsWith('<') || response.body.trim() == 'Unauthorized') {
        loggy.error('Received non-JSON response: ${response.body.substring(0, min(50, response.body.length))}');
        final cached = await _getCachedPreferences(userId, groupId ?? '');
        if (cached != null) return cached;
        return {
          'success': false,
          'message': 'Server returned invalid response. Please try again later.',
          'auth_error': response.statusCode == 401
        };
      }

      final Map<String, dynamic> data = json.decode(response.body);

      if (response.statusCode != 200) {
        final cached = await _getCachedPreferences(userId, groupId ?? '');
        if (cached != null) return cached;
        return {
          'success': false,
          'message': data['message'] ?? 'Failed to fetch user preferences',
          'auth_error': response.statusCode == 401
        };
      }

      await _cachePreferences(userId, groupId ?? '', data);
      return data;
    } catch (e) {
      loggy.error('Error fetching user preferences: $e');

      final cached = await _getCachedPreferences(userId, groupId ?? '');
      if (cached != null) return cached;

      final bool isAuthError = e.toString().contains('401') ||
          e.toString().contains('Unauthorized') ||
          (e is FormatException && e.toString().contains('Unauthorized'));

      return {
        'success': false,
        'message': 'Error: ${e.toString()}',
        'auth_error': isAuthError
      };
    }
  }

  int min(int a, int b) => a < b ? a : b;

  @override
  Future<Map<String, dynamic>> replacePreference(Map<String, dynamic> data) async {
    final String url = '$apiBaseUrl$preferencesEndpoint/replace';
    final userId = data['user_id'];
    final String groupId = (data['group_id'] as String?) ?? '';

    if (userId == null || userId.isEmpty) {
      return {
        'success': false,
        'message': 'User ID is required',
      };
    }

    loggy.info('Replacing preferences for user ID: $userId');

    try {
      final headers = await _getHeaders();

      loggy.info('Sending replacement preferences to: $url');
      final updateResponse = await http.patch(
        Uri.parse(url),
        headers: headers,
        body: jsonEncode(data),
      );

      loggy.info('Replacement response status: ${updateResponse.statusCode}');

      if (updateResponse.statusCode == 401) {
        loggy.warning('Authentication error (401): Token might be expired or invalid');
        return {
          'success': false,
          'message': 'Your session has expired. Please log in again.',
          'auth_error': true
        };
      }

      if (updateResponse.statusCode >= 200 &&
          updateResponse.statusCode < 300 &&
          !updateResponse.body.trim().startsWith('<')) {
        try {
          final result = json.decode(updateResponse.body);
          loggy.info('Successfully updated preferences');
          final hasPreferencesData = result is Map &&
              (result.containsKey('preference') ||
               result.containsKey('preferences') ||
               result.containsKey('data'));
          if (hasPreferencesData) {
            await _cachePreferences(userId, groupId, result as Map<String, dynamic>);
          }
          return result;
        } catch (e) {
          loggy.error('Error parsing success response: $e');
          return {
            'success': true,
            'message': 'Successfully updated preferences, but response parsing failed',
          };
        }
      }

      loggy.error('Failed to update preferences');

      return {
        'success': false,
        'message': 'Failed to update preferences',
      };
    } catch (e) {
      loggy.error('Error replacing preferences: $e');

      return {
        'success': false,
        'message': 'An error occurred: ${e.toString()}',
      };
    }
  }
}
