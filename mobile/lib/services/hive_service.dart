import 'package:app/models/models.dart';
import 'package:app/utils/utils.dart';
import 'package:hive_flutter/hive_flutter.dart';

class HiveService {
  factory HiveService() {
    return _instance;
  }
  HiveService._internal();
  static final HiveService _instance = HiveService._internal();

  final String _forecast = 'forecast';
  final String _airQualityReadings = 'airQualityReadings-v1';
  final String _nearByAirQualityReadings = 'nearByAirQualityReading-v1';
  String get airQualityReadingsBox => _airQualityReadings;

  Future<void> initialize() async {
    await Hive.initFlutter();

    Hive
      ..registerAdapter(ForecastAdapter())
      ..registerAdapter<HealthTip>(HealthTipAdapter())
      ..registerAdapter<AirQualityReading>(AirQualityReadingAdapter());
    await Future.wait([
      Hive.openBox<List<Forecast>>(_forecast),
      Hive.openBox<AirQualityReading>(_airQualityReadings),
      Hive.openBox<AirQualityReading>(_nearByAirQualityReadings),
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
    if (forecast.isEmpty) {
      return;
    }

    try {
      await Hive.box<List<Forecast>>(_forecast).put(
        siteId,
        forecast,
      );
    } catch (exception, stackTrace) {
      await logException(
        exception,
        stackTrace,
      );
    }
  }

  Future<List<Forecast>> getForecast(String siteId) async {
    List<Forecast> forecast = [];
    final Box<List<Forecast>> forecastBox = Hive.box<List<Forecast>>(_forecast);
    dynamic hiveValue;
    try {
      hiveValue = forecastBox.get(siteId, defaultValue: null);
    } on TypeError {
      forecastBox.clear();
      hiveValue = forecastBox.get(siteId, defaultValue: null);
    }

    if (hiveValue != null) {
      try {
        forecast = (hiveValue as List<dynamic>).cast<Forecast>().toList();
      } catch (exception, stackTrace) {
        await logException(
          exception,
          stackTrace,
        );
      }
    }

    return forecast.removeInvalidData();
  }

  List<AirQualityReading> getAirQualityReadings() {
    List<AirQualityReading> airQualityReadings = Hive.box<AirQualityReading>(
      _airQualityReadings,
    ).values.toList();

    return airQualityReadings.removeInvalidData();
  }

  List<AirQualityReading> getNearbyAirQualityReadings() {
    return Hive.box<AirQualityReading>(
      _nearByAirQualityReadings,
    ).values.toList();
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
}
