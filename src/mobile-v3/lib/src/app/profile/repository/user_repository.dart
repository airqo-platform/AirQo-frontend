import 'dart:convert';

import 'package:airqo/src/app/auth/services/auth_helper.dart';
import 'package:airqo/src/app/profile/models/profile_response_model.dart';
import 'package:airqo/src/app/shared/repository/base_repository.dart';
import 'package:airqo/src/app/shared/repository/secure_storage_repository.dart';
import 'package:jwt_decoder/jwt_decoder.dart';
import 'package:http/http.dart' as http;
import 'package:loggy/loggy.dart';

abstract class UserRepository extends BaseRepository {
  Future<ProfileResponseModel> loadUserProfile();
  Future<ProfileResponseModel> loadUserProfileFromToken();
  Future<ProfileResponseModel> loadUserProfileFromAPI();
  Future<ProfileResponseModel> updateUserProfile({
    required String firstName,
    required String lastName,
    required String email,
    String? profilePicture,
  });
  
  Future<ProfileResponseModel> updateUserProfileFields(Map<String, dynamic> fields);
}

class UserImpl extends UserRepository with UiLoggy {
  @override
  Future<ProfileResponseModel> loadUserProfile() async {
    try {
      // Try to load from JWT token first (faster and more reliable)
      return await loadUserProfileFromToken();
    } catch (e) {
      loggy.warning("Failed to load profile from JWT token");
      
      // Fallback to API call
      final userId = await AuthHelper.getCurrentUserId();
      if (userId == null) {
        throw Exception("User ID not found - user may not be authenticated");
      }

      http.Response profileResponse =
          await createAuthenticatedGetRequest("/api/v2/users/$userId", {});

      ProfileResponseModel model =
          profileResponseModelFromJson(profileResponse.body);
      return model;
    }
  }

  @override
  Future<ProfileResponseModel> loadUserProfileFromToken() async {
    final token = await SecureStorageRepository.instance.getSecureData(SecureStorageKeys.authToken);
    
    if (token == null || token.isEmpty) {
      throw Exception("No authentication token found");
    }

    try {
      final Map<String, dynamic> decodedToken = JwtDecoder.decode(token);
      loggy.info('Loading user profile from JWT token');
      
      // Create User object from JWT payload matching your provided structure
      final user = User(
        id: decodedToken["_id"] ?? "",
        firstName: decodedToken["firstName"] ?? "",
        lastName: decodedToken["lastName"] ?? "",
        profilePicture: decodedToken["profilePicture"], // Allow null
        lastLogin: decodedToken["lastLogin"] != null 
            ? DateTime.parse(decodedToken["lastLogin"]) 
            : DateTime.now(),
        isActive: true, // Default since not in JWT
        loginCount: decodedToken["nrp"] ?? 1, // Use 'nrp' field from JWT
        userName: decodedToken["userName"] ?? decodedToken["email"] ?? "",
        email: decodedToken["email"] ?? "",
        verified: true, // Default since user is authenticated
        analyticsVersion: 1, // Default
        privilege: decodedToken["privilege"] ?? "user",
        updatedAt: decodedToken["updatedAt"] != null 
            ? DateTime.parse(decodedToken["updatedAt"]) 
            : DateTime.now(),
      );

      // Return as ProfileResponseModel format
      return ProfileResponseModel(
        success: true,
        message: "Profile loaded from JWT token",
        users: [user],
      );
    } catch (e) {
      loggy.error("Failed to parse JWT token for user profile");
      throw Exception("Failed to extract user profile from token");
    }
  }

  @override
  Future<ProfileResponseModel> loadUserProfileFromAPI() async {
    final userId = await AuthHelper.getCurrentUserId();
    if (userId == null) {
      throw Exception("User ID not found - user may not be authenticated");
    }

    loggy.info('Loading user profile from API (forced refresh)');
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
    final userId = await AuthHelper.getCurrentUserId();
    if (userId == null) {
      throw Exception("User ID not found - user may not be authenticated");
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

      // Force fresh data reload from API instead of JWT token
      return await loadUserProfileFromAPI();
    } catch (e) {
      loggy.warning("Error parsing update response");
      throw Exception("Failed to update profile");
    }
  }

  @override
  Future<ProfileResponseModel> updateUserProfileFields(Map<String, dynamic> fields) async {
    final userId = await AuthHelper.getCurrentUserId();
    if (userId == null) {
      throw Exception("User ID not found - user may not be authenticated");
    }

    loggy.info("Updating user profile with only changed fields: ${fields.keys.toList()}");

    http.Response updateResponse = await createAuthenticatedPutRequest(
      path: "/api/v2/users/$userId",
      data: fields,
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

      // Force fresh data reload from API instead of JWT token
      return await loadUserProfileFromAPI();
    } catch (e) {
      loggy.warning("Error parsing update response");
      throw Exception("Failed to update profile");
    }
  }
}
