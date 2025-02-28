import 'dart:convert';
import 'package:http/http.dart' as http;
import 'package:flutter_dotenv/flutter_dotenv.dart';
import 'package:loggy/loggy.dart';
import 'package:airqo/src/app/shared/repository/hive_repository.dart';

abstract class UserPreferencesRepository {
  Future<Map<String, dynamic>> getUserPreferences(String userId,
      {String? groupId});
  Future<Map<String, dynamic>> replacePreference(Map<String, dynamic> data);
}

class UserPreferencesImpl extends UserPreferencesRepository with NetworkLoggy {
  final String apiBaseUrl = 'https://api.airqo.net/api/v2';

  Future<Map<String, String>> _getHeaders() async {
    // Try to get user token first
    final userToken =
        await HiveRepository.getData('token', HiveBoxNames.authBox);

    // Base headers
    final headers = {
      "Accept": "application/json",
      "Content-Type": "application/json"
    };

    // Add authorization - prefer user token if available, fall back to env token
    if (userToken != null && userToken.isNotEmpty) {
      loggy.info('Using user authentication token');

      // Keep the token as-is with the JWT prefix
      // The API expects the token with the JWT prefix
      headers["Authorization"] = userToken;
    } else {
      // Fallback to the application token
      loggy.info('Using application token from environment');
      final appToken = dotenv.env["AIRQO_MOBILE_TOKEN"];
      if (appToken != null && appToken.isNotEmpty) {
        headers["Authorization"] = appToken;
      } else {
        loggy.warning('No authentication token available');
      }
    }

    return headers;
  }

  @override
  Future<Map<String, dynamic>> getUserPreferences(String userId,
      {String? groupId}) async {
    final String url =
        '$apiBaseUrl/users/preferences/$userId${groupId != null ? "?group_id=$groupId" : ""}';

    try {
      loggy.info('Fetching user preferences for user ID: $userId');

      final headers = await _getHeaders();
      final response = await http.get(Uri.parse(url), headers: headers);

      loggy.info('Response status code: ${response.statusCode}');

      // Handle 401 Unauthorized explicitly
      if (response.statusCode == 401) {
        loggy.warning(
            'Authentication error (401): Token might be expired or invalid');
        return {
          'success': false,
          'message': 'Authentication failed. Please log in again.',
          'auth_error': true
        };
      }

      // Check if response is HTML instead of JSON
      if (response.body.trim().startsWith('<') ||
          response.body.trim() == 'Unauthorized') {
        loggy.error(
            'Received non-JSON response: ${response.body.substring(0, min(50, response.body.length))}');
        return {
          'success': false,
          'message':
              'Server returned invalid response. Please try again later.',
          'auth_error': response.statusCode == 401
        };
      }

      final Map<String, dynamic> data = json.decode(response.body);

      if (response.statusCode != 200) {
        return {
          'success': false,
          'message': data['message'] ?? 'Failed to fetch user preferences',
          'auth_error': response.statusCode == 401
        };
      }

      return data;
    } catch (e) {
      loggy.error('Error fetching user preferences: $e');

      // Determine if this is an auth error based on the exception
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

// Helper to get minimum of two integers
  int min(int a, int b) => a < b ? a : b;

  @override
  Future<Map<String, dynamic>> replacePreference(
      Map<String, dynamic> data) async {
    try {
      final userId = data['user_id'];
      loggy.info('Replacing preferences for user ID: $userId');

      final headers = await _getHeaders();

      // First, check if preferences already exist
      loggy.info('Checking if preferences already exist');
      final String getUserPrefsUrl = '$apiBaseUrl/users/preferences/$userId';

      try {
        final getUserResponse =
            await http.get(Uri.parse(getUserPrefsUrl), headers: headers);

        loggy.info(
            'Get user preferences response status: ${getUserResponse.statusCode}');

        if (getUserResponse.statusCode == 200) {
          // Preferences exist, need to update them
          loggy.info('Preferences exist, will update them');

          try {
            final prefsData = json.decode(getUserResponse.body);

            if (prefsData['success'] == true && prefsData['data'] != null) {
              // Extract the preference ID if available
              final String? prefId = prefsData['data']['_id'];

              if (prefId != null) {
                // Update existing preferences by ID
                final updateUrl = '$apiBaseUrl/users/preferences/$prefId';
                loggy.info('Updating existing preferences with ID: $prefId');

                final updateResponse = await http.put(Uri.parse(updateUrl),
                    headers: headers, body: jsonEncode(data));

                loggy.info(
                    'Update response status: ${updateResponse.statusCode}');
                loggy.info('Update response body: ${updateResponse.body}');

                if (updateResponse.statusCode >= 200 &&
                    updateResponse.statusCode < 300) {
                  return json.decode(updateResponse.body);
                }
              }
            }
          } catch (e) {
            loggy.error('Error parsing user preferences: $e');
          }
        }
      } catch (e) {
        loggy.error('Error checking existing preferences: $e');
      }

      // If we couldn't update existing preferences, try the patch method
      final patchUrl = '$apiBaseUrl/users/preferences/update';
      loggy.info('Trying to patch preferences at: $patchUrl');

      final patchResponse = await http.patch(Uri.parse(patchUrl),
          headers: headers, body: jsonEncode(data));

      loggy.info('Patch response status: ${patchResponse.statusCode}');

      if (patchResponse.statusCode >= 200 &&
          patchResponse.statusCode < 300 &&
          !patchResponse.body.trim().startsWith('<')) {
        return json.decode(patchResponse.body);
      }

      // Try update endpoint with put method
      final updateUrl = '$apiBaseUrl/users/preferences/update';
      loggy.info('Trying to update preferences at: $updateUrl');

      final updateResponse = await http.put(Uri.parse(updateUrl),
          headers: headers, body: jsonEncode(data));

      loggy.info('Update response status: ${updateResponse.statusCode}');

      if (updateResponse.statusCode >= 200 &&
          updateResponse.statusCode < 300 &&
          !updateResponse.body.trim().startsWith('<')) {
        return json.decode(updateResponse.body);
      }

      // If all other methods fail, try one last approach - update by user ID
      final userUpdateUrl = '$apiBaseUrl/users/preferences/$userId';
      loggy.info('Trying direct update by user ID: $userUpdateUrl');

      final userUpdateResponse = await http.put(Uri.parse(userUpdateUrl),
          headers: headers, body: jsonEncode(data));

      loggy.info(
          'User update response status: ${userUpdateResponse.statusCode}');

      if (userUpdateResponse.statusCode >= 200 &&
          userUpdateResponse.statusCode < 300 &&
          !userUpdateResponse.body.trim().startsWith('<')) {
        return json.decode(userUpdateResponse.body);
      }

      // If we get here, we tried everything and nothing worked
      return {
        'success': false,
        'message':
            'Unable to update preferences. The preferences exist but could not be updated.'
      };
    } catch (e) {
      loggy.error('Error replacing preferences: $e');
      return {
        'success': false,
        'message': 'An error occurred: ${e.toString()}'
      };
    }
  }
}
