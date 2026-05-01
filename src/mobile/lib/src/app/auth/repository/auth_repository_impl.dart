import 'dart:async';
import 'dart:convert';
import 'dart:io';

import 'package:airqo/src/app/auth/models/input_model.dart';
import 'package:airqo/src/app/auth/repository/auth_repository.dart';
import 'package:airqo/src/app/auth/repository/social_auth_repository.dart';
import 'package:airqo/src/app/auth/services/oauth_service.dart';
import 'package:airqo/src/app/shared/repository/secure_storage_repository.dart';
import 'package:flutter_dotenv/flutter_dotenv.dart';
import 'package:http/http.dart' as http;
import 'package:http/http.dart';
import 'package:jwt_decoder/jwt_decoder.dart';
class AuthImpl extends AuthRepository implements SocialAuthRepository {
  final OAuthService _oauthService;

  AuthImpl({OAuthService? oauthService})
      : _oauthService = oauthService ?? OAuthServiceImpl();

  static String _sanitizeToken(String? rawToken) {
    if (rawToken == null) return '';
    String token = rawToken.trim();
    if (token.isEmpty) return '';
    final schemePattern = RegExp(r'^(bearer\s+|jwt\s+)+', caseSensitive: false);
    while (schemePattern.hasMatch(token)) {
      token = token.replaceFirst(schemePattern, '').trim();
    }
    return token;
  }

  @override
  Future<String> loginWithEmailAndPassword(String username, String password) async {
    try {
      Response loginResponse = await http.post(
          Uri.parse("${dotenv.env["AIRQO_API_URL"]}/api/v2/users/loginUser"),
          body: jsonEncode({"userName": username, "password": password}),
          headers: {
            "Authorization": dotenv.env["AIRQO_MOBILE_TOKEN"] ?? (throw StateError('AIRQO_MOBILE_TOKEN environment variable is missing')),
            "Accept": "application/json",
            "Content-Type": "application/json"
          });

      if (loginResponse.statusCode == 200) {
        Map<String, dynamic> data;
        try {
          data = json.decode(loginResponse.body);
        } catch (e) {
          loggy.error("Login response parsing failed: Status=${loginResponse.statusCode}, BodyLength=${loginResponse.body.length}");
          throw Exception("Invalid response from server. Please try again.");
        }

        if (data.isEmpty) {
          loggy.error("Login response is empty: Status=${loginResponse.statusCode}, BodyLength=${loginResponse.body.length}");
          throw Exception("Invalid response format from server. Please try again.");
        }

        final rawToken = data["token"];
        final sanitizedToken = _sanitizeToken(rawToken is String ? rawToken : null);

        if (sanitizedToken.isEmpty) {
          loggy.error("Login response missing or invalid token: Status=${loginResponse.statusCode}, BodyLength=${loginResponse.body.length}, TokenLength=${sanitizedToken.length}");
          throw Exception("Authentication failed. Invalid token received.");
        }

        String? userId;
        try {
          final Map<String, dynamic> decodedToken = JwtDecoder.decode(sanitizedToken);
          const possibleIdFields = ['sub', 'id', 'userId', 'user_id', '_id', 'uid'];
          for (final field in possibleIdFields) {
            if (decodedToken.containsKey(field) && decodedToken[field] != null) {
              userId = decodedToken[field].toString();
              break;
            }
          }
          if (userId == null || userId.trim().isEmpty) {
            throw Exception("Authentication failed. Token does not contain user information.");
          }
        } catch (e) {
          loggy.error("Failed to decode JWT token");
          throw Exception("Authentication failed. Invalid token format received.");
        }

        try {
          await SecureStorageRepository.instance.saveSecureData(SecureStorageKeys.authToken, sanitizedToken);
          await SecureStorageRepository.instance.saveSecureData(SecureStorageKeys.userId, userId);
        } catch (e) {
          loggy.error("Failed to save authentication data securely: $e");
          throw Exception("Failed to save authentication data. Please try again.");
        }

        return sanitizedToken;
      } else {
        loggy.error("Login failed - Status: ${loginResponse.statusCode}, BodyLength: ${loginResponse.body.length}");
        throw Exception(_loginErrorMessage(loginResponse.statusCode, loginResponse.body));
      }
    } on SocketException {
      throw Exception("No internet connection. Please check your network and try again.");
    } on TimeoutException {
      throw Exception("Connection timed out. Please check your network and try again.");
    } on FormatException {
      throw Exception("Invalid response from server. Please try again.");
    } catch (e) {
      if (e.toString().contains('Connection refused') || e.toString().contains('Failed host lookup')) {
        throw Exception("Unable to connect to server. Please check your network and try again.");
      }
      rethrow;
    }
  }

