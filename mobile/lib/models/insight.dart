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

    if (airQualityReading.dateTime.isYesterday()) {
      airQualityMessage =
          'The average air quality yesterday in ${airQualityReading.name} was ${airQuality.title}.';
    } else if (airQualityReading.dateTime.isAPastDate()) {
      airQualityMessage =
          'The average air quality in ${airQualityReading.name} was ${airQuality.title}.';
    } else if (airQualityReading.dateTime.isToday()) {
      airQualityMessage =
          'The average air quality in ${airQualityReading.name} is currently ${airQuality.title}.';
      if (forecastValue != null) {
        forecastMessage =
            'Expect today\'s conditions to be ${Pollutant.pm2_5.airQuality(forecastValue).title.toLowerCase()}';
      }
      healthTips = getHealthTips(
        airQualityReading.pm2_5,
        Pollutant.pm2_5,
      );
    } else if (airQualityReading.dateTime.isTomorrow()) {
      airQualityMessage =
          'The average air quality tomorrow in ${airQualityReading.name} might be ${airQuality.title}.';
      forecastMessage =
          'Expect tomorrow\'s conditions to be ${airQuality.title.toLowerCase()}';
      healthTips = getHealthTips(
        airQualityReading.pm2_5,
        Pollutant.pm2_5,
      );
    } else if (airQualityReading.dateTime.isAFutureDate()) {
      airQualityMessage =
          'The average air quality in ${airQualityReading.name} might be ${airQuality.title}.';
      forecastMessage =
          'Expect conditions to be ${airQuality.title.toLowerCase()}';
      healthTips = getHealthTips(
        airQualityReading.pm2_5,
        Pollutant.pm2_5,
      );
    }

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
