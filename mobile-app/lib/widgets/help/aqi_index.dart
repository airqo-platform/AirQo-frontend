import 'package:app/constants/app_constants.dart';
import 'package:app/screens/web_view.dart';
import 'package:app/utils/pm.dart';
import 'package:flutter/material.dart';

class AqiDialog extends StatelessWidget {
  final String good = 'Air quality is considered satisfactory,'
      ' and air pollution poses little or no risk';

  final String moderate = ''
      'Air quality is acceptable; however, for some '
      'pollutants, there may be a moderate health concern for'
      ' a very small number of people who are unusually'
      ' sensitive to air pollution.'
      '\n\n'
      '- People who are unusually sensitive to ozone may '
      'experience respiratory symptoms';

  final String sensitive =
      'Members of sensitive groups may experience health effects.'
      ' The general public is not likely to be affected.'
      '\n\n'
      '- Although the general public is not likely to be affected'
      ' at this AQI range, people with lung disease, older adults, '
      'and children are at greater risk from exposure to ozone, '
      'whereas persons with heart and lung disease, older adults'
      ' and children are at greater risk from the presence of '
      'particles in the air.'
      '';

  final String unHealthy = 'Everyone may begin to experience health effects;'
      ' members of sensitive groups may experience more serious health effect'
      '\n\n'
      '- Everyone should avoid all physical activity outdoors. \n\n'
      '- Sensitive people should avoid prolonged or heavy exertion.\n\n'
      '- Consider moving activities indoors or rescheduling.';

  final String veryUnhealthy = 'Health warnings of emergency conditions. '
      'The entire population is more likely to be affected.'
      '\n\n'
      '- Sensitive people should avoid all physical activity outdoors.\n\n'
      '- Consider indoors activities or reschedule to a time when air '
      'quality is better.';

  final String hazardous =
      'Health alert: everyone may experience more serious health effect'
      '\n\n'
      '- Everyone should avoid all physical activities outdoor ';

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
          aqiGuide('assets/images/good-face.png', good, pm2_5ToColor(0),
              pm2_5TextColor(0), '0-50   Good'),
          Divider(
            indent: 30,
            endIndent: 30,
            color: ColorConstants.appColor,
          ),
          aqiGuide('assets/images/moderate-face.png', moderate,
              pm2_5ToColor(20), pm2_5TextColor(20), '51 -100  Moderate'),
          Divider(
            indent: 30,
            endIndent: 30,
            color: ColorConstants.appColor,
          ),
          aqiGuide(
              'assets/images/sensitive-face.png',
              sensitive,
              pm2_5ToColor(40),
              pm2_5TextColor(40),
              '101-150  Unhealthy for Sensitive Groups'),
          Divider(
            indent: 30,
            endIndent: 30,
            color: ColorConstants.appColor,
          ),
          aqiGuide('assets/images/unhealthy-face.png', unHealthy,
              pm2_5ToColor(100), pm2_5TextColor(100), '151-200  Unhealthy'),
          Divider(
            indent: 30,
            endIndent: 30,
            color: ColorConstants.appColor,
          ),
          aqiGuide(
              'assets/images/very-unhealthy-face.png',
              veryUnhealthy,
              pm2_5ToColor(200),
              pm2_5TextColor(200),
              '201-300  Very unhealthy'),
          Divider(
            indent: 30,
            endIndent: 30,
            color: ColorConstants.appColor,
          ),
          aqiGuide('assets/images/hazardous-face.png', hazardous,
              pm2_5ToColor(500), pm2_5TextColor(500), '300+  Hazardous'),
          reference(),
        ],
      ),
    );
  }

  Widget reference() {
    return Padding(
      padding: const EdgeInsets.fromLTRB(0, 2, 0, 0),
      child: Row(
        crossAxisAlignment: CrossAxisAlignment.center,
        mainAxisAlignment: MainAxisAlignment.center,
        children: [
          ElevatedButton(
              style: ElevatedButton.styleFrom(primary: ColorConstants.appColor),
              onPressed: () {
                openUrl(Links.epaUrl);
              },
              child: const Text('Source: U.S. Environmental Protection Agency',
                  softWrap: true,
                  style: TextStyle(
                      height: 1.5,
                      color: Colors.white,
                      fontWeight: FontWeight.bold
                      // letterSpacing: 1.0
                      )))
        ],
      ),
    );
  }
}
