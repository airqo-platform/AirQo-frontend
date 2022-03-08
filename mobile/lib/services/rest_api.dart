import 'dart:async';
import 'dart:collection';
import 'dart:convert';
import 'dart:io';

import 'package:app/constants/api.dart';
import 'package:app/constants/config.dart';
import 'package:app/models/email_auth_model.dart';
import 'package:app/models/feedback.dart';
import 'package:app/models/insights.dart';
import 'package:app/models/json_parsers.dart';
import 'package:app/models/measurement.dart';
import 'package:app/models/place.dart';
import 'package:app/models/suggestion.dart';
import 'package:app/models/user_details.dart';
import 'package:app/utils/dialogs.dart';
import 'package:app/utils/extensions.dart';
import 'package:flutter/foundation.dart';
import 'package:flutter/material.dart';
import 'package:http/http.dart' as http;
import 'package:intl/intl.dart';
import 'package:sentry_flutter/sentry_flutter.dart';

class AirqoApiClient {
  final BuildContext context;
  final httpClient = SentryHttpClient(
      client: http.Client(),
      failedRequestStatusCodes: [
        SentryStatusCode.range(400, 404),
        SentryStatusCode(500),
      ],
      captureFailedRequests: true,
      networkTracing: true);
  final Map<String, String> headers = HashMap()
    ..putIfAbsent('Authorization', () => 'JWT ${Config.airqoApiToken}');

  AirqoApiClient(this.context);

  Future<bool> checkIfUserExists(
      String phoneNumber, String emailAddress) async {
    Map<String, String> headers = HashMap()
      ..putIfAbsent('Content-Type', () => 'application/json');
    http.Response response;

    if (phoneNumber.isNotEmpty) {
      var body = {'phoneNumber': phoneNumber};
      response = await httpClient.post(Uri.parse(AirQoUrls.checkUserExists),
          headers: headers, body: jsonEncode(body));
    } else if (emailAddress.isNotEmpty) {
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
    } on Error catch (exception, stackTrace) {
      await Sentry.captureException(
        exception,
        stackTrace: stackTrace,
      );
    }

    return <Measurement>[];
  }

  Future<List<Insights>> fetchSiteInsights(
      String siteId, bool daily, bool allHourlyData) async {
    try {
      var queryParams = <String, dynamic>{}
        ..putIfAbsent('siteId', () => siteId);
      // ..putIfAbsent(
      //     'startTime',
      //     () =>
      //         '${DateFormat('yyyy-MM-dd')
      //         .format(DateTime.now()
      //         .firstDateOfCalendarMonth())}T00:00:00Z')
      // ..putIfAbsent(
      //     'endTime',
      //     () =>
      //         '${DateFormat('yyyy-MM-dd')
      //         .format(DateTime.now()
      //         .lastDateOfCalendarMonth())}T00:00:00Z');

      if (daily) {
        queryParams
          ..putIfAbsent('frequency', () => 'daily')
          ..putIfAbsent(
              'startTime',
              () =>
                  '${DateFormat('yyyy-MM-dd').format(DateTime.now().getFirstDateOfCalendarMonth())}T00:00:00Z')
          ..putIfAbsent(
              'endTime',
              () =>
                  '${DateFormat('yyyy-MM-dd').format(DateTime.now().getLastDateOfCalendarMonth())}T23:30:00Z');
        // ..putIfAbsent('startTime', () => '${DateFormat('yyyy-MM-dd').format(
        //     DateTime.now().firstDateOfCalendarMonth())}T00:00:00Z')
        // ..putIfAbsent('endTime', () => '${DateFormat('yyyy-MM-dd').format(
        //     DateTime.now().lastDateOfCalendarMonth())}T00:00:00Z');
      } else {
        queryParams
          ..putIfAbsent('frequency', () => 'hourly')
          ..putIfAbsent(
              'startTime',
              () =>
                  '${DateFormat('yyyy-MM-dd').format(DateTime.now().getDateOfFirstDayOfWeek())}T00:00:00Z')
          ..putIfAbsent(
              'endTime',
              () =>
                  '${DateFormat('yyyy-MM-dd').format(DateTime.now().getDateOfLastDayOfWeek())}T23:30:00Z');
        if (allHourlyData) {
          queryParams['startTime'] =
              '${DateFormat('yyyy-MM-dd').format(DateTime.now().getFirstDateOfCalendarMonth())}T00:00:00Z';
          queryParams['endTime'] =
              '${DateFormat('yyyy-MM-dd').format(DateTime.now().getLastDateOfCalendarMonth())}T23:30:00Z';
        }
        // ..putIfAbsent('startTime', () => '${DateFormat('yyyy-MM-dd').format(
        //     DateTime.now().getFirstDateOfMonth())}T00:00:00Z')
        // ..putIfAbsent('endTime', () => '${DateFormat('yyyy-MM-dd').format(
        //     DateTime.now().getLastDateOfMonth())}T00:00:00Z');
      }

      final responseBody =
          await _performGetRequest(queryParams, AirQoUrls.insights);

      if (responseBody != null) {
        return compute(Insights.parseInsights, responseBody['data']);
      } else {
        return <Insights>[];
      }
    } on Error catch (exception, stackTrace) {
      debugPrint('$exception\n$stackTrace');
      await Sentry.captureException(
        exception,
        stackTrace: stackTrace,
      );
    }

    return <Insights>[];
  }

