import 'package:app/constants/app_constants.dart';
import 'package:app/utils/pm.dart';
import 'package:flutter/material.dart';

class AqiDialog extends StatelessWidget {
  final String good = 'Air quality is satisfactory,'
      ' and air pollution poses little or no risk.';

  final String moderate = ''
      'Air quality is acceptable. However, '
      'there may be a risk for some people, '
      'particularly those who are unusually sensitive to air pollution.\n\n'
      '- Unusually sensitive people consider '
      'reducing prolonged or heavy exertion.';

  final String sensitive =
      'Members of sensitive groups may experience health effects.'
      ' The general public is less likely to be affected.\n\n'
      '- Sensitive people should reduce prolonged or heavy exertion.\n\n'
      '- People with asthma should follow their asthma action'
      ' plans and keep quick relief medicine handy.';

  final String unHealthy =
      'Some members of the general public may experience health effects;'
      ' members of sensitive groups may experience'
      ' more serious health effects.\n\n'
      '- Everyone should avoid all physical activity outdoors. \n\n'
      '- Sensitive people should avoid prolonged or heavy exertion.\n\n'
      '- Consider moving activities indoors or rescheduling.';

  final String veryUnhealthy =
      'Health alert: The risk of health effects is increased for everyone.\n\n'
      '- Sensitive people should avoid all physical activity outdoors.\n\n'
      '- Consider indoors activities or reschedule to a time when air '
      'quality is better.';

  final String hazardous = 'Health warning of emergency conditions: '
      'everyone is more likely to be affected.\n\n'
      '- Everyone should avoid all physical activity outdoors. \n\n'
      '- Follow tips for keeping particle levels low indoors.';

  final Widget whatIsAQI = Container(
      color: ColorConstants.appBodyColor,
      padding: const EdgeInsets.all(10),
      child: Text(
          'While communicating air quality, an Air Quality Index (AQI) is '
          'used. Its goal is to create a a single scale'
          ' that allows users'
          ' to compare and summarize the severity of different '
          'pollutants including PM2.5, PM10, NO2 and Ozone.',
          softWrap: true,
          style: TextStyle(
              // fontSize: 17,
              fontWeight: FontWeight.w500,
              height: 1.7,
              color: ColorConstants.appColor
              // letterSpacing: 1.0
              )));

  Widget aqiGuide(
      String image, String body, Color color, Color textColor, String title) {
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
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(title,
                      softWrap: true,
                      textAlign: TextAlign.start,
                      style: TextStyle(
                        height: 1.7,
                        color: ColorConstants.appColor,
                        fontWeight: FontWeight.bold,
                        // letterSpacing: 1.0
                      )),
                  Text(body,
                      softWrap: true,
                      textAlign: TextAlign.start,
                      style: TextStyle(
                        height: 1.7,
                        color: ColorConstants.appColor,
                        fontWeight: FontWeight.w500,
                        // letterSpacing: 1.0
                      ))
                ],
              ),
            ),
          ),
        ],
      ),
    );
  }

  @override
  Widget build(BuildContext context) {
    return Container(
      color: ColorConstants.appBodyColor,
      padding: const EdgeInsets.fromLTRB(0, 0, 0, 0),
      child: ListView(
        children: [
          whatIsAQI,
          aqiGuide('assets/images/good-face.png', good, pmToColor(0),
              pmTextColor(0), 'Good (0 - 12)'),
          Divider(
            indent: 30,
            endIndent: 30,
            color: ColorConstants.appColor,
          ),
          aqiGuide('assets/images/moderate-face.png', moderate, pmToColor(20),
              pmTextColor(20), 'Moderate (12.1 - 35.4)'),
          Divider(
            indent: 30,
            endIndent: 30,
            color: ColorConstants.appColor,
          ),
          aqiGuide('assets/images/sensitive-face.png', sensitive, pmToColor(40),
              pmTextColor(40), 'Unhealthy for sensitive groups (35.6 - 55.4)'),
          Divider(
            indent: 30,
            endIndent: 30,
            color: ColorConstants.appColor,
          ),
          aqiGuide('assets/images/unhealthy-face.png', unHealthy,
              pmToColor(100), pmTextColor(100), 'Unhealthy (55.5 - 150.4)'),
          Divider(
            indent: 30,
            endIndent: 30,
            color: ColorConstants.appColor,
          ),
          aqiGuide(
              'assets/images/very-unhealthy-face.png',
              veryUnhealthy,
              pmToColor(200),
              pmTextColor(200),
              'Very unhealthy (150.5 - 250.4)'),
          Divider(
            indent: 30,
            endIndent: 30,
            color: ColorConstants.appColor,
          ),
          aqiGuide('assets/images/hazardous-face.png', hazardous,
              pmToColor(500), pmTextColor(500), 'Hazardous (250.5 - 500.4)'),
        ],
      ),
    );
  }
}
