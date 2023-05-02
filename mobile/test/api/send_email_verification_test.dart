import 'dart:convert';

import 'package:app/constants/constants.dart';
import 'package:app/models/models.dart';
import 'package:app/services/rest_api.dart';
import 'package:flutter_dotenv/flutter_dotenv.dart';
import 'package:http/http.dart' as http;
import 'package:mockito/annotations.dart';

import 'package:flutter_test/flutter_test.dart';
import 'package:mockito/mockito.dart';

import 'api.mocks.dart';

@GenerateMocks([http.Client])
Future<void> main() async {
  late MockClient client;
  late Map<String, String> headers;
  late String emailAddress;

  group('requestEmailVerificationCode', () {
    setUpAll(() async {
      await dotenv.load(fileName: Config.environmentFile);
      headers = {
        'Content-Type': 'application/json',
        'Authorization': 'JWT ${Config.airqoApiToken}',
        'service': ApiService.auth.serviceName,
      };
      client = MockClient();
      emailAddress = Config.automatedTestsEmail;
    });

    test('successfully sends a mocked verification code via email', () async {
      when(
        client.post(
          Uri.parse(
            '${AirQoUrls.emailVerification}?TOKEN=${Config.airqoApiV2Token}',
          ),
          headers: headers,
          body: jsonEncode({'email': emailAddress}),
        ),
      ).thenAnswer(
        (_) async => http.Response(
          '{"token": 123, "email": "$emailAddress", "login_link": "test-login-link", "auth_link":""}',
          200,
        ),
      );

      AirqoApiClient airqoApiClient = AirqoApiClient(client: client);
      EmailAuthModel? emailAuthModel =
          await airqoApiClient.sendEmailVerificationCode(emailAddress);
      expect(emailAuthModel, isA<EmailAuthModel>());
      expect(emailAuthModel?.emailAddress, emailAddress);
      expect(emailAuthModel?.token, 123);
      expect(emailAuthModel?.signInLink, "test-login-link");
      expect(emailAuthModel?.reAuthenticationLink, "");
    });

    test('successfully sends a mocked re-authentication code via email',
        () async {
      when(
        client.post(
          Uri.parse(
            '${AirQoUrls.emailReAuthentication}?TOKEN=${Config.airqoApiV2Token}',
          ),
          headers: headers,
          body: jsonEncode({'email': emailAddress}),
        ),
      ).thenAnswer(
        (_) async => http.Response(
          '{"token": 123, "email": "$emailAddress", "login_link": "", "auth_link":"test-auth-link"}',
          200,
        ),
      );

      AirqoApiClient airqoApiClient = AirqoApiClient(client: client);
      EmailAuthModel? emailAuthModel =
          await airqoApiClient.sendEmailReAuthenticationCode(emailAddress);
      expect(emailAuthModel, isA<EmailAuthModel>());
      expect(emailAuthModel?.emailAddress, emailAddress);
      expect(emailAuthModel?.token, 123);
      expect(emailAuthModel?.signInLink, "");
      expect(emailAuthModel?.reAuthenticationLink, "test-auth-link");
    });

    test('successfully sends a verification code via email', () async {
      AirqoApiClient airqoApiClient = AirqoApiClient();
      EmailAuthModel? emailAuthModel =
          await airqoApiClient.sendEmailVerificationCode(emailAddress);
      expect(emailAuthModel, isA<EmailAuthModel>());
      expect(emailAuthModel?.emailAddress, emailAddress);
      expect(emailAuthModel?.token.toString().length, 6);
      expect(emailAuthModel?.signInLink.isEmpty, false);
      expect(emailAuthModel?.reAuthenticationLink.isEmpty, true);
    });

    test('successfully sends a re-authentication code via email', () async {
      AirqoApiClient airqoApiClient = AirqoApiClient();
      EmailAuthModel? emailAuthModel =
          await airqoApiClient.sendEmailReAuthenticationCode(emailAddress);
      expect(emailAuthModel, isA<EmailAuthModel>());
      expect(emailAuthModel?.emailAddress, emailAddress);
      expect(emailAuthModel?.token.toString().length, 6);
      expect(emailAuthModel?.signInLink.isEmpty, true);
      expect(emailAuthModel?.reAuthenticationLink.isEmpty, false);
    });
  });
}
