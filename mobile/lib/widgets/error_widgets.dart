import 'package:app/themes/theme.dart';
import 'package:flutter/material.dart';
import 'package:flutter_svg/svg.dart';

import 'package:app/widgets/buttons.dart';
import 'package:app/widgets/custom_widgets.dart';

import '../screens/home_page.dart';

class NoSearchResultsWidget extends StatelessWidget {
  const NoSearchResultsWidget({super.key});

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
      widget: Center(
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

class ErrorPage extends StatelessWidget {
  const ErrorPage({super.key});

  @override
  Widget build(BuildContext context) {
    return AppSafeArea(
      horizontalPadding: 24,
      verticalPadding: 24,
      widget: Column(
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
          GestureDetector(
            onTap: () {
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
            child: NextButton(
              buttonColor: CustomColors.appColorBlue,
              text: 'Return home',
            ),
          ),
        ],
      ),
    );
  }
}
