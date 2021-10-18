import 'dart:async';
import 'dart:collection';
import 'dart:convert';
import 'dart:io';

import 'package:app/constants/api.dart';
import 'package:app/constants/app_constants.dart';
import 'package:app/models/alert.dart';
import 'package:app/models/feedback.dart';
import 'package:app/models/historicalMeasurement.dart';
import 'package:app/models/measurement.dart';
import 'package:app/models/place.dart';
import 'package:app/models/predict.dart';
import 'package:app/models/site.dart';
import 'package:app/models/story.dart';
import 'package:app/models/suggestion.dart';
import 'package:app/utils/dialogs.dart';
import 'package:flutter/foundation.dart';
import 'package:flutter/material.dart';
import 'package:http/http.dart' as http;
import 'package:intl/intl.dart';

class AirqoApiClient {
  final BuildContext context;

  AirqoApiClient(this.context);

  Future<List<Predict>> fetchForecast(int channelId) async {
    try {
      var startTime =
          DateTime.now().add(const Duration(hours: 1)).millisecondsSinceEpoch /
              1000;

      var url = '${AirQoUrls().forecastV2}$channelId/${startTime.round()}';

      final responseBody = await _performGetRequestV2(<String, dynamic>{}, url);

      if (responseBody != null) {
        return compute(Predict.parsePredictions, responseBody['predictions']);
      } else {
        print('Predictions are null');
        return <Predict>[];
      }
    } on Error catch (e) {
      print('Predictions error: $e');
    }

    return <Predict>[];
  }

  Future<List<HistoricalMeasurement>> fetchHistoricalMeasurements() async {
    try {
      var startTimeUtc = DateTime.now().toUtc().add(const Duration(hours: -24));
      var date = DateFormat('yyyy-MM-dd').format(startTimeUtc);
      var time = '${startTimeUtc.hour}';

      if ('$time'.length == 1) {
        time = '0$time';
      }
      var startTime = '${date}T$time:00:00Z';

      var queryParams = <String, dynamic>{}
        ..putIfAbsent('startTime', () => startTime)
        ..putIfAbsent('frequency', () => 'hourly')
        ..putIfAbsent('recent', () => 'no')
        ..putIfAbsent('external', () => 'no')
        ..putIfAbsent('metadata', () => 'site_id')
        ..putIfAbsent('tenant', () => 'airqo');

      final responseBody =
          await _performGetRequest(queryParams, AirQoUrls().measurements);

      if (responseBody != null) {
        return compute(HistoricalMeasurement.parseMeasurements, responseBody);
      } else {
        print('Historical Measurements are null');
        return <HistoricalMeasurement>[];
      }
    } on Error catch (e) {
      print('Get Historical measurements error: $e');
    }

    return <HistoricalMeasurement>[];
  }

  Future<List<Measurement>> fetchLatestMeasurements() async {
    try {
      var queryParams = <String, dynamic>{}
        ..putIfAbsent('recent', () => 'yes')
        ..putIfAbsent('metadata', () => 'site_id')
        ..putIfAbsent('external', () => 'no')
        ..putIfAbsent('frequency', () => 'hourly')
        ..putIfAbsent('tenant', () => 'airqo');

      final responseBody =
          await _performGetRequest(queryParams, AirQoUrls().measurements);
      if (responseBody != null) {
        return compute(Measurement.parseMeasurements, responseBody);
      } else {
        // print('Measurements are null');
        return <Measurement>[];
      }
    } on Error catch (e) {
      print('Get Latest measurements error: $e');
    }

    return <Measurement>[];
  }

  Future<List<Story>> fetchLatestStories() async {
    try {
      final responseBody = await _performGetRequest({}, AirQoUrls().stories);

      if (responseBody != null) {
        return compute(Story.parseStories, responseBody);
      } else {
        return <Story>[];
      }
    } on Error catch (e) {
      print('Get Latest stories error: $e');
    }

    return <Story>[];
  }

