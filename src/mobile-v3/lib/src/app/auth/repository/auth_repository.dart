import 'dart:convert';
import 'package:airqo/src/app/auth/models/input_model.dart';
import 'package:airqo/src/app/shared/repository/hive_repository.dart';
import 'package:flutter_dotenv/flutter_dotenv.dart';
import 'package:http/http.dart' as http;
import 'package:connectivity_plus/connectivity_plus.dart';
import 'package:loggy/loggy.dart';

abstract class AuthRepository with UiLoggy {
  Future<String> loginWithEmailAndPassword(String username, String password);
  Future<void> registerWithEmailAndPassword(RegisterInputModel model);
  Future<String> requestPasswordReset(String email);
  Future<String> updatePassword({
    required String token,
    required String password,
    required String confirmPassword,
  });
  Future<void> verifyEmailCode(String token, String email);
  Future<String> verifyResetPin(String pin, String email);
}

class AuthImpl extends AuthRepository {
  final Connectivity _connectivity = Connectivity();

  @override
  Future<String> loginWithEmailAndPassword(
      String username, String password) async {
    final connectivityResult = await _connectivity.checkConnectivity();
    if (connectivityResult == ConnectivityResult.none) {
      loggy.info('AuthRepository: Offline, checking cached token');
      final cachedToken =
          await HiveRepository.getData('token', HiveBoxNames.authBox);
      if (cachedToken != null && cachedToken.isNotEmpty) {
        loggy.info('AuthRepository: Returning cached token for $username');
        return cachedToken; // Use cached token when offline
      }
      loggy.error('AuthRepository: No cached token found while offline');
      throw Exception('Offline: Please try again when connected.');
    }

    loggy.info('AuthRepository: Attempting login for $username');
    final loginResponse = await http.post(
      Uri.parse("https://api.airqo.net/api/v2/users/loginUser"),
      body: jsonEncode({"userName": username, "password": password}),
      headers: {
        "Authorization": dotenv.env["AIRQO_MOBILE_TOKEN"]!,
        "Accept": "*/*",
        "Content-Type": "application/json"
      },
    );

    Map<String, dynamic> data = {};
    try {
      final decoded = jsonDecode(loginResponse.body);
      if (decoded is Map<String, dynamic>) data = decoded;
    } catch (_) {
      loggy.warning('AuthRepository: Non-JSON login response');
    }

    if (loginResponse.statusCode != 200) {
      final msg = (data['message'] as String?) ?? 'Login failed. Please try again.';
      loggy.error('AuthRepository: Login failed - $msg');
      throw Exception(msg);
    }

    final String userId = data["_id"];
    final String token = data["token"];
    await HiveRepository.saveData(HiveBoxNames.authBox, "token", token);
    await HiveRepository.saveData(HiveBoxNames.authBox, "userId", userId);
    loggy.info('AuthRepository: Login successful, token saved');
    return token;
  }

  @override
  Future<void> registerWithEmailAndPassword(RegisterInputModel model) async {
    final connectivityResult = await _connectivity.checkConnectivity();
    if (connectivityResult == ConnectivityResult.none) {
      loggy.error('AuthRepository: Offline, cannot register');
      throw Exception('Offline: Registration requires internet.');
    }

    loggy.info('AuthRepository: Attempting registration for ${model.email}');
    final registerResponse = await http.post(
      Uri.parse("https://api.airqo.net/api/v2/users/register"),
      body: registerInputModelToJson(model),
      headers: {"Accept": "*/*", "Content-Type": "application/json"},
    );

    final data = json.decode(registerResponse.body);

    if (registerResponse.statusCode != 200) {
      final errorMessage = data['errors']?['message'] ?? data['message'];
      loggy.error('AuthRepository: Registration failed - $errorMessage');
      throw Exception(errorMessage);
    }
    loggy.info('AuthRepository: Registration successful');
  }

