import 'dart:async';
import 'dart:collection';
import 'dart:convert';

import 'package:app/constants/constants.dart';
import 'package:app/models/models.dart';
import 'package:app/utils/utils.dart';
import 'package:http/http.dart' as http;
import 'package:intl/intl.dart';
import 'package:sentry_flutter/sentry_flutter.dart';
import 'package:uuid/uuid.dart';

String addQueryParameters(Map<String, dynamic> queryParams, String url) {
  if (queryParams.isNotEmpty) {
    url = '$url?';
    queryParams.forEach(
      (key, value) {
        url = queryParams.keys.first.compareTo(key) == 0
            ? '$url$key=$value'
            : '$url&$key=$value';
      },
    );
  }

  return url;
}

class AirqoApiClient {
  factory AirqoApiClient() {
    return _instance;
  }
  AirqoApiClient._internal();
  static final AirqoApiClient _instance = AirqoApiClient._internal();

  final httpClient = SentryHttpClient(
    client: http.Client(),
    failedRequestStatusCodes: [
      SentryStatusCode(500),
      SentryStatusCode(400),
      SentryStatusCode(404),
    ],
    captureFailedRequests: true,
    networkTracing: true,
  );
  final Map<String, String> headers = HashMap()
    ..putIfAbsent(
      'Authorization',
      () => 'JWT ${Config.airqoApiToken}',
    );

  Future<Map<String, double>> getLocation() async {
    String ipAddress = '';
    try {
      final ipResponse = await httpClient.get(
        Uri.parse('https://jsonip.com/'),
      );
      ipAddress = json.decode(ipResponse.body)['ip'] as String;
    } catch (exception, stackTrace) {
      await logException(
        exception,
        stackTrace,
      );
    }

    try {
      final params = ipAddress.isNotEmpty
          ? {'ip_address': ipAddress}
          : <String, dynamic>{};
      final response = await _performGetRequest(
        params,
        AirQoUrls.ipGeoCoordinates,
      );

      return {
        'latitude': response['data']['latitude'] as double,
        'longitude': response['data']['longitude'] as double,
      };
    } catch (exception, stackTrace) {
      await logException(
        exception,
        stackTrace,
      );
    }

    return {};
  }

  Future<String> getCarrier(String phoneNumber) async {
    try {
      final response = await httpClient.post(
        Uri.parse(AirQoUrls.mobileCarrier),
        body: json.encode({'phone_number': phoneNumber}),
        headers: headers,
      );

      return json.decode(response.body)['data']['carrier'] as String;
    } catch (exception, stackTrace) {
      await logException(
        exception,
        stackTrace,
      );
    }

    return '';
  }

  Future<bool> checkIfUserExists({
    String? phoneNumber,
    String? emailAddress,
  }) async {
    Map<String, String> body = HashMap();

    if (phoneNumber != null) {
      body['phoneNumber'] = phoneNumber;
    } else if (emailAddress != null) {
      body['email'] = emailAddress;
    }

    final response = await httpClient.post(
      Uri.parse(AirQoUrls.firebaseLookup),
      headers: {'Content-Type': 'application/json'},
      body: jsonEncode(body),
    );

    return json.decode(response.body)['exists'] as bool;
  }

  Future<InsightData> fetchInsightsData(String siteId) async {
    try {
      final now = DateTime.now();
      final utcNow = now.toUtc();
      final startDateTime = utcNow.getFirstDateOfCalendarMonth().toApiString();
      final endDateTime = '${DateFormat('yyyy-MM-dd').format(
        utcNow.getLastDateOfCalendarMonth(),
      )}T23:59:59Z';

      final queryParams = <String, dynamic>{
        'siteId': siteId,
        'utcOffset': now.getUtcOffset(),
        'startDateTime': startDateTime,
        'endDateTime': endDateTime,
      };

      final body = await _performGetRequest(
        queryParams,
        AirQoUrls.insights,
      );

