import 'package:app/themes/theme.dart';
import 'package:app/widgets/buttons.dart';
import 'package:app/widgets/custom_widgets.dart';
import 'package:flutter/material.dart';
import 'package:flutter_svg/svg.dart';
import 'package:package_info_plus/package_info_plus.dart';
import 'package:share_plus/share_plus.dart';

import '../screens/home_page.dart';
import '../screens/search/search_page.dart';


class NoSearchResultsWidget extends StatelessWidget {
  const NoSearchResultsWidget({super.key, this.message});
  final String? message;

  @override
  Widget build(BuildContext context) {
    return Center(
      child: Padding(
        padding: const EdgeInsets.symmetric(horizontal: 33),
        child: Column(
          mainAxisAlignment: MainAxisAlignment.center,
          crossAxisAlignment: CrossAxisAlignment.center,
          children: [
            SvgPicture.asset(
              'assets/icon/no_search_results.svg',
              semanticsLabel: 'Empty search results',
            ),
            const SizedBox(height: 53),
            Text(
              'No results found',
              style: CustomTextStyle.errorTitle(context),
              textAlign: TextAlign.center,
            ),
            const SizedBox(height: 23),
            Text(
              message ??
                  'Try adjusting your search to find what you’re looking for.',
              style: CustomTextStyle.errorSubTitle(context),
              textAlign: TextAlign.center,
            ),
          ],
        ),
      ),
    );
  }
}

class KyaNotFoundWidget extends StatelessWidget {
  const KyaNotFoundWidget({super.key});

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      body: AppSafeArea(
        child: Padding(
          padding: const EdgeInsets.symmetric(horizontal: 33),
          child: Center(
            child: Column(
              mainAxisAlignment: MainAxisAlignment.center,
              crossAxisAlignment: CrossAxisAlignment.center,
              children: [
                const Spacer(),
                SvgPicture.asset('assets/icon/no_kya_icon.svg'),
                const SizedBox(
                  height: 50,
                ),
                Text(
                  'We can’t seem to find the KYA content you’re looking for.',
                  style: CustomTextStyle.errorTitle(context),
                  textAlign: TextAlign.center,
                ),
                const SizedBox(
                  height: 23,
                ),
                Text(
                  'Scared?, take a deep breath of clean air on us. Ready? Breathe In, Breathe out.',
                  style: CustomTextStyle.errorSubTitle(context),
                  textAlign: TextAlign.center,
                ),
                const Spacer(),
                NextButton(
                  buttonColor: CustomColors.appColorBlue,
                  text: 'Return home',
                  callBack: () {
                    Navigator.pushAndRemoveUntil(
                      context,
                      MaterialPageRoute(
                        builder: (context) {
                          return const HomePage();
                        },
                      ),
                      (r) => false,
                    );
                  },
                ),
              ],
            ),
          ),
        ),
      ),
    );
  }
}

class NoAirQualityDataWidget extends StatelessWidget {
  const NoAirQualityDataWidget({
    super.key,
    required this.callBack,
    this.actionButtonText,
  });
  final Function() callBack;
  final String? actionButtonText;

  @override
  Widget build(BuildContext context) {
    return Padding(
      padding: const EdgeInsets.symmetric(horizontal: 33),
      child: Center(
        child: Column(
          mainAxisAlignment: MainAxisAlignment.center,
          crossAxisAlignment: CrossAxisAlignment.center,
          children: [
            SvgPicture.asset('assets/icon/no_air_quality_icon.svg'),
            const SizedBox(
              height: 50,
            ),
            Text(
              'No Air Quality data',
              style: CustomTextStyle.errorTitle(context),
              textAlign: TextAlign.center,
            ),
            const SizedBox(
              height: 23,
            ),
            Text(
              'We’re having issues with our network no worries, we’ll be back up soon.',
              style: CustomTextStyle.errorSubTitle(context),
              textAlign: TextAlign.center,
            ),
            const SizedBox(
              height: 30,
            ),
            InkWell(
              onTap: () {
                callBack();
              },
              child: ActionButton(
                icon: Icons.refresh_outlined,
                text: actionButtonText ?? 'Reload',
              ),
            ),
          ],
        ),
      ),
    );
  }
}

class NoFavouritePlacesWidget extends StatelessWidget {
  const NoFavouritePlacesWidget({super.key});

