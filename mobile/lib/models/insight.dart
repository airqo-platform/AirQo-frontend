import 'package:app/models/models.dart';
import 'package:equatable/equatable.dart';
import 'package:app/utils/utils.dart';

class Insight extends Equatable {
  const Insight({
    required this.forecastMessage,
    required this.airQualityMessage,
    required this.dateTime,
    required this.pm2_5,
    required this.healthTips,
    required this.airQuality,
  });

  factory Insight.fromAirQualityReading(
    AirQualityReading airQualityReading, {
    Forecast? forecast,
  }) {
    List<HealthTip> healthTips = airQualityReading.dateTime.isAPastDate()
        ? []
        : airQualityReading.healthTips;

    return Insight(
      forecastMessage: forecast != null
          ? forecast.message.isEmpty
              ? forecast.tempMessage
              : forecast.message
          : "Forecast is temporarily unavailable for this location. We’re working to restore this feature as soon as possible.",
      airQualityMessage: airQualityReading.insightsMessage(),
      pm2_5: airQualityReading.pm2_5,
      airQuality: airQualityReading.airQuality,
      healthTips: healthTips,
      dateTime: airQualityReading.dateTime,
    );
  }

  factory Insight.fromForecast(Forecast forecast) {
    String message =
        forecast.message.isEmpty ? forecast.tempMessage : forecast.message;

    return Insight(
      forecastMessage: message,
      airQualityMessage: message,
      pm2_5: forecast.pm2_5,
      airQuality: forecast.airQuality,
      healthTips: forecast.healthTips,
      dateTime: forecast.time,
    );
  }

  factory Insight.initializeEmpty(DateTime dateTime) {
    return Insight(
      forecastMessage:
          'Forecast is temporarily unavailable for this location. We’re working to restore this feature as soon as possible.',
      airQualityMessage:
          'We’re having issues with our network no worries, we’ll be back up soon.',
      pm2_5: null,
      airQuality: null,
      healthTips: const [],
      dateTime: dateTime,
    );
  }

  final String airQualityMessage;
  final String forecastMessage;
  final double? pm2_5;
  final AirQuality? airQuality;
  final List<HealthTip> healthTips;
  final DateTime dateTime;

  bool get isFutureData => dateTime.isAFutureDate();

  bool get isEmpty => pm2_5 == null || airQuality == null;

  bool get isNotEmpty => pm2_5 != null && airQuality != null;

  @override
  List<Object> get props => [dateTime.day];
}
