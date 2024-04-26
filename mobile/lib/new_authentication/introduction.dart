import 'dart:io';

import 'package:app/blocs/dashboard/dashboard_bloc.dart';
import 'package:app/constants/config.dart';
import 'package:app/models/enum_constants.dart';
import 'package:app/new_authentication/enter_name_details.dart';
import 'package:app/new_authentication/login_page.dart';
import 'package:app/new_authentication/sign_up.dart';
import 'package:app/new_authentication/widgets.dart';
import 'package:app/other/lib/new_authentication/colors.dart';
import 'package:app/screens/home_page.dart';
import 'package:app/screens/offline_banner.dart';
import 'package:app/screens/settings/update_screen.dart';
import 'package:app/services/app_service.dart';
import 'package:app/services/firebase_service.dart';
import 'package:app/services/local_storage.dart';
import 'package:app/services/rest_api.dart';
import 'package:app/utils/network.dart';
import 'package:app/widgets/custom_shimmer.dart';
import 'package:app/widgets/dialogs.dart';
import 'package:auto_size_text/auto_size_text.dart';
import 'package:carousel_slider/carousel_slider.dart';
import 'package:flutter/foundation.dart';
import 'package:flutter/material.dart';
import 'package:flutter_bloc/flutter_bloc.dart';
import 'package:package_info_plus/package_info_plus.dart';
import 'package:smooth_page_indicator/smooth_page_indicator.dart';
import 'package:flutter_gen/gen_l10n/app_localizations.dart';
import 'package:url_launcher/url_launcher.dart';

class IntroductionPage extends StatefulWidget {
  const IntroductionPage({super.key});

  @override
  State<IntroductionPage> createState() => _IntroductionPageState();
}

class _IntroductionPageState extends State<IntroductionPage> {
  DateTime? _exitTime;

  int activeIndex = 0;

