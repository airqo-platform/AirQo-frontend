import 'dart:convert';
import 'package:http/http.dart' as http;
import 'package:flutter_dotenv/flutter_dotenv.dart';
import 'package:loggy/loggy.dart';
import 'package:airqo/src/app/shared/repository/hive_repository.dart';

abstract class UserPreferencesRepository {
  Future<Map<String, dynamic>> getUserPreferences(String userId, {String? groupId});
  Future<Map<String, dynamic>> replacePreference(Map<String, dynamic> data);
}

class UserPreferencesImpl extends UserPreferencesRepository with NetworkLoggy {
  final String apiBaseUrl = 'https://api.airqo.net/api/v2';
  final String preferencesEndpoint = '/users/preferences';

  Future<Map<String, String>> _getHeaders() async {
    // Try to get user token first
    final userToken = await HiveRepository.getData('token', HiveBoxNames.authBox);

    // Base headers
    final headers = {
      "Accept": "application/json",
      "Content-Type": "application/json"
    };

    // Add authorization - prefer user token if available, fall back to env token
    if (userToken != null && userToken.isNotEmpty) {
      loggy.info('Using user authentication token');
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

      // Handle 401 Unauthorized explicitly
      if (response.statusCode == 401) {
        loggy.warning('Authentication error (401): Token might be expired or invalid');
        return {
          'success': false,
          'message': 'Authentication failed. Please log in again.',
          'auth_error': true
        };
      }

      if (response.body.trim().startsWith('<') || response.body.trim() == 'Unauthorized') {
        loggy.error('Received non-JSON response: ${response.body.substring(0, min(50, response.body.length))}');
        return {
          'success': false,
          'message': 'Server returned invalid response. Please try again later.',
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
  Future<Map<String, dynamic>> replacePreference(Map<String, dynamic> data) async {
    // Following the PATCH /replace pattern from the documentation
    final String url = '$apiBaseUrl$preferencesEndpoint/replace';
    final userId = data['user_id'];
    
    if (userId == null || userId.isEmpty) {
      return {
        'success': false,
        'message': 'User ID is required',
      };
    }
    
    loggy.info('Replacing preferences for user ID: $userId');

    Map<String, dynamic>? oldPreferencesData;

    try {
      // Step 0: Get a backup of the current preferences before making changes
      final currentPrefsResponse = await getUserPreferences(userId);
      if (currentPrefsResponse['success'] == true) {
        if (currentPrefsResponse['data'] != null && 
            currentPrefsResponse['data'] is Map<String, dynamic>) {
          oldPreferencesData = Map<String, dynamic>.from(currentPrefsResponse['data']);
          loggy.info('Backed up current preferences before update');
        } else if (currentPrefsResponse['preferences'] is List && 
                  currentPrefsResponse['preferences'].isNotEmpty) {
          oldPreferencesData = Map<String, dynamic>.from(
              currentPrefsResponse['preferences'].first);
          loggy.info('Backed up current preferences from preferences list');
        }
      }

      final headers = await _getHeaders();

      // Following API documentation - use PATCH for replacement
      loggy.info('Sending replacement preferences to: $url');
      final updateResponse = await http.patch(
        Uri.parse(url),
        headers: headers,
        body: jsonEncode(data),
      );

      loggy.info('Replacement response status: ${updateResponse.statusCode}');

      if (updateResponse.statusCode >= 200 && 
          updateResponse.statusCode < 300 &&
          !updateResponse.body.trim().startsWith('<')) {
        try {
          final result = json.decode(updateResponse.body);
          loggy.info('Successfully updated preferences');
          return result;
        } catch (e) {
          loggy.error('Error parsing success response: $e');
          return {
            'success': true,
            'message': 'Successfully updated preferences, but response parsing failed',
          };
        }
      }

      // If we reach here, the update failed
      loggy.error('Failed to update preferences');

      // Only attempt rollback if we have a backup and the data format is valid
      if (oldPreferencesData != null && 
          oldPreferencesData.containsKey('selected_sites')) {
        return await _attemptRollback(userId, oldPreferencesData, headers, url);
      }

      return {
        'success': false,
        'message': 'Failed to update preferences, and rollback was not possible',
      };
    } catch (e) {
      loggy.error('Error replacing preferences: $e');

      // Attempt rollback if we have a backup
      if (oldPreferencesData != null) {
        final headers = await _getHeaders();
        return await _attemptRollback(userId, oldPreferencesData, headers, url);
      }

      return {
        'success': false,
        'message': 'An error occurred: ${e.toString()}',
      };
    }
  }

  // Helper method to attempt rollback to old preferences
  Future<Map<String, dynamic>> _attemptRollback(
      String userId,
      Map<String, dynamic> oldPreferencesData,
      Map<String, String> headers,
      String url) async {
    try {
      loggy.info('Attempting to rollback to previous preferences');

      // Prepare rollback data
      final rollbackPayload = {
        "user_id": userId,
        "selected_sites": oldPreferencesData['selected_sites'] ?? [],
        // Include any other fields that were in the original data
        ...oldPreferencesData
      };

      // Remove any fields that shouldn't be part of the rollback
      rollbackPayload.remove('_id');
      rollbackPayload.remove('createdAt');
      rollbackPayload.remove('updatedAt');

      final rollbackResponse = await http.patch(
        Uri.parse(url),
        headers: headers,
        body: jsonEncode(rollbackPayload),
      );

      if (rollbackResponse.statusCode >= 200 &&
          rollbackResponse.statusCode < 300) {
        loggy.info('Rollback successful');
        return {
          'success': false,
          'message': 'Failed to update preferences, but successfully rolled back to previous state',
          'rolled_back': true
        };
      } else {
        loggy.error('Failed to rollback preferences: ${rollbackResponse.body}');
        return {
          'success': false,
          'message': 'Failed to update preferences and rollback failed. Your saved locations may be temporarily unavailable.',
          'rolled_back': false
        };
      }
    } catch (e) {
      loggy.error('Error during rollback: $e');
      return {
        'success': false,
        'message': 'Critical error: Could not update preferences or restore previous state. Please try again later.',
        'rolled_back': false
      };
    }
  }
}