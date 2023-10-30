import 'package:app/services/services.dart';
import 'package:app/themes/theme.dart';
import 'package:app/widgets/widgets.dart';
import 'package:auto_size_text/auto_size_text.dart';
import 'package:flutter/material.dart';
import 'package:flutter_gen/gen_l10n/app_localizations.dart';
import 'package:flutter_svg/svg.dart';

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
              AppLocalizations.of(context)!.noResultsFound,
              style: CustomTextStyle.errorTitle(context),
              textAlign: TextAlign.center,
            ),
            const SizedBox(height: 23),
            Text(
              message ??
                  AppLocalizations.of(context)!
                      .tryAdjustingYourSearchToFindWhatYoureLookingFor,
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
                  AppLocalizations.of(context)!
                      .weCantSeemToFindTheKYAContentYoureLookingFor,
                  style: CustomTextStyle.errorTitle(context),
                  textAlign: TextAlign.center,
                ),
                const SizedBox(
                  height: 23,
                ),
                Text(
                  AppLocalizations.of(context)!
                      .scaredTakeADeepBreathOfCleanAirOnUsReadyBreatheInBreatheOut,
                  style: CustomTextStyle.errorSubTitle(context),
                  textAlign: TextAlign.center,
                ),
                const Spacer(),
                NextButton(
                  buttonColor: CustomColors.appColorBlue,
                  text: AppLocalizations.of(context)!.returnHome,
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
              AppLocalizations.of(context)!.noAirQualityData,
              style: CustomTextStyle.errorTitle(context),
              textAlign: TextAlign.center,
            ),
            const SizedBox(
              height: 23,
            ),
            Text(
              AppLocalizations.of(context)!
                  .wereHavingIssuesWithOurNetworkNoWorriesWellBeBackUpSoon,
              style: CustomTextStyle.errorSubTitle(context),
              textAlign: TextAlign.center,
            ),
            const SizedBox(
              height: 30,
            ),
            ActionButton(
              callBack: callBack,
              icon: Icons.refresh_outlined,
              text: actionButtonText ?? AppLocalizations.of(context)!.reload,
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
            AppLocalizations.of(context)!.viewYourFavoritPlaces,
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
                text: "${AppLocalizations.of(context)!.tapThe} ",
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
                    " ${AppLocalizations.of(context)!.favoriteIconOnAnyLocationToAddItToYourFavorites}",
                style: Theme.of(context).textTheme.bodyLarge,
              ),
            ]),
          ),
          const SizedBox(
            height: 30,
          ),
          ActionButton(
            callBack: () async {
              await Navigator.push(
                context,
                MaterialPageRoute(
                  builder: (context) {
                    return const SearchPage();
                  },
                ),
              );
            },
            icon: Icons.add,
            text: AppLocalizations.of(context)!.addFavorites,
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
            AppLocalizations.of(context)!.knowTheAirQualityTrends,
            style: CustomTextStyle.errorTitle(context),
            textAlign: TextAlign.center,
          ),
          const SizedBox(
            height: 23,
          ),
          Text(
            AppLocalizations.of(context)!
                .stayOnTopOfChangesInAirQualityOfPlacesImportantToYou,
            style: CustomTextStyle.errorSubTitle(context),
            textAlign: TextAlign.center,
          ),
          const SizedBox(
            height: 30,
          ),
          ActionButton(
            callBack: callBack,
            icon: Icons.location_on_outlined,
            text: AppLocalizations.of(context)!.turnOnLocation,
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
          AutoSizeText(
            AppLocalizations.of(context)!.keepUpWithYourLessons,
            style: CustomTextStyle.errorTitle(context),
            textAlign: TextAlign.center,
          ),
          const SizedBox(
            height: 23,
          ),
          AutoSizeText(
            AppLocalizations.of(context)!
                .trackYourCompletedKnowYourAirLessonsAndRevisitThemAnytime,
            style: CustomTextStyle.errorSubTitle(context),
            textAlign: TextAlign.center,
          ),
          const SizedBox(
            height: 30,
          ),
          NextButton(
            buttonColor: CustomColors.appColorBlue,
            text: AppLocalizations.of(context)!.startLearning,
            callBack: callBack,
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
            AppLocalizations.of(context)!.noLessons,
            style: CustomTextStyle.errorTitle(context),
            textAlign: TextAlign.center,
          ),
          const SizedBox(
            height: 23,
          ),
          Text(
            AppLocalizations.of(context)!
                .wereHavingIssuesWithOurNetworkNoWorriesWellBeBackUpSoon,
            style: CustomTextStyle.errorSubTitle(context),
            textAlign: TextAlign.center,
          ),
          const SizedBox(
            height: 30,
          ),
          ActionButton(
            callBack: callBack,
            icon: Icons.refresh_outlined,
            text: AppLocalizations.of(context)!.reload,
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
              AppLocalizations.of(context)!.noInternetConnection,
              style: CustomTextStyle.errorTitle(context),
              textAlign: TextAlign.center,
            ),
            const SizedBox(
              height: 23,
            ),
            Text(
              AppLocalizations.of(context)!.connectToTheInternetToSeeResults,
              style: CustomTextStyle.errorSubTitle(context),
              textAlign: TextAlign.center,
            ),
            const SizedBox(
              height: 30,
            ),
            ActionButton(
              callBack: callBack,
              icon: Icons.refresh_outlined,
              text: actionButtonText ?? AppLocalizations.of(context)!.refresh,
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
                      text: AppLocalizations.of(context)!
                          .weCantSeemToFindTheContentYoureLookingFor,
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
                AppLocalizations.of(context)!
                    .scaredTakeADeepBreathOfCleanAirOnUsReadyBreatheInBreatheOut,
                textAlign: TextAlign.center,
                style: CustomTextStyle.headline8(context)?.copyWith(
                  color: CustomColors.appColorBlack,
                  fontWeight: FontWeight.normal,
                ),
              ),
            ),
            const Spacer(),
            ActionButton(
              callBack: callBack,
              icon: Icons.refresh_outlined,
              text: AppLocalizations.of(context)!.refresh,
            ),
          ],
        ),
      ),
    );
  }
}

