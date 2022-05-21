import 'dart:async';
import 'dart:collection';
import 'dart:convert';

import 'package:app/constants/api.dart';
import 'package:app/constants/config.dart';
import 'package:app/models/email_auth_model.dart';
import 'package:app/models/feedback.dart';
import 'package:app/models/insights.dart';
import 'package:app/models/json_parsers.dart';
import 'package:app/models/measurement.dart';
import 'package:app/models/place.dart';
import 'package:app/models/profile.dart';
import 'package:app/models/suggestion.dart';
import 'package:app/utils/extensions.dart';
import 'package:flutter/foundation.dart';
import 'package:http/http.dart' as http;
import 'package:intl/intl.dart';
import 'package:sentry_flutter/sentry_flutter.dart';
import 'package:uuid/uuid.dart';

import '../utils/exception.dart';

String addQueryParameters(Map<String, dynamic> queryParams, String url) {
  if (queryParams.isNotEmpty) {
    url = '$url?';
    queryParams.forEach((key, value) {
      url = queryParams.keys.elementAt(0).compareTo(key) == 0
          ? '$url$key=$value'
          : '$url&$key=$value';
    });
  }
  return url;
}

class AirqoApiClient {
  final httpClient = SentryHttpClient(
      client: http.Client(),
      failedRequestStatusCodes: [
        SentryStatusCode(500),
        SentryStatusCode(400),
        SentryStatusCode(404),
      ],
      captureFailedRequests: true,
      networkTracing: true);
  final Map<String, String> headers = HashMap()
    ..putIfAbsent('Authorization', () => 'JWT ${Config.airqoApiToken}');

  Future<bool> checkIfUserExists(
      {String? phoneNumber, String? emailAddress}) async {
    Map<String, String> headers = HashMap()
      ..putIfAbsent('Content-Type', () => 'application/json');
    http.Response response;

    if (phoneNumber != null) {
      var body = {'phoneNumber': phoneNumber};
      response = await httpClient.post(Uri.parse(AirQoUrls.checkUserExists),
          headers: headers, body: jsonEncode(body));
    } else if (emailAddress != null) {
      var body = {'emailAddress': emailAddress};
      response = await httpClient.post(Uri.parse(AirQoUrls.checkUserExists),
          headers: headers, body: jsonEncode(body));
    } else {
      throw Exception('Failed to perform action. Try again later');
    }

    if (response.statusCode != 200) {
      throw Exception('Failed to perform action. Try again later');
    }

    return json.decode(response.body)['status'];
  }

  Future<List<Measurement>> fetchLatestMeasurements() async {
    try {
      var queryParams = <String, dynamic>{}
        ..putIfAbsent('recent', () => 'yes')
        ..putIfAbsent('metadata', () => 'site_id')
        ..putIfAbsent('external', () => 'no')
        ..putIfAbsent(
            'startTime',
            () =>
                '${DateFormat('yyyy-MM-dd').format(DateTime.now().toUtc().subtract(const Duration(days: 1)))}T00:00:00Z')
        ..putIfAbsent('frequency', () => 'hourly')
        ..putIfAbsent('tenant', () => 'airqo');

      final responseBody =
          await _performGetRequest(queryParams, AirQoUrls.measurements);
      if (responseBody != null) {
        return await compute(parseMeasurements, responseBody);
      } else {
        return <Measurement>[];
      }
    } catch (exception, stackTrace) {
      await logException(exception, stackTrace);
    }

    return <Measurement>[];
  }

  Future<List<Insights>> fetchSitesInsights(String siteIds) async {
    try {
      var startDateTime =
          '${DateFormat('yyyy-MM-dd').format(DateTime.now().toUtc().getFirstDateOfCalendarMonth())}T00:00:00Z';
      var endDateTime =
          '${DateFormat('yyyy-MM-dd').format(DateTime.now().toUtc().getLastDateOfCalendarMonth())}T23:59:59Z';

      var queryParams = <String, dynamic>{}
        ..putIfAbsent('siteId', () => siteIds)
        ..putIfAbsent('startDateTime', () => startDateTime)
        ..putIfAbsent('endDateTime', () => endDateTime);

      final body = await _performGetRequest(queryParams, AirQoUrls.insights);

      if (body != null) {
        return compute(Insights.parseInsights, body['data']);
      } else {
        return <Insights>[];
      }
    } catch (exception, stackTrace) {
      await logException(exception, stackTrace);
    }

    return <Insights>[];
  }

  Future<String> getCarrier(String phoneNumber) async {
    var url = '${AirQoUrls.carrierSearchApi}$phoneNumber';
    final responseBody = await _performGetRequest({}, url);
    if (responseBody != null) {
      try {
        return responseBody['data']['carrier']['name'];
      } catch (exception, stackTrace) {
        await logException(exception, stackTrace);
      }
    }
    return '';
  }

  Future<String> imageUpload(String file, String? type, String name) async {
    type ??= 'jpeg';

    var uploadStr = 'data:image/$type;base64,$file';
    try {
      var body = {
        'file': uploadStr,
        'upload_preset': Config.imageUploadPreset,
      };
      // 'public_id': name,
      // 'api_key': Config.imageUploadApiKey

      final response = await http.post(Uri.parse(Config.imageUploadUrl),
          headers: {'Content-Type': 'application/json'},
          body: json.encode(body));

      if (response.statusCode == 200) {
        var body = json.decode(response.body);
        return body['url'];
      } else {
        throw Exception('Error');
      }
    } catch (exception, stackTrace) {
      await logException(exception, stackTrace);
      return '';
    }
  }

