import 'dart:io';
import 'dart:isolate';
import 'dart:ui';

import 'package:app/constants/constants.dart';
import 'package:app/models/models.dart';
import 'package:app/utils/utils.dart';
import 'package:app/widgets/widgets.dart';
import 'package:app_repository/app_repository.dart';
import 'package:firebase_dynamic_links/firebase_dynamic_links.dart';
import 'package:flutter/foundation.dart';
import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:flutter_cache_manager/flutter_cache_manager.dart'
    as cache_manager;
import 'package:flutter_dotenv/flutter_dotenv.dart';
import 'package:hive_flutter/hive_flutter.dart';
import 'package:in_app_review/in_app_review.dart';
import 'package:package_info_plus/package_info_plus.dart';
import 'package:permission_handler/permission_handler.dart';
import 'package:share_plus/share_plus.dart';
import 'package:url_launcher/url_launcher.dart';
import 'package:workmanager/workmanager.dart' as workmanager;

import '../screens/insights/insights_page.dart';
import '../screens/kya/kya_title_page.dart';
import 'firebase_service.dart';
import 'hive_service.dart';
import 'local_storage.dart';

class SystemProperties {
  static Future<void> setDefault() async {
    try {
      SystemChrome.setSystemUIOverlayStyle(
        const SystemUiOverlayStyle(
          statusBarColor: Colors.transparent,
          statusBarIconBrightness: Brightness.dark,
        ),
      );

      await SystemChrome.setPreferredOrientations(
        [DeviceOrientation.portraitUp, DeviceOrientation.portraitDown],
      );

      await SystemChrome.setEnabledSystemUIMode(
        SystemUiMode.manual,
        overlays: [SystemUiOverlay.bottom, SystemUiOverlay.top],
      );
    } catch (exception, stackTrace) {
      await logException(exception, stackTrace);
    }
  }
}

class RateService {
  static Future<void> rateApp({
    bool inApp = false,
  }) async {
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
    await CloudAnalytics.logEvent(
      AnalyticsEvent.rateApp,
    );
  }
}

class ShareService {
  static Future<ShortDynamicLink> createShareLink({
    Kya? kya,
    AirQualityReading? airQualityReading,
  }) async {
    final packageInfo = await PackageInfo.fromPlatform();
    const uriPrefix = 'https://airqo.page.link';
    String params = '';
    String? title;
    String? description;
    Uri? shareImage;

    if (airQualityReading != null) {
      params = '${airQualityReading.shareLinkParams()}&destination=insights';
      title = airQualityReading.name;
      description = airQualityReading.location;
      // TODO add siteShareImage to AirQualityReading model
      // shareImage = airQualityReading.siteShareImage.isEmpty ? null : Uri.parse(airQualityReading.siteShareImage);
    }

    if (kya != null) {
      params = '${kya.shareLinkParams()}&destination=kya';
      title = kya.title;
      description = 'Breathe Clean';
      shareImage = kya.shareImage.isEmpty ? null : Uri.parse(kya.shareImage);
    }

    final dynamicLinkParams = DynamicLinkParameters(
      link: Uri.parse('https://airqo.net/?$params'),
      uriPrefix: uriPrefix,
      androidParameters: AndroidParameters(
        packageName: packageInfo.packageName,
        minimumVersion: 30,
        fallbackUrl: Uri.parse(
          'https://play.google.com/store/apps/details?id=com.airqo.app',
        ),
      ),
      iosParameters: IOSParameters(
        bundleId: packageInfo.packageName,
        fallbackUrl: Uri.parse(
          'https://itunes.apple.com/ug/app/airqo-monitoring-air-quality/id1337573091',
        ),
        appStoreId: Config.iosStoreId,
        minimumVersion:
            packageInfo.version, // TODO replace with minimum version
      ),
      googleAnalyticsParameters: const GoogleAnalyticsParameters(
        source: 'airqo-app',
        medium: 'social',
        campaign: 'Air Quality Sharing',
        content: 'Air Quality Sharing',
        term: 'Air Quality Sharing',
      ),
      socialMetaTagParameters: SocialMetaTagParameters(
        title: title,
        description: description,
        imageUrl: shareImage,
      ),
    );

    return FirebaseDynamicLinks.instance.buildShortLink(dynamicLinkParams);
  }

  static Future<void> navigateToSharedFeature({
    required PendingDynamicLinkData linkData,
    required BuildContext context,
  }) async {
    final destination = linkData.link.queryParameters['destination'] ?? '';
    try {
      if (destination.equalsIgnoreCase('insights')) {
        AirQualityReading airQualityReading = AirQualityReading.fromDynamicLink(
          linkData,
        );
        Navigator.pushAndRemoveUntil(
          context,
          MaterialPageRoute(builder: (context) {
            return InsightsPage(airQualityReading);
          }),
          (r) => false,
        );
      }

      if (destination.equalsIgnoreCase('kya')) {
        final String id = linkData.link.queryParameters['kyaId'] ?? '';
        Kya kya = Hive.box<Kya>(HiveBox.kya)
            .values
            .firstWhere((element) => element.id == id, orElse: () {
          return Kya.withOnlyId(id);
        });

        Navigator.pushAndRemoveUntil(
          context,
          MaterialPageRoute(builder: (context) {
            return KyaTitlePage(kya);
          }),
          (r) => false,
        );
      }
    } catch (exception, stackTrace) {
      print(exception);
      print(stackTrace);
      Navigator.push(
        context,
        MaterialPageRoute(builder: (context) {
          return const ErrorPage();
        }),
      );
      await logException(exception, stackTrace);
    }
  }