class AppCrushWidget extends StatelessWidget {
  const AppCrushWidget(this.exception, this.stackTrace, {super.key});

  final Object exception;
  final StackTrace? stackTrace;

  @override
  Widget build(BuildContext context) {
    final locale = Localizations.localeOf(context);
    AppService.setLocale(locale.languageCode);

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
                      text:
                          AppLocalizations.of(context)!.aFatalErrorHasOccurred,
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
                AppLocalizations.of(context)!
                    .scaredTakeADeepBreathOfCleanAirOnUsReadyBreatheInBreatheOut,
                textAlign: TextAlign.center,
                style: CustomTextStyle.headline8(context)?.copyWith(
                  color: CustomColors.appColorBlack,
                  fontWeight: FontWeight.normal,
                ),
              ),
            ),
            const Spacer(),
            ActionButton(
              callBack: () async {
                loadingScreen(context);
                await AirqoApiClient.sendErrorToSlack(exception, stackTrace)
                    .then((_) {
                  Navigator.pop(context);
                  showSnackBar(
                    context,
                    AppLocalizations.of(context)!.reportHasBeenSuccessfullySent,
                    durationInSeconds: 10,
                  );
                });
              },
              icon: Icons.error_outline_rounded,
              text: AppLocalizations.of(context)!.reportError,
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
                      text: AppLocalizations.of(context)!
                          .weCantSeemToFindTheContentYoureLookingFor,
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
                AppLocalizations.of(context)!
                    .scaredTakeADeepBreathOfCleanAirOnUsReadyBreatheInBreatheOut,
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
              text: AppLocalizations.of(context)!.returnHome,
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
