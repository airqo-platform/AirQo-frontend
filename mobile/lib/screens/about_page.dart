import 'package:app/constants/app_constants.dart';
import 'package:app/services/fb_notifications.dart';
import 'package:app/utils/web_view.dart';
import 'package:app/widgets/custom_widgets.dart';
import 'package:flutter/cupertino.dart';
import 'package:flutter/material.dart';
import 'package:flutter/painting.dart';
import 'package:flutter_svg/svg.dart';

class AboutAirQo extends StatefulWidget {
  const AboutAirQo({Key? key}) : super(key: key);

  @override
  _AboutAirQoState createState() => _AboutAirQoState();
}

class _AboutAirQoState extends State<AboutAirQo> {
  final CloudAnalytics _cloudAnalytics = CloudAnalytics();

  @override
  Widget build(BuildContext context) {
    return Scaffold(
        appBar: appTopBar(context, 'About'),
        body: Container(
            color: ColorConstants.appBodyColor,
            child: Center(
              child: Column(
                mainAxisAlignment: MainAxisAlignment.center,
                crossAxisAlignment: CrossAxisAlignment.center,
                children: [
                  const SizedBox(
                    height: 126,
                  ),
                  SvgPicture.asset(
                    'assets/icon/airqo_home.svg',
                    height: 52.86,
                    width: 76.91,
                    semanticsLabel: 'Search',
                  ),
                  const SizedBox(
                    height: 21.32,
                  ),
                  Text(
                    '${AppConfig.name}',
                    style: TextStyle(
                        fontSize: 28,
                        fontWeight: FontWeight.bold,
                        color: ColorConstants.appColorBlack),
                  ),
                  const SizedBox(
                    height: 12,
                  ),
                  Text(
                    '${AppConfig.version}',
                    style: TextStyle(
                        fontSize: 16, color: ColorConstants.appColorBlack),
                  ),
                  const Spacer(),
                  GestureDetector(
                    onTap: () {
                      openUrl(Links.termsUrl);
                    },
                    child: Text(
                      'Terms & Privacy Policy',
                      style: TextStyle(
                          fontSize: 16, color: ColorConstants.appColorBlue),
                    ),
                  ),
                  const SizedBox(
                    height: 90,
                  ),
                ],
              ),
            )));
  }

  @override
  void initState() {
    _cloudAnalytics.sendScreenToAnalytics('About');
    super.initState();
  }
}
