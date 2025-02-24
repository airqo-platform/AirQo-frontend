import 'package:app/constants/constants.dart';
import 'package:app/models/models.dart';
import 'package:app/services/rest_api.dart';
import 'package:flutter_dotenv/flutter_dotenv.dart';
import 'package:flutter_test/flutter_test.dart';

Future<void> main() async {
  test('send feedback to API', () async {
    await dotenv.load(fileName: Config.environmentFile);
    UserFeedback feedback = UserFeedback(
      contactDetails: 'automated-tests@airqo.net',
      message: 'This is an automated test. Please ignore',
      feedbackType: FeedbackType.inquiry,
    );
    AirqoApiClient airqoApiClient = AirqoApiClient();
    dynamic success = await airqoApiClient.sendFeedback(feedback);
    expect(success, isA<bool>());
    expect(success, true);
  });
}
