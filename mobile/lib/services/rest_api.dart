import 'dart:async';
import 'dart:collection';
import 'dart:convert';

import 'package:app/constants/constants.dart';
import 'package:app/models/models.dart';
import 'package:app/utils/utils.dart';
import 'package:http/http.dart' as http;
import 'package:intl/intl.dart';
import 'package:uuid/uuid.dart';
import 'package:http_retry/http_retry.dart';

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
  static final Map<String, AirqoApiClient> _instances =
      <String, AirqoApiClient>{};
  final http.Client client;

  factory AirqoApiClient({http.Client? client}) {
    if (client == null) {
      final key = http.Client().hashCode.toString();
      final instance = AirqoApiClient._internal(http.Client());
      _instances[key] = instance;

      return instance;
    }

    final key = client.hashCode.toString();

    if (_instances.containsKey(key)) {
      return _instances[key]!;
    } else {
      final instance = AirqoApiClient._internal(client);
      _instances[key] = instance;

      return instance;
    }
  }

  AirqoApiClient._internal(this.client);

  final Map<String, String> getHeaders = HashMap()
    ..putIfAbsent(
      'Authorization',
      () => 'JWT ${Config.airqoApiToken}',
    );

  final Map<String, String> postHeaders = HashMap()
    ..putIfAbsent(
      'Authorization',
      () => 'JWT ${Config.airqoApiToken}',
    )
    ..putIfAbsent('Content-Type', () => 'application/json');

  Future<AppStoreVersion?> getAppVersion({
    String bundleId = "",
    String packageName = "",
  }) async {
    try {
      final body = await _performGetRequest(
        {
          "bundleId": bundleId,
          "packageName": packageName,
        },
        AirQoUrls.appVersion,
        apiService: ApiService.view,
      );

      return AppStoreVersion.fromJson(body['data'] as Map<String, dynamic>);
    } catch (exception, stackTrace) {
      await logException(
        exception,
        stackTrace,
      );
    }

    return null;
  }

  Future<String> getCarrier(String phoneNumber) async {
    try {
      Map<String, String> headers = Map.from(postHeaders);
      headers["service"] = ApiService.metaData.serviceName;

      final response = await client.post(
        Uri.parse("${AirQoUrls.mobileCarrier}?TOKEN=${Config.airqoApiV2Token}"),
        headers: headers,
        body: json.encode({'phone_number': phoneNumber}),
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

  Future<bool?> checkIfUserExists({
    String? phoneNumber,
    String? emailAddress,
  }) async {
    try {
      Map<String, String> body = HashMap();

      if (phoneNumber != null) {
        body['phoneNumber'] = phoneNumber;
      } else if (emailAddress != null) {
        body['email'] = emailAddress;
      }

      Map<String, String> headers = Map.from(postHeaders);
      headers["service"] = ApiService.auth.serviceName;

      final response = await client.post(
        Uri.parse(
          "${AirQoUrls.firebaseLookup}?TOKEN=${Config.airqoApiV2Token}",
        ),
        headers: headers,
        body: jsonEncode(body),
      );

      return json.decode(response.body)['exists'] as bool;
    } catch (exception, stackTrace) {
      await logException(
        exception,
        stackTrace,
      );
    }

    return null;
  }

  Future<List<Forecast>> fetchForecast(String siteId) async {
    final forecasts = <Forecast>[];

    try {
      final body = await _performGetRequest(
        {
          "site_id": siteId,
        },
        AirQoUrls.forecast,
        apiService: ApiService.forecast,
      );

      for (final forecast in body['forecasts'] as List<dynamic>) {
        try {
          forecasts.add(
            Forecast.fromJson({
              'pm2_5': forecast['pm2_5'],
              'time': forecast['time'],
              'siteId': siteId,
              'health_tips': forecast["health_tips"] ?? [],
              'message': forecast["message"] ?? '',
            }),
          );
        } catch (exception, stackTrace) {
          await logException(
            exception,
            stackTrace,
          );
        }
      }
    } catch (exception, stackTrace) {
      await logException(
        exception,
        stackTrace,
      );
    }

    return forecasts.removeInvalidData();
  }

  Future<EmailAuthModel?> sendEmailVerificationCode(String emailAddress) async {
    try {
      Map<String, String> headers = Map.from(postHeaders);
      headers["service"] = ApiService.auth.serviceName;

      final response = await client.post(
        Uri.parse(
          "${AirQoUrls.emailVerification}?TOKEN=${Config.airqoApiV2Token}",
        ),
        headers: headers,
        body: jsonEncode({'email': emailAddress}),
      );

      return EmailAuthModel.fromJson(
        json.decode(response.body) as Map<String, dynamic>,
      );
    } catch (exception, stackTrace) {
      await logException(
        exception,
        stackTrace,
      );
    }

    return null;
  }

  Future<EmailAuthModel?> sendEmailReAuthenticationCode(
    String emailAddress,
  ) async {
    try {
      Map<String, String> headers = Map.from(postHeaders);
      headers["service"] = ApiService.auth.serviceName;

      final response = await client.post(
        Uri.parse(
          "${AirQoUrls.emailReAuthentication}?TOKEN=${Config.airqoApiV2Token}",
        ),
        headers: headers,
        body: jsonEncode({'email': emailAddress}),
      );

      return EmailAuthModel.fromJson(
        json.decode(response.body) as Map<String, dynamic>,
      );
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
          DateTime.now().toUtc().subtract(
                const Duration(days: 1),
              ),
        )}T00:00:00Z',
      )
      ..putIfAbsent('frequency', () => 'hourly')
      ..putIfAbsent('tenant', () => 'airqo');

    try {
      final body = await _performGetRequest(
        queryParams,
        AirQoUrls.measurements,
        apiService: ApiService.deviceRegistry,
      );

      for (final measurement in body['measurements'] as List<dynamic>) {
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

    return airQualityReadings.removeInvalidData();
  }

  Future<bool> sendFeedback(UserFeedback feedback) async {
    try {
      Map<String, String> headers = Map.from(postHeaders);
      headers["service"] = ApiService.auth.serviceName;

      final body = jsonEncode(
        {
          'email': feedback.contactDetails,
          'subject': feedback.feedbackType.toString(),
          'message': feedback.message,
        },
      );

      final response = await client.post(
        Uri.parse("${AirQoUrls.feedback}?TOKEN=${Config.airqoApiV2Token}"),
        headers: headers,
        body: body,
      );

      if (response.statusCode == 200) {
        return true;
      }
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
    required ApiService apiService,
    Duration? timeout,
  }) async {
    try {
      Map<String, dynamic> params = queryParams;
      params["TOKEN"] = Config.airqoApiV2Token;

      url = addQueryParameters(params, url);

      Map<String, String> headers = Map.from(getHeaders);
      headers["service"] = apiService.serviceName;

      final retryClient = RetryClient(
        http.Client(),
        retries: 3,
        when: (response) =>
            response.statusCode >= 500 && response.statusCode <= 599,
      );

      final response = await retryClient
          .get(Uri.parse(url), headers: headers)
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
  static final Map<String, SearchApiClient> _instances =
      <String, SearchApiClient>{};
  final http.Client client;

  factory SearchApiClient({http.Client? client}) {
    if (client == null) {
      final key = http.Client().hashCode.toString();
      final instance = SearchApiClient._internal(http.Client());
      _instances[key] = instance;

      return instance;
    }

    final key = client.hashCode.toString();

    if (_instances.containsKey(key)) {
      return _instances[key]!;
    } else {
      final instance = SearchApiClient._internal(client);
      _instances[key] = instance;

      return instance;
    }
  }

  SearchApiClient._internal(this.client);

  final String sessionToken = const Uuid().v4();
  final String placeDetailsUrl =
      'https://maps.googleapis.com/maps/api/place/details/json';
  final String geocodingUrl =
      'https://maps.googleapis.com/maps/api/geocode/json';
  final String autoCompleteUrl =
      'https://maps.googleapis.com/maps/api/place/autocomplete/json';
  final SearchCache _cache = SearchCache();

  final retryClient = RetryClient(
    http.Client(),
    retries: 3,
    when: (response) =>
        response.statusCode >= 500 && response.statusCode <= 599,
  );

  Future<dynamic> _getRequest({
    required Map<String, dynamic> queryParams,
    required String url,
  }) async {
    try {
      url = addQueryParameters(queryParams, url);

      final response = await retryClient.get(
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
        for (final jsonElement
            in responseBody['predictions'] as List<dynamic>) {
          try {
            searchResults.add(
              SearchResult.fromAutoCompleteAPI(
                jsonElement as Map<String, dynamic>,
              ),
            );
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
        responseBody['result'] as Map<String, dynamic>,
        searchResult,
      );
    } catch (_, __) {}

    return null;
  }

  Future<Address?> getAddress({
    required double latitude,
    required double longitude,
  }) async {
    try {
      final queryParams = <String, String>{}
        ..putIfAbsent('latlng', () => "$latitude,$longitude")
        ..putIfAbsent('key', () => Config.searchApiKey)
        ..putIfAbsent('sessiontoken', () => sessionToken);

      final responseBody = await _getRequest(
        url: geocodingUrl,
        queryParams: queryParams,
      );

      return Address.fromGeocodingAPI(
        responseBody['results'][0] as Map<String, dynamic>,
      );
    } catch (exception, stackTrace) {
      await logException(
        exception,
        stackTrace,
      );
    }

    return null;
  }
}