  @override
  Widget build(BuildContext context) {
    return Padding(
      padding: const EdgeInsets.symmetric(horizontal: 33),
      child: Column(
        mainAxisAlignment: MainAxisAlignment.center,
        crossAxisAlignment: CrossAxisAlignment.center,
        children: [
          const Spacer(),
          SvgPicture.asset('assets/icon/no_favorite_places_icon.svg'),
          const SizedBox(
            height: 50,
          ),
          Text(
            'View your favorite places',
            style: CustomTextStyle.errorTitle(context),
            textAlign: TextAlign.center,
          ),
          const SizedBox(
            height: 23,
          ),
          RichText(
            textAlign: TextAlign.center,
            text: TextSpan(children: [
              TextSpan(
                text: 'Tap the ',
                style: Theme.of(context).textTheme.bodyLarge,
              ),
              WidgetSpan(
                child: SvgPicture.asset(
                  'assets/icon/heart.svg',
                  semanticsLabel: 'Favorite',
                  height: 15.33,
                  width: 15.12,
                ),
              ),
              TextSpan(
                text:
                    ' Favorite icon on any location to add it to your favorites',
                style: Theme.of(context).textTheme.bodyLarge,
              ),
            ]),
          ),
          const SizedBox(
            height: 30,
          ),
          InkWell(
            onTap: () async {
              await Navigator.push(
                context,
                MaterialPageRoute(
                  builder: (context) {
                    return const SearchPage();
                  },
                ),
              );
            },
            child: const ActionButton(
              icon: Icons.add,
              text: 'Add Favorites',
            ),
          ),
          const Spacer(),
        ],
      ),
    );
  }
}

class NoAnalyticsWidget extends StatelessWidget {
  const NoAnalyticsWidget({super.key, required this.callBack});
  final Function() callBack;

  @override
  Widget build(BuildContext context) {
    return Padding(
      padding: const EdgeInsets.symmetric(horizontal: 33),
      child: Column(
        mainAxisAlignment: MainAxisAlignment.center,
        crossAxisAlignment: CrossAxisAlignment.center,
        children: [
          const Spacer(),
          SvgPicture.asset('assets/icon/no_analytics_icon.svg'),
          const SizedBox(
            height: 50,
          ),
          Text(
            'Know the Air Quality trends',
            style: CustomTextStyle.errorTitle(context),
            textAlign: TextAlign.center,
          ),
          const SizedBox(
            height: 23,
          ),
          Text(
            'Stay on top of changes in Air Quality of places important to you',
            style: CustomTextStyle.errorSubTitle(context),
            textAlign: TextAlign.center,
          ),
          const SizedBox(
            height: 30,
          ),
          InkWell(
            onTap: () {
              callBack();
            },
            child: const ActionButton(
              icon: Icons.location_on_outlined,
              text: 'Turn on location',
            ),
          ),
          const Spacer(),
        ],
      ),
    );
  }
}

class NoCompleteKyaWidget extends StatelessWidget {
  const NoCompleteKyaWidget({super.key, required this.callBack});
  final Function() callBack;

  @override
  Widget build(BuildContext context) {
    return Padding(
      padding: const EdgeInsets.symmetric(horizontal: 33),
      child: Column(
        mainAxisAlignment: MainAxisAlignment.center,
        crossAxisAlignment: CrossAxisAlignment.center,
        children: [
          const Spacer(),
          SvgPicture.asset('assets/icon/no_kya_icon.svg'),
          const SizedBox(
            height: 50,
          ),
          Text(
            'Keep up with your lessons',
            style: CustomTextStyle.errorTitle(context),
            textAlign: TextAlign.center,
          ),
          const SizedBox(
            height: 23,
          ),
          Text(
            'Track your completed “Know Your Air” lessons and revisit them anytime',
            style: CustomTextStyle.errorSubTitle(context),
            textAlign: TextAlign.center,
          ),
          const SizedBox(
            height: 30,
          ),
          Padding(
            padding: const EdgeInsets.symmetric(horizontal: 40),
            child: NextButton(
              buttonColor: CustomColors.appColorBlue,
              text: 'Start learning',
              callBack: callBack,
            ),
          ),
          const Spacer(),
        ],
      ),
    );
  }
}

class NoKyaWidget extends StatelessWidget {
  const NoKyaWidget({super.key, required this.callBack});
  final Function() callBack;

