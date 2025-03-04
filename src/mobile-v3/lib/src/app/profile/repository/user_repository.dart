import 'dart:convert';
import 'package:airqo/src/app/profile/models/profile_response_model.dart';
import 'package:airqo/src/app/shared/repository/base_repository.dart';
import 'package:airqo/src/app/shared/repository/base_repository_extension.dart';
import 'package:airqo/src/app/shared/repository/hive_repository.dart';
import 'package:http/http.dart' as http;

abstract class UserRepository extends BaseRepository {
  Future<ProfileResponseModel> loadUserProfile();
  Future<ProfileResponseModel> updateUserProfile({
    required String firstName,
    required String lastName,
    required String email,
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
        await createAuthenticatedGetRequest("/api/v2/users/${userId}", {});
        
    ProfileResponseModel model =
        profileResponseModelFromJson(profileResponse.body);
    return model;
  }

  @override
  Future<ProfileResponseModel> updateUserProfile({
    required String firstName,
    required String lastName,
    required String email,
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
    
    // The extension should handle error responses
    http.Response updateResponse = await createAuthenticatedPutRequest(
      data: requestBody,
      path: "/api/v2/users/$userId", 
    );
    
    // Parse the updated user data
    ProfileResponseModel model =
        profileResponseModelFromJson(updateResponse.body);
    
    return model;
  }
}