  @override
  Future<String> requestPasswordReset(String email) async {
    final connectivityResult = await _connectivity.checkConnectivity();
    if (connectivityResult == ConnectivityResult.none) {
      loggy.error('AuthRepository: Offline, cannot request password reset');
      throw Exception('Offline: Password reset requires internet.');
    }

    loggy.info('AuthRepository: Requesting password reset for $email');
    final response = await http.post(
      Uri.parse('https://api.airqo.net/api/v2/users/reset-password-request'),
      headers: {
        "Authorization": dotenv.env["AIRQO_MOBILE_TOKEN"]!,
        "Accept": "*/*",
        "Content-Type": "application/json"
      },
      body: jsonEncode({'email': email}),
    );

    if (response.statusCode == 200) {
      final data = jsonDecode(response.body);
      if (data['success'] == true) {
        loggy.info('AuthRepository: Password reset link sent');
        return data['message'] ?? 'Password reset link sent.';
      }
      loggy.error('AuthRepository: Password reset failed - ${data['message']}');
      throw Exception(
          data['message'] ?? 'Failed to send password reset request.');
    }

    try {
      final errorData = jsonDecode(response.body);
      String errorMessage = errorData['message'] ?? 'Something went wrong.';
      switch (response.statusCode) {
        case 400:
          errorMessage =
              errorData['message'] ?? 'Invalid email address or request.';
          break;
        case 401:
          errorMessage = 'Authentication failed. Please try again.';
          break;
        case 403:
          errorMessage = 'Access denied. Please contact support.';
          break;
        case 404:
          errorMessage = 'No account found with this email address.';
          break;
        case 429:
          errorMessage =
              'Too many requests. Please wait a moment and try again.';
          break;
        case 500:
        case 502:
        case 503:
          errorMessage = 'Server error. Please try again later.';
          break;
        default:
          errorMessage = errorData['message'] ??
              'Unable to send reset code. Please try again.';
      }
      loggy.error('AuthRepository: Password reset failed - $errorMessage');
      throw Exception(errorMessage);
    } catch (e) {
      loggy.error('AuthRepository: Password reset error - $e');
      throw Exception('Unable to send reset code. Please try again.');
    }
  }

  @override
  Future<void> verifyEmailCode(String token, String email) async {
    final connectivityResult = await _connectivity.checkConnectivity();
    if (connectivityResult == ConnectivityResult.none) {
      loggy.error('AuthRepository: Offline, cannot verify email');
      throw Exception('Offline: Email verification requires internet.');
    }

    loggy.info('AuthRepository: Verifying email code for $email');
    final apiToken = dotenv.env["AIRQO_MOBILE_TOKEN"];
    assert(apiToken != null, 'AIRQO_MOBILE_TOKEN missing in .env');

    final verifyResponse = await http.post(
      Uri.parse("https://api.airqo.net/api/v2/users/verify-email/$token"),
      headers: {
        "Authorization": apiToken!,
        "Content-Type": "application/json",
        "Accept": "application/json"
      },
      body: jsonEncode({"email": email}),
    );

    try {
      final data = json.decode(verifyResponse.body);
      if (verifyResponse.statusCode != 200) {
        String errorMessage = "Email verification failed";
        if (data.containsKey('errors')) {
          var errors = data['errors'];
          errorMessage =
              errors is Map ? errors.values.join(', ') : errors.toString();
        } else if (data.containsKey('message')) {
          errorMessage = data['message'];
        }
        loggy
            .error('AuthRepository: Email verification failed - $errorMessage');
        throw Exception(errorMessage);
      }
      loggy.info('AuthRepository: Email verification successful');
    } catch (e) {
      loggy.error(
          'AuthRepository: Invalid response during email verification - $e');
      throw Exception("Invalid response: ${verifyResponse.body}");
    }
  }

  @override
  Future<String> updatePassword({
    required String token,
    required String password,
    required String confirmPassword,
  }) async {
    final connectivityResult = await _connectivity.checkConnectivity();
    if (connectivityResult == ConnectivityResult.none) {
      loggy.error('AuthRepository: Offline, cannot update password');
      throw Exception('Offline: Password reset requires internet.');
    }

    loggy.info('AuthRepository: Updating password');
    final response = await http.post(
      Uri.parse('https://api.airqo.net/api/v2/users/reset-password/$token'),
      headers: {
        'Content-Type': "application/json",
      },
      body: jsonEncode({
        'password': password,
        'confirmPassword': confirmPassword,
      }),
    );

    if (response.statusCode == 200) {
      final data = jsonDecode(response.body);
      loggy.info('AuthRepository: Password reset successful');
      return data['message'] ?? 'Password reset successful.';
    }

    final error =
        jsonDecode(response.body)['message'] ?? 'Failed to reset password.';
    loggy.error('AuthRepository: Password reset failed - $error');
    throw Exception(error);
  }

  @override
  Future<String> verifyResetPin(String pin, String email) async {
    loggy.info('AuthRepository: Verifying reset PIN for $email');
    if (RegExp(r'^\d{5}$').hasMatch(pin)) {
      loggy.info('AuthRepository: PIN format valid');
      return pin;
    }
    loggy.error('AuthRepository: Invalid PIN format');
    throw Exception('Invalid PIN. Please enter a 5-digit numeric PIN.');
  }
}
