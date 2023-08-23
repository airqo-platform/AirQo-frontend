import 'package:app/constants/constants.dart';
import 'package:app/services/rest_api.dart';
import 'package:flutter_dotenv/flutter_dotenv.dart';
import 'package:flutter_test/flutter_test.dart';

Future<void> main() async {
  test('returns carrier from API', () async {
    await dotenv.load(fileName: Config.environmentFile);
    AirqoApiClient airqoApiClient = AirqoApiClient();
    String carrier = await airqoApiClient.getCarrier(
      Config.automatedTestsPhoneNumber,
    );
    expect(carrier, isA<String>());
    expect(carrier.isEmpty, false);
  });
}