  @override
  Widget build(BuildContext context) {
    final List<Widget> screens = [
      screen1(context),
      screen2(context),
      screen3(context),
    ];
    return OfflineBanner(
      child: PopScope(
        onPopInvoked: ((didPop) {
          if (didPop) {
            onWillPop();
          }
        }),
        child: Scaffold(
          backgroundColor: const Color(0xff34373B),
          body: Column(
            mainAxisAlignment: MainAxisAlignment.start,
            crossAxisAlignment: CrossAxisAlignment.center,
            children: [
              SizedBox(
                width: MediaQuery.of(context).size.width,
                height: MediaQuery.of(context).size.height * 0.6,
                child: Column(
                  children: [
                    Expanded(
                      child: CarouselSlider.builder(
                        itemCount: screens.length,
                        itemBuilder: (context, index, realIndex) {
                          return screens[index];
                        },
                        options: CarouselOptions(
                          height: MediaQuery.of(context).size.height,
                          enableInfiniteScroll: true,
                          autoPlay: true,
                          autoPlayInterval: const Duration(seconds: 3),
                          autoPlayAnimationDuration:
                              const Duration(milliseconds: 800),
                          autoPlayCurve: Curves.fastOutSlowIn,
                          viewportFraction: 1.0,
                          onPageChanged: (index, reason) {
                            setState(() {
                              activeIndex = index;
                            });
                          },
                        ),
                      ),
                    ),
                    Padding(
                      padding: const EdgeInsets.all(8.0),
                      child: SmoothPageIndicator(
                        controller: PageController(initialPage: activeIndex),
                        count: screens.length,
                        effect: const ExpandingDotsEffect(
                          activeDotColor: Colors.white,
                          dotColor: Colors.grey,
                          dotHeight: 6,
                          dotWidth: 10,
                          spacing: 8,
                        ),
                      ),
                    ),
                  ],
                ),
              ),
              Column(
                children: [
                  Padding(
                    padding: const EdgeInsets.symmetric(horizontal: 20),
                    child: NextButton(
                      textColor: Colors.white,
                      text: 'Create Account',
                      buttonColor: const Color(0xff145FFF),
                      callBack: () {
                        Navigator.push(
                          context,
                          MaterialPageRoute(
                            builder: (context) {
                              return const NewProfileDetails();
                            },
                          ),
                        );
                      },
                    ),
                  ),
                  const SizedBox(
                    height: 16,
                  ),
                  Padding(
                    padding: const EdgeInsets.symmetric(horizontal: 20),
                    child: NextButton(
                      textColor: const Color(0xff485972),
                      text: 'Login here',
                      buttonColor: CustomColors.appBodyColor,
                      callBack: () {
                        Navigator.push(
                          context,
                          MaterialPageRoute(
                            builder: (context) {
                              return const EmailLoginScreen();
                            },
                          ),
                        );
                      },
                    ),
                  ),
                  const SizedBox(
                    height: 16,
                  ),
                  const ProceedAsGuest()
                ],
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
          currentVersion: "2.0.20",
          bundleId: Platform.isIOS ? packageInfo.packageName : null,
          packageName: Platform.isAndroid ? packageInfo.packageName : null,
        )
            .then((version) async {
          if (version != null && mounted && !version.isUpdated) {
            await canLaunchUrl(version.url).then((bool result) async {
              try {
                await openUpdateScreen(context, version);
              } catch (error) {
                if (kDebugMode) {
                  print('Error opening update screen: $error');
                }
              }
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

Widget screen1(BuildContext context) {
  return Stack(
    children: [
      Container(
        width: MediaQuery.of(context).size.width,
        height: MediaQuery.of(context).size.height * 0.7,
        decoration: BoxDecoration(
          image: const DecorationImage(
            fit: BoxFit.fill,
            image: AssetImage(
              'assets/images/nairobi_view.png',
            ),
          ),
          color: Theme.of(context).primaryColor,
        ),
      ),
      Padding(
        padding: const EdgeInsets.only(
          left: 20,
          right: 20,
          top: 56.14, // Adjust as necessary
        ),
        child: Column(
          mainAxisAlignment: MainAxisAlignment.start,
          crossAxisAlignment: CrossAxisAlignment.center,
          children: [
            Container(
              width: 80,
              height: 56.14,
              decoration: const BoxDecoration(
                color: Colors.transparent,
                image: DecorationImage(
                  image: AssetImage(
                    'assets/images/airQo-logo.png',
                  ),
                ),
              ),
            ),
            const SizedBox(
              height: 100,
            ),
            const Padding(
              padding: EdgeInsets.only(
                left: 20,
                right: 20,
              ),
              child: Column(
                mainAxisAlignment: MainAxisAlignment.center,
                crossAxisAlignment: CrossAxisAlignment.center,
                children: [
                  Text(
                    '👋 Welcome to AirQo!',
                    textAlign: TextAlign.center,
                    style: TextStyle(
                      fontWeight: FontWeight.w400,
                      fontStyle: FontStyle.normal,
                      fontFamily: 'inter',
                      fontSize: 20,
                    ),
                  ),
                  SizedBox(
                    height: 10,
                  ),
                  AutoSizeText(
                    'Clean Air for all African Cities.',
                    maxLines: 2,
                    textAlign: TextAlign.center,
                    style: TextStyle(
                      fontWeight: FontWeight.w700,
                      fontStyle: FontStyle.normal,
                      fontFamily: 'inter',
                      fontSize: 35,
                    ),
                  ),
                ],
              ),
            ),
          ],
        ),
      ),
    ],
  );
}

Widget screen2(BuildContext context) {
  return Container(
    color: Theme.of(context).primaryColor,
    padding: const EdgeInsets.fromLTRB(
      0,
      70,
      0,
      0,
    ),
    child: Stack(
      alignment: Alignment.topCenter,
      children: [
        Column(
          mainAxisAlignment: MainAxisAlignment.start,
          crossAxisAlignment: CrossAxisAlignment.center,
          children: [
            buildExpandedBox(
              color: Theme.of(context).primaryColor,
              children: [
                buildStackedEmojis(direction: TextDirection.rtl),
              ],
            ),
          ],
        ),
        const Column(
          mainAxisAlignment: MainAxisAlignment.start,
          crossAxisAlignment: CrossAxisAlignment.center,
          children: [
            SizedBox(
              height: 100,
            ),
            Padding(
              padding: EdgeInsets.fromLTRB(20, 40, 20, 10),
              child: Column(
                mainAxisAlignment: MainAxisAlignment.center,
                crossAxisAlignment: CrossAxisAlignment.center,
                children: [
                  Text(
                    '🌿 Breathe Clean',
                    textAlign: TextAlign.center,
                    style: TextStyle(
                      fontWeight: FontWeight.w400,
                      fontStyle: FontStyle.normal,
                      fontFamily: 'inter',
                      fontSize: 16,
                    ),
                  ),
                  SizedBox(
                    height: 10,
                  ),
                  AutoSizeText(
                    'Track and monitor the quality of air you breathe',
                    maxLines: 2,
                    textAlign: TextAlign.center,
                    style: TextStyle(
                      fontWeight: FontWeight.w700,
                      fontStyle: FontStyle.normal,
                      fontFamily: 'inter',
                      fontSize: 20,
                    ),
                  ),
                ],
              ),
            ),
          ],
        ),
      ],
    ),
  );
}

Widget buildExpandedBox({
  required List<Widget> children,
  required Color color,
}) =>
    Expanded(
      child: Container(
        color: color,
        child: Center(
          child: Column(
            mainAxisAlignment: MainAxisAlignment.start,
            crossAxisAlignment: CrossAxisAlignment.center,
            children: children,
          ),
        ),
      ),
    );

Widget buildStackedEmojis({
  TextDirection direction = TextDirection.ltr,
}) {
  const double size = 120;
  const double xShift = 20;
  final urlImages = [
    "assets/images/good_emoji.png",
    "assets/images/moderate_emoji.png",
  ];

  final items = urlImages.map((urlImage) => buildImage(urlImage)).toList();

  return StackedWidgets(
    direction: direction,
    items: items,
    size: size,
    xShift: xShift,
  );
}

Widget buildImage(String urlImage) {
  const double borderSize = 5;

  return ClipOval(
    child: Container(
      padding: const EdgeInsets.all(borderSize),
      color: Colors.white,
      child: ClipOval(
        child: Image.asset(
          urlImage,
          fit: BoxFit.cover,
        ),
      ),
    ),
  );
}

Widget screen3(BuildContext context) {
  return Container(
    color: Theme.of(context).primaryColor,
    padding: const EdgeInsets.fromLTRB(
      0,
      70,
      0,
      0,
    ),
    child: Stack(
      alignment: Alignment.topCenter,
      children: [
        buildExpandedBox(
          color: Theme.of(context).primaryColor,
          children: [
            buildStackedPeople(
              direction: TextDirection.ltr,
            )
          ],
        ),
        const Column(
          mainAxisAlignment: MainAxisAlignment.start,
          crossAxisAlignment: CrossAxisAlignment.center,
          children: [
            SizedBox(
              height: 100,
            ),
            Padding(
              padding: EdgeInsets.fromLTRB(20, 40, 20, 10),
              child: Column(
                mainAxisAlignment: MainAxisAlignment.center,
                crossAxisAlignment: CrossAxisAlignment.center,
                children: [
                  Text(
                    '✨ Know Your Air',
                    textAlign: TextAlign.center,
                    style: TextStyle(
                      fontWeight: FontWeight.w400,
                      fontStyle: FontStyle.normal,
                      fontFamily: 'inter',
                      fontSize: 16,
                    ),
                  ),
                  SizedBox(
                    height: 10,
                  ),
                  AutoSizeText(
                    'Learn and reduce air pollution in your community',
                    maxLines: 2,
                    textAlign: TextAlign.center,
                    style: TextStyle(
                      fontWeight: FontWeight.w700,
                      fontStyle: FontStyle.normal,
                      fontFamily: 'inter',
                      fontSize: 23,
                    ),
                  ),
                ],
              ),
            ),
          ],
        ),
      ],
    ),
  );
}

Widget buildStackedPeople({
  TextDirection direction = TextDirection.ltr,
}) {
  const double size = 120;
  const double xShift = 20;
  final urlImages = [
    "assets/images/person1.png",
    "assets/images/person2.png",
  ];

  final items = urlImages
      .map((urlImage) =>
          buildimageperson(imageUrl: urlImage, width: size, height: size))
      .toList();

  return StackedWidgets(
    direction: direction,
    items: items,
    size: size,
    xShift: xShift,
  );
}

Widget buildimageperson({
  required String imageUrl,
  required double width,
  required double height,
}) {
  return Image.asset(
    imageUrl,
    width: width,
    height: height,
    fit: BoxFit.cover,
  );
}

class ProceedAsGuest extends StatelessWidget {
  const ProceedAsGuest({super.key});

  @override
  Widget build(BuildContext context) {
    return InkWell(
      onTap: () async {
        await _guestSignIn(context);
      },
      child: SizedBox(
        width: double.infinity,
        child: Row(
          crossAxisAlignment: CrossAxisAlignment.center,
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            Text(
              'Continue As Guest',
              textAlign: TextAlign.center,
              style: Theme.of(context).textTheme.bodySmall?.copyWith(
                    color: CustomColors.appBodyColor.withOpacity(0.6),
                  ),
            ),
          ],
        ),
      ),
    );
  }

  Future<void> _guestSignIn(BuildContext context) async {
    await hasNetworkConnection().then((hasConnection) async {
      if (!hasConnection) {
        showSnackBar(
            context, AppLocalizations.of(context)!.checkYourInternetConnection);
        return;
      }

      loadingScreen(context);

      await CustomAuth.guestSignIn().then((success) async {
        if (success) {
          await AppService.postSignOutActions(context, log: false)
              .then((_) async {
            await AppService.postSignInActions(context, isGuest: true)
                .then((_) async {
              Navigator.pop(context);
              await Navigator.pushAndRemoveUntil(
                context,
                MaterialPageRoute(builder: (context) {
                  return const HomePage();
                }),
                (r) => true,
              );
            });
          });
        } else {
          Navigator.pop(context);
          showSnackBar(context, Config.guestLogInFailed);
        }
      });
    });
  }
}
