import 'dart:async';
import 'dart:convert';

import 'dart:io';
import 'package:app/config/secret.dart';
import 'package:app/constants/api.dart';
import 'package:app/constants/app_constants.dart';
import 'package:app/models/device.dart';
import 'package:app/models/hourly.dart';
import 'package:app/models/place.dart';
import 'package:app/models/predict.dart';
import 'package:app/models/suggestion.dart';
import 'package:app/models/feedback.dart';
import 'package:app/models/event.dart';
import 'package:app/models/measurement.dart';
import 'package:app/utils/ui/dialogs.dart';
import 'package:flutter/material.dart';
import 'package:http/http.dart' as http;
import 'package:mailer/mailer.dart';
import 'package:mailer/smtp_server.dart';

class AirqoApiClient {
  AirqoApiClient(this.context);

  final BuildContext context;

  Future<bool> sendFeedback(UserFeedback feedback) async {
    final smtpServer = gmail(fromEmail, emailPassword);

    final message = Message()
      ..from = const Address(fromEmail, 'AirQo Analytics')
      ..recipients.add(emailRecipient)
      ..ccRecipients.addAll(emailCC)
      ..subject = 'Mobile App Feedback ${DateTime.now()}'
      ..text = feedback.feedback;

    try {
      final sendReport = await send(message, smtpServer);
      print('Message sent: $sendReport');
      return true;
    } on MailerException catch (e) {
      print('Message not sent.');
      print(e);
      for (var p in e.problems) {
        print('Problem: ${p.code}: ${p.msg}');
      }

      return false;
    }
  }

  Future<List<Measurement>> fetchMeasurements() async {
    try {
      final response = await http.get(Uri.parse(getLatestEvents));

      print(response.statusCode);
      if (response.statusCode == 200) {
        print(response.body);

        var measurements = <Measurement>[];

        // List<Measurement> measurements = json
        //     .decode(response.body)['measurements']
        //     .map<Measurement>((m) => Measurement.fromJson(m))
        //     .toList();

        var jsonBody = json.decode(response.body)['measurements'];
        for (var element in jsonBody) {
          try {
            var measurement = Measurement.fromJson(element);
            measurements.add(measurement);
          } on Error catch (e) {
            print('Mapping Devices error: $e');
          }
        }

        return measurements;
      } else {
        print('Unexpected status code ${response.statusCode}:'
            ' ${response.reasonPhrase}');
        print('Body ${response.body}:');
        print('uri: Uri.parse($getLatestEvents)');
        return <Measurement>[];
      }
    } on SocketException {
      await showSnackBar(context, ErrorMessages().socketException);
    } on TimeoutException {
      await showSnackBar(context, ErrorMessages().timeoutException);
    } on Error catch (e) {
      print('Get Latest events error: $e');
      await showSnackBar(
          context, 'Measurements not available, try again later');
    }

    return <Measurement>[];
  }