  Future<List<HistoricalMeasurement>> fetchSiteDayMeasurements(
      Site site, DateTime dateTime) async {
    try {
      var nowUtc = dateTime.toUtc();
      var date = DateFormat('yyyy-MM-dd').format(nowUtc);
      var startTime = '${date}T00:00:00Z';
      var endTime = '${date}T11:59:00Z';

      var queryParams = <String, dynamic>{}
        ..putIfAbsent('site_id', () => site.id)
        ..putIfAbsent('startTime', () => startTime)
        ..putIfAbsent('endTime', () => endTime)
        ..putIfAbsent('frequency', () => 'hourly')
        ..putIfAbsent('metadata', () => 'site_id')
        ..putIfAbsent('external', () => 'no')
        ..putIfAbsent('recent', () => 'no')
        ..putIfAbsent('tenant', () => 'airqo');

      final responseBody =
          await _performGetRequest(queryParams, AirQoUrls().measurements);

      if (responseBody != null) {
        return compute(HistoricalMeasurement.parseMeasurements, responseBody);
      } else {
        // print('Measurements are null');
        return <HistoricalMeasurement>[];
      }
    } on Error {
      // print('Get site historical measurements error: $e');
    }

    return <HistoricalMeasurement>[];
  }

  Future<List<HistoricalMeasurement>> fetchSiteHistoricalMeasurements(
      Site site) async {
    try {
      var nowUtc = DateTime.now().toUtc();
      var startTimeUtc = nowUtc.subtract(const Duration(hours: 24));

      var time = '${startTimeUtc.hour}';
      if ('$time'.length == 1) {
        time = '0$time';
      }

      var date = DateFormat('yyyy-MM-dd').format(startTimeUtc);
      var startTime = '${date}T$time:00:00Z';

      var queryParams = <String, dynamic>{}
        ..putIfAbsent('site_id', () => site.id)
        ..putIfAbsent('startTime', () => startTime)
        ..putIfAbsent('frequency', () => 'hourly')
        ..putIfAbsent('metadata', () => 'site_id')
        ..putIfAbsent('external', () => 'no')
        ..putIfAbsent('recent', () => 'no')
        ..putIfAbsent('tenant', () => 'airqo');

      final responseBody =
          await _performGetRequest(queryParams, AirQoUrls().measurements);

      if (responseBody != null) {
        return compute(HistoricalMeasurement.parseMeasurements, responseBody);
      } else {
        // print('Measurements are null');
        return <HistoricalMeasurement>[];
      }
    } on Error {
      // print('Get site historical measurements error: $e');
    }

    return <HistoricalMeasurement>[];
  }

  Future<Measurement> fetchSiteMeasurements(Site site) async {
    try {
      var queryParams = <String, dynamic>{}
        ..putIfAbsent('recent', () => 'yes')
        ..putIfAbsent('site_id', () => site.id)
        ..putIfAbsent('frequency', () => 'hourly')
        ..putIfAbsent('external', () => 'no')
        ..putIfAbsent('metadata', () => 'site_id')
        ..putIfAbsent('tenant', () => 'airqo');

      final responseBody =
          await _performGetRequest(queryParams, AirQoUrls().measurements);

      if (responseBody != null) {
        return compute(Measurement.parseMeasurement, responseBody);
      } else {
        // print('Site latest measurements are null');
        throw Exception('site does not exist');
      }
    } on Error {
      // print('Get site latest measurements error: $e');
      throw Exception('site does not exist');
    }
  }

