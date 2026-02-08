import 'package:airqo/src/app/shared/repository/secure_storage_repository.dart';
import 'package:jwt_decoder/jwt_decoder.dart';
import 'package:loggy/loggy.dart';

/// AuthHelper class with dedicated logger
class AuthHelper {
  // Create a static logger using your app's logging setup
  static final _logger = Loggy('AuthHelper');

  /// Get the current user ID from secure storage (preferred method)
  static Future<String?> getCurrentUserId(
      {bool suppressGuestWarning = false}) async {
    try {
      // First, try to get userId directly from secure storage
      final userId = await SecureStorageRepository.instance
          .getSecureData(SecureStorageKeys.userId);

      if (userId != null && userId.isNotEmpty) {
        _logger.info('User ID retrieved from secure storage');
        return userId;
      }

      // If not found in secure storage, try to extract from token
      _logger
          .info('User ID not found in secure storage, extracting from token');
      return await getUserIdFromToken(
          suppressGuestWarning: suppressGuestWarning);
    } catch (e) {
      _logger.error('Unexpected error getting user ID: $e');
      return null;
    }
  }

  /// Get user ID by decoding the JWT token (fallback method)
  static Future<String?> getUserIdFromToken(
      {bool suppressGuestWarning = false}) async {
    try {
      final token = await SecureStorageRepository.instance
          .getSecureData(SecureStorageKeys.authToken);

      if (token == null) {
        if (!suppressGuestWarning) {
          _logger.info('No authentication token found - user is in guest mode');
        }
        return null;
      }

      if (token.isEmpty) {
        _logger.warning('Token is empty string');
        return null;
      }

      _logger.info('Token retrieved successfully');

      try {
        // Try to decode the token
        final Map<String, dynamic> decodedToken = JwtDecoder.decode(token);
        _logger.info('Token decoded successfully');

        final possibleIdFields = [
          'sub',
          'id',
          'userId',
          'user_id',
          '_id',
          'uid'
        ];
        String? userId;

        for (final field in possibleIdFields) {
          if (decodedToken.containsKey(field) && decodedToken[field] != null) {
            userId = decodedToken[field].toString();
            _logger.info('Found user ID in token');

            try {
              await SecureStorageRepository.instance
                  .saveSecureData(SecureStorageKeys.userId, userId);
              _logger.info('Saved user ID to secure storage');
            } catch (e) {
              _logger.warning('Failed to save user ID to secure storage');
            }

            return userId;
          }
        }

        // If we got here, we didn't find a user ID in the expected fields
        _logger
            .warning('Token decoded but no user ID found in expected fields');

        return null;
      } catch (decodeError) {
        _logger.error('Error decoding token');
        return null;
      }
    } catch (e) {
      _logger.error('Unexpected error getting user ID from token');
      return null;
    }
  }

  /// Debug the token information directly
  static Future<void> debugToken() async {
    _logger.info('Debugging auth token');

    try {
      final token = await SecureStorageRepository.instance
          .getSecureData(SecureStorageKeys.authToken);

      if (token == null) {
        _logger.warning('DEBUG: Token is null');
        return;
      }

      if (token.isEmpty) {
        _logger.warning('DEBUG: Token is empty string');
        return;
      }

      _logger.info('DEBUG: Token exists with length ${token.length}');
      _logger.info('DEBUG: Token format appears valid');

      // Check if it's a valid JWT format (3 parts separated by dots)
      final parts = token.split('.');
      if (parts.length == 3) {
        _logger
            .info('DEBUG: Token appears to be in valid JWT format (3 parts)');
      } else {
        _logger.warning(
            'DEBUG: Token is not in standard JWT format (expected 3 parts, found ${parts.length})');
      }

      try {
        JwtDecoder.decode(token);
        _logger.info('DEBUG: JWT decoded successfully');
      } catch (e) {
        _logger.error('DEBUG: Failed to decode as JWT');
      }
    } catch (e) {
      _logger.error('DEBUG: Error accessing token');
    }
  }

  /// Check if the current token is expired
  static Future<bool> isTokenExpired() async {
    try {
      final token = await SecureStorageRepository.instance
          .getSecureData(SecureStorageKeys.authToken);

      if (token == null || token.isEmpty) {
        _logger.warning('Token is null or empty, considered expired');
        return true; // No token = effectively expired
      }

      // Check if it's a valid JWT format first
      final parts = token.split('.');
      if (parts.length != 3) {
        _logger.warning('Token is not in valid JWT format, considered expired');
        return true;
      }

      final isExpired = JwtDecoder.isExpired(token);
      _logger
          .info('Token expiration check: ${isExpired ? "Expired" : "Valid"}');
      return isExpired;
    } catch (e) {
      _logger.error('Error checking token expiration: $e');
      // Don't assume expired on decode errors - could be temporary issue
      // Return false to allow the request to proceed and let the server decide
      return false;
    }
  }
}
