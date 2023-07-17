import 'dart:convert';

import 'package:app/constants/constants.dart';
import 'package:app/models/models.dart';
import 'package:app/services/rest_api.dart';
import 'package:flutter_dotenv/flutter_dotenv.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:http/http.dart' as http;
import 'package:mockito/annotations.dart';
import 'package:mockito/mockito.dart';

import 'api.mocks.dart';

@GenerateMocks([http.Client])
Future<void> main() async {
  late MockClient client;
  late Map<String, String> headers;
  late UserFeedback feedback;

  group('sendFeedback', () {
    setUpAll(() async {
      await dotenv.load(fileName: Config.environmentFile);
      headers = {
        'Content-Type': 'application/json',
        'Authorization': 'JWT ${Config.airqoJWTToken}',
        'service': ApiService.auth.serviceName,
      };
      client = MockClient();
      feedback = UserFeedback(
        contactDetails: 'automated-tests@airqo.net',
        message: 'This is an automated test. Please ignore',
        feedbackType: FeedbackType.inquiry,
      );
    });

    test('successfully sends mocked feedback', () async {
      when(
        client.post(
          Uri.parse('${AirQoUrls.feedback}?TOKEN=${Config.airqoApiV2Token}'),
          headers: headers,
          body: jsonEncode(
            {
              'email': feedback.contactDetails,
              'subject': feedback.feedbackType.toString(),
              'message': feedback.message,
            },
          ),
        ),
      ).thenAnswer(
        (_) async => http.Response(
          '',
          200,
        ),
      );

      AirqoApiClient airqoApiClient = AirqoApiClient(client: client);
      dynamic success = await airqoApiClient.sendFeedback(feedback);

      expect(success, isA<bool>());
      expect(success, true);
    });

    test('unsuccessfully sends mocked feedback', () async {
      when(
        client.post(
          Uri.parse('${AirQoUrls.feedback}?TOKEN=${Config.airqoApiV2Token}'),
          headers: headers,
          body: jsonEncode(
            {
              'email': feedback.contactDetails,
              'subject': feedback.feedbackType.toString(),
              'message': feedback.message,
            },
          ),
        ),
      ).thenAnswer(
        (_) async => http.Response(
          '',
          400,
        ),
      );

      AirqoApiClient airqoApiClient = AirqoApiClient(client: client);
      dynamic success = await airqoApiClient.sendFeedback(feedback);

      expect(success, isA<bool>());
      expect(success, false);
    });

    test('send feedback to API', () async {
      AirqoApiClient airqoApiClient = AirqoApiClient();
      dynamic success = await airqoApiClient.sendFeedback(feedback);
      expect(success, isA<bool>());
      expect(success, true);
    });
  });
}