  @override
  Future<void> registerWithEmailAndPassword(RegisterInputModel model) async {
    try {
      Response registerResponse = await http.post(
          Uri.parse("${dotenv.env["AIRQO_API_URL"]}/api/v2/users/register"),
          body: registerInputModelToJson(model),
          headers: {"Accept": "application/json", "Content-Type": "application/json"});

      if (registerResponse.statusCode >= 200 && registerResponse.statusCode <= 299) return;

      loggy.error("Registration failed - Status: ${registerResponse.statusCode}, BodyLength: ${registerResponse.body.length}");

      String errorMessage;
      if (registerResponse.statusCode >= 400 && registerResponse.statusCode <= 499) {
        try {
          final body = jsonDecode(registerResponse.body);
          errorMessage = body['message'] ?? body['error'] ?? "There was an issue with your request. Please check your input and try again.";
        } catch (_) {
          errorMessage = "There was an issue with your request. Please check your input and try again.";
        }
      } else if (registerResponse.statusCode >= 500) {
        errorMessage = "We're experiencing technical difficulties. Please try again later.";
      } else {
        errorMessage = "Registration failed. Please try again.";
      }

      throw Exception(errorMessage);
    } on SocketException {
      throw Exception("No internet connection. Please check your network and try again.");
    } on TimeoutException {
      throw Exception("Connection timed out. Please check your network and try again.");
    } on FormatException {
      throw Exception("Invalid response from server. Please try again.");
    } catch (e) {
      if (e.toString().contains('Connection refused') || e.toString().contains('Failed host lookup')) {
        throw Exception("Unable to connect to server. Please check your network and try again.");
      }
      rethrow;
    }
  }

  @override
  Future<String> requestPasswordReset(String email) async {
    try {
      final response = await http.post(
        Uri.parse('${dotenv.env["AIRQO_API_URL"]}/api/v2/users/reset-password-request'),
        headers: {
          "Authorization": dotenv.env["AIRQO_MOBILE_TOKEN"] ?? (throw StateError('AIRQO_MOBILE_TOKEN environment variable is missing')),
          "Accept": "application/json",
          "Content-Type": "application/json"
        },
        body: jsonEncode({'email': email}),
      );

      if (response.statusCode == 200) {
        final data = jsonDecode(response.body);
        if (data['success'] == true) return data['message'] ?? 'Password reset link sent.';
        throw Exception(data['message'] ?? 'Failed to send password reset request.');
      }

      loggy.error("Password reset request failed - Status: ${response.statusCode}, BodyLength: ${response.body.length}");
      throw Exception(_passwordResetErrorMessage(response.statusCode, response.body));
    } on SocketException {
      loggy.error('Password Reset Network Error: No internet connection');
      throw Exception("No internet connection. Please check your network and try again.");
    } on TimeoutException {
      loggy.error('Password Reset Network Error: Connection timed out');
      throw Exception("Connection timed out. Please check your network and try again.");
    } on FormatException {
      loggy.error('Password Reset Parsing Error: Invalid server response format');
      throw Exception("Invalid response from server. Please try again.");
    } catch (e) {
      if (e.toString().contains('Connection refused') || e.toString().contains('Failed host lookup')) {
        loggy.error('Password Reset Network Error: Unable to connect to server');
        throw Exception("Unable to connect to server. Please check your network and try again.");
      }
      rethrow;
    }
  }

  @override
  Future<void> verifyEmailCode(String token, String email) async {
    try {
      final apiToken = dotenv.env["AIRQO_MOBILE_TOKEN"] ?? (throw StateError('AIRQO_MOBILE_TOKEN environment variable is missing'));
      final verifyResponse = await http.post(
        Uri.parse("${dotenv.env["AIRQO_API_URL"]}/api/v2/users/verify-email/$token"),
        headers: {
          "Authorization": apiToken,
          "Content-Type": "application/json",
          "Accept": "application/json"
        },
        body: json.encode({"email": email}),
      );

      if (verifyResponse.statusCode >= 200 && verifyResponse.statusCode <= 299) return;

      loggy.error("Email verification failed - Status: ${verifyResponse.statusCode}, BodyLength: ${verifyResponse.body.length}");
      throw Exception(_verifyEmailErrorMessage(verifyResponse.statusCode, verifyResponse.body));
    } on SocketException {
      loggy.error('Email Verification Network Error: No internet connection');
      throw Exception("No internet connection. Please check your network and try again.");
    } on TimeoutException {
      loggy.error('Email Verification Network Error: Connection timed out');
      throw Exception("Connection timed out. Please check your network and try again.");
    } on FormatException {
      loggy.error('Email Verification Parsing Error: Invalid server response format');
      throw Exception("Invalid response from server. Please try again.");
    } catch (e) {
      if (e.toString().contains('Connection refused') || e.toString().contains('Failed host lookup')) {
        loggy.error('Email Verification Network Error: Unable to connect to server');
        throw Exception("Unable to connect to server. Please check your network and try again.");
      }
      loggy.error("Unexpected error during email verification: $e");
      throw Exception("Email verification failed. Please try again.");
    }
  }

