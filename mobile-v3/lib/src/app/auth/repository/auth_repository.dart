import 'dart:convert';

import 'package:airqo/src/app/auth/models/input_model.dart';
import 'package:airqo/src/app/shared/repository/hive_repository.dart';
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
          "Authorization":
              "JWT eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJfaWQiOiI1ZmM3NDdkZTE0NGE1ODAwMTk0N2FhOWMiLCJsb2NhdGlvbkNvdW50Ijo1LCJvcmdhbml6YXRpb24iOiJhaXJxbyIsImxvbmdfb3JnYW5pemF0aW9uIjoiYWlycW8iLCJmaXJzdE5hbWUiOiJBaXJRbyIsImxhc3ROYW1lIjoiQWRtaW4iLCJ1c2VyTmFtZSI6ImFkbWluIiwiZW1haWwiOiJhaXJxby5hbmFseXRpY3NAZ21haWwuY29tIiwicm9sZSI6IjY0ODBhOTZkNDk1OTZhMDAxMmMzNTkyNyIsIm5ldHdvcmtzIjpbIjYzZThkMzdjODkwYTQ1MDAxYmRkZTlmMiIsIjYzZDhiNGNlMWU1YmEyMDAxMzg1NmUwYSIsIjY0NDhkMWEzNGFjZDUwMDAxMzA5OGUzMyIsIjY0MDNiMGYzYWU1MmRjMDAxYTRlODM3MyIsIjY0OGIwNjA0Mjc1NmM0MDAxMzEyNjZmMyJdLCJwcml2aWxlZ2UiOiJzdXBlciIsInByb2ZpbGVQaWN0dXJlIjoiaHR0cHM6Ly9yZXMuY2xvdWRpbmFyeS5jb20vZGJpYmp2eWhtL2ltYWdlL3VwbG9hZC92MTY3OTYwODc5NC9wcm9maWxlcy9pam9nZXB3cmlwc2p2eDJ3ZmNnZC5qcGciLCJwaG9uZU51bWJlciI6NzMzNDE4NDQ5LCJ1cGRhdGVkQXQiOiIyMDIzLTA2LTMwVDEwOjMwOjEwLjIwN1oiLCJpYXQiOjE2ODkxNjY1Mzd9.maO7Y-dhY-NMF6Ynqt_vQ4ITFSKfvDHt3OgdZ_I079w",
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
