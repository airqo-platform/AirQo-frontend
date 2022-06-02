import 'dart:io';
import 'dart:ui' as ui;

import 'package:app/constants/config.dart';
import 'package:app/models/measurement.dart';
import 'package:app/models/place_details.dart';
import 'package:app/services/firebase_service.dart';
import 'package:app/services/local_storage.dart';
import 'package:app/utils/date.dart';
import 'package:app/utils/pm.dart';
import 'package:auto_size_text/auto_size_text.dart';
import 'package:flutter/material.dart';
import 'package:flutter/rendering.dart';
import 'package:flutter/services.dart';
import 'package:in_app_review/in_app_review.dart';
import 'package:path_provider/path_provider.dart';
import 'package:permission_handler/permission_handler.dart';
import 'package:share_plus/share_plus.dart';
import 'package:url_launcher/url_launcher.dart';

import '../models/enum_constants.dart';
import '../models/profile.dart';
import '../screens/analytics/analytics_widgets.dart';
import '../themes/app_theme.dart';
import '../themes/colors.dart';
import '../utils/exception.dart';
import 'firebase_service.dart';

class SystemProperties {
  static Future<void> setDefault() async {
    SystemChrome.setSystemUIOverlayStyle(const SystemUiOverlayStyle(
      statusBarColor: Colors.transparent,
      statusBarIconBrightness: Brightness.dark,
    ));

    await SystemChrome.setPreferredOrientations(
        [DeviceOrientation.portraitUp, DeviceOrientation.portraitDown]);

    await SystemChrome.setEnabledSystemUIMode(SystemUiMode.manual,
        overlays: [SystemUiOverlay.bottom, SystemUiOverlay.top]);
  }
}

class RateService {
  static Future<void> rateApp({bool inApp = false}) async {
    if (await InAppReview.instance.isAvailable()) {
      inApp
          ? await InAppReview.instance.requestReview()
          : await InAppReview.instance
              .openStoreListing(
                appStoreId: Config.iosStoreId,
              )
              .then((value) => logAppRating);
    } else {
      if (Platform.isIOS || Platform.isMacOS) {
        try {
          await launchUrl(Uri.parse(Config.appStoreUrl))
              .then((value) => logAppRating);
        } catch (exception, stackTrace) {
          debugPrint('${exception.toString()}\n${stackTrace.toString()}');
        }
      } else {
        try {
          await launchUrl(Uri.parse(Config.playStoreUrl))
              .then((value) => logAppRating);
        } catch (exception, stackTrace) {
          debugPrint('${exception.toString()}\n${stackTrace.toString()}');
        }
      }
    }
  }

  static Future<void> logAppRating() async {
    await CloudAnalytics.logEvent(AnalyticsEvent.rateApp);
  }
}

