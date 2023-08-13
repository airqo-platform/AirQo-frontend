import 'dart:io';
import 'dart:isolate';
import 'dart:ui';

import 'package:app/blocs/blocs.dart';
import 'package:app/constants/constants.dart';
import 'package:app/models/models.dart';
import 'package:app/services/rest_api.dart';
import 'package:app/utils/utils.dart';
import 'package:app/widgets/widgets.dart';
import 'package:firebase_dynamic_links/firebase_dynamic_links.dart';
import 'package:flutter/foundation.dart';
import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:flutter_bloc/flutter_bloc.dart';
import 'package:flutter_cache_manager/flutter_cache_manager.dart'
    as cache_manager;
import 'package:flutter_dotenv/flutter_dotenv.dart';
import 'package:in_app_review/in_app_review.dart';
import 'package:permission_handler/permission_handler.dart';
import 'package:share_plus/share_plus.dart';
import 'package:workmanager/workmanager.dart' as workmanager;

import '../screens/insights/insights_page.dart';
import '../screens/kya/kya_title_page.dart';
import 'firebase_service.dart';
import 'hive_service.dart';

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
      CloudAnalyticsEvent.rateApp,
    );
  }
}

class ShareService {
  static Future<void> navigateToSharedFeature({
    required PendingDynamicLinkData linkData,
    required BuildContext context,
  }) async {
    final destination = linkData.link.queryParameters['page'] ?? '';
    switch (destination.toLowerCase()) {
      case 'insights':
        AirQualityReading airQualityReading =
            AirQualityReading.fromDynamicLink(linkData);

        context
            .read<InsightsBloc>()
            .add(InitializeInsightsPage(airQualityReading));

        Navigator.pushAndRemoveUntil(
          context,
          MaterialPageRoute(builder: (context) {
            return InsightsPage(airQualityReading);
          }),
          (r) => false,
        );
        break;
      case 'kya':
        Navigator.pushAndRemoveUntil(
          context,
          MaterialPageRoute(builder: (context) {
            return KyaTitlePage(KyaLesson.fromDynamicLink(linkData));
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
    Uri link,
    BuildContext context, {
    KyaLesson? kya,
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
    ).then((_) => {updateUserShares(context)});
  }

  static Future<void> updateUserShares(BuildContext context) async {
    Profile profile = context.read<ProfileBloc>().state;
    profile = profile.copyWith(
      aqShares: profile.aqShares + 1,
    );
    context.read<ProfileBloc>().add(UpdateProfile(profile));

    if (profile.aqShares >= 5) {
      await CloudAnalytics.logAirQualitySharing(profile);
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
        await HiveService().updateAirQualityReadings(
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

  static void cacheKyaImages(KyaLesson _) {
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
