import 'package:app/blocs/profile/profile_bloc.dart';
import 'package:app/constants/config.dart';
import 'package:app/models/enum_constants.dart';
import 'package:app/models/profile.dart';
import 'package:app/new_authentication/login.dart';
import 'package:app/screens/home_page.dart';
import 'package:app/screens/offline_banner.dart';
import 'package:app/services/firebase_service.dart';
import 'package:app/services/local_storage.dart';
import 'package:app/services/location_service.dart';
import 'package:app/services/native_api.dart';
import 'package:app/services/notification_service.dart';
import 'package:app/themes/app_theme.dart';
import 'package:app/themes/colors.dart';
import 'package:app/utils/extensions.dart';
import 'package:app/widgets/buttons.dart';
import 'package:app/widgets/custom_widgets.dart';
import 'package:app/widgets/dialogs.dart';
import 'package:app/widgets/text_fields.dart';
import 'package:firebase_messaging/firebase_messaging.dart';
import 'package:flutter/material.dart';
import 'package:flutter_bloc/flutter_bloc.dart';
import 'package:flutter_gen/gen_l10n/app_localizations.dart';
import 'package:flutter_svg/svg.dart';

class NotificationsSetupScreen extends StatefulWidget {
  const NotificationsSetupScreen({super.key});

  @override
  NotificationsSetupScreenState createState() =>
      NotificationsSetupScreenState();
}

class NotificationsSetupScreenState extends State<NotificationsSetupScreen> {
  DateTime? exitTime;

