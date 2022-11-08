import 'package:app/constants/config.dart';
import 'package:app/screens/web_view_page.dart';
import 'package:app/themes/theme.dart';
import 'package:app/widgets/widgets.dart';
import 'package:flutter/material.dart';
import 'package:flutter_svg/svg.dart';
import 'package:package_info_plus/package_info_plus.dart';

class AboutAirQo extends StatefulWidget {
  const AboutAirQo({
    super.key,
  });

  @override
  State<AboutAirQo> createState() => _AboutAirQoState();
}

class _AboutAirQoState extends State<AboutAirQo> {
  PackageInfo _packageInfo = PackageInfo(
    appName: 'AirQo',
    packageName: 'Unknown',
    version: 'v1.0.0',
    buildNumber: '1',
    buildSignature: 'Unknown',
  );

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: const AppTopBar('About'),
      body: CustomSafeArea(
        backgroundColor: CustomColors.appBodyColor,
        widget: Center(
          child: Column(
            children: [
              const Spacer(),
              SvgPicture.asset(
                'assets/icon/airqo_logo.svg',
                height: 52.86,
                width: 76.91,
                semanticsLabel: 'Home',
              ),
              const SizedBox(
                height: 22,
              ),
              Text(
                _packageInfo.appName,
                style: CustomTextStyle.headline11(context),
              ),
              const SizedBox(
                height: 12,
              ),
              Text(
                _packageInfo.version,
                style: Theme.of(context).textTheme.subtitle1?.copyWith(
                      color: CustomColors.appColorBlack.withOpacity(0.5),
                    ),
              ),
              const Spacer(),
              GestureDetector(
                onTap: () async {
                  await Navigator.push(
                    context,
                    MaterialPageRoute(
                      builder: (context) {
                        return WebViewScreen(
                          url: Config.termsUrl,
                          title: 'Terms & Privacy Policy',
                        );
                      },
                    ),
                  );
                },
                child: Text(
                  'Terms & Privacy Policy',
                  style: Theme.of(context).textTheme.subtitle1?.copyWith(
                        color: CustomColors.appColorBlue,
                      ),
                ),
              ),
              const SizedBox(
                height: 20,
              ),
            ],
          ),
        ),
      ),
    );
  }

  @override
  void initState() {
    super.initState();
    _initPackageInfo();
  }

  Future<void> _initPackageInfo() async {
    final info = await PackageInfo.fromPlatform();
    setState(() => _packageInfo = info);
  }
}