  @override
  Widget build(BuildContext context) {
    return Padding(
      padding: const EdgeInsets.symmetric(horizontal: 33),
      child: Column(
        mainAxisAlignment: MainAxisAlignment.center,
        crossAxisAlignment: CrossAxisAlignment.center,
        children: [
          const Spacer(),
          SvgPicture.asset('assets/icon/no_kya_icon.svg'),
          const SizedBox(
            height: 50,
          ),
          Text(
            'No lessons',
            style: CustomTextStyle.errorTitle(context),
            textAlign: TextAlign.center,
          ),
          const SizedBox(
            height: 23,
          ),
          Text(
            'We’re having issues with our network no worries, we’ll be back up soon.',
            style: CustomTextStyle.errorSubTitle(context),
            textAlign: TextAlign.center,
          ),
          const SizedBox(
            height: 30,
          ),
          InkWell(
            onTap: () {
              callBack();
            },
            child: const ActionButton(
              icon: Icons.refresh_outlined,
              text: 'Reload',
            ),
          ),
          const Spacer(),
        ],
      ),
    );
  }
}

class NoInternetConnectionWidget extends StatelessWidget {
  const NoInternetConnectionWidget({
    super.key,
    required this.callBack,
    this.actionButtonText,
  });
  final Function() callBack;
  final String? actionButtonText;

  @override
  Widget build(BuildContext context) {
    return Padding(
      padding: const EdgeInsets.symmetric(horizontal: 0),
      child: Center(
        child: Column(
          mainAxisAlignment: MainAxisAlignment.center,
          crossAxisAlignment: CrossAxisAlignment.center,
          children: [
            SvgPicture.asset('assets/icon/no_internet_connection_icon.svg'),
            const SizedBox(
              height: 50,
            ),
            Text(
              'No internet connection',
              style: CustomTextStyle.errorTitle(context),
              textAlign: TextAlign.center,
            ),
            const SizedBox(
              height: 23,
            ),
            Text(
              'Connect to the internet to see results',
              style: CustomTextStyle.errorSubTitle(context),
              textAlign: TextAlign.center,
            ),
            const SizedBox(
              height: 30,
            ),
            InkWell(
              onTap: () {
                callBack();
              },
              child: ActionButton(
                icon: Icons.refresh_outlined,
                text: actionButtonText ?? 'Refresh',
              ),
            ),
          ],
        ),
      ),
    );
  }
}

class AppErrorWidget extends StatelessWidget {
  const AppErrorWidget({super.key, required this.callBack});
  final Function() callBack;

  @override
  Widget build(BuildContext context) {
    return AppSafeArea(
      horizontalPadding: 33,
      child: Center(
        child: Column(
          mainAxisAlignment: MainAxisAlignment.center,
          crossAxisAlignment: CrossAxisAlignment.center,
          children: [
            const Spacer(),
            SvgPicture.asset(
              'assets/icon/error_icon.svg',
              semanticsLabel: 'Error',
            ),
            const SizedBox(height: 24),
            Padding(
              padding: const EdgeInsets.symmetric(horizontal: 13),
              child: RichText(
                textAlign: TextAlign.center,
                text: TextSpan(
                  children: <TextSpan>[
                    TextSpan(
                      text: 'Oops! ',
                      style: CustomTextStyle.headline7(context)?.copyWith(
                        color: CustomColors.appColorBlue,
                      ),
                    ),
                    TextSpan(
                      text:
                          'We can’t seem to find the content you’re looking for.',
                      style: CustomTextStyle.headline7(context)?.copyWith(
                        color: CustomColors.appColorBlack,
                      ),
                    ),
                  ],
                ),
              ),
            ),
            const SizedBox(height: 24),
            Padding(
              padding: const EdgeInsets.symmetric(horizontal: 30),
              child: Text(
                'Scared?, take a deep breath of clean air on us. Ready? Breathe In, Breathe out.',
                textAlign: TextAlign.center,
                style: CustomTextStyle.headline8(context)?.copyWith(
                  color: CustomColors.appColorBlack,
                  fontWeight: FontWeight.normal,
                ),
              ),
            ),
            const Spacer(),
            InkWell(
              onTap: () {
                callBack();
              },
              child: const ActionButton(
                icon: Icons.refresh_outlined,
                text: 'Refresh',
              ),
            ),
          ],
        ),
      ),
    );
  }
}

