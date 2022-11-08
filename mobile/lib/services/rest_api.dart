import 'dart:async';
import 'dart:collection';
import 'dart:convert';

import 'package:app/constants/constants.dart';
import 'package:app/models/models.dart';
import 'package:app/utils/utils.dart';
import 'package:http/http.dart' as http;
import 'package:intl/intl.dart';
import 'package:sentry_flutter/sentry_flutter.dart';

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

  Future<Map<String, dynamic>> getLocation() async {
    var ipAddress = '';
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
      final response =
          await _performGetRequest(params, AirQoUrls.ipGeoCoordinates);

      return response['data'];
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
    Map<String, String> headers = HashMap()
      ..putIfAbsent('Content-Type', () => 'application/json');
    http.Response response;

    if (phoneNumber != null) {
      final body = {
        'phoneNumber': phoneNumber,
      };
      response = await httpClient.post(
        Uri.parse(AirQoUrls.checkUserExists),
        headers: headers,
        body: jsonEncode(body),
      );
    } else if (emailAddress != null) {
      final body = {
        'emailAddress': emailAddress,
      };
      response = await httpClient.post(
        Uri.parse(AirQoUrls.checkUserExists),
        headers: headers,
        body: jsonEncode(body),
      );
    } else {
      throw Exception('Failed to perform action. Try again later');
    }

    if (response.statusCode != 200) {
      throw Exception('Failed to perform action. Try again later');
    }

    return json.decode(response.body)['status'] as bool;
  }

  Future<List<Insights>> fetchSitesInsights(String siteIds) async {
    try {
      final utcNow = DateTime.now().toUtc();
      final startDateTime = utcNow.getFirstDateOfCalendarMonth().toApiString();
      final endDateTime = '${DateFormat('yyyy-MM-dd').format(
        utcNow.getLastDateOfCalendarMonth(),
      )}T23:59:59Z';

      final queryParams = <String, dynamic>{}
        ..putIfAbsent('siteId', () => siteIds)
        ..putIfAbsent('startDateTime', () => startDateTime)
        ..putIfAbsent('endDateTime', () => endDateTime);

      final body = await _performGetRequest(
        queryParams,
        AirQoUrls.insights,
      );

      return body != null ? Insights.parseInsights(body['data']) : <Insights>[];
    } catch (exception, stackTrace) {
      await logException(
        exception,
        stackTrace,
      );
    }

    return <Insights>[];
  }

  Future<EmailAuthModel?> requestEmailVerificationCode(
    String emailAddress,
    bool reAuthenticate,
  ) async {
    try {
      Map<String, String> headers = HashMap()
        ..putIfAbsent(
          'Content-Type',
          () => 'application/json',
        );

      final body = {
        'email': emailAddress,
      };

      final uri = reAuthenticate
          ? AirQoUrls.requestEmailReAuthentication
          : AirQoUrls.requestEmailVerification;

      final response = await http.post(
        Uri.parse(uri),
        headers: headers,
        body: jsonEncode(body),
      );

      return EmailAuthModel.parseEmailAuthModel(
        json.decode(response.body),
      );
    } catch (exception, stackTrace) {
      await logException(
        exception,
        stackTrace,
      );
    }

    return null;
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

      Map<String, String> headers = HashMap()
        ..putIfAbsent('Content-Type', () => 'application/json');

      final response = await httpClient.post(
        Uri.parse(AirQoUrls.feedback),
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

  @Deprecated('Functionality has been transferred to the backend')
  Future<void> sendWelcomeMessage(Profile userDetails) async {
    try {
      if (!userDetails.emailAddress.isValidEmail()) {
        return;
      }

      final body = {
        'firstName':
            userDetails.firstName.isNull() ? '' : userDetails.firstName,
        'platform': 'mobile',
        'email': userDetails.emailAddress,
      };

      await _performPostRequest(
        queryParams: <String, dynamic>{},
        url: AirQoUrls.welcomeMessage,
        body: jsonEncode(body),
      );
    } catch (exception, stackTrace) {
      await logException(
        exception,
        stackTrace,
      );
    }
  }

  Future<dynamic> _performGetRequest(
    Map<String, dynamic> queryParams,
    String url,
  ) async {
    try {
      url = addQueryParameters(queryParams, url);

      final response = await httpClient.get(
        Uri.parse(url),
        headers: headers,
      );
      if (response.statusCode == 200) {
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

  Future<bool> _performPostRequest({
    required Map<String, dynamic> queryParams,
    required String url,
    required dynamic body,
  }) async {
    try {
      url = addQueryParameters(
        queryParams,
        url,
      );
      headers.putIfAbsent(
        'Content-Type',
        () => 'application/json',
      );

      final response = await httpClient.post(
        Uri.parse(url),
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
}
