import 'dart:convert';

import 'package:app/constants/constants.dart';
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

  group('checkIfUserExists', () {
    setUpAll(() async {
      await dotenv.load(fileName: Config.environmentFile);
      headers = {
        'Content-Type': 'application/json',
        'Authorization': 'JWT ${Config.airqoApiToken}'
      };
      client = MockClient();
    });

    test('returns true if user is already signed up with email address',
        () async {
      when(
        client.post(
          Uri.parse(
              '${AirQoUrls.firebaseLookup}?TOKEN=${Config.airqoApiV2Token}'),
          headers: headers,
          body: jsonEncode({"email": "guest@airqo.net"}),
        ),
      ).thenAnswer(
        (_) async => http.Response('{"exists": true}', 200),
      );

      AirqoApiClient airqoApiClient = AirqoApiClient(client: client);

      expect(
          await airqoApiClient.checkIfUserExists(
              emailAddress: "guest@airqo.net"),
          true);
    });

    test('returns false if user is not signed up with email address', () async {
      when(
        client.post(
          Uri.parse(
              '${AirQoUrls.firebaseLookup}?TOKEN=${Config.airqoApiV2Token}'),
          headers: headers,
          body: jsonEncode({"email": "guest@airqo.net"}),
        ),
      ).thenAnswer(
        (_) async => http.Response('{"exists": false}', 200),
      );

      AirqoApiClient airqoApiClient = AirqoApiClient(client: client);

      expect(
          await airqoApiClient.checkIfUserExists(
              emailAddress: "guest@airqo.net"),
          false);
    });

    test('returns true if user is already signed up with a phone number',
        () async {
      when(
        client.post(
          Uri.parse(
              '${AirQoUrls.firebaseLookup}?TOKEN=${Config.airqoApiV2Token}'),
          headers: headers,
          body: jsonEncode({"phoneNumber": "+256700000001"}),
        ),
      ).thenAnswer(
        (_) async => http.Response('{"exists": true}', 200),
      );

      AirqoApiClient airqoApiClient = AirqoApiClient(client: client);

      expect(
          await airqoApiClient.checkIfUserExists(phoneNumber: "+256700000001"),
          true);
    });

    test('returns false if user is not signed up with a phone number',
        () async {
      when(
        client.post(
          Uri.parse(
              '${AirQoUrls.firebaseLookup}?TOKEN=${Config.airqoApiV2Token}'),
          headers: headers,
          body: jsonEncode({"phoneNumber": "+256700000001"}),
        ),
      ).thenAnswer(
        (_) async => http.Response('{"exists": false}', 200),
      );

      AirqoApiClient airqoApiClient = AirqoApiClient(client: client);

      expect(
          await airqoApiClient.checkIfUserExists(phoneNumber: "+256700000001"),
          false);
    });

    test('returns null if exists not in response body', () async {
      when(
        client.post(
          Uri.parse(
              '${AirQoUrls.firebaseLookup}?TOKEN=${Config.airqoApiV2Token}'),
          headers: headers,
          body: jsonEncode({"phoneNumber": "+256700000001"}),
        ),
      ).thenAnswer(
        (_) async => http.Response('', 200),
      );

      AirqoApiClient airqoApiClient = AirqoApiClient(client: client);

      expect(
          await airqoApiClient.checkIfUserExists(phoneNumber: "+256700000001"),
          null);
    });

    test('returns null if exists is not a boolean', () async {
      when(
        client.post(
          Uri.parse(
              '${AirQoUrls.firebaseLookup}?TOKEN=${Config.airqoApiV2Token}'),
          headers: headers,
          body: jsonEncode({"phoneNumber": "+256700000001"}),
        ),
      ).thenAnswer(
        (_) async => http.Response('{"exists": "false"}', 200),
      );

      AirqoApiClient airqoApiClient = AirqoApiClient(client: client);

      expect(
          await airqoApiClient.checkIfUserExists(phoneNumber: "+256700000001"),
          null);
    });

    test('returns null if a phone number or email is not provided', () async {
      AirqoApiClient airqoApiClient = AirqoApiClient();
      expect(await airqoApiClient.checkIfUserExists(), null);
    });
  });
}
