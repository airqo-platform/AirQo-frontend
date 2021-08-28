import 'dart:async';
import 'dart:collection';
import 'dart:convert';
import 'dart:io';

import 'package:app/config/env.dart';
import 'package:app/constants/api.dart';
import 'package:app/constants/app_constants.dart';
import 'package:app/models/device.dart';
import 'package:app/models/feedback.dart';
import 'package:app/models/historicalMeasurement.dart';
import 'package:app/models/measurement.dart';
import 'package:app/models/place.dart';
import 'package:app/models/predict.dart';
import 'package:app/models/suggestion.dart';
import 'package:app/utils/dialogs.dart';
import 'package:flutter/foundation.dart';
import 'package:flutter/material.dart';
import 'package:http/http.dart' as http;
import 'package:intl/intl.dart';

class AirqoApiClient {
  final BuildContext context;

  AirqoApiClient(this.context);

  Future<List<HistoricalMeasurement>> fetchDeviceHistoricalMeasurements(
      Device device) async {
    try {
      var nowUtc = DateTime.now().toUtc();
      var startTimeUtc = nowUtc.subtract(const Duration(hours: 48));

      var time = '${startTimeUtc.hour}';
      if ('$time'.length == 1) {
        time = '0$time';
      }

      var date = DateFormat('yyyy-MM-dd').format(startTimeUtc);
      var startTime = '${date}T$time:00:00Z';
      var endTime = '${DateFormat('yyyy-MM-dd').format(nowUtc)}T$time:00:00Z';

      var queryParams = <String, dynamic>{}
        ..putIfAbsent('device', () => device.name)
        ..putIfAbsent('startTime', () => startTime)
        ..putIfAbsent('endTime', () => endTime)
        ..putIfAbsent('frequency', () => 'hourly')
        ..putIfAbsent('metadata', () => 'device')
        ..putIfAbsent('recent', () => 'no')
        ..putIfAbsent('tenant', () => 'airqo');

      final responseBody =
          await _performGetRequest(queryParams, AirQoUrls().measurements);

      if (responseBody != null) {
        return compute(HistoricalMeasurement.parseMeasurements, responseBody);
      } else {
        print('Measurements are null');
        return <HistoricalMeasurement>[];
      }
    } on Error catch (e) {
      print('Get Device historical measurements error: $e');
    }

    return <HistoricalMeasurement>[];
  }

  Future<Measurement> fetchDeviceMeasurements(Device device) async {
    try {
      var queryParams = <String, dynamic>{}
        ..putIfAbsent('recent', () => 'yes')
        ..putIfAbsent('device', () => device.name)
        ..putIfAbsent('frequency', () => 'hourly')
        ..putIfAbsent('metadata', () => 'device')
        ..putIfAbsent('tenant', () => 'airqo');

      final responseBody =
          await _performGetRequest(queryParams, AirQoUrls().measurements);

      if (responseBody != null) {
        return compute(Measurement.parseMeasurement, responseBody);
      } else {
        print('Device latest measurements are null');
        throw Exception('device does not exist');
      }
    } on Error catch (e) {
      print('Get device latest measurements error: $e');
      throw Exception('device does not exist');
    }
  }

  Future<List<Device>> fetchDevices() async {
    try {
      var queryParams = <String, dynamic>{}
        ..putIfAbsent('active', () => 'yes')
        ..putIfAbsent('tenant', () => 'airqo');

      final responseBody =
          await _performGetRequest(queryParams, AirQoUrls().devices);

      if (responseBody != null) {
        return compute(Device.parseDevices, responseBody);
      } else {
        print('Devices are null');
        return <Device>[];
      }
    } on Error catch (e) {
      print('Get devices error: $e');
    }

    return <Device>[];
  }

  Future<List<Predict>> fetchForecast(
      String latitude, String longitude, String dateTime) async {
    try {
      var body = {
        'selected_datetime': dateTime,
        'latitude': latitude,
        'longitude': longitude
      };

      final response = await http.post(Uri.parse('${AirQoUrls().forecast}'),
          headers: {'Content-Type': 'application/json'},
          body: json.encode(body));

      print(response.statusCode);
      if (response.statusCode == 200) {
        var jsonBody =
            json.decode(response.body)['formatted_results']['predictions'];

        return compute(Predict.parsePredictions, jsonBody);
      } else {
        print('Unexpected status code ${response.statusCode}:'
            ' ${response.reasonPhrase}');
        print('Body ${response.body}:');
        print('uri: ${AirQoUrls().forecast}');
        return <Predict>[];
      }
    } on SocketException {
      await showSnackBar(context, ErrorMessages().socketException);
    } on TimeoutException {
      await showSnackBar(context, ErrorMessages().timeoutException);
    } on Error catch (e) {
      print('Get Forecast error: $e');
    }

    return <Predict>[];
  }

