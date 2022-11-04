import 'package:app/models/models.dart';
import 'package:app/services/services.dart';
import 'package:app/themes/theme.dart';
import 'package:app/widgets/widgets.dart';
import 'package:flutter/material.dart';
import 'package:flutter_svg/svg.dart';

import '../auth/phone_auth_widget.dart';
import 'on_boarding_widgets.dart';

class IntroductionScreen extends StatefulWidget {
  const IntroductionScreen({
    super.key,
  });

  @override
  IntroductionScreenState createState() => IntroductionScreenState();
}

class IntroductionScreenState extends State<IntroductionScreen> {
  DateTime? _exitTime;

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: const OnBoardingTopBar(),
      body: WillPopScope(
        onWillPop: onWillPop,
        child: AppSafeArea(
          horizontalPadding: 24,
          widget: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Text(
                'Welcome to',
                style: Theme.of(context).textTheme.headline6,
              ),
              Text(
                'AirQo',
                style: Theme.of(context).textTheme.headline6?.copyWith(
                      color: CustomColors.appColorBlue,
                    ),
              ),
              const SizedBox(
                height: 21,
              ),
              WelcomeSection(
                header: 'Save your favorite places',
                body:
                    'Keep track of air quality in locations that matter to you',
                svg: 'assets/icon/onboarding_fav.svg',
              ),
              const SizedBox(
                height: 24,
              ),
              WelcomeSection(
                header: 'New experiences for You',
                body: 'Access analytics and content curated just for you',
                svg: 'assets/icon/onboarding_hash_tag.svg',
              ),
              const SizedBox(
                height: 24,
              ),
              WelcomeSection(
                header: 'Know your air on the go',
                body: 'An easy way to plan your outdoor activities to minimise'
                    ' excessive exposure to bad air quality ',
                svg: 'assets/icon/onboarding_profile_icon.svg',
              ),
              const Spacer(),
              GestureDetector(
                onTap: () {
                  Navigator.pushAndRemoveUntil(
                    context,
                    MaterialPageRoute(builder: (context) {
                      return const PhoneSignUpWidget();
                    }),
                    (r) => false,
                  );
                },
                child: NextButton(
                  text: 'Let’s go',
                  buttonColor: CustomColors.appColorBlue,
                ),
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
    updateOnBoardingPage();
  }

  Future<bool> onWillPop() {
    final now = DateTime.now();

    if (_exitTime == null ||
        now.difference(_exitTime!) > const Duration(seconds: 2)) {
      _exitTime = now;

      showSnackBar(
        context,
        'Tap again to exit !',
      );

      return Future.value(false);
    }

    return Future.value(true);
  }

  void updateOnBoardingPage() async {
    await SharedPreferencesHelper.updateOnBoardingPage(OnBoardingPage.welcome);
  }
}

class WelcomeSection extends StatelessWidget {
  const WelcomeSection({
    super.key,
    required this.header,
    required this.body,
    required this.svg,
  });

  final String header;
  final String body;
  final String svg;

  @override
  Widget build(BuildContext context) {
    return ListTile(
      contentPadding: const EdgeInsets.only(left: 0.0, right: 20),
      horizontalTitleGap: 16,
      leading: SizedBox(
        height: 40,
        width: 40,
        child: SvgPicture.asset(svg),
      ),
      title: Text(
        header,
        style: CustomTextStyle.headline10(context),
      ),
      subtitle: Padding(
        padding: const EdgeInsets.only(top: 4.0),
        child: Text(
          body,
          style: Theme.of(context).textTheme.bodyText2?.copyWith(
                color: CustomColors.appColorBlack.withOpacity(0.5),
              ),
        ),
      ),
    );
  }
}
