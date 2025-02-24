import 'package:app/blocs/blocs.dart';
import 'package:app/constants/constants.dart';
import 'package:app/models/models.dart';
import 'package:app/themes/theme.dart';
import 'package:app/widgets/widgets.dart';
import 'package:auto_size_text/auto_size_text.dart';
import 'package:flutter/material.dart';
import 'package:flutter_bloc/flutter_bloc.dart';
import 'package:url_launcher/url_launcher.dart';
import 'package:flutter_gen/gen_l10n/app_localizations.dart';

Future<void> openUpdateScreen(
  BuildContext context,
  AppStoreVersion appStoreVersion,
) async {
  await showModalBottomSheet(
    isScrollControlled: true,
    useSafeArea: true,
    isDismissible: false,
    enableDrag: false,
    elevation: 0.0,
    backgroundColor: CustomColors.appBodyColor,
    context: context,
    shape: const RoundedRectangleBorder(
      borderRadius: BorderRadius.only(
        topLeft: Radius.circular(16),
        topRight: Radius.circular(16),
      ),
    ),
    builder: (BuildContext context) {
      final mediaQueryData = MediaQuery.of(context);
      final num textScaleFactor = mediaQueryData.textScaleFactor.clamp(
        Config.minimumTextScaleFactor,
        Config.maximumTextScaleFactor,
      );

      return MediaQuery(
        data: mediaQueryData.copyWith(
          textScaler: TextScaler.linear(textScaleFactor as double),
        ),
        child: Column(
          children: [
            const SizedBox(
              height: 29,
            ),
            Padding(
              padding: const EdgeInsets.symmetric(horizontal: 29),
              child: Row(
                mainAxisAlignment: MainAxisAlignment.end,
                children: [
                  InkWell(
                    onTap: () {
                      context.read<DashboardBloc>().add(
                            const CancelCheckForUpdates(),
                          );
                      Navigator.pop(context);
                    },
                    child: SvgIcons.close(),
                  ),
                ],
              ),
            ),
            const Spacer(),
            Padding(
              padding: const EdgeInsets.symmetric(horizontal: 58.0),
              child: SvgIcons.update(),
            ),
            const SizedBox(
              height: 45,
            ),
            Padding(
              padding: const EdgeInsets.symmetric(horizontal: 60.0),
              child: Text(
                AppLocalizations.of(context)!.aNewUpdateIsNowAvailable,
                style: CustomTextStyle.errorTitle(context),
                textAlign: TextAlign.center,
              ),
            ),
            const SizedBox(
              height: 23,
            ),
            Padding(
              padding: const EdgeInsets.symmetric(horizontal: 50.0),
              child: Text(
                AppLocalizations.of(context)!
                    .airQoversionIsNowAvailableToKeepYouUpToDateOnTheLatestAirQualityData(
                  appStoreVersion.version,
                ),
                style: CustomTextStyle.errorSubTitle(context),
                textAlign: TextAlign.center,
              ),
            ),
            const SizedBox(
              height: 23,
            ),
            Padding(
              padding: const EdgeInsets.symmetric(horizontal: 81.0),
              child: OutlinedButton(
                style: OutlinedButton.styleFrom(
                  minimumSize: const Size.fromHeight(60),
                  foregroundColor: CustomColors.appColorBlue,
                  elevation: 0,
                  side: BorderSide(
                    color: CustomColors.appColorBlue,
                    width: 0,
                  ),
                  shape: const RoundedRectangleBorder(
                    borderRadius: BorderRadius.all(
                      Radius.circular(8),
                    ),
                  ),
                  backgroundColor: CustomColors.appColorBlue,
                  padding: const EdgeInsets.symmetric(
                    vertical: 12,
                    horizontal: 59,
                  ),
                ),
                onPressed: () async {
                  await launchUrl(
                    appStoreVersion.url,
                    mode: LaunchMode.externalApplication,
                  ).then((value) {
                    context.read<DashboardBloc>().add(
                          const CancelCheckForUpdates(),
                        );
                  });
                },
                child: AutoSizeText(
                  AppLocalizations.of(context)!.updateNow,
                  style: CustomTextStyle.errorTitle(context)?.copyWith(
                    fontSize: 14,
                    color: Colors.white,
                    fontWeight: FontWeight.w400,
                    fontStyle: FontStyle.normal,
                  ),
                ),
              ),
            ),
            const Spacer(),
          ],
        ),
      );
    },
  );
}
