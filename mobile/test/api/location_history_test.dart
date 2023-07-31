import 'package:app/constants/constants.dart';
import 'package:app/models/models.dart';
import 'package:app/services/rest_api.dart';
import 'package:flutter_dotenv/flutter_dotenv.dart';
import 'package:flutter_test/flutter_test.dart';

Future<void> main() async {
  late Map<String, String> headers;

  group('locationHistory', () {
    setUpAll(() async {
      await dotenv.load(fileName: Config.environmentFile);
      headers = {
        'Authorization': 'JWT ${Config.airqoJWTToken}',
        'service': ApiService.auth.serviceName,
      };
    });

    test('successfully get location History', () async {
      String userId = "test";
      List<LocationHistory> histories =
          await AirqoApiClient().fetchLocationHistory(userId);

      expect(histories, isA<List<LocationHistory>>());
      for (LocationHistory history in histories) {
        expect(history.location, "testLocation");
        expect(history.name, "testName");
      }
    });

    test('successfully sync location History', () async {
      String userId = "test";
      List<LocationHistory> historyList = [
        LocationHistory(
            location: "testLocation2",
            name: "testName",
            latitude: 21.423,
            longitude: 21.423,
            placeId: "60d058c8048305120d2d6174",
            dateTime: DateTime(2021, 8, 30, 16, 0, 0, 0, 0),
            site: "60d058c8048305120d2d6173"),
      ];
      bool response =
          await AirqoApiClient().syncLocationHistory(historyList, userId);

      expect(response, true);
    });
  });
}
