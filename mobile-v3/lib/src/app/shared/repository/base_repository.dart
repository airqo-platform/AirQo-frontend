import 'dart:convert';
import 'package:airqo/src/app/shared/repository/hive_repository.dart';
import 'package:airqo/src/meta/utils/api_utils.dart';
import 'package:http/http.dart' as http;
import 'package:http/http.dart';

class BaseRepository {
  Future<Response> createPostRequest(
      {required String path, dynamic data}) async {
    String? token = await HiveRepository.getData("token", HiveBoxNames.authBox);

    String url = ApiUtils.baseUrl + path;

    print(url);

    Response response = await http.post(Uri.parse(url),
        body: json.encode(data),
        headers: {
          "Authorization": "${token}",
          "Accept": "*/*",
          "contentType": "application/json"
        });

    print(response.statusCode);

    if (response.statusCode != 200) {
      throw new Exception(json.decode(response.body)['message']);
    }
    return response;
  }

  Future<Response> createGetRequest(
      String path, Map<String, String> queryParams) async {
    // String token = await HiveRepository.getData("token", HiveBoxNames.authBox);

    String url = ApiUtils.baseUrl + path;

    Response response = await http
        .get(Uri.parse(url).replace(queryParameters: queryParams), headers: {
      "Accept": "*/*",
      "Content-Type": "application/json",
    });

    print(response.statusCode);

    if (response.statusCode != 200) {
      throw new Exception(json.decode(response.body)['message']);
    }

    return response;
  }

  Future<Response> createAuthenticatedGetRequest(
      String path, Map<String, String> queryParams) async {
    String token =
        (await HiveRepository.getData("token", HiveBoxNames.authBox))!;

    print(token);

    String url = ApiUtils.baseUrl + path;

    Response response = await http
        .get(Uri.parse(url).replace(queryParameters: queryParams), headers: {
      "Accept": "*/*",
      "Authorization": "${token}",
      "Content-Type": "application/json",
    });

    if (response.statusCode != 200) {
      throw new Exception(json.decode(response.body)['message']);
    }

    return response;
  }
}
