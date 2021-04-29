import 'dart:async';
import 'dart:convert';
import 'dart:io';
import 'package:app/config/secret.dart';
import 'package:app/constants/api.dart';
import 'package:app/models/Place.dart';
import 'package:app/models/Suggestion.dart';
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

  Future<List<Measurement>> getMeasurements() async {
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

    print('Token ======================> ' + sessionToken);

    final request =
        'https://maps.googleapis.com/maps/api/place/autocomplete/json?input=$input&types=address&components=country:ug&key=$apiKey&sessiontoken=$sessionToken';


    try{

      final response = await http.get(Uri.parse(request));

      if (response.statusCode == 200) {
        final result = json.decode(response.body);
        if (result['status'] == 'OK') {
          // compose suggestions in a list
          return result['predictions']
              .map<Suggestion>((p) => Suggestion(p['place_id'], p['description']))
              .toList();
        }
        if (result['status'] == 'ZERO_RESULTS') {
          return [];
        }
        throw Exception(result['error_message']);
      } else {
        throw Exception('Failed to fetch suggestion');
      }

    }
    on SocketException{
      throw Exception('You are working offline, please connect to internet');
    }
    on TimeoutException {
      throw Exception('Update failed, please check your network connection');

    } on Error catch (e) {
      print('Update Latest events error: $e');
      throw Exception('Cannot get locations, please try again later');
    }


  }

  Future<Place> getPlaceDetailFromId(String placeId) async {

    final request =
        'https://maps.googleapis.com/maps/api/place/details/json?place_id=$placeId&fields=address_component&key=$apiKey&sessiontoken=$sessionToken';

    try{
      final response = await http.get(Uri.parse(request));

      if (response.statusCode == 200) {
        final result = json.decode(response.body);
        if (result['status'] == 'OK') {
          final components =
          result['result']['address_components'] as List<dynamic>;
          // build result
          var place;
          components.forEach((c) {
            final List type = c['types'];
            if (type.contains('street_number')) {
              place.streetNumber = c['long_name'];
            }
            if (type.contains('route')) {
              place.street = c['long_name'];
            }
            if (type.contains('locality')) {
              place.city = c['long_name'];
            }
            if (type.contains('postal_code')) {
              place.zipCode = c['long_name'];
            }
          });
          return place;
        }
        throw Exception(result['error_message']);
      } else {
        throw Exception('Failed to fetch suggestion');
      }

    }
    on SocketException{
      throw Exception('You are working offline, please connect to internet');
    }
    on TimeoutException {
      throw Exception('Update failed, please check your network connection');

    } on Error catch (e) {
      print('Update Latest events error: $e');
      throw Exception('Cannot get locations, please try again later');
    }



  }
}