  Future<List<Predict>> fetchForecast(
      String latitude, String longitude, String dateTime) async {
    try {
      var body = {
        "selected_datetime": dateTime,
        "latitude": latitude,
        "longitude": longitude
      };

      print(body);

      final response = await http.post(Uri.parse('$getForecastUrl'),
          headers: {"Content-Type": "application/json"},
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

  Future<List<Measurement>> fetchMeasurementsByDate(
      String datetime, String channelID) async {
    try {
      final response = await http
          .get(Uri.parse('$getEvensByTime$datetime&device=$channelID'));

      print('$getEvensByTime$datetime&channeID=$channelID');

      print(response.statusCode);
      if (response.statusCode == 200) {
        print(response.body);

        // List<Measurement> measurements = json
        //     .decode(response.body)['measurements']
        //     .map<Measurement>((m) => Measurement.fromJson(m))
        //     .toList();
        //
        // return measurements;

        var measurements = <Measurement>[];

        var jsonBody = json.decode(response.body)['measurements'];

        for (var element in jsonBody) {
          try {
            var measurement = Measurement.fromJson(element);
            measurements.add(measurement);
          } on Error catch (e) {
            print('Get measurements error: $e');
          }
        }

        return measurements;
      } else {
        print('Unexpected status code ${response.statusCode}:'
            ' ${response.reasonPhrase}');
        throw HttpException(
            'Unexpected status code ${response.statusCode}:'
            ' ${response.reasonPhrase}',
            uri: Uri.parse(getLatestEvents));
      }
    } on SocketException {
      await showSnackBar(context, ErrorMessages().socketException);
    } on TimeoutException {
      await showSnackBar(context, ErrorMessages().timeoutException);
    } on Error catch (e) {
      print('Get Latest events error: $e');
      var message = 'Connection timeout, please check your internet connection';
      // await showSnackBar(context, message);
    }

    return <Measurement>[];
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
            Device device = Device.fromJson(t);
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

      var url = '$getLatestDeviceEvents${device.name}';
      print(url);
      final response = await http
          .get(Uri.parse(url));

      print(response.statusCode);
      if (response.statusCode == 200) {
        print(response.body);

        var readings = Measurement.fromApiMap(json.decode(response.body));
        readings['deviceDetails'] = device.toJson();
        readings['channelID'] = device.channelID;

        var measurement = Measurement.fromJson(readings);

        return measurement;
      } else {
        print('Unexpected status code ${response.statusCode}:'
            ' ${response.reasonPhrase}');
        throw HttpException(
            'Unexpected status code ${response.statusCode}:'
            ' ${response.reasonPhrase}',
            uri: Uri.parse(url));
      }
    } on SocketException {
      await showSnackBar(context, ErrorMessages().socketException);
    } on TimeoutException {
      await showSnackBar(context, ErrorMessages().timeoutException);
    } on Error catch (e) {
      print('Get Devices error: $e');
      var message = 'Couldn\'t get location data, please try again later';
      await showSnackBar(context, message);
    }
    throw Exception('device doesn\'t exist');
  }

  Future<List<Measurement>> fetchComparisonMeasurements() async {
    // var device_01 = await fetchDeviceMeasurements(1);
    // var device_02 = await fetchDeviceMeasurements(2);

    var measurements = <Measurement>[];
    // measurements.add(device_02);
    // measurements.add(device_01);

    return measurements;
  }

  Future<List<Hourly>> fetchHourlyMeasurements(int channelId) async {
    try {
      final response = await http.get(Uri.parse('$getHourlyEvents$channelId'));

      print(response.statusCode);

      if (response.statusCode == 200) {
        print(response.body);

        var measurements = <Hourly>[];

        var jsonBody = json.decode(response.body)['hourly_results'];

        for (var element in jsonBody) {
          try {
            var measurement = Hourly.fromJson(element);
            measurements.add(measurement);
          } on Error catch (e) {
            print('Get hourly measurements error: $e');
          }
        }

        return measurements;
      } else {
        print('Unexpected status code ${response.statusCode}:'
            ' ${response.reasonPhrase}');
        print('Body ${response.body}:');
        print('uri: Uri.parse($getForecastUrl)');
        return <Hourly>[];
      }
    } on SocketException {
      await showSnackBar(context, ErrorMessages().socketException);
    } on TimeoutException {
      await showSnackBar(context, ErrorMessages().timeoutException);
    } on Error catch (e) {
      print('Get hourly measurements error: $e');
      // var message = 'Connection timeout, please check your internet connection';
      // await showSnackBar(context, message);
    }

    return <Hourly>[];
  }

  Future<String> imageUpload(String file, String? type) async {
    type ??= 'jpeg';

    var uploadStr = 'data:image/$type;base64,$file';
    try {
      var body = {
        "file": uploadStr,
        "upload_preset": "mobile_uploads"
      };

    //   "api_key": cloudinaryApiKey,
    // "timestamp": DateTime.now().microsecondsSinceEpoch,
    // "signature": "",

      // print(body);

      final response = await http.post(Uri.parse('$getCloundinaryUrl'),
          headers: {"Content-Type": "application/json"},
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

  Future<List<Device>> getDevicesByCoordinates(double latitude, double longitude) async {



    try {

      String url = '$getDevicesByGeoCoordinates&radius=1&latitude=$latitude&longitude=$longitude';
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
            Device device = Device.fromJson(t);
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

}

class GoogleSearchProvider {
  GoogleSearchProvider(this.sessionToken);

  final sessionToken;

  static final String androidKey = googleApiKey;
  static final String iosKey = iosApiKey;

  final apiKey = Platform.isAndroid ? androidKey : iosKey;

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
          // List<Measurement> suggestions = Event.fromJson(json.decode(response.body));
          // List<Measurement> measurements = event.measurements;
          //
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
        // throw Exception(result['error_message']);
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
