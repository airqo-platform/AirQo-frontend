import 'dart:async';

import 'package:airqo_api/airqo_api.dart';
import 'package:airqo_api/src/utils.dart';
import 'package:http/http.dart' as http;
import 'package:intl/intl.dart';
import 'package:sentry/sentry.dart';

/// Exception thrown when get measurements fails.
class AirQoApiRequestFailure implements Exception {}

/// Exception thrown when no measurements are returned
class DataNotFound implements Exception {}

/// {@template airqo_api_client}
/// Dart API Client which wraps the [AirQo API](https://api.airqo.net/).
/// {@endtemplate}
class AirQoApiClient {
  /// {@macro airqo_api_client}

  AirQoApiClient({required this.airqoApiToken, required this.baseUrl})
      : _headers = {
          'Authorization': 'JWT $airqoApiToken',
        };
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
  final Map<String, String> _headers;

  final String baseUrl;
  final String airqoApiToken;

  /// Fetches  of [Measurement].
  Future<List<Measurement>> fetchLatestMeasurements() async {
    try {
      final queryParams = <String, dynamic>{}
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

      final responseBody = await performGetRequest(
        url: '${baseUrl}devices/events',
        queryParams: queryParams,
        headers: _headers,
        httpClient: _httpClient,
      );

      return responseBody != null
          ? parseMeasurements(responseBody)
          : <Measurement>[];
    } catch (exception, _) {
      // TODO create utils package
      // await logException(
      //   exception,
      //   stackTrace,
      // );

      return <Measurement>[];
    }
  }
}
