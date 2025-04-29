import 'package:airqo/src/app/shared/repository/hive_repository.dart';
import 'package:jwt_decoder/jwt_decoder.dart';
import 'dart:math' as Math;
import 'package:loggy/loggy.dart';

/// AuthHelper class with dedicated logger
class AuthHelper {
  // Create a static logger using your app's logging setup
  static final _logger = Loggy('AuthHelper');
  
  /// Get the current user ID from the stored auth token
  static Future<String?> getCurrentUserId() async {
    _logger.info('getCurrentUserId called');
    
    try {
      // Get token from Hive
      final token = await HiveRepository.getData('token', HiveBoxNames.authBox);
      
      if (token == null) {
        _logger.warning('Token is null - not found in Hive storage');
        return null;
      }
      
      if (token.isEmpty) {
        _logger.warning('Token is empty string');
        return null;
      }
      
      _logger.info('Token retrieved successfully: ${token.substring(0, Math.min<int>(10, token.length))}...');
      
      try {
        // Try to decode the token
        final Map<String, dynamic> decodedToken = JwtDecoder.decode(token);
        _logger.info('Token decoded successfully, payload keys: ${decodedToken.keys.toList()}');
        
        // Look for common user ID fields
        final possibleIdFields = ['sub', 'id', 'userId', 'user_id', '_id', 'uid'];
        String? userId;
        
        for (final field in possibleIdFields) {
          if (decodedToken.containsKey(field) && decodedToken[field] != null) {
            userId = decodedToken[field].toString();
            _logger.info('Found user ID in field "$field": $userId');
            return userId;
          }
        }
        
        // If we got here, we didn't find a user ID in the expected fields
        _logger.warning('Token decoded but no user ID found in expected fields');
        _logger.info('Available fields in token: ${decodedToken.keys.toList()}');
        _logger.info('Token payload dump: $decodedToken');
        
        // As a fallback, return the first non-null value we find
        for (final entry in decodedToken.entries) {
          if (entry.value != null && entry.value.toString().isNotEmpty) {
            _logger.info('Using fallback field "${entry.key}" as user ID: ${entry.value}');
            return entry.value.toString();
          }
        }
        
        return null;
      } catch (decodeError) {
        _logger.error('Error decoding token: $decodeError');
        
        // If JWT decoding fails, try a different approach
        // Maybe the token is not a JWT but some other format
        _logger.info('Attempting alternative token parsing approaches');
        
        // Example: Try parsing as basic string token
        if (token.contains(':')) {
          final parts = token.split(':');
          if (parts.length > 0 && parts[0].isNotEmpty) {
            _logger.info('Extracted user ID from colon-separated token: ${parts[0]}');
            return parts[0];
          }
        }
        
        return null;
      }
    } catch (e) {
      _logger.error('Unexpected error getting user ID: $e');
      return null;
    }
  }
  
  /// Debug the token information directly
  static Future<void> debugToken() async {
    _logger.info('Debugging auth token');
    
    try {
      final token = await HiveRepository.getData('token', HiveBoxNames.authBox);
      
      if (token == null) {
        _logger.warning('DEBUG: Token is null');
        return;
      }
      
      if (token.isEmpty) {
        _logger.warning('DEBUG: Token is empty string');
        return;
      }
      
      _logger.info('DEBUG: Token exists with length ${token.length}');
      _logger.info('DEBUG: First few characters: ${token.substring(0, Math.min<int>(20, token.length))}');
      
      // Check if it's a valid JWT format (3 parts separated by dots)
      final parts = token.split('.');
      if (parts.length == 3) {
        _logger.info('DEBUG: Token appears to be in valid JWT format (3 parts)');
      } else {
        _logger.warning('DEBUG: Token is not in standard JWT format (expected 3 parts, found ${parts.length})');
      }
      
      try {
        final decoded = JwtDecoder.decode(token);
        _logger.info('DEBUG: JWT decoded successfully');
        _logger.info('DEBUG: Payload fields: ${decoded.keys.toList()}');
      } catch (e) {
        _logger.error('DEBUG: Failed to decode as JWT: $e');
      }
    } catch (e) {
      _logger.error('DEBUG: Error accessing token: $e');
    }
  }
  
  /// Check if the current token is expired
  static Future<bool> isTokenExpired() async {
    try {
      final token = await HiveRepository.getData('token', HiveBoxNames.authBox);
      
      if (token == null || token.isEmpty) {
        _logger.warning('Token is null or empty, considered expired');
        return true; // No token = effectively expired
      }
      
      final isExpired = JwtDecoder.isExpired(token);
      _logger.info('Token expiration check: ${isExpired ? "Expired" : "Valid"}');
      return isExpired;
    } catch (e) {
      _logger.error('Error checking token expiration: $e');
      return true; // Assume expired on error
    }
  }
}