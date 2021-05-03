import 'dart:async';
import 'dart:convert';
import 'dart:io';
import 'package:app/config/secret.dart';
import 'package:app/constants/api.dart';
import 'package:app/models/device.dart';
import 'package:app/models/hourly.dart';
import 'package:app/models/place.dart';
import 'package:app/models/suggestion.dart';
import 'package:app/models/feedback.dart';
import 'package:app/models/event.dart';
import 'package:app/models/measurement.dart';
import 'package:app/utils/ui/dialogs.dart';
import 'package:flutter/material.dart';
import 'package:http/http.dart' as http;

class AirqoApiClient{


  AirqoApiClient(this.context);

  final BuildContext context;

  Future<bool> sendFeedback(UserFeedback feedback) async {
    final response =
    await http.post(Uri.parse('http://airqo.net'), body: feedback.toJson());
    print(response.body);
    print(response.statusCode);

    if (response.statusCode == 200) {
      return true;
    } else {
      print('Unexpected status code ${response.statusCode}:'
          ' ${response.reasonPhrase}');
      // return false;
      throw HttpException(
          'Unexpected status code ${response.statusCode}:'
              ' ${response.reasonPhrase}',
          uri: Uri.parse('http://airqo.net'));
    }
  }

  Future<List<Measurement>> fetchMeasurements() async {

    try {

      final response = await http.get(Uri.parse(getLatestEvents));

      print(response.statusCode);
      if (response.statusCode == 200) {

        print(response.body);

        // Event event = Event.fromJson(json.decode(response.body));
        // List<Measurement> measurements = event.measurements;

        List<Measurement> measurements = json.decode(response.body)['measurements']
            .map<Measurement>((m) => Measurement.fromJson(m))
            .toList();
        // measurements.forEach((element) {
        //   print(element.channelID);
        //   print(element.location.longitude.value);
        //   print(element.location.latitude.value);
        // });

        return measurements;


      } else {
        print('Unexpected status code ${response.statusCode}:'
            ' ${response.reasonPhrase}');
        throw HttpException(
            'Unexpected status code ${response.statusCode}:'
                ' ${response.reasonPhrase}',
            uri: Uri.parse(getLatestEvents));
      }
    }
    on SocketException {
      var message = 'You are working offline, please connect to internet';
      await showSnackBar(context, message);
    }
    on TimeoutException {
      var message = 'Connection timeout, please check your internet connection';
      await showSnackBar(context, message);

    } on Error catch (e) {
      print('Get Latest events error: $e');
      var message = 'Connection timeout, please check your internet connection';
      await showSnackBar(context, message);
    }

    return <Measurement>[];

  }

  Future<List<Device>> fetchDevices() async {

    try {

      final response = await http.get(Uri.parse(getDevices));

      print(response.statusCode);
      if (response.statusCode == 200) {

        print(response.body);

        List<Device> devices = json.decode(response.body)['devices']
            .map<Device>((d) => Device.fromJson(d))
            .toList();

        return devices;
      } else {
        print('Unexpected status code ${response.statusCode}:'
            ' ${response.reasonPhrase}');
        throw HttpException(
            'Unexpected status code ${response.statusCode}:'
                ' ${response.reasonPhrase}',
            uri: Uri.parse(getDevices));
      }
    }
    on SocketException {
      var message = 'You are working offline, please connect to internet';
      await showSnackBar(context, message);
    }
    on TimeoutException {
      var message = 'Connection timeout, please check your internet connection';
      await showSnackBar(context, message);

    } on Error catch (e) {
      print('Get Devices error: $e');
      var message = 'Connection timeout, please check your internet connection';
      await showSnackBar(context, message);
    }

    return <Device>[];

  }

  Future<List<Measurement>> fetchDeviceMeasurements(String device) async {

    final response = await http.get(Uri.parse('http://platform.airqo.net/api/v1/devices/events?'
        'tenant=airqo&device=$device&startTime=2021-04-26&endTime=2021-04-27'));

    print(response.statusCode);
    if (response.statusCode == 200) {

      print(response.body);

      Event event = Event.fromJson(json.decode(response.body));
      List<Measurement> measurements = event.measurements;

      // measurements.forEach((element) {
      //   print(element.channelID);
      //   print(element.location.longitude.value);
      //   print(element.location.latitude.value);
      // });

      return measurements;
    } else {
      print('Unexpected status code ${response.statusCode}:'
          ' ${response.reasonPhrase}');
      throw HttpException(
          'Unexpected status code ${response.statusCode}:'
              ' ${response.reasonPhrase}',
          uri: Uri.parse(getLatestEvents));
    }
  }

  Future<List<Measurement>> fetchComparisonMeasurements() async {

    var device_01 = await fetchDeviceMeasurements('aq_05');
    var device_02 = await fetchDeviceMeasurements('aq_06');

    for (var m in device_02){
      device_01.add(m);
    }

    return device_01;

  }

  Future<List<Hourly>> fetchHourlyMeasurements(String channelId) async {

    final response = await http.get(Uri.parse(getHourlyEvents));

    if (response.statusCode == 200) {

      var results = json.decode(response.body);

      print(results);

      List<Hourly> hourlyMeasurements = results['hourly_results']
          .map<Hourly>((l) => Hourly.fromJson(l))
          .toList();

      return hourlyMeasurements;

    } else {
      print('Unexpected status code ${response.statusCode}:'
          ' ${response.reasonPhrase}');
      throw HttpException(
          'Unexpected status code ${response.statusCode}:'
              ' ${response.reasonPhrase}',
          uri: Uri.parse(getHourlyEvents));
    }
  }


  List<Measurement> mapMeasurements(List<Measurement> measurements,
      List<Device> devices) {

    var transformedMeasurements = <Measurement>[];

    for (var measurement in measurements) {

      for (var device in devices) {
        if(device.channelID == measurement.channelID){
          measurement.setAddress(device.siteName);
          transformedMeasurements.add(measurement);
          break;
        }
      }
    }


    return transformedMeasurements;

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
        'types=address&'
        'components=country:ug&'
        'key=$apiKey&'
        'sessiontoken=$sessionToken';

    print(request);


    try{

      final response = await http.get(Uri.parse(request));

      if (response.statusCode == 200) {
        final result = json.decode(response.body);

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

    }
    on SocketException{
      throw Exception('You are working offline, please connect to internet');
    }
    on TimeoutException {
      throw Exception('Your connection timed out, please check your network connection');

    } on Error catch (e) {
      print('Update Latest events error: $e');
      throw Exception('Cannot get locations, please try again later');
    }


  }

  Future<Place> getPlaceDetailFromId(String placeId) async {

    final request =
        'https://maps.googleapis.com/maps/api/place/details/json?'
        'place_id=$placeId&'
        'fields=name,geometry&'
        'key=$apiKey&'
        'sessiontoken=$sessionToken';

    print(request);
    try{
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

    }
    on SocketException{
      throw Exception('You are working offline, please connect to internet');
    }
    on TimeoutException {
      throw Exception('Your connection timed out, please check your network connection');

    }

    on Error catch (e) {
      print('Update Latest events error: $e');
      throw Exception('Cannot get details, please try again later');
    }



  }
}