  Future<List<Insights>> fetchSitesInsights(String siteIds) async {
    try {
      var insights = <Insights>[];

      var siteInsights = await Future.wait([
        fetchSiteInsights(siteIds, true, true),
        fetchSiteInsights(siteIds, false, true),
      ]);

      insights.addAll(<Insights>[
        ...siteInsights[0],
        ...siteInsights[1],
      ]);

      return insights;
    } on Error catch (exception, stackTrace) {
      debugPrint('$exception\n$stackTrace');
      await Sentry.captureException(
        exception,
        stackTrace: stackTrace,
      );
    }

    return <Insights>[];
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
    } on SocketException {
      await showSnackBar(context, Config.connectionErrorMessage);
      return '';
    } on TimeoutException {
      await showSnackBar(context, Config.connectionErrorMessage);
      return '';
    } on Error catch (exception, stackTrace) {
      debugPrint('$exception\n$stackTrace');
      await Sentry.captureException(
        exception,
        stackTrace: stackTrace,
      );
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
    } on SocketException {
      await showSnackBar(context, Config.socketErrorMessage);
    } on TimeoutException {
      await showSnackBar(context, Config.connectionErrorMessage);
    } on Error catch (exception, stackTrace) {
      debugPrint('$exception\n$stackTrace');
      await Sentry.captureException(
        exception,
        stackTrace: stackTrace,
      );
    }
    return null;
  }

  Future<bool> sendFeedback(UserFeedback feedback) async {
    try {
      var body = {
        'text': {'type': 'mrkdwn', 'text': '@channel, Mobile App feedback'},
        'attachments': [
          {
            'fallback': 'Mobile App feedback',
            'color': '#3067e2',
            'title': 'Mobile App feedback',
            'fields': [
              {
                'title': feedback.contactDetails,
              },
              {'title': feedback.feedbackType, 'value': feedback.message},
            ],
            'footer': 'AirQo Mobile App'
          }
        ]
      };

      final response = await _performPostRequest(
          <String, dynamic>{}, Config.feedbackWebhook, jsonEncode(body));
      return response;
    } on Error catch (exception, stackTrace) {
      debugPrint('$exception\n$stackTrace');
      await Sentry.captureException(
        exception,
        stackTrace: stackTrace,
      );
    }

    return false;
  }

  @Deprecated('Functionality has been transferred to the backend')
  Future<void> sendWelcomeMessage(UserDetails userDetails) async {
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
    } on SocketException {
      await showSnackBar(context, Config.socketErrorMessage);
    } on TimeoutException {
      await showSnackBar(context, Config.connectionErrorMessage);
    } on Error catch (exception, stackTrace) {
      await Sentry.captureException(
        exception,
        stackTrace: stackTrace,
      );
    }
  }

  Future<dynamic> _performGetRequest(
      Map<String, dynamic> queryParams, String url) async {
    try {
      if (queryParams.isNotEmpty) {
        url = '$url?';
        queryParams.forEach((key, value) {
          if (queryParams.keys.elementAt(0).compareTo(key) == 0) {
            url = '$url$key=$value';
          } else {
            url = '$url&$key=$value';
          }
        });
      }

      final response = await httpClient.get(Uri.parse(url), headers: headers);
      if (response.statusCode == 200) {
        return json.decode(response.body);
      } else {
        return null;
      }
    } on SocketException {
      await showSnackBar(context, Config.socketErrorMessage);
    } on TimeoutException {
      await showSnackBar(context, Config.connectionErrorMessage);
    } on Error catch (exception, stackTrace) {
      debugPrint('$exception\n$stackTrace');
      await Sentry.captureException(
        exception,
        stackTrace: stackTrace,
      );
      await showSnackBar(context, Config.appErrorMessage);
    }

    return null;
  }

  Future<bool> _performPostRequest(
      Map<String, dynamic> queryParams, String url, dynamic body) async {
    try {
      if (queryParams.isNotEmpty) {
        url = '$url?';
        queryParams.forEach((key, value) {
          if (queryParams.keys.elementAt(0).compareTo(key) == 0) {
            url = '$url$key=$value';
          } else {
            url = '$url&$key=$value';
          }
        });
      }

      Map<String, String> headers = HashMap()
        ..putIfAbsent('Content-Type', () => 'application/json');

      final response =
          await httpClient.post(Uri.parse(url), headers: headers, body: body);
      if (response.statusCode == 200) {
        return true;
      } else {
        return false;
      }
    } on SocketException {
      await showSnackBar(context, Config.socketErrorMessage);
      return false;
    } on TimeoutException {
      await showSnackBar(context, Config.connectionErrorMessage);
      return false;
    } on Error catch (exception, stackTrace) {
      debugPrint('$exception\n$stackTrace');
      await Sentry.captureException(
        exception,
        stackTrace: stackTrace,
      );
      await showSnackBar(context, Config.appErrorMessage);
      return false;
    }
  }
}