  Future<List<HistoricalMeasurement>> fetchHistoricalMeasurements() async {
    try {
      var startTimeUtc = DateTime.now().toUtc().add(const Duration(hours: -48));
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
        ..putIfAbsent('metadata', () => 'device')
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

  Future<List<Measurement>> fetchLatestDevicesMeasurements(
      List<String> devices) async {
    try {
      if (devices.isEmpty) {
        return <Measurement>[];
      }

      var devicesStr = '';
      for (var device in devices) {
        devicesStr = '$devicesStr,$device,';
      }

      devicesStr = devicesStr.substring(1, devicesStr.length - 1);

      var queryParams = <String, dynamic>{}
        ..putIfAbsent('device', () => devicesStr)
        ..putIfAbsent('recent', () => 'yes')
        ..putIfAbsent('metadata', () => 'device')
        ..putIfAbsent('frequency', () => 'hourly')
        ..putIfAbsent('tenant', () => 'airqo');

      final responseBody =
          await _performGetRequest(queryParams, AirQoUrls().measurements);

      if (responseBody != null) {
        return compute(Measurement.parseMeasurements, responseBody);
      } else {
        print('Latest devices Measurements are null');
        return <Measurement>[];
      }
    } on Error catch (e) {
      print('Get Latest measurements for specific devices error: $e');
    }

    return <Measurement>[];
  }

  Future<List<Measurement>> fetchLatestMeasurements() async {
    try {
      var queryParams = <String, dynamic>{}
        ..putIfAbsent('recent', () => 'yes')
        ..putIfAbsent('metadata', () => 'device')
        ..putIfAbsent('frequency', () => 'hourly')
        ..putIfAbsent('tenant', () => 'airqo');

      final responseBody =
          await _performGetRequest(queryParams, AirQoUrls().measurements);

      if (responseBody != null) {
        return compute(Measurement.parseMeasurements, responseBody);
      } else {
        print('Measurements are null');
        return <Measurement>[];
      }
    } on Error catch (e) {
      print('Get Latest measurements error: $e');
    }

    return <Measurement>[];
  }

  Future<List<Device>> getDevicesByCoordinates(
      double latitude, double longitude) async {
    try {
      var queryParams = <String, dynamic>{}
        ..putIfAbsent('radius', () => '$defaultRadius')
        ..putIfAbsent('tenant', () => 'airqo')
        ..putIfAbsent('longitude', () => longitude)
        ..putIfAbsent('latitude', () => latitude);

      final responseBody = await _performGetRequest(
          queryParams, AirQoUrls().devicesByGeoCoordinates);

      if (responseBody != null) {
        return compute(Device.parseDevicesV2, responseBody);
      } else {
        print('Devices are null');
        return <Device>[];
      }
    } on Error catch (e) {
      print('Get devices error: $e');
    }

    return <Device>[];
  }

  Future<String> imageUpload(String file, String? type) async {
    type ??= 'jpeg';

    var uploadStr = 'data:image/$type;base64,$file';
    try {
      var body = {'file': uploadStr, 'upload_preset': 'mobile_uploads'};

      //   "api_key": cloudinaryApiKey,
      // "timestamp": DateTime.now().microsecondsSinceEpoch,
      // "signature": "",

      // print(body);

      final response = await http.post(
          Uri.parse('${AirQoUrls().cloundinaryUrl}'),
          headers: {'Content-Type': 'application/json'},
          body: json.encode(body));

      print(response.statusCode);
      if (response.statusCode == 200) {
        print(response.body);
        return response.body.toString();
      } else {
        print('Unexpected status code ${response.statusCode}:'
            ' ${response.reasonPhrase}');
        print('Body ${response.body}:');
        print('uri: ${AirQoUrls().cloundinaryUrl}');
        throw Exception('Error');
      }
    } on SocketException {
      await showSnackBar(context, ErrorMessages().socketException);
      throw Exception('Error');
    } on TimeoutException {
      await showSnackBar(context, ErrorMessages().timeoutException);
      throw Exception('Error');
    } on Error catch (e) {
      print('Get Forecast error: $e');
      throw Exception('Error');
      // var message = 'Forecast data is not available, try again later';
      // await showSnackBar(context, message);
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
              {'title': 'Feedback', 'value': '${feedback.feedback}'},
            ],
            'footer': 'AirQo Mobile App'
          }
        ]
      };