  Future<EmailAuthModel?> requestEmailVerificationCode(
      String emailAddress, bool reAuthenticate) async {
    try {
      Map<String, String> headers = HashMap()
        ..putIfAbsent('Content-Type', () => 'application/json');

      var body = {'email': emailAddress};

      var uri = reAuthenticate
          ? AirQoUrls.requestEmailReAuthentication
          : AirQoUrls.requestEmailVerification;

      final response = await http.post(Uri.parse(uri),
          headers: headers, body: jsonEncode(body));

      return compute(
          EmailAuthModel.parseEmailAuthModel, json.decode(response.body));
    } catch (exception, stackTrace) {
      await logException(exception, stackTrace);
    }
    return null;
  }

  Future<bool> sendFeedback(UserFeedback feedback) async {
    var body = jsonEncode({
      'personalizations': [
        {
          'to': [
            {
              'email': Config.airqoSupportEmail,
              'name': Config.airqoSupportUsername
            }
          ],
          'cc': [
            {
              'email': feedback.contactDetails,
              'name': Config.defaultFeedbackUserName
            }
          ],
          'subject': feedback.feedbackType
        }
      ],
      'content': [
        {'type': 'text/plain', 'value': feedback.message}
      ],
      'from': {
        'email': Config.airqoDataProductsEmail,
        'name': Config.defaultFeedbackUserName
      },
      'reply_to': {
        'email': feedback.contactDetails,
        'name': Config.defaultFeedbackUserName
      }
    });

    try {
      Map<String, String> headers = HashMap()
        ..putIfAbsent('Content-Type', () => 'application/json')
        ..putIfAbsent(
            'Authorization', () => 'Bearer ${Config.emailFeedbackAPIKey}');

      final response = await httpClient.post(Uri.parse(Config.emailFeedbackUrl),
          headers: headers, body: body);

      if (response.statusCode == 200 || response.statusCode == 202) {
        return true;
      }
    } catch (exception, stackTrace) {
      await logException(exception, stackTrace);
    }

    return false;
  }

  @Deprecated('Functionality has been transferred to the backend')
  Future<void> sendWelcomeMessage(Profile userDetails) async {
    try {
      if (!userDetails.emailAddress.isValidEmail()) {
        return;
      }

      var body = {
        'firstName':
            userDetails.firstName.isNull() ? '' : userDetails.firstName,
        'platform': 'mobile',
        'email': userDetails.emailAddress
      };

      await _performPostRequest(
          <String, dynamic>{}, AirQoUrls.welcomeMessage, jsonEncode(body));
    } catch (exception, stackTrace) {
      await logException(exception, stackTrace);
    }
  }

  Future<dynamic> _performGetRequest(
      Map<String, dynamic> queryParams, String url) async {
    try {
      url = addQueryParameters(queryParams, url);
      final response = await httpClient.get(Uri.parse(url), headers: headers);
      if (response.statusCode == 200) {
        return json.decode(response.body);
      }
    } catch (exception, stackTrace) {
      await logException(exception, stackTrace);
    }

    return null;
  }

  Future<bool> _performPostRequest(
      Map<String, dynamic> queryParams, String url, dynamic body) async {
    try {
      url = addQueryParameters(queryParams, url);
      headers.putIfAbsent('Content-Type', () => 'application/json');

      final response =
          await httpClient.post(Uri.parse(url), headers: headers, body: body);
      if (response.statusCode == 200) {
        return true;
      }
    } catch (exception, stackTrace) {
      await logException(exception, stackTrace);
    }
    return false;
  }
}

class SearchApi {
  final String sessionToken = const Uuid().v4();
  final apiKey = Config.googleApiKey;

  Future<List<Suggestion>> fetchSuggestions(String input) async {
    try {
      var queryParams = <String, dynamic>{}
        ..putIfAbsent('input', () => input)
        ..putIfAbsent('components', () => 'country:ug')
        ..putIfAbsent('key', () => apiKey)
        ..putIfAbsent('sessiontoken', () => sessionToken);

      final responseBody =
          await _performGetRequest(queryParams, AirQoUrls.searchSuggestions);

      if (responseBody != null && responseBody['status'] == 'OK') {
        return compute(Suggestion.parseSuggestions, responseBody);
      }
    } catch (exception, stackTrace) {
      await logException(exception, stackTrace);
    }

    return [];
  }

  Future<Place?> getPlaceDetails(String placeId) async {
    try {
      var queryParams = <String, dynamic>{}
        ..putIfAbsent('place_id', () => placeId)
        ..putIfAbsent('fields', () => 'name,geometry')
        ..putIfAbsent('key', () => apiKey)
        ..putIfAbsent('sessiontoken', () => sessionToken);

      final responseBody =
          await _performGetRequest(queryParams, AirQoUrls.placeSearchDetails);

      var place = Place.fromJson(responseBody['result']);

      return place;
    } catch (exception, stackTrace) {
      await logException(exception, stackTrace);
    }

    return null;
  }

  Future<dynamic> _performGetRequest(
      Map<String, dynamic> queryParams, String url) async {
    try {
      url = addQueryParameters(queryParams, url);
      final response = await http.get(Uri.parse(url));

      if (response.statusCode == 200) {
        return json.decode(response.body);
      }
    } catch (exception, stackTrace) {
      await logException(exception, stackTrace);
    }

    return null;
  }
}
