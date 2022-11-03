import 'dart:async';

import 'package:airqo_api/src/utils.dart';
import 'package:http/http.dart' as http;
import 'package:sentry/sentry.dart';
import 'package:uuid/uuid.dart';

import 'models/place.dart';
import 'models/prediction.dart';

String get placeSearchDetails =>
    'https://maps.googleapis.com/maps/api/place/details/json';
String get searchSuggestions =>
    'https://maps.googleapis.com/maps/api/place/autocomplete/json';

/// REFERENCES : https://developers.google.com/maps/documentation/places/web-service/autocomplete
class SearchApiClient {
  SearchApiClient({required this.apiKey});

  final String sessionToken = const Uuid().v4();
  final String apiKey;
  final _httpClient = SentryHttpClient(
    client: http.Client(),
    failedRequestStatusCodes: [
      SentryStatusCode(500),
      SentryStatusCode(400),
      SentryStatusCode(404),
    ],
    captureFailedRequests: true,
    networkTracing: true,
  );

  Future<List<Prediction>> fetchPredictions(String input) async {
    try {
      final queryParams = <String, dynamic>{}
        ..putIfAbsent('input', () => input)
        ..putIfAbsent('key', () => apiKey)
        ..putIfAbsent(
          'sessiontoken',
          () => sessionToken,
        );

      final responseBody = await performGetRequest(
        url: searchSuggestions,
        queryParams: queryParams,
        headers: {},
        httpClient: _httpClient,
      );

      if (responseBody != null && responseBody['status'] == 'OK') {
        return Prediction.parsePredictions(responseBody);
      }
    } catch (exception, stackTrace) {
      // TODO: add utility functions
      print('$exception, $stackTrace');
      // await logException(
      //   exception,
      //   stackTrace,
      // );
    }

    return [];
  }

  Future<Place?> getPlaceDetails(String placeId) async {
    try {
      final queryParams = <String, dynamic>{}
        ..putIfAbsent('place_id', () => placeId)
        ..putIfAbsent('fields', () => 'name,geometry')
        ..putIfAbsent('key', () => apiKey)
        ..putIfAbsent(
          'sessiontoken',
          () => sessionToken,
        );

      final responseBody = await performGetRequest(
        url: placeSearchDetails,
        queryParams: queryParams,
        headers: {},
        httpClient: _httpClient,
      );

      final place = Place.fromJson(responseBody['result']);

      return place;
    } catch (exception, stackTrace) {
      // TODO: add utility functions
      print('$exception, $stackTrace');
      // await logException(
      //   exception,
      //   stackTrace,
      // );
    }

    return null;
  }
}
