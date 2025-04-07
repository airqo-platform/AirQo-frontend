import 'dart:convert';

import 'package:airqo/src/app/profile/models/profile_response_model.dart';
import 'package:airqo/src/app/shared/repository/base_repository.dart';
import 'package:airqo/src/app/shared/repository/hive_repository.dart';
import 'package:http/http.dart' as http;

abstract class UserRepository extends BaseRepository {
  Future<ProfileResponseModel> loadUserProfile();
  Future<ProfileResponseModel> updateUserProfile({
    required String firstName,
    required String lastName,
    required String email,
    String? profilePicture,
  });
}

class UserImpl extends UserRepository {
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
      "profilePicture": profilePicture,
    };

    if (profilePicture != null) {
      requestBody["profilePicture"] = profilePicture;
    }

    http.Response updateResponse = await createAuthenticatedPutRequest(
      path: "/api/v2/users/$userId",
      data: requestBody,
    );

    print("https://api.airqo.net/api/v2/users/$userId");
    print(updateResponse.statusCode);

    // Print the full response body for debugging
    print("Full response body: ${updateResponse.body}");

    try {
      final responseBody = json.decode(updateResponse.body);
      print("Response structure: ${responseBody.keys}");

      // Print details of each key to identify null values
      responseBody.forEach((key, value) {
        print("Key: $key, Value: $value, Type: ${value?.runtimeType}");
      });

      // Print user object structure if it exists
      if (responseBody.containsKey('user') && responseBody['user'] != null) {
        print("User object keys: ${(responseBody['user'] as Map).keys}");
      }

      // Try a simpler approach - just reload the profile
      return await loadUserProfile();
    } catch (e) {
      print("Error parsing update response: $e");
      throw Exception("Failed to update profile: $e");
    }
  }
}