  Future<String> imageUpload(String file, String? type, String name) async {
    type ??= 'jpeg';

    var uploadStr = 'data:image/$type;base64,$file';
    try {
      var body = {
        'file': uploadStr,
        'upload_preset': AppConfig.imageUploadPreset,
        'public_id': name,
      };
      // 'api_key': AppConfig.imageUploadApiKey

      final response = await http.post(
          Uri.parse('${AirQoUrls().imageUploadUrl}'),
          headers: {'Content-Type': 'application/json'},
          body: json.encode(body));

      print(response.statusCode);
      if (response.statusCode == 200) {
        var body = json.decode(response.body);
        return body['url'];
      } else {
        print('Unexpected status code ${response.statusCode}:'
            ' ${response.reasonPhrase}');
        print('Body ${response.body}:');
        print('uri: ${AirQoUrls().imageUploadUrl}');
        throw Exception('Error');
      }
    } on SocketException {
      await showSnackBar(context, ErrorMessages.socketException);
      throw Exception('Error');
    } on TimeoutException {
      await showSnackBar(context, ErrorMessages.timeoutException);
      throw Exception('Error');
    } on Error catch (e) {
      print('Image upload error: $e');
      throw Exception('Error');
    }
  }

  Future<bool> saveAlert(Alert alert) async {
    try {
      var body = alert.toJson();
      final response = await _performPostRequest(
          <String, dynamic>{}, AirQoUrls().alerts, jsonEncode(body));
      return response;
    } on Error catch (e) {
      print('Save alert error: $e');
      return false;
    }
  }

  Future<bool> sendFeedback(UserFeedback feedback) async {
    try {
      var body = {
        'text': {'type': 'mrkdwn', 'text': '@channel, Mobile App feedback'},
        'attachments': [
          {
            'fallback': 'Mobile App feedback',
            'color': '#3067e2',
            'title': 'Mobile App feedback',
            'fields': [
              {'title': 'Message', 'value': '${feedback.feedback}'},
            ],
            'footer': 'AirQo Mobile App'
          }
        ]
      };

      final response = await _performPostRequest(
          <String, dynamic>{}, AirQoUrls().feedbackUrl, jsonEncode(body));
      return response;
    } on Error catch (e) {
      print('Send Feedback: $e');
      return false;
    }
  }

  Future<dynamic> _performGetRequest(
      Map<String, dynamic> queryParams, String url) async {
    try {
      if (queryParams.isNotEmpty) {
        url = '$url?';
        queryParams.forEach((key, value) {
          if (queryParams.keys.elementAt(0).compareTo(key) == 0) {
            url = '$url$key=$value';
          } else {
            url = '$url&$key=$value';
          }
        });
      }

      Map<String, String> headers = HashMap()
        ..putIfAbsent('Authorization', () => 'JWT ${AppConfig.airQoApiKey}');

      final response = await http.get(Uri.parse(url), headers: headers);

      if (response.statusCode == 200) {
        return json.decode(response.body);
      } else {
        print(response.statusCode);
        print('Unexpected status code ${response.statusCode}:'
            ' ${response.reasonPhrase}');
        // print('Body ${response.body}:');
        // print('uri: $url');
        return null;
      }
    } on SocketException {
      await showSnackBar(context, ErrorMessages.socketException);
    } on TimeoutException {
      await showSnackBar(context, ErrorMessages.timeoutException);
    } on Error {
      await showSnackBar(context, ErrorMessages.appException);
    }

    return null;
  }

  Future<dynamic> _performGetRequestV2(
      Map<String, dynamic> queryParams, String url) async {
    try {
      if (queryParams.isNotEmpty) {
        url = '$url?';
        queryParams.forEach((key, value) {
          if (queryParams.keys.elementAt(0).compareTo(key) == 0) {
            url = '$url$key=$value';
          } else {
            url = '$url&$key=$value';
          }
        });
      }

      Map<String, String> headers = HashMap()
        ..putIfAbsent('Authorization', () => 'JWT ${AppConfig.airQoApiKey}');

      final response = await http.get(Uri.parse(url), headers: headers);
      return json.decode(response.body);
    } on SocketException {
      await showSnackBar(context, ErrorMessages.socketException);
    } on TimeoutException {
      await showSnackBar(context, ErrorMessages.timeoutException);
    } on Error {
      await showSnackBar(context, ErrorMessages.appException);
    }

    return null;
  }