class AppCrushWidget extends StatelessWidget {
  const AppCrushWidget(this.exception, this.stackTrace, {super.key});
  final dynamic exception;
  final StackTrace? stackTrace;

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: null,
      body: AppSafeArea(
        horizontalPadding: 24,
        verticalPadding: 24,
        child: Column(
          mainAxisAlignment: MainAxisAlignment.center,
          crossAxisAlignment: CrossAxisAlignment.center,
          children: [
            const Spacer(),
            SvgPicture.asset(
              'assets/icon/error_icon.svg',
              semanticsLabel: 'Error',
            ),
            const SizedBox(height: 24),
            Padding(
              padding: const EdgeInsets.symmetric(horizontal: 13),
              child: RichText(
                textAlign: TextAlign.center,
                text: TextSpan(
                  children: <TextSpan>[
                    TextSpan(
                      text: 'Oops! ',
                      style: CustomTextStyle.headline7(context)?.copyWith(
                        color: CustomColors.appColorBlue,
                      ),
                    ),
                    TextSpan(
                      text: 'A fatal error has occurred.',
                      style: CustomTextStyle.headline7(context)?.copyWith(
                        color: CustomColors.appColorBlack,
                      ),
                    ),
                  ],
                ),
              ),
            ),
            const SizedBox(height: 24),
            Padding(
              padding: const EdgeInsets.symmetric(horizontal: 30),
              child: Text(
                'Scared?, take a deep breath of clean air on us. Ready? Breathe In, Breathe out.',
                textAlign: TextAlign.center,
                style: CustomTextStyle.headline8(context)?.copyWith(
                  color: CustomColors.appColorBlack,
                  fontWeight: FontWeight.normal,
                ),
              ),
            ),
            const Spacer(),
            InkWell(
              onTap: () async {
                // T_DO log to  a backend service
                PackageInfo packageInfo = await PackageInfo.fromPlatform();
                String subject = "Mobile App Crush";
                String body = ""
                    "App Version : ${packageInfo.version}\n"
                    "Build Number : ${packageInfo.buildNumber}\n"
                    "Installed via : ${packageInfo.installerStore}\n\n"
                    "Error : $exception\n\n"
                    "StackTrace : $stackTrace\n\n";
                await Share.share(body, subject: subject);
              },
              child: const ActionButton(
                icon: Icons.error_outline_rounded,
                text: 'Report Error',
              ),
            ),
          ],
        ),
      ),
    );
  }
}

class ErrorPage extends StatelessWidget {
  const ErrorPage({super.key});

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      body: AppSafeArea(
        horizontalPadding: 24,
        verticalPadding: 24,
        child: Column(
          mainAxisAlignment: MainAxisAlignment.center,
          crossAxisAlignment: CrossAxisAlignment.center,
          children: [
            const Spacer(),
            SvgPicture.asset(
              'assets/icon/error_icon.svg',
              semanticsLabel: 'Error',
            ),
            const SizedBox(height: 24),
            Padding(
              padding: const EdgeInsets.symmetric(horizontal: 13),
              child: RichText(
                textAlign: TextAlign.center,
                text: TextSpan(
                  children: <TextSpan>[
                    TextSpan(
                      text: 'Oops! ',
                      style: CustomTextStyle.headline7(context)?.copyWith(
                        color: CustomColors.appColorBlue,
                      ),
                    ),
                    TextSpan(
                      text:
                          'We can’t seem to find the content you’re looking for.',
                      style: CustomTextStyle.headline7(context)?.copyWith(
                        color: CustomColors.appColorBlack,
                      ),
                    ),
                  ],
                ),
              ),
            ),
            const SizedBox(height: 24),
            Padding(
              padding: const EdgeInsets.symmetric(horizontal: 30),
              child: Text(
                'Scared?, take a deep breath of clean air on us. Ready? Breathe In, Breathe out.',
                textAlign: TextAlign.center,
                style: CustomTextStyle.headline8(context)?.copyWith(
                  color: CustomColors.appColorBlack,
                  fontWeight: FontWeight.normal,
                ),
              ),
            ),
            const Spacer(),
            NextButton(
              buttonColor: CustomColors.appColorBlue,
              text: 'Return home',
              callBack: () {
                Navigator.pushAndRemoveUntil(
                  context,
                  MaterialPageRoute(
                    builder: (context) {
                      return const HomePage();
                    },
                  ),
                  (r) => false,
                );
              },
            ),
          ],
        ),
      ),
    );
  }
}
