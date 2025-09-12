import 'dart:async';
import 'dart:convert';
import 'dart:io';

import 'package:airqo/src/app/auth/models/input_model.dart';
import 'package:airqo/src/app/shared/repository/secure_storage_repository.dart';
import 'package:flutter_dotenv/flutter_dotenv.dart';
import 'package:http/http.dart' as http;
import 'package:http/http.dart';
import 'package:jwt_decoder/jwt_decoder.dart';
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
  @override
  Future<String> loginWithEmailAndPassword(
      String username, String password) async {
    try {
      Response loginResponse = await http.post(
          Uri.parse("https://api.airqo.net/api/v2/users/loginUser"),
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
        
        final token = data["token"];
        
        if (token == null || token is! String || token.trim().isEmpty) {
          loggy.error("Login response missing or invalid token: Status=${loginResponse.statusCode}, BodyLength=${loginResponse.body.length}");
          throw Exception("Authentication failed. Invalid token received.");
        }

        String? userId;
        try {
          final Map<String, dynamic> decodedToken = JwtDecoder.decode(token);
          
          final possibleIdFields = ['sub', 'id', 'userId', 'user_id', '_id', 'uid'];
          
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
          await SecureStorageRepository.instance.saveSecureData(SecureStorageKeys.authToken, token);
          await SecureStorageRepository.instance.saveSecureData(SecureStorageKeys.userId, userId);
        } catch (e) {
          loggy.error("Failed to save authentication data securely: $e");
          throw Exception("Failed to save authentication data. Please try again.");
        }
        
        return token;
      } else {
        loggy.error("Login failed - Status: ${loginResponse.statusCode}, BodyLength: ${loginResponse.body.length}");
        
        String errorMessage;
        String errorType;
        
        if (loginResponse.statusCode >= 400 && loginResponse.statusCode < 500) {
          errorType = 'CLIENT_ERROR';
          errorMessage = "Please check your login information and try again.";
          switch (loginResponse.statusCode) {
            case 400:
              errorType = 'VALIDATION_ERROR: Invalid login request format';
              errorMessage = "Please check your email and password format.";
              break;
            case 401:
              errorType = 'AUTH_ERROR: Invalid credentials';
              errorMessage = "Invalid email or password. Please check your credentials and try again.";
              break;
            case 403:
              errorType = 'FORBIDDEN_ERROR: Account access blocked';
              errorMessage = "Your account access has been restricted. Please contact support.";
              break;
            case 404:
              errorType = 'NOT_FOUND_ERROR: User account not found';
              errorMessage = "No account found with these credentials.";
              break;
            case 422:
              errorType = 'VALIDATION_ERROR: Login validation failed';
              try {
                Map<String, dynamic> data = json.decode(loginResponse.body);
                if (data['message'] != null) {
                  errorMessage = data['message'];
                } else if (data['errors'] != null) {
                  var errors = data['errors'];
                  if (errors is Map) {
                    errorMessage = errors.values.map((e) => e?.toString() ?? 'null').join(', ');
                  } else {
                    errorMessage = "Please check your login information and try again.";
                  }
                } else {
                  errorMessage = "Please check your login information and try again.";
                }
              } catch (e) {
                errorMessage = "Please check your login information and try again.";
              }
              break;
            case 429:
              errorType = 'RATE_LIMIT_ERROR: Too many login attempts';
              errorMessage = "Too many login attempts. Please wait a moment and try again.";
              break;
          }
        } else if (loginResponse.statusCode >= 500) {
          errorType = 'SERVER_ERROR';
          errorMessage = "We're experiencing technical difficulties. Please try again later.";
          switch (loginResponse.statusCode) {
            case 502:
              errorType = 'BAD_GATEWAY_ERROR: Login service unavailable';
              break;
            case 503:
              errorType = 'SERVICE_UNAVAILABLE_ERROR: Login service unavailable';
              break;
          }
        } else {
          errorType = 'UNKNOWN_LOGIN_ERROR';
          errorMessage = "Login failed. Please try again.";
        }
        
        loggy.error('Login Failed: $errorType | Status: ${loginResponse.statusCode}, BodyLength: ${loginResponse.body.length}');
        throw Exception(errorMessage);
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
          Uri.parse("https://api.airqo.net/api/v2/users/register"),
          body: registerInputModelToJson(model),
          headers: {"Accept": "application/json", "Content-Type": "application/json"});

      if (registerResponse.statusCode >= 200 && registerResponse.statusCode <= 299) {
        return;
      } else {
        loggy.error("Registration failed - Status: ${registerResponse.statusCode}, BodyLength: ${registerResponse.body.length}");
        
        String errorMessage;
        
        if (registerResponse.statusCode >= 400 && registerResponse.statusCode <= 499) {
          try {
            final responseBody = jsonDecode(registerResponse.body);
            if (responseBody != null && responseBody['message'] != null) {
              errorMessage = responseBody['message'];
            } else if (responseBody != null && responseBody['error'] != null) {
              errorMessage = responseBody['error'];
            } else {
              errorMessage = "There was an issue with your request. Please check your input and try again.";
            }
          } catch (e) {
            errorMessage = "There was an issue with your request. Please check your input and try again.";
          }
        } else if (registerResponse.statusCode >= 500 && registerResponse.statusCode <= 599) {
          errorMessage = "We're experiencing technical difficulties. Please try again later.";
        } else {
          errorMessage = "Registration failed. Please try again.";
        }
        
        throw Exception(errorMessage);
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
  Future<String> requestPasswordReset(String email) async {
    try {
      final response = await http.post(
        Uri.parse('https://api.airqo.net/api/v2/users/reset-password-request'),
        headers: {
          "Authorization": dotenv.env["AIRQO_MOBILE_TOKEN"] ?? (throw StateError('AIRQO_MOBILE_TOKEN environment variable is missing')),
          "Accept": "application/json",
          "Content-Type": "application/json"
        },
        body: jsonEncode({
          'email': email,
        }),
      );

      if (response.statusCode == 200) {
        final data = jsonDecode(response.body);
        if (data['success'] == true) {
          return data['message'] ?? 'Password reset link sent.';
        } else {
          throw Exception(
              data['message'] ?? 'Failed to send password reset request.');
        }
      } else {
        loggy.error("Password reset request failed - Status: ${response.statusCode}, BodyLength: ${response.body.length}");
        
        String errorMessage;
        String errorType;
        
        if (response.statusCode >= 400 && response.statusCode < 500) {
          errorType = 'CLIENT_ERROR';
          errorMessage = 'Please check your email address and try again.';
          switch (response.statusCode) {
            case 400:
              errorType = 'VALIDATION_ERROR: Invalid email format or request';
              try {
                final errorData = jsonDecode(response.body);
                errorMessage = errorData['message'] ?? 'Please enter a valid email address.';
              } catch (e) {
                errorMessage = 'Please enter a valid email address.';
              }
              break;
            case 401:
              errorType = 'AUTH_ERROR: Service authentication failed';
              errorMessage = 'Authentication failed. Please try again.';
              break;
            case 403:
              errorType = 'FORBIDDEN_ERROR: Password reset blocked';
              errorMessage = 'Password reset is not allowed for this account.';
              break;
            case 404:
              errorType = 'NOT_FOUND_ERROR: User account not found';
              errorMessage = 'No account found with this email address.';
              break;
            case 429:
              errorType = 'RATE_LIMIT_ERROR: Too many password reset requests';
              errorMessage = 'Too many requests. Please wait a moment and try again.';
              break;
          }
        } else if (response.statusCode >= 500) {
          errorType = 'SERVER_ERROR';
          errorMessage = 'We\'re experiencing technical difficulties. Please try again later.';
          switch (response.statusCode) {
            case 502:
              errorType = 'BAD_GATEWAY_ERROR: Password reset service unavailable';
              break;
            case 503:
              errorType = 'SERVICE_UNAVAILABLE_ERROR: Password reset service unavailable';
              break;
          }
        } else {
          errorType = 'UNKNOWN_PASSWORD_RESET_ERROR';
          errorMessage = 'Unable to send reset code. Please try again.';
        }
        
        loggy.error('Password Reset Request Failed: $errorType | Status: ${response.statusCode}, BodyLength: ${response.body.length}');
        throw Exception(errorMessage);
      }
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
      Uri.parse("https://api.airqo.net/api/v2/users/verify-email/$token"),
      headers: {
        "Authorization": apiToken,
        "Content-Type": "application/json",
        "Accept": "application/json"
      },
      body: json.encode({
        "email": email 
      })
    );
    
    if (verifyResponse.statusCode >= 200 && verifyResponse.statusCode <= 299) {
      return;
    }
    
    loggy.error("Email verification failed - Status: ${verifyResponse.statusCode}, BodyLength: ${verifyResponse.body.length}");
    
    String errorMessage;
    String errorType;
    
    if (verifyResponse.statusCode >= 400 && verifyResponse.statusCode < 500) {
      errorType = 'CLIENT_ERROR';
      errorMessage = "Please check your verification code and try again.";
      switch (verifyResponse.statusCode) {
        case 400:
          errorType = 'VALIDATION_ERROR: Invalid verification code or email';
          errorMessage = "Invalid verification code. Please check your code and try again.";
          break;
        case 401:
          errorType = 'AUTH_ERROR: Invalid or expired verification token';
          errorMessage = "Your verification link has expired. Please request a new verification email.";
          break;
        case 403:
          errorType = 'FORBIDDEN_ERROR: Email verification blocked';
          errorMessage = "Email verification is not allowed for this account.";
          break;
        case 404:
          errorType = 'NOT_FOUND_ERROR: Verification token or user not found';
          errorMessage = "Verification link is invalid or has already been used.";
          break;
        case 422:
          errorType = 'VALIDATION_ERROR: Invalid email verification data';
          try {
            final responseBody = jsonDecode(verifyResponse.body);
            if (responseBody != null && responseBody['message'] != null) {
              errorMessage = responseBody['message'];
            } else if (responseBody != null && responseBody['errors'] != null) {
              var errors = responseBody['errors'];
              if (errors is Map) {
                errorMessage = errors.values.map((e) => e?.toString() ?? 'null').join(', ');
              } else {
                errorMessage = "Please check your verification code and try again.";
              }
            } else {
              errorMessage = "Please check your verification code and try again.";
            }
          } catch (e) {
            errorMessage = "Please check your verification code and try again.";
          }
          break;
      }
    } else if (verifyResponse.statusCode >= 500) {
      errorType = 'SERVER_ERROR';
      errorMessage = "We're experiencing technical difficulties. Please try again later.";
      switch (verifyResponse.statusCode) {
        case 502:
          errorType = 'BAD_GATEWAY_ERROR: Email verification service unavailable';
          break;
        case 503:
          errorType = 'SERVICE_UNAVAILABLE_ERROR: Email verification service unavailable';
          break;
      }
    } else {
      errorType = 'UNKNOWN_EMAIL_VERIFICATION_ERROR';
      errorMessage = "Email verification failed. Please try again.";
    }
    
    loggy.error('Email Verification Failed: $errorType | Status: ${verifyResponse.statusCode}, BodyLength: ${verifyResponse.body.length}');
    throw Exception(errorMessage);
    
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
        Uri.parse('https://api.airqo.net/api/v2/users/reset-password/$token'),
        headers: {
          'Content-Type': 'application/json',
        },
        body: jsonEncode({
          'password': password,
          'confirmPassword': confirmPassword,
        }),
      );

      if (response.statusCode == 200) {
        final data = jsonDecode(response.body);
        return data['message'] ?? 'Password reset successful.';
      } else {
        loggy.error("Password update failed - Status: ${response.statusCode}, BodyLength: ${response.body.length}");
        
        String errorMessage;
        String errorType;
        
        if (response.statusCode >= 400 && response.statusCode < 500) {
          errorType = 'CLIENT_ERROR';
          errorMessage = 'Please check your password and try again.';
          switch (response.statusCode) {
            case 400:
              errorType = 'VALIDATION_ERROR: Invalid password or token';
              try {
                final errorData = jsonDecode(response.body);
                errorMessage = errorData['message'] ?? 'Password requirements not met. Please check your password and try again.';
              } catch (e) {
                errorMessage = 'Password requirements not met. Please check your password and try again.';
              }
              break;
            case 401:
              errorType = 'AUTH_ERROR: Invalid or expired reset token';
              errorMessage = 'Your password reset link has expired. Please request a new password reset.';
              break;
            case 403:
              errorType = 'FORBIDDEN_ERROR: Password reset forbidden';
              errorMessage = 'Password reset is not allowed for this account.';
              break;
            case 404:
              errorType = 'NOT_FOUND_ERROR: Reset token not found';
              errorMessage = 'Invalid reset link. Please request a new password reset.';
              break;
            case 422:
              errorType = 'VALIDATION_ERROR: Password validation failed';
              try {
                final errorData = jsonDecode(response.body);
                if (errorData['message'] != null) {
                  errorMessage = errorData['message'];
                } else if (errorData['errors'] != null) {
                  var errors = errorData['errors'];
                  if (errors is Map) {
                    errorMessage = errors.values.map((e) => e?.toString() ?? 'null').join(', ');
                  } else {
                    errorMessage = 'Password does not meet requirements. Please try a stronger password.';
                  }
                } else {
                  errorMessage = 'Password does not meet requirements. Please try a stronger password.';
                }
              } catch (e) {
                errorMessage = 'Password does not meet requirements. Please try a stronger password.';
              }
              break;
          }
        } else if (response.statusCode >= 500) {
          errorType = 'SERVER_ERROR';
          errorMessage = 'We\'re experiencing technical difficulties. Please try again later.';
          switch (response.statusCode) {
            case 502:
              errorType = 'BAD_GATEWAY_ERROR: Password update service unavailable';
              break;
            case 503:
              errorType = 'SERVICE_UNAVAILABLE_ERROR: Password update service unavailable';
              break;
          }
        } else {
          errorType = 'UNKNOWN_PASSWORD_UPDATE_ERROR';
          errorMessage = 'Failed to reset password. Please try again.';
        }
        
        loggy.error('Password Update Failed: $errorType | Status: ${response.statusCode}, BodyLength: ${response.body.length}');
        throw Exception(errorMessage);
      }
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
  Future<String> verifyResetPin(String pin, String email) async {
    if (RegExp(r'^\d{5}$').hasMatch(pin)) {
      return pin; 
    } else {
      throw Exception('Invalid PIN. Please enter a 5-digit numeric PIN.');
    }
  }
}
