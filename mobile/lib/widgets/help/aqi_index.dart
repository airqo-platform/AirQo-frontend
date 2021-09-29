import 'package:app/constants/app_constants.dart';
import 'package:app/utils/pm.dart';
import 'package:flutter/material.dart';

class AqiDialog extends StatelessWidget {
  final String good = 'Good (0 - 12) \nAir quality is good for everyone.';

  final String moderate = 'Moderate (12.1 - 35.4) \n'
      'Unusually sensitive people consider reducing '
      'prolonged or heavy exertion.';

  final String sensitive = 'Unhealthy for sensitive groups (35.6 - 55.4)\n'
      'Sensitive people should reduce prolonged or heavy exertion. '
      'It\'s OK to be active outside, but take more breaks '
      'and do less intense activities. '
      'People with asthma should follow their asthma action'
      ' plans and keep quick relief medicine handy.';

  final String unHealthy = 'Unhealthy (55.5 - 150.4)\n'
      'Everyone should avoid all physical activity outdoors. \n'
      'Sensitive people should avoid prolonged or heavy exertion. '
      'Consider moving activities indoors or rescheduling.';

  final String veryUnhealthy = 'Very unhealthy (150.5 - 250.4) \n'
      'Sensitive people should avoid all physical activity outdoors. '
      'Move activities indoors or reschedule to a time when air '
      'quality is better.';

  final String hazardous = 'Hazardous (250.5 - 500.4) \n'
      'Everyone should avoid all physical activity outdoors. \n'
      'Sensitive people should remain indoors and keep activity levels low. '
      'Follow tips for keeping particle levels low indoors.';

  final Widget whatIsAQI = Container(
      color: ColorConstants.appBodyColor,
      padding: const EdgeInsets.all(10),
      child: Text(
          'An air quality index is used by government agencies to '
          'communicate to '
          'the public how polluted the air currently is or how polluted it is '
          'forecast to become.'
          'Different countries have their own air quality indices, '
          'corresponding to different national air quality standards.',
          softWrap: true,
          style: TextStyle(
              fontSize: 17,
              fontWeight: FontWeight.w500,
              height: 1.2,
              color: ColorConstants.appColor
              // letterSpacing: 1.0
              )));

  Widget aqiGuide(String image, String body, Color color, Color textColor) {
    return Container(
      color: ColorConstants.appBodyColor,
      padding: const EdgeInsets.all(5),
      child: Row(
        crossAxisAlignment: CrossAxisAlignment.start,
        mainAxisAlignment: MainAxisAlignment.start,
        children: [
          Padding(
            padding: const EdgeInsets.all(5),
            child: Image.asset(
              image,
              height: 50,
              width: 50,
            ),
          ),
          Expanded(
            child: Padding(
              padding: const EdgeInsets.all(5),
              child: Text(body,
                  softWrap: true,
                  style: TextStyle(
                    height: 1.2,
                    color: ColorConstants.appColor,
                    fontSize: 15,
                    fontWeight: FontWeight.w500,
                    // letterSpacing: 1.0
                  )),
            ),
          )
        ],
      ),
    );
  }

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: const EdgeInsets.fromLTRB(0, 0, 0, 0),
      child: ListView(
        children: [
          whatIsAQI,
          aqiGuide('assets/images/good-face.png', good, pmToColor(0),
              pmTextColor(0)),
          aqiGuide('assets/images/moderate-face.png', moderate, pmToColor(20),
              pmTextColor(20)),
          aqiGuide('assets/images/sensitive-face.png', sensitive, pmToColor(40),
              pmTextColor(40)),
          aqiGuide('assets/images/unhealthy-face.png', unHealthy,
              pmToColor(100), pmTextColor(100)),
          aqiGuide('assets/images/very-unhealthy-face.png', veryUnhealthy,
              pmToColor(200), pmTextColor(200)),
          aqiGuide('assets/images/hazardous-face.png', hazardous,
              pmToColor(500), pmTextColor(500)),
        ],
      ),
    );
  }
}
