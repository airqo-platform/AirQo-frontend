import 'dart:convert';
import 'dart:typed_data';

import 'package:app/models/models.dart';
import 'package:app/services/services.dart';
import 'package:app_repository/app_repository.dart';
import 'package:hive_flutter/hive_flutter.dart';

class HiveService {
  static Future<void> initialize() async {
    await Hive.initFlutter();

    Hive
      ..registerAdapter(AppNotificationAdapter())
      ..registerAdapter(ProfileAdapter())
      ..registerAdapter(KyaAdapter())
      ..registerAdapter(AnalyticsAdapter())
      ..registerAdapter(AppNotificationTypeAdapter())
      ..registerAdapter(KyaLessonAdapter())
      ..registerAdapter(UserPreferencesTypeAdapter())
      ..registerAdapter(FavouritePlaceAdapter())
      ..registerAdapter(AirQualityReadingAdapter());

    final encryptionKey = await getEncryptionKey();

    await Future.wait(
      [
        Hive.openBox<AppNotification>(HiveBox.appNotifications),
        Hive.openBox<Kya>(HiveBox.kya),
        Hive.openBox<Analytics>(HiveBox.analytics),
        Hive.openBox<AirQualityReading>(HiveBox.airQualityReadings),
        Hive.openBox<FavouritePlace>(HiveBox.favouritePlaces),
        Hive.openBox<AirQualityReading>(HiveBox.nearByAirQualityReadings),
        Hive.openBox<Profile>(
          HiveBox.profile,
          encryptionCipher: encryptionKey == null
              ? null
              : HiveAesCipher(
                  encryptionKey,
                ),
        ),
      ],
    );
  }

  static Future<Uint8List?>? getEncryptionKey() async {
    try {
      final secureStorage = SecureStorage();
      var encodedKey = await secureStorage.getValue(HiveBox.encryptionKey);
      if (encodedKey == null) {
        final secureKey = Hive.generateSecureKey();
        await secureStorage.setValue(
          key: HiveBox.encryptionKey,
          value: base64UrlEncode(secureKey),
        );
      }
      encodedKey = await secureStorage.getValue(HiveBox.encryptionKey);

      return base64Url.decode(encodedKey!);
    } catch (_, __) {
      return null;
    }
  }

  static Future<void> clearUserData() async {
    await Future.wait([
      Hive.box<AppNotification>(HiveBox.appNotifications).clear(),
      Hive.box<Kya>(HiveBox.kya).clear(),
      Hive.box<Analytics>(HiveBox.analytics).clear(),
      Hive.box<FavouritePlace>(HiveBox.favouritePlaces).clear(),
    ]);
  }

  static Future<void> updateAirQualityReadings(
    List<SiteReading> siteReadings, {
    bool reload = false,
  }) async {
    final airQualityReadings = <dynamic, AirQualityReading>{};

    for (final siteReading in siteReadings) {
      final airQualityReading = AirQualityReading.fromSiteReading(siteReading);
      airQualityReadings[airQualityReading.placeId] = airQualityReading;
    }
    if (reload) {
      await Hive.box<AirQualityReading>(HiveBox.airQualityReadings).clear();
    }
    await Hive.box<AirQualityReading>(HiveBox.airQualityReadings)
        .putAll(airQualityReadings);
  }

  static Future<void> updateNearbyAirQualityReadings(
    List<AirQualityReading> nearbyAirQualityReadings,
  ) async {
    final nearByAirQualityReadings = <dynamic, AirQualityReading>{};

    nearbyAirQualityReadings =
        sortAirQualityReadingsByDistance(nearbyAirQualityReadings).toList();

    for (final airQualityReading in nearbyAirQualityReadings) {
      nearByAirQualityReadings[airQualityReading.placeId] = airQualityReading;
    }

    await Hive.box<AirQualityReading>(HiveBox.nearByAirQualityReadings).clear();
    await Hive.box<AirQualityReading>(HiveBox.nearByAirQualityReadings)
        .putAll(nearByAirQualityReadings);
  }

  static Future<void> loadNotifications(
    List<AppNotification> notifications,
  ) async {
    if (notifications.isEmpty) {
      return;
    }
    await Hive.box<AppNotification>(HiveBox.appNotifications).clear();

    final notificationsMap = <String, AppNotification>{};

    for (final notification in notifications) {
      notificationsMap[notification.id] = notification;
    }
    await Hive.box<AppNotification>(HiveBox.appNotifications)
        .putAll(notificationsMap);
  }

  static Future<void> loadKya(List<Kya> kya) async {
    if (kya.isEmpty) {
      return;
    }

    await Hive.box<Kya>(HiveBox.kya).clear();
    final kyaMap = <String, Kya>{};

    for (final x in kya) {
      kyaMap[x.id] = x;
    }

    await Hive.box<Kya>(HiveBox.kya).putAll(kyaMap);

    for (final kya in kya) {
      CacheService.cacheKyaImages(kya);
    }
  }

  static Future<void> loadProfile(Profile profile) async {
    await Hive.box<Profile>(HiveBox.profile).put(HiveBox.profile, profile);
  }

  static Future<void> loadFavouritePlaces(
    List<FavouritePlace> favouritePlaces,
  ) async {
    if (favouritePlaces.isEmpty) {
      return;
    }
    await Hive.box<FavouritePlace>(HiveBox.favouritePlaces).clear();

    final favouritePlacesMap = <String, FavouritePlace>{};

    for (final favouritePlace in favouritePlaces) {
      favouritePlacesMap[favouritePlace.placeId] = favouritePlace;
    }

    await Hive.box<FavouritePlace>(HiveBox.favouritePlaces)
        .putAll(favouritePlacesMap)
        .then((value) => CloudStore.updateFavouritePlaces());
  }

  static Future<void> loadAnalytics(List<Analytics> analytics) async {
    if (analytics.isEmpty) {
      return;
    }
    await Hive.box<Analytics>(HiveBox.analytics).clear();

    final analyticsMap = <String, Analytics>{};

    for (final analytic in analytics) {
      analyticsMap[analytic.site] = analytic;
    }

    await Hive.box<Analytics>(HiveBox.analytics).putAll(analyticsMap);
  }
}

class HiveBox {
  static String get appNotifications => 'appNotifications';
  static String get kya => 'kya';
  static String get profile => 'profile';
  static String get encryptionKey => 'hiveEncryptionKey';
  static String get analytics => 'analytics';
  static String get airQualityReadings => 'airQualityReadingsBox';
  static String get nearByAirQualityReadings => 'nearByAirQualityReadings';
  static String get favouritePlaces => 'favouritePlaces';
}
