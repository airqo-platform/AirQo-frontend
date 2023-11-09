import 'package:app/models/models.dart';
import 'package:app/utils/utils.dart';
import 'package:equatable/equatable.dart';

class Insight extends Equatable {
  const Insight({
    required this.dateTime,
    required this.currentPm2_5,
    required this.forecastPm2_5,
    required this.healthTips,
    required this.currentAirQuality,
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
      currentPm2_5: airQualityReading.pm2_5,
      forecastPm2_5: null,
      currentAirQuality: airQualityReading.airQuality,
      forecastAirQuality: null,
      healthTips: healthTips,
      dateTime: airQualityReading.dateTime,
    );
  }

  factory Insight.fromForecast(Forecast forecast) {
    return Insight(
      currentPm2_5: null,
      forecastPm2_5: forecast.pm2_5,
      currentAirQuality: null,
      forecastAirQuality: forecast.airQuality,
      healthTips: forecast.healthTips,
      dateTime: forecast.time,
    );
  }

  factory Insight.initializeEmpty(DateTime dateTime) {
    return Insight(
      currentPm2_5: null,
      forecastPm2_5: null,
      currentAirQuality: null,
      forecastAirQuality: null,
      healthTips: const [],
      dateTime: dateTime,
    );
  }

  Insight copyWithForecast({
    required AirQuality forecastAirQuality,
    required double forecastPm2_5,
  }) {
    return Insight(
      currentPm2_5: currentPm2_5,
      forecastPm2_5: forecastPm2_5,
      currentAirQuality: currentAirQuality,
      forecastAirQuality: forecastAirQuality,
      healthTips: healthTips,
      dateTime: dateTime,
    );
  }

  final double? currentPm2_5;
  final double? forecastPm2_5;
  final AirQuality? currentAirQuality;
  final AirQuality? forecastAirQuality;
  final List<HealthTip> healthTips;
  final DateTime dateTime;

  bool get isFutureData => dateTime.isAFutureDate();

  double? get pm2_5 => currentPm2_5 ?? forecastPm2_5;

  AirQuality? get airQuality => currentAirQuality ?? forecastAirQuality;

  bool get hasAirQuality =>
      currentAirQuality != null || forecastAirQuality != null;

  @override
  List<Object> get props => [dateTime.day];
}
