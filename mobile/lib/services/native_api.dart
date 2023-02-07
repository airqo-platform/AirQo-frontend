import 'dart:io';
import 'dart:isolate';
import 'dart:ui';

import 'package:app/constants/constants.dart';
import 'package:app/models/models.dart';
import 'package:app/services/rest_api.dart';
import 'package:app/utils/utils.dart';
import 'package:app/widgets/widgets.dart';
import 'package:firebase_dynamic_links/firebase_dynamic_links.dart';
import 'package:flutter/foundation.dart';
import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:flutter_cache_manager/flutter_cache_manager.dart'
    as cache_manager;
import 'package:flutter_dotenv/flutter_dotenv.dart';
import 'package:in_app_review/in_app_review.dart';
import 'package:package_info_plus/package_info_plus.dart';
import 'package:permission_handler/permission_handler.dart';
import 'package:share_plus/share_plus.dart';
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
  static Future<void> rateApp() async {
    final InAppReview inAppReview = InAppReview.instance;
    await inAppReview.openStoreListing(appStoreId: Config.iosStoreId);
  }

  static Future<void> logAppRating() async {
    await CloudAnalytics.logEvent(
      AnalyticsEvent.rateApp,
    );
  }
}

class ShareService {
  // TODO : transfer to backend: Reference: https://firebase.google.com/docs/reference/dynamic-links/link-shortener
  static Future<Uri> createShareLink({
    Kya? kya,
    AirQualityReading? airQualityReading,
  }) async {
    if (airQualityReading != null && kya != null) {
      throw Exception('One model should be provided');
    }

    try {
      if (airQualityReading != null &&
          airQualityReading.shareLink.isNotEmpty &&
          airQualityReading.shareLink.length < Config.shareLinkMaxLength) {
        return Uri.parse(airQualityReading.shareLink);
      }

      if (kya != null &&
          kya.shareLink.isNotEmpty &&
          kya.shareLink.length < Config.shareLinkMaxLength) {
        return Uri.parse(kya.shareLink);
      }
    } catch (exception, stackTrace) {
      await logException(
        exception,
        stackTrace,
      );
    }

    String params = '';
    String? title;
    String? description;
    Uri? shareImage;

    if (airQualityReading != null) {
      params = '${airQualityReading.shareLinkParams()}&page=insights';
      title = airQualityReading.name;
      description = airQualityReading.location;
      shareImage = Uri.parse(Config.airqoSecondaryLogo);
    }

    if (kya != null) {
      params = '${kya.shareLinkParams()}&page=kya';
      title = kya.title;
      description = 'Breathe Clean';
      shareImage = Uri.parse(kya.imageUrl);
    }

    const uriPrefix = 'https://airqo.page.link';

    PackageInfo packageInfo = await PackageInfo.fromPlatform();

    final DynamicLinkParameters dynamicLinkParams = DynamicLinkParameters(
      link: Uri.parse('https://airqo.net/?$params'),
      uriPrefix: uriPrefix,
      androidParameters: AndroidParameters(
        packageName: Platform.isAndroid
            ? packageInfo.packageName
            : Config.androidPackageName,
        minimumVersion: Config.androidMinimumShareVersion,
        fallbackUrl: Uri.parse(
          'https://play.google.com/store/apps/details?id=com.airqo.app',
        ),
      ),
      iosParameters: IOSParameters(
        bundleId: Platform.isIOS ? packageInfo.packageName : Config.iosBundleId,
        fallbackUrl: Uri.parse(
          'https://itunes.apple.com/ug/app/airqo-monitoring-air-quality/id1337573091',
        ),
        appStoreId: Config.iosStoreId,
        minimumVersion: Config.iosMinimumShareVersion,
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

    if (await hasNetworkConnection()) {
      try {
        final ShortDynamicLink shortDynamicLink = await FirebaseDynamicLinks
            .instance
            .buildShortLink(dynamicLinkParams);
        Uri shareLink = shortDynamicLink.shortUrl;
        if (airQualityReading != null) {
          await HiveService.updateAirQualityReading(airQualityReading.copyWith(
            shareLink: shareLink.toString(),
          ));
        }

        if (kya != null) {
          await HiveService.updateKya(
            kya.copyWith(shareLink: shareLink.toString()),
          );
        }

        return shareLink;
      } catch (exception, stackTrace) {
        await logException(exception, stackTrace);
      }
    }

    return FirebaseDynamicLinks.instance.buildLink(dynamicLinkParams);
  }

  static Future<void> navigateToSharedFeature({
    required PendingDynamicLinkData linkData,
    required BuildContext context,
  }) async {
    final destination = linkData.link.queryParameters['page'] ?? '';
    switch (destination.toLowerCase()) {
      case 'insights':
        Navigator.pushAndRemoveUntil(
          context,
          MaterialPageRoute(builder: (context) {
            return InsightsPage(AirQualityReading.fromDynamicLink(linkData));
          }),
          (r) => false,
        );
        break;
      case 'kya':
        Navigator.pushAndRemoveUntil(
          context,
          MaterialPageRoute(builder: (context) {
            return KyaTitlePage(Kya.fromDynamicLink(linkData));
          }),
          (r) => false,
        );
        break;
      default:
        Navigator.push(
          context,
          MaterialPageRoute(builder: (context) {
            return const ErrorPage();
          }),
        );
        break;
    }
  }

  static Future<void> shareLink(
    Uri link, {
    Kya? kya,
    AirQualityReading? airQualityReading,
  }) async {
    if (airQualityReading != null && kya != null) {
      throw Exception('One model should be provided');
    }

    String subject;
    if (kya != null) {
      subject = kya.title;
    } else if (airQualityReading != null) {
      subject = '${airQualityReading.name}\n${airQualityReading.location}';
    } else {
      subject = '';
    }
    await Share.share(
      link.toString(),
      subject: subject,
    ).then((_) => {updateUserShares()});
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
            final airQualityReadings =
                await AirqoApiClient().fetchAirQualityReadings();
            final sendPort = IsolateNameServer.lookupPortByName(
              BackgroundService.taskChannel(task),
            );
            if (sendPort != null) {
              sendPort.send(airQualityReadings);
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
        await HiveService.updateAirQualityReadings(
          data as List<AirQualityReading>,
        );
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
