import 'package:app/models/models.dart';
import 'package:equatable/equatable.dart';
import 'package:app/utils/utils.dart';

class Insight with EquatableMixin {
  Insight({
    required this.name,
    required this.dateTime,
    required this.pm2_5,
    required this.healthTips,
    required this.airQuality,
    required this.available,
  });

  factory Insight.fromAirQualityReading(AirQualityReading airQualityReading) {
    List<HealthTip> healthTips =
        getHealthTips(airQualityReading.pm2_5, Pollutant.pm2_5);
    return Insight(
      name: airQualityReading.name,
      pm2_5: airQualityReading.pm2_5,
      airQuality: airQualityReading.airQuality(),
      healthTips: healthTips,
      dateTime: airQualityReading.dateTime,
      available: true,
    );
  }

  factory Insight.initializeEmpty(
      AirQualityReading airQualityReading, DateTime dateTime) {
    return Insight(
      name: airQualityReading.name,
      pm2_5: airQualityReading.pm2_5,
      airQuality: airQualityReading.airQuality(),
      healthTips: [],
      dateTime: dateTime,
      available: false,
    );
  }

  final String name;
  final double pm2_5;
  final AirQuality airQuality;
  final List<HealthTip> healthTips;
  final DateTime dateTime;
  final bool available;

  @override
  List<Object> get props => [dateTime.day];
}
