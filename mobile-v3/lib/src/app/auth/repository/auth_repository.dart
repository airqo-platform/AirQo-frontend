import 'dart:convert';

import 'package:airqo/src/app/auth/models/input_model.dart';
import 'package:airqo/src/app/shared/repository/hive_repository.dart';
import 'package:flutter_dotenv/flutter_dotenv.dart';
import 'package:http/http.dart' as http;
import 'package:http/http.dart';

abstract class AuthRepository {
  //login function
  Future<String> loginWithEmailAndPassword(String username, String password);
  Future<void> registerWithEmailAndPassword(RegisterInputModel model);
  Future<String> requestPasswordReset(String email);
  Future<String> updatePassword({
    required String token,
    required String password,
    required String confirmPassword,
  });
}

class AuthImpl extends AuthRepository {
  @override
  Future<String> loginWithEmailAndPassword(String username,
      String password) async {
    Response loginResponse = await http.post(
        Uri.parse("https://api.airqo.net/api/v2/users/loginUser"),
        body: jsonEncode({"userName": username, "password": password}),
        headers: {
          "Authorization": dotenv.env["AIRQO_MOBILE_TOKEN"]!,
          "Accept": "*/*",
          "Content-Type": "application/json"
        });

    Map<String, dynamic> data = json.decode(loginResponse.body);

    if (loginResponse.statusCode != 200) {
      throw Exception(data['message']);
    } else {
      String userId = data["_id"];
      String token = data["token"];

      HiveRepository.saveData(HiveBoxNames.authBox, "token", token);
      HiveRepository.saveData(HiveBoxNames.authBox, "userId", userId);
    }

    return data["token"];
  }

  @override
  Future<void> registerWithEmailAndPassword(RegisterInputModel model) async {
    Response registerResponse = await http.post(
        Uri.parse("https://api.airqo.net/api/v2/users"),
        body: registerInputModelToJson(model),
        headers: {"Accept": "*/*", "Content-Type": "application/json"});

    Map<String, dynamic> data = json.decode(registerResponse.body);

    if (registerResponse.statusCode != 200) {
      throw Exception(data['errors']['message'] ?? data['message']);
    }
  }

  @override
  Future<String> requestPasswordReset(String email) async {
    final response = await http.post(
      Uri.parse('https://api.airqo.net/api/v2/users/reset-password-request'),
      headers: {
        'Content-Type': 'application/json',
      },
      body: jsonEncode({
        'email': email, // User's email address
      }),
    );

    if (response.statusCode == 200) {
      final data = jsonDecode(response.body);
      if (data['success'] == true) {
        return data['message'] ?? 'Password reset link sent.';
      } else {
        throw Exception(data['message'] ?? 'Failed to send password reset request.');
      }
    } else {
      final error = jsonDecode(response.body)['message'] ?? 'Something went wrong.';
      throw Exception(error);
    }
  }


  @override
  Future<String> updatePassword({
    required String token,
    required String password,
    required String confirmPassword,
  }) async {
    final response = await http.post(
      Uri.parse('https://api.airqo.net/api/v2/users/reset-password/$token'),

      headers: {
        'Content-Type': 'application/json',
      },
      body: jsonEncode({
        'password': password,
        'confirmPassword': confirmPassword, // Include confirmPassword
      }),
    );

    if (response.statusCode == 200) {
      final data = jsonDecode(response.body);
      return data['message'] ?? 'Password reset successful.';
    } else {
      final error = jsonDecode(response.body)['message'] ??
          'Failed to reset password.';
      throw Exception(error);
    }
  }
}


