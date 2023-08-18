import 'package:app/blocs/blocs.dart';
import 'package:app/models/models.dart';
import 'package:app/screens/home_page.dart';
import 'package:app/screens/offline_banner.dart';
import 'package:app/screens/on_boarding/setup_complete_screen.dart';
import 'package:app/services/services.dart';
import 'package:app/themes/theme.dart';
import 'package:app/widgets/widgets.dart';
import 'package:flutter/material.dart';
import 'package:flutter_bloc/flutter_bloc.dart';

import 'on_boarding_widgets.dart';
import 'package:flutter_gen/gen_l10n/app_localizations.dart';

class LocationSetupScreen extends StatefulWidget {
  const LocationSetupScreen({super.key});

  @override
  LocationSetupScreenState createState() => LocationSetupScreenState();
}

class LocationSetupScreenState extends State<LocationSetupScreen> {
  DateTime? exitTime;

  @override
  Widget build(BuildContext context) {
    return OfflineBanner(
      child: Scaffold(
        appBar: const OnBoardingTopBar(),
        body: WillPopScope(
          onWillPop: onWillPop,
          child: AppSafeArea(
            verticalPadding: 10,
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.center,
              children: [
                const Spacer(),
                const OnBoardingLocationIcon(),
                const SizedBox(
                  height: 26,
                ),
                Padding(
                  padding: const EdgeInsets.symmetric(horizontal: 57),
                  child: Text(
                    AppLocalizations.of(context)!.enableLocations,
                    textAlign: TextAlign.center,
                    style: CustomTextStyle.headline7(context),
                  ),
                ),
                const SizedBox(
                  height: 8,
                ),
                Padding(
                  padding: const EdgeInsets.symmetric(horizontal: 45),
                  child: Text(
                    AppLocalizations.of(context)!
                        .allowAirQoToSendYouLocationAirQualityUpdateForYourWorkPlaceHome,
                    textAlign: TextAlign.center,
                    style: Theme.of(context).textTheme.bodyLarge,
                  ),
                ),
                const Spacer(),
                Padding(
                  padding: const EdgeInsets.symmetric(horizontal: 24),
                  child: NextButton(
                    text: AppLocalizations.of(context)!.yesKeepMeSafe,
                    buttonColor: CustomColors.appColorBlue,
                    callBack: () async {
                      await _allowLocation();
                    },
                  ),
                ),
                const SkipOnboardScreen(SetUpCompleteScreen()),
              ],
            ),
          ),
        ),
      ),
    );
  }

  @override
  void initState() {
    super.initState();
    _updateOnBoardingPage();
  }

  Future<void> _goToNextScreen() async {
    if (!mounted) return;
    context.read<ProfileBloc>().add(const SyncProfile());
    await Navigator.pushAndRemoveUntil(
      context,
      MaterialPageRoute(
        builder: (context) {
          return const SetUpCompleteScreen();
        },
      ),
      (r) => false,
    );
  }

  Future<void> _allowLocation() async {
    bool hasPermission =
        await PermissionService.checkPermission(AppPermission.location);
    if (hasPermission && mounted) {
      await _goToNextScreen();
    } else {
      await LocationService.requestLocation();
    }
  }

  Future<bool> onWillPop() {
    final now = DateTime.now();

    if (exitTime == null ||
        now.difference(exitTime!) > const Duration(seconds: 2)) {
      exitTime = now;

      showSnackBar(
        context,
        AppLocalizations.of(context)!.tapAgainToExit,
      );

      return Future.value(false);
    }

    Navigator.pushAndRemoveUntil(
      context,
      MaterialPageRoute(
        builder: (context) {
          return const HomePage();
        },
      ),
      (r) => false,
    );

    return Future.value(false);
  }

  void _updateOnBoardingPage() async {
    await SharedPreferencesHelper.updateOnBoardingPage(OnBoardingPage.location);
  }
}
