import 'package:app/models/models.dart';
import 'package:app/utils/utils.dart';
import 'package:equatable/equatable.dart';

class Insight extends Equatable {
  const Insight({
    required this.dateTime,
    required this.pm2_5,
    required this.forecastPm2_5,
    required this.healthTips,
    required this.airQuality,
    required this.forecastAirQuality,
  });

  factory Insight.fromAirQualityReading(
    AirQualityReading airQualityReading, {
    Forecast? forecast,
  }) {
    List<HealthTip> healthTips = airQualityReading.dateTime.isAPastDate()
        ? []
        : airQualityReading.healthTips;

    return Insight(
      pm2_5: airQualityReading.pm2_5,
      forecastPm2_5: null,
      airQuality: airQualityReading.airQuality,
      forecastAirQuality: null,
      healthTips: healthTips,
      dateTime: airQualityReading.dateTime,
    );
  }

  factory Insight.fromForecast(Forecast forecast) {
    return Insight(
      pm2_5: null,
      forecastPm2_5: forecast.pm2_5,
      airQuality: null,
      forecastAirQuality: forecast.airQuality,
      healthTips: forecast.healthTips,
      dateTime: forecast.time,
    );
  }

  factory Insight.initializeEmpty(DateTime dateTime) {
    return Insight(
      pm2_5: null,
      forecastPm2_5: null,
      airQuality: null,
      forecastAirQuality: null,
      healthTips: const [],
      dateTime: dateTime,
    );
  }

  final double? pm2_5;
  final double? forecastPm2_5;
  final AirQuality? airQuality;
  final AirQuality? forecastAirQuality;
  final List<HealthTip> healthTips;
  final DateTime dateTime;

  bool get isFutureData => dateTime.isAFutureDate();

  bool get isEmpty => pm2_5 == null || airQuality == null;

  bool get isNotEmpty => pm2_5 != null && airQuality != null;

  @override
  List<Object> get props => [dateTime.day];
}
