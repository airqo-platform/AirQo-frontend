

import 'dart:convert';
import 'package:http/http.dart' as http;
import 'package:flutter_dotenv/flutter_dotenv.dart';
import 'package:loggy/loggy.dart';

abstract class UserPreferencesRepository {
  Future<Map<String, dynamic>> getUserPreferences(String userId, {String? groupId});
  Future<Map<String, dynamic>> replacePreference(Map<String, dynamic> data);
}

class UserPreferencesImpl extends UserPreferencesRepository with NetworkLoggy {
  final String baseUrl = 'https://api.airqo.net/api/v2/preferences';
  
  @override
  Future<Map<String, dynamic>> getUserPreferences(String userId, {String? groupId}) async {
    final String url = '$baseUrl/$userId${groupId != null ? "?group_id=$groupId" : ""}';
    
    try {
      final response = await http.get(
        Uri.parse(url),
        headers: {
          "Authorization": dotenv.env["AIRQO_MOBILE_TOKEN"]!,
          "Accept": "*/*",
          "Content-Type": "application/json"
        }
      );
      
      final Map<String, dynamic> data = json.decode(response.body);
      
      if (response.statusCode != 200) {
        throw Exception(data['message'] ?? 'Failed to fetch user preferences');
      }
      
      return data;
    } catch (e) {
      loggy.error('Error fetching user preferences: $e');
      rethrow;
    }
  }
  
  @override
  Future<Map<String, dynamic>> replacePreference(Map<String, dynamic> data) async {
    try {
      final response = await http.patch(
        Uri.parse('$baseUrl/replace'),
        body: jsonEncode(data),
        headers: {
          "Authorization": dotenv.env["AIRQO_MOBILE_TOKEN"]!,
          "Accept": "*/*",
          "Content-Type": "application/json"
        }
      );
      
      final Map<String, dynamic> responseData = json.decode(response.body);
      
      if (response.statusCode != 200) {
        throw Exception(responseData['message'] ?? 'Failed to replace preferences');
      }
      
      return responseData;
    } catch (e) {
      loggy.error('Error replacing user preferences: $e');
      rethrow;
    }
  }
}