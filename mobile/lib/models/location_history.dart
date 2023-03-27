import 'package:app/services/services.dart';
import 'package:app/utils/utils.dart';
import 'package:equatable/equatable.dart';
import 'package:hive_flutter/hive_flutter.dart';
import 'package:json_annotation/json_annotation.dart';

import 'air_quality_reading.dart';

part 'location_history.g.dart';

@JsonSerializable()
class LocationHistory extends Equatable {
  factory LocationHistory.fromAirQualityReading(
    AirQualityReading airQualityReading,
  ) {
    return LocationHistory(
      placeId: airQualityReading.placeId,
      site: airQualityReading.referenceSite,
      name: airQualityReading.name,
      location: airQualityReading.location,
      dateTime: airQualityReading.dateTime,
      longitude: airQualityReading.longitude,
      latitude: airQualityReading.latitude,
    );
  }

  factory LocationHistory.fromJson(Map<String, dynamic> json) =>
      _$LocationHistoryFromJson(json);

  const LocationHistory({
    required this.placeId,
    required this.site,
    required this.name,
    required this.location,
    required this.dateTime,
    required this.longitude,
    required this.latitude,
  });

  final String placeId;

  final String site;

  final String name;

  final String location;

  final double latitude;

  final double longitude;

  final DateTime dateTime;

  Map<String, dynamic> toJson() => _$LocationHistoryToJson(this);

  static LocationHistory? parseAnalytics(Map<String, dynamic> jsonBody) {
    try {
      return LocationHistory.fromJson(jsonBody);
    } catch (exception, stackTrace) {
      logException(exception, stackTrace);

      return null;
    }
  }

  static List<LocationHistory> fromAirQualityReadings() {
    return Hive.box<AirQualityReading>(HiveBox.airQualityReadings)
        .values
        .map((airQualityReading) => LocationHistory.fromAirQualityReading(
              airQualityReading,
            ))
        .toList();
  }

  @override
  List<Object?> get props => [placeId];
}

@JsonSerializable(explicitToJson: true)
class LocationHistoryList {
  factory LocationHistoryList.fromJson(Map<String, dynamic> json) =>
      _$LocationHistoryListFromJson(json);

  LocationHistoryList({required this.data});

  List<LocationHistory> data;

  Map<String, dynamic> toJson() => _$LocationHistoryListToJson(this);
}
