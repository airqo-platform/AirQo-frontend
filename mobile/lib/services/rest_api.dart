import 'dart:async';
import 'dart:collection';
import 'dart:convert';
import 'dart:io';

import 'package:app/constants/constants.dart';
import 'package:app/models/models.dart';
import 'package:app/services/services.dart';
import 'package:app/utils/utils.dart';
import 'package:flutter/foundation.dart';
import 'package:http/http.dart' as http;
import 'package:http/retry.dart';
import 'package:intl/intl.dart';
import 'package:package_info_plus/package_info_plus.dart';
import 'package:uuid/uuid.dart';

String addQueryParameters(Map<String, dynamic> queryParams, String url) {
  Map<String, dynamic> params = queryParams;
  params.remove("TOKEN");
  String formattedUrl = '$url?TOKEN=${Config.airqoApiV2Token}';
  params.forEach((key, value) => formattedUrl = "$formattedUrl&$key=$value");

  return formattedUrl;
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
      () => 'JWT ${Config.airqoJWTToken}',
    );

  final Map<String, String> postHeaders = HashMap()
    ..putIfAbsent(
      'Authorization',
      () => 'JWT ${Config.airqoJWTToken}',
    )
    ..putIfAbsent('Content-Type', () => 'application/json');

  Future<AppStoreVersion?> getAppVersion() async {
    try {
      final PackageInfo packageInfo = await PackageInfo.fromPlatform();

      Map<String, String> queryParams = {"version": packageInfo.version};
      if (Platform.isAndroid) {
        queryParams["packageName"] = packageInfo.packageName;
      } else if (Platform.isIOS) {
        queryParams["bundleId"] = packageInfo.packageName;
      }

      final body = await _performGetRequest(
        queryParams,
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
      String url = addQueryParameters({}, AirQoUrls.mobileCarrier);

      final response = await client.post(
        Uri.parse(url),
        headers: headers,
        body: json.encode({'phone_number': phoneNumber}),
      );
      if (response.statusCode != 200) {
        return "";
      }

      return json.decode(response.body)['data']['carrier'] as String;
    } catch (exception, stackTrace) {
      await logException(
        exception,
        stackTrace,
        fatal: false,
      );
    }

    return '';
  }

  static Future<void> sendErrorToSlack(
    Object exception,
    StackTrace? stackTrace,
  ) async {
    try {
      PackageInfo packageInfo = await PackageInfo.fromPlatform();
      final retryClient = RetryClient(
        http.Client(),
        retries: 10,
      );

      await retryClient.post(
        Uri.parse(Config.slackWebhookUrl),
        headers: {
          HttpHeaders.contentTypeHeader: 'application/json',
        },
        body: jsonEncode({
          'text': "Exception: ${exception.toString()}\n\n "
              "App details: $packageInfo\n\n "
              "StackTrace: $stackTrace\n\n",
        }),
      );
    } catch (e) {
      debugPrint(e.toString());
    }
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

      String url = addQueryParameters({}, AirQoUrls.firebaseLookup);

      final response = await client.post(
        Uri.parse(url),
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

      String url = addQueryParameters({}, AirQoUrls.emailVerification);

      final response = await client.post(
        Uri.parse(url),
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

  Future<List<LocationHistory>> fetchLocationHistory(String userId) async {
    final locationHistory = <LocationHistory>[];
    final queryParams = <String, String>{}
      ..putIfAbsent('tenant', () => 'airqo');

    try {
      final body = await _performGetRequest(
        queryParams,
        "${AirQoUrls.locationHistory}/users/$userId",
        apiService: ApiService.auth,
      );

      for (final history in body['location_histories'] as List<dynamic>) {
        try {
          locationHistory.add(
            LocationHistory.fromJson(
              history as Map<String, dynamic>,
            ),
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

    return locationHistory;
  }

  Future<bool> syncLocationHistory(
    List<LocationHistory> historyList,
    String userId,
  ) async {
    try {
      Map<String, String> headers = Map.from(postHeaders);
      headers["service"] = ApiService.auth.serviceName;

      List<Map<String, dynamic>> body =
          historyList.map((e) => e.toJson()).toList();

      String url = addQueryParameters(
        {},
        "${AirQoUrls.locationHistory}/syncLocationHistory/$userId",
      );

      final response = await client.post(
        Uri.parse(url),
        headers: headers,
        body: jsonEncode({'location_histories': body}),
      );

      return response.statusCode == 200;
    } catch (exception, stackTrace) {
      await logException(
        exception,
        stackTrace,
      );
    }

    return false;
  }

  Future<EmailAuthModel?> sendEmailReAuthenticationCode(
    String emailAddress,
  ) async {
    try {
      Map<String, String> headers = Map.from(postHeaders);
      headers["service"] = ApiService.auth.serviceName;

      final response = await client.post(
        Uri.parse(
          "${AirQoUrls.emailReAuthentication}/mobileAccountDelete?TOKEN=${Config.airqoApiV2Token}",
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

  Future<List<KyaLesson>> fetchKyaLessons(String userId) async {
    final lessons = <KyaLesson>[];
    final queryParams = <String, String>{}
      ..putIfAbsent('tenant', () => 'airqo');
    String url = "${AirQoUrls.kya}/lessons/users/$userId";
    if (userId.isEmpty) {
      url = "${AirQoUrls.kya}/lessons";
    }

    try {
      final body = await _performGetRequest(
        queryParams,
        url,
        apiService: ApiService.deviceRegistry,
      );

      for (dynamic kya in body['kya_lessons'] as List<dynamic>) {
        KyaLesson apiKya = KyaLesson.fromJson(kya as Map<String, dynamic>);
        lessons.add(apiKya);
      }
    } catch (exception, stackTrace) {
      await logException(
        exception,
        stackTrace,
      );
    }

    return lessons;
  }

  Future<bool> syncKyaProgress(
    List<KyaLesson> kyaLessons,
    String userId,
  ) async {
    try {
      Map<String, String> headers = Map.from(postHeaders);
      headers["service"] = ApiService.deviceRegistry.serviceName;

      final response = await client.post(
        Uri.parse(
          "${AirQoUrls.kya}/sync/$userId",
        ),
        headers: headers,
        body: jsonEncode({
          'kya_user_progress': kyaLessons.map((e) => e.toJson()).toList(),
        }),
      );
      final responseBody = json.decode(response.body);

      return responseBody['success'] as bool;
    } catch (exception, stackTrace) {
      await logException(
        exception,
        stackTrace,
      );
    }

    return false;
  }

  Future<List<FavouritePlace>> fetchFavoritePlaces(String userId) async {
    final favoritePlaces = <FavouritePlace>[];
    final queryParams = <String, String>{}
      ..putIfAbsent('tenant', () => 'airqo');

    if (userId.isEmpty) {
      return [];
    }

    try {
      final body = await _performGetRequest(
        queryParams,
        "${AirQoUrls.favourites}/users/$userId",
        apiService: ApiService.auth,
      );

      for (final favorite in body['favorites'] as List<dynamic>) {
        try {
          favoritePlaces.add(
            FavouritePlace.fromJson(
              favorite as Map<String, dynamic>,
            ),
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

    return favoritePlaces;
  }

  Future<bool> syncFavouritePlaces(
    List<FavouritePlace> favorites, {
    bool clear = false,
  }) async {
    final userId = CustomAuth.getUserId();

    if ((userId.isEmpty) || (favorites.isEmpty && !clear)) {
      return false;
    }
    try {
      Map<String, String> headers = Map.from(postHeaders);
      headers["service"] = ApiService.auth.serviceName;

      List<Map<String, dynamic>> body =
          favorites.map((e) => e.toAPiJson(userId)).toList();

      String url = addQueryParameters(
        {},
        "${AirQoUrls.favourites}/syncFavorites/$userId",
      );

      final response = await client.post(
        Uri.parse(url),
        headers: headers,
        body: jsonEncode({'favorite_places': body}),
      );

      return response.statusCode == 200;
    } catch (exception, stackTrace) {
      await logException(
        exception,
        stackTrace,
      );
    }

    return false;
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

      String url = addQueryParameters({}, AirQoUrls.feedback);

      final response = await client.post(
        Uri.parse(url),
        headers: headers,
        body: body,
      );

      return response.statusCode == 200;
    } catch (exception, stackTrace) {
      await logException(
        exception,
        stackTrace,
      );
    }

    return false;
  }

  Future<List<SearchHistory>> fetchSearchHistory(String userId) async {
    final searchHistory = <SearchHistory>[];
    final queryParams = <String, String>{}
      ..putIfAbsent('tenant', () => 'airqo');

    try {
      final body = await _performGetRequest(
        queryParams,
        "${AirQoUrls.searchHistory}/users/$userId",
        apiService: ApiService.auth,
      );

      for (final history in body['search_history'] as List<dynamic>) {
        try {
          searchHistory.add(
            SearchHistory.fromJson(
              history as Map<String, dynamic>,
            ),
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

    return searchHistory;
  }

  Future<bool> syncSearchHistory(
    List<SearchHistory> searchHistory,
    String userId,
  ) async {
    try {
      Map<String, String> headers = Map.from(postHeaders);
      headers["service"] = ApiService.auth.serviceName;

      List<Map<String, dynamic>> body =
          searchHistory.map((e) => e.toAPIJson(userId)).toList();

      String url = addQueryParameters(
        {},
        "${AirQoUrls.searchHistory}/syncSearchHistory/$userId",
      );

      final response = await client.post(
        Uri.parse(url),
        headers: headers,
        body: jsonEncode({'search_histories': body}),
      );

      return response.statusCode == 200;
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