  @override
  Future<String> updatePassword({
    required String token,
    required String password,
    required String confirmPassword,
  }) async {
    try {
      final response = await http.post(
        Uri.parse('${dotenv.env["AIRQO_API_URL"]}/api/v2/users/reset-password/$token'),
        headers: {'Content-Type': 'application/json'},
        body: jsonEncode({'password': password, 'confirmPassword': confirmPassword}),
      );

      if (response.statusCode == 200) {
        final data = jsonDecode(response.body);
        return data['message'] ?? 'Password reset successful.';
      }

      loggy.error("Password update failed - Status: ${response.statusCode}, BodyLength: ${response.body.length}");
      throw Exception(_updatePasswordErrorMessage(response.statusCode, response.body));
    } on SocketException {
      loggy.error('Password Update Network Error: No internet connection');
      throw Exception("No internet connection. Please check your network and try again.");
    } on TimeoutException {
      loggy.error('Password Update Network Error: Connection timed out');
      throw Exception("Connection timed out. Please check your network and try again.");
    } on FormatException {
      loggy.error('Password Update Parsing Error: Invalid server response format');
      throw Exception("Invalid response from server. Please try again.");
    } catch (e) {
      if (e.toString().contains('Connection refused') || e.toString().contains('Failed host lookup')) {
        loggy.error('Password Update Network Error: Unable to connect to server');
        throw Exception("Unable to connect to server. Please check your network and try again.");
      }
      rethrow;
    }
  }

  @override
  Future<String> validatePinFormat(String pin, String email) async {
    if (RegExp(r'^\d{5}$').hasMatch(pin)) return pin;
    throw Exception('Invalid PIN. Please enter a 5-digit numeric PIN.');
  }

  @override
  Future<void> loginWithProvider(String provider) async {
    try {
      final token = await _oauthService.authenticate(provider);
      final sanitizedToken = _sanitizeToken(token);

      if (sanitizedToken.isEmpty) throw Exception('Authentication failed. Invalid token received.');

      String? userId;
      try {
        final Map<String, dynamic> decoded = JwtDecoder.decode(sanitizedToken);
        const possibleIdFields = ['sub', 'id', 'userId', 'user_id', '_id', 'uid'];
        for (final field in possibleIdFields) {
          if (decoded.containsKey(field) && decoded[field] != null) {
            userId = decoded[field].toString();
            break;
          }
        }
      } catch (_) {
        loggy.error('Failed to decode OAuth JWT token');
        throw Exception('Authentication failed. Invalid token format received.');
      }

      if (userId == null || userId.trim().isEmpty) {
        throw Exception('Authentication failed. Token does not contain user information.');
      }

      await SecureStorageRepository.instance.saveSecureData(SecureStorageKeys.authToken, sanitizedToken);
      await SecureStorageRepository.instance.saveSecureData(SecureStorageKeys.userId, userId);
    } on OAuthCancelledException {
      rethrow;
    } on SocketException {
      throw Exception('No internet connection. Please check your network and try again.');
    } on TimeoutException {
      throw Exception('Connection timed out. Please check your network and try again.');
    } catch (e) {
      rethrow;
    }
  }

  @override
  Future<void> deleteUserAccount() async {
    try {
      final authToken = await SecureStorageRepository.instance.getSecureData(SecureStorageKeys.authToken);
      final userId = await SecureStorageRepository.instance.getSecureData(SecureStorageKeys.userId);

      if (authToken == null || userId == null) {
        throw Exception('No authentication data found. Please login first.');
      }

      final response = await http.delete(
        Uri.parse('${dotenv.env["AIRQO_API_URL"]}/api/v2/users/deleteAccount'),
        headers: {
          "Authorization": "JWT ${_sanitizeToken(authToken)}",
          "Accept": "application/json",
          "Content-Type": "application/json"
        },
      ).timeout(const Duration(seconds: 30));

      if (response.statusCode >= 200 && response.statusCode <= 299) {
        await SecureStorageRepository.instance.deleteSecureData(SecureStorageKeys.authToken);
        await SecureStorageRepository.instance.deleteSecureData(SecureStorageKeys.userId);
        return;
      }

      loggy.error("Account deletion failed - Status: ${response.statusCode}, BodyLength: ${response.body.length}");
      throw Exception(_deleteAccountErrorMessage(response.statusCode, response.body));
    } on SocketException {
      loggy.error('Account Deletion Network Error: No internet connection');
      throw Exception("No internet connection. Please check your network and try again.");
    } on TimeoutException {
      loggy.error('Account Deletion Network Error: Connection timed out');
      throw Exception("Connection timed out. Please check your network and try again.");
    } on FormatException {
      loggy.error('Account Deletion Parsing Error: Invalid server response format');
      throw Exception("Invalid response from server. Please try again.");
    } catch (e) {
      if (e.toString().contains('Connection refused') || e.toString().contains('Failed host lookup')) {
        loggy.error('Account Deletion Network Error: Unable to connect to server');
        throw Exception("Unable to connect to server. Please check your network and try again.");
      }
      rethrow;
    }
  }

