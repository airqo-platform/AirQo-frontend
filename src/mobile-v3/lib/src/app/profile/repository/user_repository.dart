import 'dart:convert';

import 'package:airqo/src/app/profile/models/profile_response_model.dart';
import 'package:airqo/src/app/shared/repository/base_repository.dart';
import 'package:airqo/src/app/shared/repository/hive_repository.dart';
import 'package:http/http.dart' as http;
import 'package:loggy/loggy.dart';

abstract class UserRepository extends BaseRepository {
  Future<ProfileResponseModel> loadUserProfile();
  Future<ProfileResponseModel> updateUserProfile({
    required String firstName,
    required String lastName,
    required String email,
    String? profilePicture,
  });
}

class UserImpl extends UserRepository with UiLoggy {
  @override
  Future<ProfileResponseModel> loadUserProfile() async {
    final userId = await HiveRepository.getData("userId", HiveBoxNames.authBox);
    if (userId == null) {
      throw Exception("User ID not found");
    }

    http.Response profileResponse =
        await createAuthenticatedGetRequest("/api/v2/users/$userId", {});

    ProfileResponseModel model =
        profileResponseModelFromJson(profileResponse.body);
    return model;
  }

  @override
  Future<ProfileResponseModel> updateUserProfile({
    required String firstName,
    required String lastName,
    required String email,
    String? profilePicture,
  }) async {
    final userId = await HiveRepository.getData("userId", HiveBoxNames.authBox);
    if (userId == null) {
      throw Exception("User ID not found");
    }

    // Prepare the request body with the updated fields
    final Map<String, dynamic> requestBody = {
      "firstName": firstName,
      "lastName": lastName,
      "email": email,
    };

    if (profilePicture != null) {
      requestBody["profilePicture"] = profilePicture;
    }

    http.Response updateResponse = await createAuthenticatedPutRequest(
      path: "/api/v2/users/$userId",
      data: requestBody,
    );


    try {
      final responseBody = json.decode(updateResponse.body);
      loggy.info("Response structure: ${responseBody.keys}");

      responseBody.forEach((key, value) {
        loggy.debug("Key: $key, Value: $value, Type: ${value?.runtimeType}");
      });

      if (responseBody.containsKey('user') && responseBody['user'] != null) {
        loggy.debug("User object keys: ${(responseBody['user'] as Map).keys}");
      }

      return await loadUserProfile();
    } catch (e) {
      loggy.warning("Error parsing update response: $e");
      throw Exception("Failed to update profile: $e");
    }
  }
}
