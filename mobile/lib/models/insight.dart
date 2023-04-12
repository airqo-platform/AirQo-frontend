import 'package:app/models/models.dart';
import 'package:equatable/equatable.dart';
import 'package:app/utils/utils.dart';

class Insight with EquatableMixin {
  Insight({
    required this.forecastMessage,
    required this.airQualityMessage,
    required this.dateTime,
    required this.pm2_5,
    required this.healthTips,
    required this.airQuality,
  });

  factory Insight.fromAirQualityReading(AirQualityReading airQualityReading) {
    String airQualityMessage = '';
    AirQuality airQuality = airQualityReading.airQuality();
    String verb = airQualityReading.dateTime.isAPastDate() ? " was" : " is";
    String dateAdverb =
        airQualityReading.dateTime.isYesterday() ? " yesterday" : "";

    switch (airQuality) {
      case AirQuality.good:
        airQualityMessage =
            'The air quality$dateAdverb in ${airQualityReading.name}$verb quite ${airQuality.title}.';
        break;
      case AirQuality.moderate:
        airQualityMessage =
            'The air quality$dateAdverb in ${airQualityReading.name}$verb at a ${airQuality.title} level.';
        break;
      case AirQuality.ufsgs:
        airQualityMessage =
            'The air quality$dateAdverb in ${airQualityReading.name}$verb ${airQuality.title}.';
        break;
      case AirQuality.unhealthy:
        airQualityMessage =
            'The air quality$dateAdverb in ${airQualityReading.name}$verb ${airQuality.title} for everyone';
        break;
      case AirQuality.veryUnhealthy:
        airQualityMessage =
            'The air quality$dateAdverb in ${airQualityReading.name}$verb ${airQuality.title} reaching levels of high alert.';
        break;
      case AirQuality.hazardous:
        airQualityMessage =
            'The air quality$dateAdverb in ${airQualityReading.name}$verb ${airQuality.title} and can cause a health emergency.';
        break;
    }

    List<HealthTip> healthTips = airQualityReading.dateTime.isAPastDate()
        ? []
        : airQualityReading.healthTips;

    return Insight(
      forecastMessage: "",
      airQualityMessage: airQualityMessage,
      pm2_5: airQualityReading.pm2_5,
      airQuality: airQuality,
      healthTips: healthTips,
      dateTime: airQualityReading.dateTime,
    );
  }

  factory Insight.fromForecast(Forecast forecast) {
    String forecastMessage = '';
    AirQuality airQuality = Pollutant.pm2_5.airQuality(forecast.pm2_5);

    switch (airQuality) {
      case AirQuality.good:
      case AirQuality.moderate:
      case AirQuality.hazardous:
        forecastMessage =
            'Expect ${airQuality.title.toLowerCase()} levels of air quality ${forecast.time.isTomorrow() ? "tomorrow" : ""}';
        break;
      case AirQuality.ufsgs:
        forecastMessage =
            'Expect ${forecast.time.isTomorrow() ? "tomorrow's" : ""} air quality to be unhealthy for sensitive groups';
        break;
      case AirQuality.unhealthy:
        forecastMessage =
            'Expect ${forecast.time.isTomorrow() ? "tomorrow's" : ""} air quality to be unhealthy for everyone';
        break;
      case AirQuality.veryUnhealthy:
        forecastMessage =
            'Air quality is likely to be very unhealthy ${forecast.time.isTomorrow() ? "tomorrow" : ""}';
        break;
    }

    return Insight(
      forecastMessage: forecastMessage,
      airQualityMessage: "",
      pm2_5: forecast.pm2_5,
      airQuality: airQuality,
      healthTips: [],
      dateTime: forecast.time,
    );
  }

  factory Insight.initializeEmpty(DateTime dateTime) {
    return Insight(
      forecastMessage: '',
      airQualityMessage: '',
      pm2_5: null,
      airQuality: null,
      healthTips: [],
      dateTime: dateTime,
    );
  }

  final String airQualityMessage;
  final String forecastMessage;
  final double? pm2_5;
  final AirQuality? airQuality;
  final List<HealthTip> healthTips;
  final DateTime dateTime;

  bool get isEmpty => pm2_5 == null || airQuality == null;

  bool get isNotEmpty => pm2_5 != null && airQuality != null;

  @override
  List<Object> get props => [dateTime.day];
}