  @override
  Widget build(BuildContext context) {
    return OfflineBanner(
      child: Scaffold(
        backgroundColor: const Color(0xff34373B),
        appBar: const OnBoardingTopBar(
          backgroundColor: Color(0xff34373B),
        ),
        body: PopScope(
          onPopInvoked: ((didPop) {
            if (didPop) {
              onWillPop();
            }
          }),
          child: AppSafeArea(
            backgroundColor: const Color(0xff34373B),
            verticalPadding: 10,
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.center,
              children: [
                const Spacer(),
                const OnBoardingNotificationIcon(),
                const SizedBox(
                  height: 26,
                ),
                Padding(
                  padding: const EdgeInsets.symmetric(horizontal: 40),
                  child: Text(
                    AppLocalizations.of(context)!.knowYourAirInRealTime,
                    textAlign: TextAlign.center,
                    style: Theme.of(context).textTheme.headlineMedium,
                  ),
                ),
                const SizedBox(
                  height: 8,
                ),
                Padding(
                  padding: const EdgeInsets.symmetric(horizontal: 40),
                  child: Text(
                    AppLocalizations.of(context)!
                        .getNotifiedWhenAirQualityIsGettingBetterOrWorse,
                    textAlign: TextAlign.center,
                    style: Theme.of(context).textTheme.bodyLarge,
                  ),
                ),
                const Spacer(),
                Padding(
                  padding: const EdgeInsets.symmetric(horizontal: 40),
                  child: NextButton(
                    text: AppLocalizations.of(context)!.yesKeepMeUpdated,
                    buttonColor: CustomColors.appColorBlue,
                    callBack: () async {
                      await _allowNotifications();
                    },
                  ),
                ),
                const SkipOnboardScreen(LocationSetupScreen()),
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

  Future<void> _allowNotifications() async {
    bool hasPermission =
        await PermissionService.checkPermission(AppPermission.notification);
    if (hasPermission && mounted) {
      await FirebaseMessaging.instance
          .subscribeToTopic(Config.notificationsTopic);

      Profile profile = context.read<ProfileBloc>().state;
      context
          .read<ProfileBloc>()
          .add(UpdateProfile(profile.copyWith(notifications: hasPermission)));
      await Navigator.pushAndRemoveUntil(
        context,
        MaterialPageRoute(
          builder: (context) {
            return const LocationSetupScreen();
          },
        ),
        (r) => false,
      );
      CloudAnalytics.logAllowNotification();
    } else {
      NotificationService.requestNotification(context, "onboarding");
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
      MaterialPageRoute(builder: (context) {
        return const HomePage();
      }),
      (r) => false,
    );

    return Future.value(false);
  }

  void _updateOnBoardingPage() async {
    await SharedPreferencesHelper.updateOnBoardingPage(
      OnBoardingPage.notification,
    );
  }
}

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
        appBar: const OnBoardingTopBar(
          backgroundColor: Color(0xff34373B),
        ),
        body: PopScope(
          onPopInvoked: ((didPop) {
            if (didPop) {
              onWillPop();
            }
          }),
          child: AppSafeArea(
            backgroundColor: const Color(0xff34373B),
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
                // const SkipOnboardScreen(SetUpCompleteScreen()),
                const SkipOnboardScreen(
                  OnboardingQuiz(),
                ),
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

  Future<void> _allowLocation() async {
    bool hasPermission =
        await PermissionService.checkPermission(AppPermission.location);
    if (hasPermission && mounted) {
      Profile profile = context.read<ProfileBloc>().state;
      context.read<ProfileBloc>().add(UpdateProfile(
            profile.copyWith(
              location: hasPermission,
            ),
          ));
      await Navigator.pushAndRemoveUntil(
        context,
        MaterialPageRoute(
          builder: (context) {
            return const SetUpCompleteScreen();
          },
        ),
        (r) => false,
      );
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

class SetUpCompleteScreen extends StatefulWidget {
  const SetUpCompleteScreen({super.key});

  @override
  SetUpCompleteScreenState createState() => SetUpCompleteScreenState();
}

class SetUpCompleteScreenState extends State<SetUpCompleteScreen> {
  @override
  Widget build(BuildContext context) {
    return OfflineBanner(
      child: Scaffold(
        appBar: const OnBoardingTopBar(
          backgroundColor: Color(0xff34373B),
        ),
        body: PopScope(
          onPopInvoked: ((didPop) {
            if (didPop) {
              _onWillPop();
            }
          }),
          child: AppSafeArea(
            backgroundColor: const Color(0xff34373B),
            child: GestureDetector(
              onTap: () {
                Navigator.pushAndRemoveUntil(
                  context,
                  MaterialPageRoute(builder: (context) {
                    return const LoginPage();
                  }),
                  (r) => false,
                );
              },
              child: Center(
                child: Column(
                  mainAxisAlignment: MainAxisAlignment.center,
                  children: [
                    Text(
                      'Welcome',
                      textAlign: TextAlign.center,
                      style: _setUpCompleteTextStyle(),
                    ),
                    Text(
                      'Hakim!',
                      textAlign: TextAlign.center,
                      style: _setUpCompleteTextStyle()?.copyWith(
                        color: CustomColors.appColorBlue,
                      ),
                    ),
                  ],
                ),
              ),
            ),
          ),
        ),
      ),
    );
  }

  Future<void> _initialize() async {
    await SharedPreferencesHelper.updateOnBoardingPage(OnBoardingPage.complete);
    Future.delayed(const Duration(seconds: 3), () async {
      await _goToHome();
    });
  }

  @override
  void initState() {
    super.initState();
    _initialize();
  }

  Future<bool> _onWillPop() {
    _goToHome();

    return Future.value(false);
  }

  Future<void> _goToHome() async {
    if (mounted) {
      await Navigator.pushAndRemoveUntil(
        context,
        MaterialPageRoute(
          builder: (context) {
            return const HomePage();
          },
        ),
        (r) => false,
      );
    }
  }

  TextStyle? _setUpCompleteTextStyle() {
    return Theme.of(context).textTheme.bodyLarge?.copyWith(
          fontWeight: FontWeight.bold,
          fontStyle: FontStyle.normal,
          fontSize: 48,
          height: 56 / 48,
          letterSpacing: 16 * -0.022,
        );
  }
}

OnBoardingPage getOnBoardingPageConstant(String value) {
  switch (value) {
    case 'signup':
      return OnBoardingPage.signup;
    case 'profile':
      return OnBoardingPage.profile;
    case 'notification':
      return OnBoardingPage.notification;
    case 'location':
      return OnBoardingPage.location;
    case 'complete':
      return OnBoardingPage.complete;
    case 'home':
      return OnBoardingPage.home;
    case 'welcome':
      return OnBoardingPage.welcome;
    default:
      return OnBoardingPage.signup;
  }
}

class OnBoardingLocationIcon extends StatelessWidget {
  const OnBoardingLocationIcon({super.key});

  @override
  Widget build(BuildContext context) {
    return Stack(
      alignment: AlignmentDirectional.center,
      children: [
        Image.asset(
          'assets/icon/floating_bg.png',
          fit: BoxFit.fitWidth,
          width: double.infinity,
        ),
        Image.asset(
          'assets/icon/enable_location_icon.png',
          height: 221,
        ),
      ],
    );
  }
}

class OnBoardingNotificationIcon extends StatelessWidget {
  const OnBoardingNotificationIcon({super.key});

  @override
  Widget build(BuildContext context) {
    return Stack(
      alignment: AlignmentDirectional.center,
      children: [
        Image.asset(
          'assets/icon/floating_bg.png',
          fit: BoxFit.fitWidth,
          width: double.infinity,
        ),
        SvgPicture.asset(
          'assets/icon/enable_notifications_icon.svg',
          height: 221,
        ),
      ],
    );
  }
}

class ProfileSetupNameInputField extends StatelessWidget {
  const ProfileSetupNameInputField({
    super.key,
    required this.controller,
  });

  final TextEditingController controller;

  @override
  Widget build(BuildContext context) {
    OutlineInputBorder borderSide = OutlineInputBorder(
      borderSide: BorderSide(color: CustomColors.appColorBlue, width: 1.0),
      borderRadius: BorderRadius.circular(8.0),
    );

    return BlocBuilder<ProfileBloc, Profile>(
      builder: (context, profile) {
        return TextFormField(
          controller: controller,
          onEditingComplete: () {
            FocusScope.of(context).requestFocus(
              FocusNode(),
            );
            List<String> names = controller.text.getFirstAndLastNames();
            context.read<ProfileBloc>().add(
                  UpdateProfile(
                    profile.copyWith(
                      firstName: names.first,
                      lastName: names.last,
                    ),
                  ),
                );
          },
          enableSuggestions: false,
          cursorWidth: 1,
          cursorColor: CustomColors.appColorBlue,
          keyboardType: TextInputType.name,
          onChanged: (text) {
            List<String> names = text.getFirstAndLastNames();
            context.read<ProfileBloc>().add(
                  UpdateProfile(
                    profile.copyWith(
                      firstName: names.first,
                      lastName: names.last,
                    ),
                  ),
                );
          },
          validator: (value) {
            if (value == null || value.isEmpty) {
              return AppLocalizations.of(context)!.pleaseEnterYourName;
            }

            return null;
          },
          decoration: InputDecoration(
            contentPadding: const EdgeInsets.fromLTRB(16, 12, 0, 12),
            focusedBorder: borderSide,
            enabledBorder: borderSide,
            border: borderSide,
            hintText: AppLocalizations.of(context)!.enterYourName,
            errorStyle: const TextStyle(
              fontSize: 0,
            ),
            suffixIcon: GestureDetector(
              onTap: () {
                controller.text = "";
                context.read<ProfileBloc>().add(
                      UpdateProfile(
                        profile.copyWith(firstName: "", lastName: ""),
                      ),
                    );
              },
              child: const TextInputCloseButton(),
            ),
          ),
        );
      },
    );
  }
}

class TitleToggleListOption extends StatelessWidget {
  const TitleToggleListOption({
    super.key,
    required this.title,
    required this.currentTitle,
  });

  final TitleOptions title;
  final TitleOptions currentTitle;

  @override
  Widget build(BuildContext context) {
    Color textColor = currentTitle == title
        ? CustomColors.appColorBlue
        : CustomColors.appColorBlack;

    Color bgColor = currentTitle == title
        ? CustomColors.appColorBlue.withOpacity(0.05)
        : Colors.transparent;

    return ListTile(
      shape: const RoundedRectangleBorder(
        borderRadius: BorderRadius.all(
          Radius.circular(8.0),
        ),
      ),
      tileColor: bgColor,
      title: Text(
        title.getDisplayValue(context),
        style: Theme.of(context).textTheme.bodySmall?.copyWith(
              color: textColor,
              fontWeight: FontWeight.w700,
            ),
      ),
    );
  }
}

class SkipOnboardScreen extends StatelessWidget {
  const SkipOnboardScreen(this.nextScreen, {super.key, this.skipText});

  final Widget nextScreen;
  final String? skipText;

  @override
  Widget build(BuildContext context) {
    return InkWell(
      onTap: () async {
        await Navigator.pushAndRemoveUntil(
          context,
          MaterialPageRoute(builder: (context) {
            return nextScreen;
          }),
          (r) => false,
        );
      },
      child: Padding(
        padding: const EdgeInsets.only(top: 16.0),
        child: Text(
          skipText ??
              AppLocalizations.of(context)!
                  .noThanks, // Use the provided skipText or fallback to "No Thanks"
          textAlign: TextAlign.center,
          style: Theme.of(context).textTheme.bodySmall?.copyWith(
                color: CustomColors.appColorBlue,
                fontWeight: FontWeight.w600,
              ),
        ),
      ),
    );
  }
}

class TitleDropDown extends StatelessWidget {
  const TitleDropDown({super.key});

  @override
  Widget build(BuildContext context) {
    return BlocBuilder<ProfileBloc, Profile>(
      builder: (context, profile) {
        return PopupMenuButton<TitleOptions>(
          padding: const EdgeInsets.only(top: -8),
          position: PopupMenuPosition.under,
          color: CustomColors.appBodyColor,
          shape: const RoundedRectangleBorder(
            borderRadius: BorderRadius.all(
              Radius.circular(8.0),
            ),
          ),
          onSelected: (title) {
            context
                .read<ProfileBloc>()
                .add(UpdateProfile(profile.copyWith(title: title.value)));
          },
          child: Container(
            width: 65,
            decoration: BoxDecoration(
              color: CustomColors.appBodyColor,
              borderRadius: BorderRadius.circular(8),
            ),
            child: Padding(
              padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 15),
              child: Row(
                crossAxisAlignment: CrossAxisAlignment.center,
                mainAxisAlignment: MainAxisAlignment.center,
                children: [
                  Text(
                    profile.getTitle().getAbbr(context),
                    style: Theme.of(context).textTheme.bodySmall?.copyWith(
                          fontWeight: FontWeight.w700,
                        ),
                  ),
                  Icon(
                    Icons.keyboard_arrow_down_sharp,
                    color: Theme.of(context).primaryColor,
                  ),
                ],
              ),
            ),
          ),
          itemBuilder: (BuildContext context) => TitleOptions.values
              .map(
                (element) => PopupMenuItem(
                  padding: const EdgeInsets.symmetric(horizontal: 8),
                  value: element,
                  child: TitleToggleListOption(
                    title: element,
                    currentTitle: profile.getTitle(),
                  ),
                ),
              )
              .toList(),
        );
      },
    );
  }
}

class LogoWidget extends StatelessWidget {
  const LogoWidget({super.key});

  @override
  Widget build(BuildContext context) {
    return Center(
      child: SvgPicture.asset(
        'assets/icon/splash_image.svg',
        semanticsLabel: 'Splash image',
      ),
    );
  }
}

class TaglineWidget extends StatelessWidget {
  const TaglineWidget({
    super.key,
    required this.visible,
  });

  final bool visible;

  @override
  Widget build(BuildContext context) {
    return AnimatedOpacity(
      opacity: visible ? 1.0 : 0.0,
      duration: const Duration(milliseconds: 500),
      child: Center(
        child: Stack(
          alignment: AlignmentDirectional.center,
          children: [
            Image.asset(
              'assets/images/splash-image.png',
              fit: BoxFit.cover,
              height: double.infinity,
              width: double.infinity,
              alignment: Alignment.center,
            ),
            Text(AppLocalizations.of(context)!.breatheClean,
                textAlign: TextAlign.center,
                style: Theme.of(context).textTheme.headlineMedium),
          ],
        ),
      ),
    );
  }
}

class OnBoardingTopBar extends StatelessWidget implements PreferredSizeWidget {
  const OnBoardingTopBar({super.key, this.backgroundColor});

  final Color? backgroundColor;

  @override
  PreferredSizeWidget build(BuildContext context) {
    return AppBar(
      toolbarHeight: 0,
      backgroundColor: backgroundColor ?? CustomColors.appBodyColor,
    );
  }

  @override
  Size get preferredSize => const Size.fromHeight(0);
}

//setup quiz

class OnboardingQuiz extends StatefulWidget {
  const OnboardingQuiz({super.key});

  @override
  OnboardingQuizState createState() => OnboardingQuizState();
}

class OnboardingQuizState extends State<OnboardingQuiz> {
  DateTime? exitTime;

  @override
  Widget build(BuildContext context) {
    return OfflineBanner(
      child: Scaffold(
        backgroundColor: const Color(0xff34373B),
        body: PopScope(
          onPopInvoked: ((didPop) {
            if (didPop) {
              onWillPop();
            }
          }),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.center,
            children: [
              Image.asset(
                'assets/images/quiz_cover.png',
                fit: BoxFit.cover,
                width: double.infinity,
              ),
              const SizedBox(
                height: 26,
              ),
              Padding(
                padding: const EdgeInsets.symmetric(horizontal: 40),
                child: Text(
                  'Take our quick quiz to personalize your experience',
                  textAlign: TextAlign.center,
                  style: Theme.of(context).textTheme.bodyMedium,
                ),
              ),
              const SizedBox(
                height: 8,
              ),
              Padding(
                padding: const EdgeInsets.symmetric(horizontal: 40),
                child: Text(
                  'Get customized air quality recommendation in a few seconds!',
                  textAlign: TextAlign.center,
                  style: Theme.of(context).textTheme.bodyLarge,
                ),
              ),
              const SizedBox(
                height: 8,
              ),
              Padding(
                padding: const EdgeInsets.symmetric(horizontal: 40),
                child: NextButton(
                  text: 'Start the quiz',
                  buttonColor: CustomColors.appColorBlue,
                  callBack: () async {
                    await _allowNotifications();
                  },
                ),
              ),
              const SkipOnboardScreen(
                skipText: 'Maybe later',
                SetUpCompleteScreen(),
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
    _updateOnBoardingPage();
  }

  Future<void> _allowNotifications() async {
    bool hasPermission =
        await PermissionService.checkPermission(AppPermission.notification);
    if (hasPermission && mounted) {
      await FirebaseMessaging.instance
          .subscribeToTopic(Config.notificationsTopic);

      Profile profile = context.read<ProfileBloc>().state;
      context
          .read<ProfileBloc>()
          .add(UpdateProfile(profile.copyWith(notifications: hasPermission)));
      await Navigator.pushAndRemoveUntil(
        context,
        MaterialPageRoute(
          builder: (context) {
            return const LocationSetupScreen();
          },
        ),
        (r) => false,
      );
      CloudAnalytics.logAllowNotification();
    } else {
      NotificationService.requestNotification(context, "onboarding");
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
      MaterialPageRoute(builder: (context) {
        return const HomePage();
      }),
      (r) => false,
    );

    return Future.value(false);
  }

  void _updateOnBoardingPage() async {
    await SharedPreferencesHelper.updateOnBoardingPage(
      OnBoardingPage.notification,
    );
  }
}
