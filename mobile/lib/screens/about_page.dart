import 'package:app/constants/config.dart';
import 'package:app/utils/web_view.dart';
import 'package:app/widgets/custom_widgets.dart';
import 'package:flutter/material.dart';
import 'package:flutter_svg/svg.dart';

class AboutAirQo extends StatefulWidget {
  const AboutAirQo({Key? key}) : super(key: key);

  @override
  _AboutAirQoState createState() => _AboutAirQoState();
}

class _AboutAirQoState extends State<AboutAirQo> {
  @override
  Widget build(BuildContext context) {
    return Scaffold(
        appBar: appTopBar(context, 'About'),
        body: Container(
            color: Config.appBodyColor,
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
                    Config.appName,
                    style: TextStyle(
                        fontSize: 28,
                        fontWeight: FontWeight.bold,
                        color: Config.appColorBlack),
                  ),
                  const SizedBox(
                    height: 12,
                  ),
                  Text(
                    Config.version,
                    style: TextStyle(fontSize: 16, color: Config.appColorBlack),
                  ),
                  const Spacer(),
                  GestureDetector(
                    onTap: () {
                      openUrl(Config.termsUrl);
                    },
                    child: Text(
                      'Terms & Privacy Policy',
                      style:
                          TextStyle(fontSize: 16, color: Config.appColorBlue),
                    ),
                  ),
                  const SizedBox(
                    height: 90,
                  ),
                ],
              ),
            )));
  }
}
