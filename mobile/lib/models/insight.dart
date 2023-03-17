import 'package:app/models/models.dart';
import 'package:equatable/equatable.dart';
import 'package:app/utils/utils.dart';

class Insight with EquatableMixin {
  Insight({
    required this.name,
    required this.forecastMessage,
    required this.airQualityMessage,
    required this.dateTime,
    required this.pm2_5,
    required this.healthTips,
    required this.airQuality,
    required this.isAvailable,
  });

  factory Insight.fromAirQualityReading(
    AirQualityReading airQualityReading, {
    double? forecastValue,
  }) {
    List<HealthTip> healthTips = [];
    String airQualityMessage = '';
    String forecastMessage = '';
    AirQuality airQuality = airQualityReading.airQuality();
    String verb = airQualityReading.dateTime.isToday()
        ? "is"
        : airQualityReading.dateTime.isYesterday() ||
                airQualityReading.dateTime.isAPastDate()
            ? "was"
            : "might be";
    String dateAdverb = airQualityReading.dateTime.isYesterday()
        ? "yesterday"
        : airQualityReading.dateTime.isTomorrow()
            ? "tomorrow"
            : "";

    switch (airQuality.title) {
      case "Good":
        airQualityMessage =
            'The air quality $dateAdverb in ${airQualityReading.name} $verb quite ${airQuality.title}.';
        break;
      case "Moderate":
        airQualityMessage =
            'The air quality $dateAdverb in ${airQualityReading.name} $verb at a ${airQuality.title} level.';
        break;
      case "Unhealthy For Sensitive Groups":
        airQualityMessage =
            'The air quality $dateAdverb in ${airQualityReading.name} $verb ${airQuality.title}.';
        break;
      case "Unhealthy":
        airQualityMessage =
            'The air quality $dateAdverb in ${airQualityReading.name} $verb ${airQuality.title} for everyone';
        break;
      case "Very Unhealthy":
        airQualityMessage =
            'The air quality $dateAdverb in ${airQualityReading.name} $verb ${airQuality.title} reaching levels of high alert.';
        break;
      case "Hazardous":
        airQualityMessage =
            'The air quality $dateAdverb in ${airQualityReading.name} $verb ${airQuality.title} and can cause a health emergency.';
        break;
    }
      if (forecastValue != null) {
      switch (Pollutant.pm2_5.airQuality(forecastValue)) {
        case AirQuality.good:
        case AirQuality.moderate:
        case AirQuality.hazardous:
          forecastMessage =
              'Expect ${Pollutant.pm2_5.airQuality(forecastValue).title.toLowerCase()} levels of air quality ${airQualityReading.dateTime.isTomorrow() ? "tomorrrow" : ""}';
          break;
        case AirQuality.ufsgs:
          forecastMessage =
              'Expect ${airQualityReading.dateTime.isTomorrow() ? "tomorrrow's" : ""} air quality to be unhealthy for sensitive groups';
          break;
        case AirQuality.unhealthy:
          forecastMessage =
              'Expect ${airQualityReading.dateTime.isTomorrow() ? "tomorrrow's" : ""} air quality to be unhealthy for everyone';
          break;
        case AirQuality.veryUnhealthy:
          forecastMessage =
              'Air quality is likely to be very unhealthy ${airQualityReading.dateTime.isTomorrow() ? "tomorrrow" : ""}';
          break;
      }
    }
      healthTips = getHealthTips(
        airQualityReading.pm2_5,
        Pollutant.pm2_5,
    );

    return Insight(
      name: airQualityReading.name,
      forecastMessage: forecastMessage,
      airQualityMessage: airQualityMessage,
      pm2_5: airQualityReading.pm2_5,
      airQuality: airQuality,
      healthTips: healthTips,
      dateTime: airQualityReading.dateTime,
      isAvailable: true,
    );
  }

  factory Insight.initializeEmpty(
    AirQualityReading airQualityReading,
    DateTime dateTime,
  ) {
    return Insight(
      forecastMessage: '',
      airQualityMessage: '',
      name: airQualityReading.name,
      pm2_5: airQualityReading.pm2_5,
      airQuality: airQualityReading.airQuality(),
      healthTips: [],
      dateTime: dateTime,
      isAvailable: false,
    );
  }

  final String name;
  final String airQualityMessage;
  final String forecastMessage;
  final double pm2_5;
  final AirQuality airQuality;
  final List<HealthTip> healthTips;
  final DateTime dateTime;
  final bool isAvailable;

  @override
  List<Object> get props => [dateTime.day];
}
