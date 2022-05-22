import 'package:app/constants/config.dart';
import 'package:app/utils/dialogs.dart';
import 'package:app/widgets/buttons.dart';
import 'package:flutter/material.dart';
import 'package:flutter_svg/svg.dart';

import '../../models/enum_constants.dart';
import '../../services/local_storage.dart';
import '../../themes/app_theme.dart';
import '../auth/phone_auth_widget.dart';
import 'on_boarding_widgets.dart';

class WelcomeScreen extends StatefulWidget {
  const WelcomeScreen({Key? key}) : super(key: key);

  @override
  WelcomeScreenState createState() => WelcomeScreenState();
}

class WelcomeScreenState extends State<WelcomeScreen> {
  DateTime? _exitTime;

  @override
  Widget build(BuildContext context) {
    return Scaffold(
        appBar: const OnBoardingAppBar(),
        backgroundColor: Config.appBodyColor,
        body: WillPopScope(
          onWillPop: onWillPop,
          child: Padding(
            padding: const EdgeInsets.only(left: 24, right: 24.0),
            child:
                Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
              const SizedBox(
                height: 56,
              ),
              Text(
                'Welcome to',
                style: Theme.of(context).textTheme.headline6,
              ),
              Text(
                'AirQo',
                style: Theme.of(context)
                    .textTheme
                    .headline6
                    ?.copyWith(color: Config.appColorBlue),
              ),
              const SizedBox(
                height: 21,
              ),
              welcomeSection(
                  'Save your favorite places',
                  'Keep track of air quality in locations that matter to you',
                  'assets/icon/onboarding_fav.svg'),
              const SizedBox(
                height: 24,
              ),
              welcomeSection(
                  'New experiences for You',
                  'Access analytics and content curated just for you',
                  'assets/icon/onboarding_hash_tag.svg'),
              const SizedBox(
                height: 24,
              ),
              welcomeSection(
                  'Know your air on the go',
                  'An easy way to plan your outdoor activities to minimise'
                      ' excessive exposure to bad air quality ',
                  'assets/icon/onboarding_profile_icon.svg'),
              const Spacer(),
              GestureDetector(
                onTap: () {
                  Navigator.pushAndRemoveUntil(context,
                      MaterialPageRoute(builder: (context) {
                    return const PhoneSignUpWidget();
                  }), (r) => false);
                },
                child: NextButton(
                  text: 'Let\'s go',
                  buttonColor: Config.appColorBlue,
                ),
              ),
              const SizedBox(
                height: 40,
              ),
            ]),
          ),
        ));
  }

  @override
  void initState() {
    super.initState();
    updateOnBoardingPage();
  }

  Future<bool> onWillPop() {
    var now = DateTime.now();

    if (_exitTime == null ||
        now.difference(_exitTime!) > const Duration(seconds: 2)) {
      _exitTime = now;

      showSnackBar(context, 'Tap again to exit !');
      return Future.value(false);
    }
    return Future.value(true);
  }

  void updateOnBoardingPage() async {
    await SharedPreferencesHelper.updateOnBoardingPage(OnBoardingPage.welcome);
  }

  Widget welcomeSection(
    String header,
    String body,
    String svg,
  ) {
    return ListTile(
        contentPadding: const EdgeInsets.only(left: 0.0, right: 20),
        horizontalTitleGap: 16,
        leading: SizedBox(
          height: 40,
          width: 40,
          child: SvgPicture.asset(
            svg,
          ),
        ),
        title: Text(
          header,
          style: CustomTextStyle.headline10(context),
        ),
        subtitle: Padding(
          padding: const EdgeInsets.only(top: 4.0),
          child: Text(
            body,
            style: Theme.of(context)
                .textTheme
                .bodyText2
                ?.copyWith(color: Config.appColorBlack.withOpacity(0.5)),
          ),
        ));
  }
}
