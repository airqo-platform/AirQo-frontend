import 'package:app/models/hive_type_id.dart';
import 'package:app/models/models.dart';
import 'package:app/utils/utils.dart';
import 'package:hive_flutter/hive_flutter.dart';

class HiveService {
  factory HiveService() {
    return _instance;
  }
  HiveService._internal();
  static final HiveService _instance = HiveService._internal();

  final String _searchHistory = 'searchHistory';
  final String _forecast = 'forecast';
  final String _airQualityReadings = 'airQualityReadings-v1';
  final String _nearByAirQualityReadings = 'nearByAirQualityReading-v1';

  Future<void> initialize() async {
    await Hive.initFlutter();

    Hive
      ..registerAdapter<SearchHistory>(SearchHistoryAdapter())
      ..registerAdapter(ForecastAdapter())
      ..registerAdapter<HealthTip>(HealthTipAdapter())
      ..registerAdapter<AirQualityReading>(AirQualityReadingAdapter());

    await Future.wait([
      Hive.openBox<SearchHistory>(_searchHistory),
      Hive.openBox<List<Forecast>>(_forecast),
      Hive.openBox<AirQualityReading>(_airQualityReadings),
      Hive.openBox<AirQualityReading>(_nearByAirQualityReadings),
    ]);
  }

  Future<void> clearUserData() async {
    await Future.wait([
      Hive.box<SearchHistory>(_searchHistory).clear(),
    ]);
  }

  Future<void> updateAirQualityReading(
    AirQualityReading airQualityReading,
  ) async {
    await Hive.box<AirQualityReading>(_airQualityReadings)
        .put(airQualityReading.placeId, airQualityReading);
  }

  Future<void> updateAirQualityReadings(
    List<AirQualityReading> airQualityReadings, {
    bool reload = false,
  }) async {
    final airQualityReadingsMap = <String, AirQualityReading>{};
    final currentReadings = getAirQualityReadings();

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
      await Hive.box<AirQualityReading>(_airQualityReadings).clear();
    }
    await Hive.box<AirQualityReading>(_airQualityReadings)
        .putAll(airQualityReadingsMap);
  }

  Future<void> saveForecast(
    List<Forecast> forecast,
    String siteId,
  ) async {
    await Hive.box<List<Forecast>>(_forecast).put(
      siteId,
      forecast,
    );
  }

  Future<List<Forecast>> getForecast(String siteId) async {
    List<Forecast> forecast = Hive.box<List<Forecast>>(
          _forecast,
        ).get(siteId) ??
        [];

    return forecast.removeInvalidData();
  }

  List<AirQualityReading> getAirQualityReadings() {
    List<AirQualityReading> airQualityReadings = Hive.box<AirQualityReading>(
      _airQualityReadings,
    ).values.toList();

    return airQualityReadings.removeInvalidData();
  }

  List<SearchHistory> getSearchHistory() {
    List<SearchHistory> searchHistory =
        Hive.box<SearchHistory>(_searchHistory).values.toList();
    searchHistory.sortByDateTime();

    return searchHistory;
  }

  List<AirQualityReading> getNearbyAirQualityReadings() {
    return Hive.box<AirQualityReading>(
      _nearByAirQualityReadings,
    ).values.toList();
  }

  Future<void> updateSearchHistory(
    AirQualityReading airQualityReading,
  ) async {
    List<SearchHistory> searchHistoryList =
        Hive.box<SearchHistory>(_searchHistory).values.toList();
    searchHistoryList
        .add(SearchHistory.fromAirQualityReading(airQualityReading));
    searchHistoryList = searchHistoryList
      ..sortByDateTime()
      ..take(10).toList();

    final searchHistoryMap = <String, SearchHistory>{};
    for (final searchHistory in searchHistoryList) {
      searchHistoryMap[searchHistory.placeId] = searchHistory;
    }

    await Hive.box<SearchHistory>(_searchHistory).clear();
    await Hive.box<SearchHistory>(_searchHistory).putAll(searchHistoryMap);
  }

  Future<void> updateNearbyAirQualityReadings(
    List<AirQualityReading> nearbyAirQualityReadings,
  ) async {
    final airQualityReadingsMap = <String, AirQualityReading>{};

    nearbyAirQualityReadings.sortByDistanceToReferenceSite();

    for (final airQualityReading in nearbyAirQualityReadings) {
      airQualityReadingsMap[airQualityReading.placeId] = airQualityReading;
    }

    await Hive.box<AirQualityReading>(_nearByAirQualityReadings).clear();
    await Hive.box<AirQualityReading>(_nearByAirQualityReadings)
        .putAll(airQualityReadingsMap);
  }

  Future<void> deleteSearchHistory() async {
    await Hive.box<SearchHistory>(_searchHistory).clear();
  }
}
