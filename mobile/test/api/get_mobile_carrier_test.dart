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
  late String phoneNumber;
  late AirqoApiClient airqoApiClient;

  group('returnsMobileCarrier', () {
    setUpAll(() async {
      await dotenv.load(fileName: Config.environmentFile);
      headers = {
        'Content-Type': 'application/json',
        'Authorization': 'JWT ${Config.airqoApiToken}'
      };
      client = MockClient();
      phoneNumber = Config.automatedTestsPhoneNumber;
      airqoApiClient = AirqoApiClient(client: client);
    });

    test('returns mocked carrier', () async {
      when(
        client.post(
          Uri.parse(
              '${AirQoUrls.mobileCarrier}?TOKEN=${Config.airqoApiV2Token}'),
          headers: headers,
          body: json.encode({'phone_number': phoneNumber}),
        ),
      ).thenAnswer(
        (_) async => http.Response(
          '{"data": {"carrier": "airtel"}}',
          200,
        ),
      );
      String carrier = await airqoApiClient.getCarrier(phoneNumber);

      expect(carrier, isA<String>());
      expect(carrier, "airtel");
    });

    test('returns empty string if phone number is empty', () async {
      when(
        client.post(
          Uri.parse(
              '${AirQoUrls.mobileCarrier}?TOKEN=${Config.airqoApiV2Token}'),
          headers: headers,
          body: json.encode({'phone_number': ''}),
        ),
      ).thenAnswer(
        (_) async => http.Response(
          '{"data": {"carrier": ""}}',
          200,
        ),
      );

      String carrier = await airqoApiClient.getCarrier("");

      expect(carrier, isA<String>());
      expect(carrier, "");
    });

    test('returns carrier from API', () async {
      AirqoApiClient airqoApiClient = AirqoApiClient();
      String carrier = await airqoApiClient.getCarrier(phoneNumber);
      expect(carrier, isA<String>());
      expect(carrier.isEmpty, false);
    });
  });
}