      final response = await _performPostRequest(
          <String, dynamic>{}, slackWebhook, jsonEncode(body));
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
        ..putIfAbsent('Authorization', () => 'JWT $airQoApiKey');
      print(url);

      final response = await http.get(Uri.parse(url), headers: headers);

      if (response.statusCode == 200) {
        print(response.body);
        return json.decode(response.body);
      } else {
        print(response.statusCode);
        print('Unexpected status code ${response.statusCode}:'
            ' ${response.reasonPhrase}');
        print('Body ${response.body}:');
        print('uri: $url');
        return null;
      }
    } on SocketException {
      await showSnackBar(context, ErrorMessages().socketException);
    } on TimeoutException {
      await showSnackBar(context, ErrorMessages().timeoutException);
    } on Error catch (e) {
      await showSnackBar(context, ErrorMessages().appException);
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

      print(body);
      print(url);
      final response =
          await http.post(Uri.parse(url), headers: headers, body: body);

      if (response.statusCode == 200) {
        return true;
      } else {
        print(response.statusCode);
        print('Unexpected status code ${response.statusCode}:'
            ' ${response.reasonPhrase}');
        print('Body ${response.body}:');
        print('uri: $url');
        return false;
      }
    } on SocketException {
      await showSnackBar(context, ErrorMessages().socketException);
      return false;
    } on TimeoutException {
      await showSnackBar(context, ErrorMessages().timeoutException);
      return false;
    } on Error catch (e) {
      print(e);
      await showSnackBar(context, ErrorMessages().appException);
      return false;
    }
  }
}

class GoogleSearchProvider {
  static final String androidKey = googleApiKey;

  static final String iosKey = iosApiKey;
  final sessionToken;
  final apiKey = Platform.isAndroid ? androidKey : iosKey;

  GoogleSearchProvider(this.sessionToken);

  Future<List<Suggestion>> fetchSuggestions(String input) async {
    final request =
        'https://maps.googleapis.com/maps/api/place/autocomplete/json?'
        'input=$input&'
        'components=country:ug&'
        'key=$apiKey&'
        'sessiontoken=$sessionToken';

    try {
      final response = await http.get(Uri.parse(request));

      if (response.statusCode == 200) {
        final result = json.decode(response.body);

        if (result['status'] == 'OK') {
          List<Suggestion> suggestions = result['predictions']
              .map<Suggestion>((p) => Suggestion.fromJson(p))
              .toList();

          return suggestions;
        }
        if (result['status'] == 'ZERO_RESULTS') {
          return [];
        }
        throw Exception(result['error_message']);
      } else {
        throw Exception('Failed to perform search, please try again later');
      }
    } on SocketException {
      throw Exception(ErrorMessages().socketException);
    } on TimeoutException {
      throw Exception(ErrorMessages().timeoutException);
    } on Error catch (e) {
      throw Exception('Cannot get locations, please try again later');
    }
  }

  Future<Place> getPlaceDetailFromId(String placeId) async {
    final request = 'https://maps.googleapis.com/maps/api/place/details/json?'
        'place_id=$placeId&'
        'fields=name,geometry&'
        'key=$apiKey&'
        'sessiontoken=$sessionToken';

    try {
      final response = await http.get(Uri.parse(request));

      if (response.statusCode != 200) {
        throw Exception('Failed to get details, please try again later');
      }

      final result = json.decode(response.body);

      if (result['status'] != 'OK') {
        throw Exception('Failed to get details');
      }

      var place = Place.fromJson(result['result']);

      return place;
    } on SocketException {
      throw Exception(ErrorMessages().socketException);
    } on TimeoutException {
      throw Exception(ErrorMessages().timeoutException);
    } on Error catch (e) {
      print(e);
      throw Exception('Cannot get details, please try again later');
    }
  }
}
