import 'package:airqo/src/app/shared/repository/secure_storage_repository.dart';
import 'package:jwt_decoder/jwt_decoder.dart';
import 'package:loggy/loggy.dart';

class AuthTokenStorage {
  static final _logger = Loggy('AuthTokenStorage');

  static String sanitizeToken(String? rawToken) {
    if (rawToken == null) return '';
    String token = rawToken.trim();
    if (token.isEmpty) return '';
    final schemePattern = RegExp(r'^(bearer\s+|jwt\s+)+', caseSensitive: false);
    while (schemePattern.hasMatch(token)) {
      token = token.replaceFirst(schemePattern, '').trim();
    }
    return token;
  }

  static Future<void> saveAuthToken(String rawToken) async {
    final token = sanitizeToken(rawToken);
    if (token.isEmpty) return;

    await SecureStorageRepository.instance
        .saveSecureData(SecureStorageKeys.authToken, token);

    final userId = extractUserId(token);
    if (userId != null && userId.isNotEmpty) {
      await SecureStorageRepository.instance
          .saveSecureData(SecureStorageKeys.userId, userId);
    }
  }

  static Future<void> saveTokenFromHeaders(Map<String, String> headers) async {
    final rawToken = _headerValue(headers, 'x-access-token');
    if (rawToken == null || rawToken.trim().isEmpty) return;

    try {
      await saveAuthToken(rawToken);
      _logger.info('Stored refreshed auth token from X-Access-Token header');
    } catch (e) {
      _logger.error('Failed to store X-Access-Token header token: $e');
    }
  }

  static String? extractUserId(String token) {
    try {
      final decoded = JwtDecoder.decode(sanitizeToken(token));
      const possibleIdFields = ['sub', 'id', 'userId', 'user_id', '_id', 'uid'];
      for (final field in possibleIdFields) {
        final value = decoded[field];
        if (value != null && value.toString().trim().isNotEmpty) {
          return value.toString();
        }
      }
    } catch (e) {
      _logger.warning('Unable to extract user ID from auth token: $e');
    }
    return null;
  }

  static String? _headerValue(Map<String, String> headers, String name) {
    final lowerName = name.toLowerCase();
    for (final entry in headers.entries) {
      if (entry.key.toLowerCase() == lowerName) return entry.value;
    }
    return null;
  }
}
