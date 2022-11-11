import 'package:app/models/air_quality_reading.dart';
import 'package:app/services/services.dart';
import 'package:app/utils/utils.dart';
import 'package:hive_flutter/hive_flutter.dart';
import 'package:json_annotation/json_annotation.dart';

part 'analytics.g.dart';

@JsonSerializable()
@HiveType(typeId: 40, adapterName: 'AnalyticsAdapter')
class Analytics extends HiveObject {
  factory Analytics.fromJson(Map<String, dynamic> json) =>
      _$AnalyticsFromJson(json);

  Analytics({
    required this.id,
    required this.site,
    required this.name,
    required this.location,
    required this.createdAt,
    required this.longitude,
    required this.latitude,
  });

  @HiveField(1)
  String id;

  @HiveField(2, defaultValue: '')
  String site;

  @HiveField(3, defaultValue: '')
  String name;

  @HiveField(4, defaultValue: '')
  String location;

  @HiveField(5)
  double latitude;

  @HiveField(6)
  double longitude;

  @HiveField(7)
  DateTime createdAt;

  Map<String, dynamic> toJson() => _$AnalyticsToJson(this);

  static Analytics? parseAnalytics(Map<String, dynamic> jsonBody) {
    try {
      return Analytics.fromJson(jsonBody);
    } catch (exception, stackTrace) {
      logException(exception, stackTrace);

      return null;
    }
  }

  static List<Analytics> fromAirQualityReadings() {
    return Hive.box<AirQualityReading>(HiveBox.airQualityReadings)
        .values
        .map((airQualityReading) => Analytics(
              id: airQualityReading.placeId,
              site: airQualityReading.referenceSite,
              name: airQualityReading.name,
              location: airQualityReading.location,
              createdAt: airQualityReading.dateTime,
              longitude: airQualityReading.longitude,
              latitude: airQualityReading.latitude,
            ))
        .toList();
  }
}