  Future<bool> _performPostRequest(
      Map<String, dynamic> queryParams, String url, dynamic body) async {
    try {
      if (queryParams.isNotEmpty) {
        url = '$url?';
        queryParams.forEach((key, value) {
          if (queryParams.keys.elementAt(0).compareTo(key) == 0) {
            url = '$url$key=$value';
          } else {
            url = '$url&$key=$value';
          }
        });
      }

      Map<String, String> headers = HashMap()
        ..putIfAbsent('Content-Type', () => 'application/json');

      final response =
          await http.post(Uri.parse(url), headers: headers, body: body);

      if (response.statusCode == 200) {
        return true;
      } else {
        print(response.statusCode);
        print('Unexpected status code ${response.statusCode}:'
            ' ${response.reasonPhrase}');
        return false;
      }
    } on SocketException {
      await showSnackBar(context, ErrorMessages.socketException);
      return false;
    } on TimeoutException {
      await showSnackBar(context, ErrorMessages.timeoutException);
      return false;
    } on Error {
      await showSnackBar(context, ErrorMessages.appException);
      return false;
    }
  }
}

class SearchApi {
  final sessionToken;
  final apiKey = AppConfig.googleApiKey;

  SearchApi(this.sessionToken);

  Future<List<Suggestion>> fetchSuggestions(String input) async {
    try {
      var queryParams = <String, dynamic>{}
        ..putIfAbsent('input', () => input)
        ..putIfAbsent('components', () => 'country:ug')
        ..putIfAbsent('key', () => apiKey)
        ..putIfAbsent('sessiontoken', () => sessionToken);

      final responseBody =
          await _performGetRequest(queryParams, AirQoUrls().searchSuggestions);

      if (responseBody['status'] == 'OK') {
        return compute(Suggestion.parseSuggestions, responseBody);
      }
      if (responseBody['status'] == 'ZERO_RESULTS') {
        return [];
      }

      throw Exception(responseBody['error_message']);
    } on SocketException {
      throw Exception(ErrorMessages.socketException);
    } on TimeoutException {
      throw Exception(ErrorMessages.timeoutException);
    } on Error {
      throw Exception('Cannot get suggestions, please try again later');
    }
  }

  Future<Place> getPlaceDetails(String placeId) async {
    try {
      var queryParams = <String, dynamic>{}
        ..putIfAbsent('place_id', () => placeId)
        ..putIfAbsent('fields', () => 'name,geometry')
        ..putIfAbsent('key', () => apiKey)
        ..putIfAbsent('sessiontoken', () => sessionToken);

      final responseBody =
          await _performGetRequest(queryParams, AirQoUrls().placeSearchDetails);

      var place = Place.fromJson(responseBody['result']);

      return place;
    } on Error catch (e) {
      print('Getting place details : $e');
      throw Exception('$e');
    }
  }

  Future<dynamic> _performGetRequest(
      Map<String, dynamic> queryParams, String url) async {
    try {
      if (queryParams.isNotEmpty) {
        url = '$url?';
        queryParams.forEach((key, value) {
          if (queryParams.keys.elementAt(0).compareTo(key) == 0) {
            url = '$url$key=$value';
          } else {
            url = '$url&$key=$value';
          }
        });
      }

      final response = await http.get(Uri.parse(url));

      if (response.statusCode == 200) {
        return json.decode(response.body);
      } else {
        print(response.statusCode);
        print('Unexpected status code ${response.statusCode}:'
            ' ${response.reasonPhrase}');
        // print('Body ${response.body}:');
        // print('uri: $url');
        return null;
      }
    } on SocketException {
      throw Exception(ErrorMessages.timeoutException);
    } on TimeoutException {
      throw Exception(ErrorMessages.timeoutException);
    } on Error {
      throw Exception('Cannot get details, please try again later');
    }
  }
}