  static Future<void> shareLink({
    required ShortDynamicLink link,
    required String subject,
  }) async {
    await Share.share(
      '${link.shortUrl}',
      subject: subject,
    ).then((value) => {updateUserShares()});
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
      await CloudAnalytics.logEvent(
        AnalyticsEvent.shareAirQualityInformation,
      );
    }
  }
}

class PermissionService {
  static Future<bool> checkPermission(
    AppPermission permission, {
    bool request = false,
  }) async {
    PermissionStatus status;
    switch (permission) {
      case AppPermission.notification:
        status = await Permission.notification.status;
        break;
      case AppPermission.location:
        status = await Permission.location.status;
        break;
      case AppPermission.photosStorage:
        status = await Permission.photos.status;
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
          case AppPermission.photosStorage:
            return await Permission.accessMediaLocation.request() ==
                PermissionStatus.granted;
        }
      }
    }

    return status == PermissionStatus.granted;
  }
}

void backgroundCallbackDispatcher() {
  workmanager.Workmanager().executeTask(
    (task, inputData) async {
      await dotenv.load(fileName: Config.environmentFile);
      try {
        switch (task) {
          case BackgroundService.airQualityUpdates:
            final siteReadings = await AppRepository(
              airqoApiKey: Config.airqoApiToken,
              baseUrl: Config.airqoApiUrl,
            ).getSitesReadings();
            final sendPort = IsolateNameServer.lookupPortByName(
              BackgroundService.taskChannel(task),
            );
            if (sendPort != null) {
              sendPort.send(siteReadings);
            } else {
              // TODO: implement saving
              // final SharedPreferences prefs = await
              // SharedPreferences.getInstance();
              // await prefs.setString('measurements', 'measurements');
            }
            break;
        }

        return Future.value(true);
      } catch (exception, stackTrace) {
        await logException(
          exception,
          stackTrace,
        );

        return Future.value(false);
      }
    },
  );
}

class BackgroundService {
  factory BackgroundService() {
    return _instance;
  }

  BackgroundService._internal();

  static final BackgroundService _instance = BackgroundService._internal();

  static const airQualityUpdates = 'Air Quality Updates';

  static String taskChannel(String task) {
    return 'channel_${task.toLowerCase().replaceAll(' ', '_')}';
  }

  void registerAirQualityRefreshTask() {
    if (Platform.isAndroid) {
      workmanager.Workmanager().registerPeriodicTask(
        BackgroundService.airQualityUpdates,
        BackgroundService.airQualityUpdates,
        frequency: const Duration(minutes: 15),
        constraints: workmanager.Constraints(
          networkType: workmanager.NetworkType.connected,
        ),
      );
    }
    if (Platform.isIOS) {
      workmanager.Workmanager().registerOneOffTask(
        BackgroundService.airQualityUpdates,
        BackgroundService.airQualityUpdates,
        constraints: workmanager.Constraints(
          networkType: workmanager.NetworkType.connected,
        ),
      );
    }
  }

  Future<void> initialize() async {
    await workmanager.Workmanager().initialize(
      backgroundCallbackDispatcher,
      isInDebugMode: kReleaseMode ? false : true,
    );
  }

  void listenToTask(String task) {
    var port = ReceivePort();
    // if (IsolateNameServer.lookupPortByName('bChannel') != null) {
    //   IsolateNameServer.removePortNameMapping('bChannel');
    // }

    IsolateNameServer.registerPortWithName(
      port.sendPort,
      BackgroundService.taskChannel(task),
    );
    port.listen(
      (dynamic data) async {
        await HiveService.updateAirQualityReadings(data as List<SiteReading>);
      },
    );
  }
}

class CacheService {
  static cache_manager.Config cacheConfig(String key) {
    return cache_manager.Config(
      key,
      stalePeriod: const Duration(days: 7),
    );
  }

  static void cacheKyaImages(Kya _) {
    // TODO : implement caching
    // await Future.wait([
    //   cache_manager.DefaultCacheManager()
    //       .downloadFile(kya.imageUrl, key: kya.imageUrlCacheKey()),
    //   cache_manager.DefaultCacheManager().downloadFile(kya.secondaryImageUrl,
    //       key: kya.secondaryImageUrlCacheKey())
    // ]);
    //
    // for (final lesson in kya.lessons) {
    //   await cache_manager.DefaultCacheManager()
    //       .downloadFile(lesson.imageUrl, key: lesson.imageUrlCacheKey(kya));
    // }
  }
}

Future<void> initializeBackgroundServices() async {
  if (Platform.isAndroid) {
    await BackgroundService().initialize();
    BackgroundService().listenToTask(BackgroundService.airQualityUpdates);
    BackgroundService().registerAirQualityRefreshTask();
  }
}
