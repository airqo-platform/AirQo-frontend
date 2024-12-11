import 'dart:convert';

import 'package:airqo/src/app/auth/models/input_model.dart';
import 'package:airqo/src/app/shared/repository/hive_repository.dart';
import 'package:flutter_dotenv/flutter_dotenv.dart';
import 'package:http/http.dart' as http;
import 'package:http/http.dart';

abstract class AuthRepository {
  //login function
  Future<void> loginWithEmailAndPassword(String username, String password);
  Future<void> registerWithEmailAndPassword(RegisterInputModel model);
}

class AuthImpl extends AuthRepository {
  @override
  Future<void> loginWithEmailAndPassword(
      String username, String password) async {
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
}
