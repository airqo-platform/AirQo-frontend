import 'dart:io';

import 'package:app/blocs/blocs.dart';
import 'package:app/models/models.dart';
import 'package:app/services/services.dart';
import 'package:app/themes/theme.dart';
import 'package:app/widgets/widgets.dart';
import 'package:auto_size_text/auto_size_text.dart';
import 'package:flutter/material.dart';
import 'package:flutter_bloc/flutter_bloc.dart';
import 'package:flutter_gen/gen_l10n/app_localizations.dart';
import 'package:flutter_svg/svg.dart';
import 'package:package_info_plus/package_info_plus.dart';
import 'package:url_launcher/url_launcher.dart';

import '../phone_authentication/phone_auth_screen.dart';
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
              AutoSizeText(
                maxLines: 3,
                minFontSize: 1,
                //overflow: TextOverflow.ellipsis,
                AppLocalizations.of(context)!.welcomeTo,
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
              WelcomeSection(
                header: AppLocalizations.of(context)!.saveYourFavoritePlaces,
                body: AppLocalizations.of(context)!
                    .keepTrackOfAirQualityInLocationsThatMatterToYou,
                svg: 'assets/icon/onboarding_fav.svg',
              ),
              const SizedBox(
                height: 24,
              ),
              WelcomeSection(
                header: AppLocalizations.of(context)!.newExperiencesForYou,
                body: AppLocalizations.of(context)!
                    .accessAnalyticsAndContentCuratedJustForYou,
                svg: 'assets/icon/onboarding_hash_tag.svg',
              ),
              const SizedBox(
                height: 24,
              ),
              WelcomeSection(
                header: AppLocalizations.of(context)!.knowYourAirOnTheGo,
                body: AppLocalizations.of(context)!
                    .anEasyWayToPlanYourOutdoorActivitiesToMinimiseexcessiveExposureToBadAirQuality,
                svg: 'assets/icon/onboarding_profile_icon.svg',
              ),
              const Spacer(),
              NextButton(
                text: AppLocalizations.of(context)!.letsGo,
                buttonColor: CustomColors.appColorBlue,
                callBack: () {
                  Navigator.pushAndRemoveUntil(
                    context,
                    MaterialPageRoute(builder: (context) {
                      return const PhoneSignUpScreen();
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
        final PackageInfo packageInfo = await PackageInfo.fromPlatform();

        await AirqoApiClient()
            .getAppVersion(
          currentVersion: packageInfo.version,
          bundleId: Platform.isIOS ? packageInfo.packageName : null,
          packageName: Platform.isAndroid ? packageInfo.packageName : null,
        )
            .then((version) async {
          if (version != null && mounted && !version.isUpdated) {
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
        AppLocalizations.of(context)!.tapAgainToExit,
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
      title: AutoSizeText(
        maxLines: 2,
        minFontSize: 1,
        header,
        style: CustomTextStyle.headline10(context),
      ),
      subtitle: Padding(
        padding: const EdgeInsets.only(top: 4.0),
        child: AutoSizeText(
          maxLines: 5,
          minFontSize: 1,
          body,
          style: Theme.of(context).textTheme.bodyMedium?.copyWith(
                color: CustomColors.appColorBlack.withOpacity(0.5),
              ),
        ),
      ),
    );
  }
}