class ShareService {
  static Widget analyticsCardImage(Measurement measurement,
      PlaceDetails placeDetails, BuildContext context) {
    return Container(
      constraints: const BoxConstraints(maxHeight: 200, maxWidth: 300),
      padding: const EdgeInsets.symmetric(vertical: 5, horizontal: 8),
      decoration: BoxDecoration(
          color: Colors.white,
          borderRadius: const BorderRadius.all(Radius.circular(16.0)),
          border: Border.all(color: Colors.transparent)),
      child: Column(
        children: [
          const Spacer(),
          Row(
            mainAxisAlignment: MainAxisAlignment.center,
            children: [
              AnalyticsAvatar(measurement: measurement),
              const SizedBox(width: 10.0),
              Flexible(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    AutoSizeText(
                      placeDetails.name,
                      maxLines: 1,
                      overflow: TextOverflow.ellipsis,
                      minFontSize: 17,
                      style: CustomTextStyle.headline9(context),
                    ),
                    AutoSizeText(
                      placeDetails.location,
                      maxLines: 1,
                      overflow: TextOverflow.ellipsis,
                      minFontSize: 12,
                      style: CustomTextStyle.bodyText4(context)?.copyWith(
                          color: CustomColors.appColorBlack.withOpacity(0.3)),
                    ),
                    const SizedBox(
                      height: 12,
                    ),
                    Container(
                      padding: const EdgeInsets.fromLTRB(10.0, 2.0, 10.0, 2.0),
                      decoration: BoxDecoration(
                          borderRadius:
                              const BorderRadius.all(Radius.circular(40.0)),
                          color: pollutantValueColor(
                                  value: measurement.getPm2_5Value(),
                                  pollutant: Pollutant.pm2_5)
                              .withOpacity(0.4),
                          border: Border.all(color: Colors.transparent)),
                      child: AutoSizeText(
                        pollutantValueString(
                            value: measurement.getPm2_5Value(),
                            pollutant: Pollutant.pm2_5),
                        maxLines: 2,
                        textAlign: TextAlign.start,
                        overflow: TextOverflow.ellipsis,
                        style: TextStyle(
                          fontSize: 12,
                          color: pollutantTextColor(
                              value: measurement.getPm2_5Value(),
                              pollutant: Pollutant.pm2_5),
                        ),
                      ),
                    ),
                    const SizedBox(
                      height: 8,
                    ),
                    Text(
                      dateToShareString(measurement.time),
                      maxLines: 1,
                      overflow: TextOverflow.ellipsis,
                      style: TextStyle(
                          fontSize: 8, color: Colors.black.withOpacity(0.3)),
                    ),
                  ],
                ),
              )
            ],
          ),
          const Spacer(),
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              Text(
                '© ${DateTime.now().year} AirQo',
                style: TextStyle(
                  fontSize: 9,
                  color: CustomColors.appColorBlack.withOpacity(0.5),
                  height: 32 / 9,
                  fontWeight: FontWeight.w500,
                ),
              ),
              Text(
                'www.airqo.africa',
                style: TextStyle(
                  fontSize: 9,
                  color: CustomColors.appColorBlack.withOpacity(0.5),
                  height: 32 / 9,
                  fontWeight: FontWeight.w500,
                ),
              ),
            ],
          )
        ],
      ),
    );
  }

  static String getShareMessage() {
    return 'Download the AirQo app from Google play\nhttps://play.google.com/store/apps/details?id=com.airqo.app\nand App Store\nhttps://itunes.apple.com/ug/app/airqo-monitoring-air-quality/id1337573091\n';
  }

  static Future<void> shareCard(BuildContext buildContext, GlobalKey globalKey,
      Measurement measurement) async {
    try {
      final boundary =
          globalKey.currentContext!.findRenderObject() as RenderRepaintBoundary;
      final image = await boundary.toImage(pixelRatio: 10.0);
      final byteData = await image.toByteData(format: ui.ImageByteFormat.png);
      final pngBytes = byteData!.buffer.asUint8List();

      final directory = (await getApplicationDocumentsDirectory()).path;
      final imgFile = File('$directory/airqo_analytics_card.png');
      await imgFile.writeAsBytes(pngBytes);

      await Share.shareFiles([imgFile.path], text: getShareMessage())
          .then((value) => {updateUserShares()});
    } catch (exception, stackTrace) {
      await logException(exception, stackTrace);
    }
  }

  static Future<void> shareGraph(BuildContext buildContext, GlobalKey globalKey,
      PlaceDetails placeDetails) async {
    final boundary =
        globalKey.currentContext!.findRenderObject() as RenderRepaintBoundary;
    final image = await boundary.toImage(pixelRatio: 10.0);
    final byteData = await image.toByteData(format: ui.ImageByteFormat.png);
    final pngBytes = byteData!.buffer.asUint8List();

    final directory = (await getApplicationDocumentsDirectory()).path;
    final imgFile = File('$directory/airqo_analytics_graph.png');
    await imgFile.writeAsBytes(pngBytes);

    await Share.shareFiles([imgFile.path], text: getShareMessage())
        .then((value) => {updateUserShares()});
  }

  static Future<void> shareKya(
      BuildContext buildContext, GlobalKey globalKey) async {
    final boundary =
        globalKey.currentContext!.findRenderObject() as RenderRepaintBoundary;
    final image = await boundary.toImage(pixelRatio: 10.0);
    final byteData = await image.toByteData(format: ui.ImageByteFormat.png);
    final pngBytes = byteData!.buffer.asUint8List();
    final directory = (await getApplicationDocumentsDirectory()).path;
    final imgFile = File('$directory/analytics_graph.png');
    await imgFile.writeAsBytes(pngBytes);

    await Share.shareFiles([imgFile.path], text: getShareMessage())
        .then((value) => {updateUserShares()});
  }

  static void shareMeasurementText(Measurement measurement) {
    final recommendationList =
        getHealthRecommendations(measurement.getPm2_5Value(), Pollutant.pm2_5);
    var recommendations = '';
    for (final value in recommendationList) {
      recommendations = '$recommendations\n- ${value.body}';
    }
    Share.share(
            '${measurement.site.name}, Current Air Quality.\n\n'
            'PM2.5 : ${measurement.getPm2_5Value().toStringAsFixed(2)} µg/m\u00B3 (${pollutantValueString(value: measurement.getPm2_5Value(), pollutant: Pollutant.pm2_5)}) \n'
            'PM10 : ${measurement.getPm10Value().toStringAsFixed(2)} µg/m\u00B3 \n'
            '$recommendations\n\n'
            'Source: AirQo App',
            subject: 'AirQo, ${measurement.site.name}!')
        .then((value) => {updateUserShares()});
  }

  static Future<void> updateUserShares() async {
    final preferences = await SharedPreferencesHelper.getPreferences();
    final value = preferences.aqShares + 1;
    if (CustomAuth.isLoggedIn()) {
      final profile = await Profile.getProfile();
      profile.preferences.aqShares = value;
      await profile.update();
    } else {
      await SharedPreferencesHelper.updatePreference('aqShares', value, 'int');
    }

    if (value >= 5) {
      await CloudAnalytics.logEvent(AnalyticsEvent.shareAirQualityInformation);
    }
  }
}

class PermissionService {
  static Future<bool> checkPermission(AppPermission permission,
      {bool request = false}) async {
    PermissionStatus status;
    switch (permission) {
      case AppPermission.notification:
        status = await Permission.notification.status;
        break;
      case AppPermission.location:
        status = await Permission.location.status;
        break;
    }

    if (status != PermissionStatus.granted && request) {
      if (status == PermissionStatus.permanentlyDenied) {
        return await openAppSettings();
      } else {
        switch (permission) {
          case AppPermission.notification:
            return await Permission.notification.request() ==
                PermissionStatus.granted;
          case AppPermission.location:
            return await Permission.location.request() ==
                PermissionStatus.granted;
        }
      }
    }

    return status == PermissionStatus.granted;
  }
}
