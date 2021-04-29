import 'dart:async';
import 'dart:convert';
import 'dart:io';
import 'package:app/config/secret.dart';
import 'package:app/constants/api.dart';
import 'package:app/models/place.dart';
import 'package:app/models/suggestion.dart';
import 'package:app/models/feedback.dart';
import 'package:app/models/event.dart';
import 'package:app/models/measurement.dart';
import 'package:http/http.dart' as http;

class AirqoApiClient{

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
    final response =
    await http.get(Uri.parse(getLatestEvents));

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

      // if (result['status'] != 'OK') {
      //   throw Exception('Failed to get details');
      // }

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
