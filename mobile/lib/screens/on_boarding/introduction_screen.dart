import 'package:app/blocs/blocs.dart';
import 'package:app/models/models.dart';
import 'package:app/services/services.dart';
import 'package:app/themes/theme.dart';
import 'package:app/widgets/widgets.dart';
import 'package:flutter/material.dart';
import 'package:flutter_bloc/flutter_bloc.dart';
import 'package:flutter_svg/svg.dart';
import 'package:url_launcher/url_launcher.dart';

import '../auth/email_auth_widget.dart';
import '../auth/phone_auth_widget.dart';
import '../settings/update_screen.dart';
import 'on_boarding_widgets.dart';

class IntroductionScreen extends StatefulWidget {
  const IntroductionScreen({super.key});

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
          verticalPadding: 10,
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Text(
                'Welcome to',
                style: Theme.of(context).textTheme.titleLarge,
              ),
              Text(
                'AirQo',
                style: Theme.of(context).textTheme.titleLarge?.copyWith(
                      color: CustomColors.appColorBlue,
                    ),
              ),
              const SizedBox(
                height: 21,
              ),
              const WelcomeSection(
                header: 'Save your favorite places',
                body:
                    'Keep track of air quality in locations that matter to you',
                svg: 'assets/icon/onboarding_fav.svg',
              ),
              const SizedBox(
                height: 24,
              ),
              const WelcomeSection(
                header: 'New experiences for You',
                body: 'Access analytics and content curated just for you',
                svg: 'assets/icon/onboarding_hash_tag.svg',
              ),
              const SizedBox(
                height: 24,
              ),
              const WelcomeSection(
                header: 'Know your air on the go',
                body: 'An easy way to plan your outdoor activities to minimise'
                    ' excessive exposure to bad air quality ',
                svg: 'assets/icon/onboarding_profile_icon.svg',
              ),
              const Spacer(),
              NextButton(
                text: 'Let’s go',
                buttonColor: CustomColors.appColorBlue,
                callBack: () {
                  Navigator.pushAndRemoveUntil(
                    context,
                    MaterialPageRoute(builder: (context) {
                      return const EmailSignUpWidget();
                    }),
                    (r) => false,
                  );
                },
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
    WidgetsBinding.instance.addPostFrameCallback((_) async {
      if (context.read<DashboardBloc>().state.checkForUpdates) {
        await AppService().latestVersion().then((version) async {
          if (version != null && mounted) {
            await canLaunchUrl(version.url).then((bool result) async {
              await openUpdateScreen(context, version);
            });
          }
        });
      }
    });
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
          style: Theme.of(context).textTheme.bodyMedium?.copyWith(
                color: CustomColors.appColorBlack.withOpacity(0.5),
              ),
        ),
      ),
    );
  }
}
