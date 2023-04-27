import 'dart:async';
import 'dart:collection';
import 'dart:convert';

import 'package:app/constants/constants.dart';
import 'package:app/models/models.dart';
import 'package:app/utils/utils.dart';
import 'package:http/http.dart' as http;
import 'package:intl/intl.dart';
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

  static final Map<String, AirqoApiClient> _instances = <String, AirqoApiClient>{};
  final http.Client client;

  factory AirqoApiClient({http.Client? client}) {
    if(client == null){
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
      final response = await client.post(
        Uri.parse("${AirQoUrls.mobileCarrier}?TOKEN=${Config.airqoApiV2Token}"),
        headers: {'Content-Type': 'application/json'},
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

      final response = await client.post(
        Uri.parse("${AirQoUrls.firebaseLookup}?TOKEN=${Config.airqoApiV2Token}"),
        headers: {'Content-Type': 'application/json'},
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
      );

      for (final forecast in body['forecasts'] as List<dynamic>) {
        try {
          forecasts.add(
            Forecast.fromJson({
              'pm2_5': forecast['pm2_5'],
              'time': forecast['time'],
              'siteId': siteId,
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

    return forecasts;
  }

  Future<EmailAuthModel?> sendEmailVerificationCode(String emailAddress) async {
    try {

      final response = await client.post(
        Uri.parse("${AirQoUrls.emailVerification}?TOKEN=${Config.airqoApiV2Token}"),
        headers: {'Content-Type': 'application/json'},
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

  Future<EmailAuthModel?> sendEmailReAuthenticationCode(String emailAddress) async {
    try {

      final response = await client.post(
        Uri.parse("${AirQoUrls.emailReAuthentication}?TOKEN=${Config.airqoApiV2Token}"),
        headers: {'Content-Type': 'application/json'},
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

    return airQualityReadings;
  }

  Future<bool> sendFeedback(UserFeedback feedback) async {
    try {
      final body = jsonEncode(
        {
          'email': feedback.contactDetails,
          'subject': feedback.feedbackType.toString(),
          'message': feedback.message,
        },
      );

      final response = await client.post(
        Uri.parse("${AirQoUrls.feedback}?TOKEN=${Config.airqoApiV2Token}"),
        headers: {'Content-Type': 'application/json'},
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
    Duration? timeout,
  }) async {
    try {
      Map<String, dynamic> params = queryParams;
      params["TOKEN"] = Config.airqoApiV2Token;

      url = addQueryParameters(params, url);

      final response = await client
          .get(
            Uri.parse(url),
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
}