class SearchApi {
  final String sessionToken;
  final apiKey = Config.googleApiKey;
  final BuildContext context;

  SearchApi(this.sessionToken, this.context);

  Future<List<Suggestion>> fetchSuggestions(String input) async {
    try {
      var queryParams = <String, dynamic>{}
        ..putIfAbsent('input', () => input)
        ..putIfAbsent('components', () => 'country:ug')
        ..putIfAbsent('key', () => apiKey)
        ..putIfAbsent('sessiontoken', () => sessionToken);

      final responseBody =
          await _performGetRequest(queryParams, AirQoUrls.searchSuggestions);

      if (responseBody == null) {
        return [];
      }
      if (responseBody['status'] == 'OK') {
        return compute(Suggestion.parseSuggestions, responseBody);
      }
    } on Error catch (exception, stackTrace) {
      debugPrint('$exception\n$stackTrace');
      await Sentry.captureException(
        exception,
        stackTrace: stackTrace,
      );
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
    } on Error catch (exception, stackTrace) {
      debugPrint('$exception\n$stackTrace');
      await Sentry.captureException(
        exception,
        stackTrace: stackTrace,
      );
    }

    return null;
  }

  Future<dynamic> _performGetRequest(
      Map<String, dynamic> queryParams, String url) async {
    try {
      if (queryParams.isNotEmpty) {
        url = '$url?';
        queryParams.forEach((key, value) {
          if (queryParams.keys.elementAt(0).compareTo(key) == 0) {
            url = '$url$key=$value';
          } else {
            url = '$url&$key=$value';
          }
        });
      }

      final response = await http.get(Uri.parse(url));

      if (response.statusCode == 200) {
        return json.decode(response.body);
      } else {
        return null;
      }
    } on SocketException {
      await showSnackBar(context, Config.connectionErrorMessage);
      return null;
    } on TimeoutException {
      await showSnackBar(context, Config.connectionErrorMessage);
      return null;
    } on Error catch (exception, stackTrace) {
      debugPrint('$exception\n$stackTrace');
      await Sentry.captureException(
        exception,
        stackTrace: stackTrace,
      );
      return null;
    }
  }
}
