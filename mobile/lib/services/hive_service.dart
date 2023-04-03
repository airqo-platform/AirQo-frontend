import 'dart:convert';
import 'dart:typed_data';

import 'package:app/models/models.dart';
import 'package:app/services/services.dart';
import 'package:app/utils/utils.dart';
import 'package:hive_flutter/hive_flutter.dart';

class HiveService {
  static Future<void> initialize() async {
    await Hive.initFlutter();

    // if (!Hive.isAdapterRegistered(20)) {
    Hive
      ..registerAdapter<SearchHistory>(SearchHistoryAdapter())
      ..registerAdapter<HealthTip>(HealthTipAdapter())
      ..registerAdapter<AirQualityReading>(AirQualityReadingAdapter());
    // }
    await Future.wait([
      Hive.openBox<SearchHistory>(HiveBox.searchHistory),
      Hive.openBox<AirQualityReading>(HiveBox.airQualityReadings),
      Hive.openBox<AirQualityReading>(HiveBox.nearByAirQualityReadings),
    ]);
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
      Hive.box<SearchHistory>(HiveBox.searchHistory).clear(),
    ]);
  }

  static Future<void> updateAirQualityReading(
    AirQualityReading airQualityReading,
  ) async {
    await Hive.box<AirQualityReading>(HiveBox.airQualityReadings)
        .put(airQualityReading.placeId, airQualityReading);
  }

  static Future<void> updateAirQualityReadings(
    List<AirQualityReading> airQualityReadings, {
    bool reload = false,
  }) async {
    final airQualityReadingsMap = <String, AirQualityReading>{};
    final currentReadings =
        Hive.box<AirQualityReading>(HiveBox.airQualityReadings).values.toList();
    for (final reading in airQualityReadings) {
      if (reading.shareLink.isEmpty) {
        AirQualityReading airQualityReading = currentReadings.firstWhere(
          (element) => element.placeId == reading.placeId,
          orElse: () {
            return reading;
          },
        );
        airQualityReadingsMap[reading.placeId] =
            reading.copyWith(shareLink: airQualityReading.shareLink);
      } else {
        airQualityReadingsMap[reading.placeId] = reading;
      }
    }

    if (reload) {
      await Hive.box<AirQualityReading>(HiveBox.airQualityReadings).clear();
    }
    await Hive.box<AirQualityReading>(HiveBox.airQualityReadings)
        .putAll(airQualityReadingsMap);
  }

  static List<AirQualityReading> getAirQualityReadings() {
    return Hive.box<AirQualityReading>(
      HiveBox.airQualityReadings,
    ).values.toList();
  }

  static Future<void> updateSearchHistory(
    AirQualityReading airQualityReading,
  ) async {
    List<SearchHistory> searchHistoryList =
        Hive.box<SearchHistory>(HiveBox.searchHistory).values.toList();
    searchHistoryList
        .add(SearchHistory.fromAirQualityReading(airQualityReading));
    searchHistoryList = searchHistoryList.sortByDateTime().take(10).toList();

    final searchHistoryMap = <String, SearchHistory>{};
    for (final searchHistory in searchHistoryList) {
      searchHistoryMap[searchHistory.placeId] = searchHistory;
    }

    await Hive.box<SearchHistory>(HiveBox.searchHistory).clear();
    await Hive.box<SearchHistory>(HiveBox.searchHistory)
        .putAll(searchHistoryMap);
  }

  static Future<void> updateNearbyAirQualityReadings(
    List<AirQualityReading> nearbyAirQualityReadings,
  ) async {
    final airQualityReadingsMap = <String, AirQualityReading>{};

    nearbyAirQualityReadings =
        nearbyAirQualityReadings.sortByDistanceToReferenceSite();

    for (final airQualityReading in nearbyAirQualityReadings) {
      airQualityReadingsMap[airQualityReading.placeId] = airQualityReading;
    }

    await Hive.box<AirQualityReading>(HiveBox.nearByAirQualityReadings).clear();
    await Hive.box<AirQualityReading>(HiveBox.nearByAirQualityReadings)
        .putAll(airQualityReadingsMap);
  }

  static Future<void> deleteSearchHistory() async {
    await Hive.box<SearchHistory>(HiveBox.searchHistory).clear();
  }
}

class HiveBox {
  static String get searchHistory => 'searchHistory';
  static String get encryptionKey => 'hiveEncryptionKey';

  static String get airQualityReadings => 'airQualityReadings-v1';

  static String get nearByAirQualityReadings => 'nearByAirQualityReading-v1';
}