      return InsightData.fromJson(body['data']);
    } catch (exception, stackTrace) {
      await logException(
        exception,
        stackTrace,
      );
    }

    return const InsightData(forecast: [], historical: []);
  }

  Future<EmailAuthModel?> requestEmailVerificationCode(
    String emailAddress,
  ) async {
    try {
      final response = await http.post(
        Uri.parse(AirQoUrls.requestEmailVerification),
        headers: {'Content-Type': 'application/json'},
        body: jsonEncode({'email': emailAddress}),
      );

      return EmailAuthModel.fromJson(json.decode(response.body));
    } catch (exception, stackTrace) {
      await logException(
        exception,
        stackTrace,
      );
    }

    return null;
  }

  Future<List<AirQualityReading>> fetchAirQualityReadings() async {
    final airQualityReadings = <AirQualityReading>[];
    final queryParams = <String, String>{}
      ..putIfAbsent('recent', () => 'yes')
      ..putIfAbsent('metadata', () => 'site_id')
      ..putIfAbsent('external', () => 'no')
      ..putIfAbsent(
        'startTime',
        () => '${DateFormat('yyyy-MM-dd').format(
          DateTime.now().toUtc().subtract(const Duration(days: 1)),
        )}T00:00:00Z',
      )
      ..putIfAbsent('frequency', () => 'hourly')
      ..putIfAbsent('tenant', () => 'airqo');

    try {
      final body = await _performGetRequest(
        queryParams,
        AirQoUrls.measurements,
      );

      for (final measurement in body['measurements']) {
        try {
          airQualityReadings.add(
            AirQualityReading.fromAPI(measurement as Map<String, dynamic>),
          );
        } catch (_, __) {}
      }
    } catch (exception, stackTrace) {
      await logException(
        exception,
        stackTrace,
      );
    }

    return airQualityReadings;
  }

  Future<bool> sendFeedback(UserFeedback feedback) async {
    try {
      final response = await httpClient.post(
        Uri.parse(AirQoUrls.feedback),
        headers: {'Content-Type': 'application/json'},
        body: jsonEncode({
          'email': feedback.contactDetails,
          'subject': feedback.feedbackType.toString(),
          'message': feedback.message,
        }),
      );

      if (response.statusCode == 200) return true;
    } catch (exception, stackTrace) {
      await logException(
        exception,
        stackTrace,
      );
    }

    return false;
  }

  Future<dynamic> _performGetRequest(
    Map<String, dynamic> queryParams,
    String url, {
    Duration? timeout,
  }) async {
    try {
      url = addQueryParameters(queryParams, url);

      final response = await httpClient
          .get(
            Uri.parse(url),
            headers: headers,
          )
          .timeout(timeout ?? const Duration(seconds: 30));
      if (response.statusCode == 200) {
        // TODO : use advanced decoding
        return json.decode(response.body);
      }
    } catch (exception, stackTrace) {
      await logException(
        exception,
        stackTrace,
      );
    }

    return null;
  }
}

class SearchApiClient {
  factory SearchApiClient() {
    return _instance;
  }
  SearchApiClient._internal();
  static final SearchApiClient _instance = SearchApiClient._internal();

  final String sessionToken = const Uuid().v4();
  final String placeDetailsUrl =
      'https://maps.googleapis.com/maps/api/place/details/json';
  final String autoCompleteUrl =
      'https://maps.googleapis.com/maps/api/place/autocomplete/json';
  final SearchCache _cache = SearchCache();

  Future<dynamic> _getRequest({
    required Map<String, dynamic> queryParams,
    required String url,
  }) async {
    try {
      url = addQueryParameters(queryParams, url);

      final response = await http.Client().get(
        Uri.parse(url),
      );
      if (response.statusCode == 200) {
        return json.decode(response.body);
      }
    } catch (_, __) {}

    return null;
  }

  Future<List<SearchResult>> search(String input) async {
    List<SearchResult>? cachedResult = _cache.getSearchResults(input);
    if (cachedResult != null) {
      return cachedResult;
    }

    List<SearchResult> searchResults = <SearchResult>[];

    try {
      final queryParams = <String, String>{}
        ..putIfAbsent('input', () => input)
        ..putIfAbsent('key', () => Config.searchApiKey)
        ..putIfAbsent(
          'sessiontoken',
          () => sessionToken,
        );

      final responseBody = await _getRequest(
        url: autoCompleteUrl,
        queryParams: queryParams,
      );

      if (responseBody != null && responseBody['status'] == 'OK') {
        for (final jsonElement in responseBody['predictions']) {
          try {
            searchResults.add(SearchResult.fromAutoCompleteAPI(jsonElement));
          } catch (__, _) {}
        }
      }
    } catch (_, __) {}

    return searchResults;
  }

  Future<SearchResult?> getPlaceDetails(
    SearchResult searchResult,
  ) async {
    SearchResult? cachedResult = _cache.getSearchResult(searchResult.id);
    if (cachedResult != null) {
      return cachedResult;
    }

    try {
      final queryParams = <String, String>{}
        ..putIfAbsent('place_id', () => searchResult.id)
        ..putIfAbsent('fields', () => 'name,geometry')
        ..putIfAbsent('key', () => Config.searchApiKey)
        ..putIfAbsent(
          'sessiontoken',
          () => sessionToken,
        );

      final responseBody = await _getRequest(
        url: placeDetailsUrl,
        queryParams: queryParams,
      );

      return SearchResult.fromPlacesAPI(
        responseBody['result'],
        searchResult,
      );
    } catch (_, __) {}

    return null;
  }
}
