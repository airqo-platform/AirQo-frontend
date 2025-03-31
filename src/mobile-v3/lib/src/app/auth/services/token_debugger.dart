import 'package:airqo/src/app/shared/repository/hive_repository.dart';
import 'package:jwt_decoder/jwt_decoder.dart';
import 'dart:convert';
import 'package:loggy/loggy.dart';

class TokenDebugger {
  static final _logger = Loggy('TokenDebugger');

  /// Perform a detailed check of token expiration with extra debugging
  static Future<bool> checkTokenExpiration() async {
    _logger.info('Performing detailed token expiration check');
    
    try {
      final token = await HiveRepository.getData('token', HiveBoxNames.authBox);
      
      if (token == null) {
        _logger.warning('Token is null - not found in storage');
        return true; // Considered expired
      }
      
      if (token.isEmpty) {
        _logger.warning('Token is empty string');
        return true; // Considered expired
      }
      
      _logger.info('Token exists with length ${token.length}');
      
      // Check for common format issues
      if (token.startsWith('Bearer ')) {
        _logger.warning('⚠️ Token starts with "Bearer " prefix - this might cause decoding issues');
        // You might want to strip this prefix when storing the token
      }
      
      // Check token format (should be 3 parts for JWT)
      final parts = token.split('.');
      if (parts.length != 3) {
        _logger.warning('⚠️ Token is not in standard JWT format (has ${parts.length} parts, expected 3)');
        return true; // Not a valid JWT, consider expired
      }
      
      try {
        // Try to manually decode the payload part (middle part)
        final normalizedPayload = _normalizeBase64(parts[1]);
        final payloadJson = utf8.decode(base64Decode(normalizedPayload));
        final payload = jsonDecode(payloadJson);
        
        _logger.info('Manually decoded payload fields: ${payload.keys.toList()}');
        
        // Check for expiration field
        if (payload.containsKey('exp')) {
          final expValue = payload['exp'];
          _logger.info('Found expiration value: $expValue (${expValue.runtimeType})');
          
          // Convert to timestamps for comparison
          final now = DateTime.now().millisecondsSinceEpoch ~/ 1000; // Current time in seconds
          _logger.info('Current timestamp (seconds): $now');
          
          int expTimestamp;
          if (expValue is int) {
            expTimestamp = expValue;
          } else {
            // Try to parse as int
            expTimestamp = int.tryParse('$expValue') ?? 0;
          }
          
          // Check if the expiration value is in seconds or milliseconds
          if (expTimestamp > 0) {
            // If expTimestamp is very large (> year 2100), it might be in milliseconds
            if (expTimestamp > 4102444800) { // Jan 1, 2100 in seconds
              _logger.warning('⚠️ Expiration timestamp is very large - might be in milliseconds instead of seconds');
              expTimestamp = expTimestamp ~/ 1000; // Convert to seconds
            }
            
            final expDate = DateTime.fromMillisecondsSinceEpoch(expTimestamp * 1000);
            _logger.info('Expiration date: $expDate');
            
            final isExpired = now > expTimestamp;
            _logger.info('Token expiration check: ${isExpired ? "EXPIRED" : "VALID"}');
            
            // Add some tolerance for clock skew (5 minutes)
            const clockSkewAllowance = 5 * 60; // 5 minutes in seconds
            final isExpiredWithSkew = now > (expTimestamp + clockSkewAllowance);
            _logger.info('With clock skew allowance: ${isExpiredWithSkew ? "EXPIRED" : "VALID"}');
            
            // Compare with the library's implementation
            try {
              final libraryCheck = JwtDecoder.isExpired(token);
              _logger.info('JWT library expiration check: ${libraryCheck ? "EXPIRED" : "VALID"}');
              
              if (libraryCheck != isExpired) {
                _logger.warning('⚠️ Discrepancy between manual check and JWT library!');
              }
            } catch (e) {
              _logger.error('JWT library threw error on expiration check: $e');
            }
            
            return isExpired;
          } else {
            _logger.warning('Invalid expiration value: $expValue');
            return true; // Invalid exp, consider expired
          }
        } else {
          _logger.warning('⚠️ Token does not contain "exp" field');
          
          // Check for other expiration-related fields
          final expirationFields = ['expires_at', 'expiresAt', 'expiry', 'expires', 'expiration'];
          for (final field in expirationFields) {
            if (payload.containsKey(field)) {
              _logger.info('Found alternative expiration field: "$field" with value: ${payload[field]}');
            }
          }
          
          // If no expiration field is found, we can't determine
          return false; // Assume not expired if no exp field
        }
      } catch (e) {
        _logger.error('Error manually decoding token payload: $e');
      }
      
      // As fallback, use the library's implementation
      try {
        final isExpired = JwtDecoder.isExpired(token);
        _logger.info('Fallback to JWT library: ${isExpired ? "EXPIRED" : "VALID"}');
        return isExpired;
      } catch (e) {
        _logger.error('JWT library threw error on fallback: $e');
        return true; // Error checking, assume expired
      }
    } catch (e) {
      _logger.error('Unexpected error in token expiration check: $e');
      return true; // Error checking, assume expired
    }
  }
  
  /// Normalize base64 string to make it valid for decoding
  static String _normalizeBase64(String base64String) {
    String normalized = base64String.replaceAll('-', '+').replaceAll('_', '/');
    while (normalized.length % 4 != 0) {
      normalized += '=';
    }
    return normalized;
  }
}