  // --- error message helpers ---

  String _loginErrorMessage(int status, String body) {
    if (status >= 500) return "We're experiencing technical difficulties. Please try again later.";
    switch (status) {
      case 400: return "Please check your email and password format.";
      case 401: return "Invalid email or password. Please check your credentials and try again.";
      case 403: return "Your account access has been restricted. Please contact support.";
      case 404: return "No account found with these credentials.";
      case 422:
        try {
          final data = json.decode(body);
          if (data['message'] != null) return data['message'];
          final errors = data['errors'];
          if (errors is Map) return errors.values.map((e) => e?.toString() ?? '').join(', ');
        } catch (_) {}
        return "Please check your login information and try again.";
      case 429: return "Too many login attempts. Please wait a moment and try again.";
      default:  return "Login failed. Please try again.";
    }
  }

  String _passwordResetErrorMessage(int status, String body) {
    if (status >= 500) return "We're experiencing technical difficulties. Please try again later.";
    switch (status) {
      case 400:
        try { return jsonDecode(body)['message'] ?? 'Please enter a valid email address.'; } catch (_) {}
        return 'Please enter a valid email address.';
      case 401: return 'Authentication failed. Please try again.';
      case 403: return 'Password reset is not allowed for this account.';
      case 404: return 'No account found with this email address.';
      case 429: return 'Too many requests. Please wait a moment and try again.';
      default:  return 'Unable to send reset code. Please try again.';
    }
  }

  String _verifyEmailErrorMessage(int status, String body) {
    if (status >= 500) return "We're experiencing technical difficulties. Please try again later.";
    switch (status) {
      case 400: return "Invalid verification code. Please check your code and try again.";
      case 401: return "Your verification link has expired. Please request a new verification email.";
      case 403: return "Email verification is not allowed for this account.";
      case 404: return "Verification link is invalid or has already been used.";
      case 422:
        try {
          final data = jsonDecode(body);
          if (data['message'] != null) return data['message'];
          final errors = data['errors'];
          if (errors is Map) return errors.values.map((e) => e?.toString() ?? '').join(', ');
        } catch (_) {}
        return "Please check your verification code and try again.";
      default: return "Email verification failed. Please try again.";
    }
  }

  String _updatePasswordErrorMessage(int status, String body) {
    if (status >= 500) return "We're experiencing technical difficulties. Please try again later.";
    switch (status) {
      case 400:
        try { return jsonDecode(body)['message'] ?? 'Password requirements not met. Please check your password and try again.'; } catch (_) {}
        return 'Password requirements not met. Please check your password and try again.';
      case 401: return 'Your password reset link has expired. Please request a new password reset.';
      case 403: return 'Password reset is not allowed for this account.';
      case 404: return 'Invalid reset link. Please request a new password reset.';
      case 422:
        try {
          final data = jsonDecode(body);
          if (data['message'] != null) return data['message'];
          final errors = data['errors'];
          if (errors is Map) return errors.values.map((e) => e?.toString() ?? '').join(', ');
        } catch (_) {}
        return 'Password does not meet requirements. Please try a stronger password.';
      default: return 'Failed to reset password. Please try again.';
    }
  }

  String _deleteAccountErrorMessage(int status, String body) {
    if (status >= 500) return "We're experiencing technical difficulties. Please try again later.";
    switch (status) {
      case 400: return 'Invalid request. Please try again.';
      case 401: return 'Your session has expired. Please login and try again.';
      case 403: return 'Account deletion is not allowed for this account.';
      case 404: return 'Account not found or already deleted.';
      case 422:
        try { return jsonDecode(body)['message'] ?? 'Unable to delete account. Please contact support.'; } catch (_) {}
        return 'Unable to delete account. Please contact support.';
      case 429: return 'Too many requests. Please wait and try again later.';
      default:  return 'Failed to delete account. Please try again.';
    }
  }
}
