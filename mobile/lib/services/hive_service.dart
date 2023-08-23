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
  final String _airQualityReadingsBox = 'airQualityReadings-v2';

  final String _airQualityReadings = 'air-quality-readings';
  final String _nearByAirQualityReadings = 'nearby-air-quality-readings';

  Future<void> initialize() async {
    await Hive.initFlutter();

    Hive
      ..registerAdapter(ForecastAdapter())
      ..registerAdapter<HealthTip>(HealthTipAdapter())
      ..registerAdapter<AirQualityReading>(AirQualityReadingAdapter());
    await Future.wait([
      Hive.openBox<List<Forecast>>(_forecast),
      Hive.openBox<List<AirQualityReading>>(_airQualityReadingsBox),
    ]);
  }

  Future<void> updateAirQualityReading(
    AirQualityReading airQualityReading,
  ) async {
    List<AirQualityReading> airQualityReadings = getAirQualityReadings();
    airQualityReadings.removeWhere(
      (element) => element.placeId == airQualityReading.placeId,
    );
    airQualityReadings.add(airQualityReading);
    await updateAirQualityReadings(airQualityReadings);
  }

  Future<void> updateAirQualityReadings(
    List<AirQualityReading> airQualityReadings,
  ) async {
    await Hive.box<List<AirQualityReading>>(_airQualityReadingsBox)
        .put(_airQualityReadings, airQualityReadings);
  }

  List<AirQualityReading> getAirQualityReadings() {
    List<AirQualityReading> airQualityReadings =
        Hive.box<List<AirQualityReading>>(
              _airQualityReadingsBox,
            ).get(_airQualityReadings, defaultValue: []) ??
            [];

    return airQualityReadings.removeInvalidData();
  }

  List<AirQualityReading> getNearbyAirQualityReadings() {
    return Hive.box<List<AirQualityReading>>(
          _airQualityReadingsBox,
        ).get(_nearByAirQualityReadings, defaultValue: []) ??
        [];
  }

  Future<void> updateNearbyAirQualityReadings(
    List<AirQualityReading> airQualityReadings,
  ) async {
    await Hive.box<List<AirQualityReading>>(_airQualityReadingsBox)
        .put(_nearByAirQualityReadings, airQualityReadings);
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
        ).get(siteId, defaultValue: []) ??
        [];
    return forecast.removeInvalidData();
  }
}
