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

  Future<Device> fetchDevice(String name) async {
    try {
      final response = await http.get(Uri.parse('$getDevice$name'));

      print(response.statusCode);
      if (response.statusCode == 200) {
        print(response.body);

        var devices = json
            .decode(response.body)['devices']
            .map<Device>((d) => Device.fromJson(d))
            .toList();

        return devices.first;
      } else {
        print('Unexpected status code ${response.statusCode}:'
            ' ${response.reasonPhrase}');
        throw HttpException(
            'Unexpected status code ${response.statusCode}:'
            ' ${response.reasonPhrase}',
            uri: Uri.parse(getDevices));
      }
    } on SocketException {
      await showSnackBar(context, ErrorMessages().socketException);
    } on TimeoutException {
      await showSnackBar(context, ErrorMessages().timeoutException);
    } on Error catch (e) {
      print('Get Devices error: $e');
      var message = 'Location data is not available, please try again later';
      await showSnackBar(context, message);
    }

    throw Exception('device doesn\'t exist');
  }

  Future<Measurement> fetchDeviceMeasurements(Device device) async {
    try {
      var queryParams = <String, dynamic>{}
        ..putIfAbsent('recent', () => 'yes')
        ..putIfAbsent('device', () => device.name)
        ..putIfAbsent('frequency', () => 'hourly')
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

    // try {
    //   var url = '$getLatestDeviceEvents${device.name}';
    //   print(url);
    //   final response = await http.get(Uri.parse(url));
    //
    //   print(response.statusCode);
    //   if (response.statusCode == 200) {
    //     print(response.body);
    //
    //     var readings = Measurement.mapFromApi(json.decode(response.body));
    //     readings['deviceDetails'] = device.toJson();
    //     readings['channelID'] = device.name;
    //
    //     var measurement = Measurement.fromJson(readings);
    //
    //     return measurement;
    //   } else {
    //     print('Unexpected status code ${response.statusCode}:'
    //         ' ${response.reasonPhrase}');
    //     throw HttpException(
    //         'Unexpected status code ${response.statusCode}:'
    //         ' ${response.reasonPhrase}',
    //         uri: Uri.parse(url));
    //   }
    // } on SocketException {
    //   await showSnackBar(context, ErrorMessages().socketException);
    // } on TimeoutException {
    //   await showSnackBar(context, ErrorMessages().timeoutException);
    // } on Error catch (e) {
    //   print('Get Devices error: $e');
    //   var message = 'Couldn\'t get location data, please try again later';
    //   await showSnackBar(context, message);
    // }
    // throw Exception('device doesn\'t exist');
  }

  Future<List<Device>> fetchDevices() async {
    try {
      final response = await http.get(Uri.parse(getDevices));

      print(response.statusCode);
      if (response.statusCode == 200) {
        print(response.body);

        // List<Device> devices = json.decode(response.body)['devices']
        //     .map<Device>((d) => {
        //   Device.fromJson(d)
        // })
        //     .toList();

        var devices = <Device>[];

        var j = json.decode(response.body)['devices'];
        for (var t in j) {
          try {
            var device = Device.fromJson(t);
            devices.add(device);
          } on Error catch (e) {
            print('Get Devices error: $e');
          }
        }

        return devices;
      } else {
        print('Unexpected status code ${response.statusCode}:'
            ' ${response.reasonPhrase}');
        throw HttpException(
            'Unexpected status code ${response.statusCode}:'
            ' ${response.reasonPhrase}',
            uri: Uri.parse(getDevices));
      }
    } on SocketException {
      await showSnackBar(context, ErrorMessages().socketException);
    } on TimeoutException {
      await showSnackBar(context, ErrorMessages().timeoutException);
    } on Error catch (e) {
      print('Get Devices error: $e');
      var message =
          'Recent locations are not available, please try again later';
      await showSnackBar(context, message);
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

      print(body);

      final response = await http.post(Uri.parse('$getForecastUrl'),
          headers: {'Content-Type': 'application/json'},
          body: json.encode(body));

      print(response.statusCode);
      if (response.statusCode == 200) {
        print(response.body);

        var predictions = <Predict>[];

        var jsonBody =
            json.decode(response.body)['formatted_results']['predictions'];

        for (var element in jsonBody) {
          try {
            var predict = Predict.fromJson(element);
            predictions.add(predict);
          } on Error catch (e) {
            print('Get predictions error: $e');
          }
        }

        return predictions;
      } else {
        print('Unexpected status code ${response.statusCode}:'
            ' ${response.reasonPhrase}');
        print('Body ${response.body}:');
        print('uri: Uri.parse($getForecastUrl)');
        return <Predict>[];
      }
    } on SocketException {
      await showSnackBar(context, ErrorMessages().socketException);
    } on TimeoutException {
      await showSnackBar(context, ErrorMessages().timeoutException);
    } on Error catch (e) {
      print('Get Forecast error: $e');
      // var message = 'Forecast data is not available, try again later';
      // await showSnackBar(context, message);
    }

    return <Predict>[];
  }

  Future<List<HistoricalMeasurement>> fetchDeviceHistoricalMeasurements(
      Device device) async {
    try {
      var startTimeUtc = DateTime.now().toUtc().add(const Duration(hours: -48));
      var date = DateFormat('yyyy-MM-dd').format(startTimeUtc);
      var time = '${startTimeUtc.hour}';

      if ('$time'.length == 1){
        time = '0$time';
      }
      var startTime = '${date}T$time:00:00Z';

      var queryParams = <String, dynamic>{}
        ..putIfAbsent('device', () => device.name)
        ..putIfAbsent('startTime', () => startTime)
        ..putIfAbsent('frequency', () => 'hourly')
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

  Future<List<HistoricalMeasurement>> fetchHistoricalMeasurements() async {
    try {

      var startTimeUtc = DateTime.now().toUtc().add(const Duration(hours: -48));
      var date = DateFormat('yyyy-MM-dd').format(startTimeUtc);
      var time = '${startTimeUtc.hour}';

      if ('$time'.length == 1){
        time = '0$time';
      }
      var startTime = '${date}T$time:00:00Z';

      var queryParams = <String, dynamic>{}
        ..putIfAbsent('startTime', () => startTime)
        ..putIfAbsent('frequency', () => 'hourly')
        ..putIfAbsent('recent', () => 'no')
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
      var url = '$getDevicesByGeoCoordinates&radius=1&latitude='
          '$latitude&longitude=$longitude';
      print(url);
      final response = await http.get(Uri.parse(url));

      print(response.statusCode);
      if (response.statusCode == 200) {
        // List<Device> devices = json.decode(response.body)['devices']
        //     .map<Device>((d) => {
        //   Device.fromJson(d)
        // })
        //     .toList();

        var devices = <Device>[];

        var j = json.decode(response.body);
        for (var t in j) {
          try {
            var device = Device.fromJson(t);
            devices.add(device);
          } on Error catch (e) {
            print('Get Devices error: $e');
          }
        }

        return devices;
      } else {
        print('Unexpected status code ${response.statusCode}:'
            ' ${response.reasonPhrase}');
        throw HttpException(
            'Unexpected status code ${response.statusCode}:'
            ' ${response.reasonPhrase}',
            uri: Uri.parse(getDevices));
      }
    } on SocketException {
      await showSnackBar(context, ErrorMessages().socketException);
    } on TimeoutException {
      await showSnackBar(context, ErrorMessages().timeoutException);
    } on Error catch (e) {
      print('Get Devices error: $e');
      var message =
          'Recent locations are not available, please try again later';
      await showSnackBar(context, message);
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

      final response = await http.post(Uri.parse('$getCloundinaryUrl'),
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
        print('uri: Uri.parse($getForecastUrl)');
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
              {'title': 'Email', 'value': '${feedback.email}'},
              {'title': 'Message', 'value': '${feedback.feedback}'},
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
    print('Session Token ==> $sessionToken');

    final request =
        'https://maps.googleapis.com/maps/api/place/autocomplete/json?'
        'input=$input&'
        'components=country:ug&'
        'key=$apiKey&'
        'sessiontoken=$sessionToken';
    // 'types=address&'
    // print(request);

    try {
      final response = await http.get(Uri.parse(request));

      if (response.statusCode == 200) {
        final result = json.decode(response.body);

        // print(result);

        if (result['status'] == 'OK') {
          // List<Measurement> suggestions =
          // Event.fromJson(json.decode(response.body));
          // List<Measurement> measurements = event.measurements;
          // Suggestion(description: p['description'], placeId: p['place_id']);

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
      print('Update Latest events error: $e');
      throw Exception('Cannot get locations, please try again later');
    }
  }

  Future<Place> getPlaceDetailFromId(String placeId) async {
    final request = 'https://maps.googleapis.com/maps/api/place/details/json?'
        'place_id=$placeId&'
        'fields=name,geometry&'
        'key=$apiKey&'
        'sessiontoken=$sessionToken';

    print(request);
    try {
      final response = await http.get(Uri.parse(request));

      if (response.statusCode != 200) {
        throw Exception('Failed to get details, please try again later');
      }

      final result = json.decode(response.body);
      print(result);

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
      print('Update Latest events error: $e');
      throw Exception('Cannot get details, please try again later');
    }
  }
}

// Future<List<Hourly>> fetchHourlyMeasurements(String channelId) async {
//   try {
//     final response = await http.get(Uri.parse('$getHourlyEvents$channelId'));
//
//     print(response.statusCode);
//
//     if (response.statusCode == 200) {
//       print(response.body);
//
//       var measurements = <Hourly>[];
//
//       var jsonBody = json.decode(response.body)['hourly_results'];
//
//       for (var element in jsonBody) {
//         try {
//           var measurement = Hourly.fromJson(element);
//           measurements.add(measurement);
//         } on Error catch (e) {
//           print('Get hourly measurements error: $e');
//         }
//       }
//
//       return measurements;
//     } else {
//       print('Unexpected status code ${response.statusCode}:'
//           ' ${response.reasonPhrase}');
//       print('Body ${response.body}:');
//       print('uri: Uri.parse($getForecastUrl)');
//       return <Hourly>[];
//     }
//   } on SocketException {
//     await showSnackBar(context, ErrorMessages().socketException);
//   } on TimeoutException {
//     await showSnackBar(context, ErrorMessages().timeoutException);
//   } on Error catch (e) {
//     print('Get hourly measurements error: $e');
//   }
//
//   return <Hourly>[];
// }
