import 'dart:math';

import 'package:equatable/equatable.dart';
import 'package:json_annotation/json_annotation.dart';

import 'air_quality_reading.dart';

part 'location_history.g.dart';

@JsonSerializable(explicitToJson: true)
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
    this.airQualityReading,
  });

  @JsonKey(name: "place_id")
  final String placeId;

  @JsonKey(name: "reference_site")
  final String site;

  final String name;

  final String location;

  final double latitude;

  final double longitude;

  @JsonKey(name: "date_time")
  final DateTime dateTime;

  @JsonKey(
    includeToJson: false,
    includeFromJson: false,
    includeIfNull: true,
    disallowNullValue: false,
  )
  final AirQualityReading? airQualityReading;

  LocationHistory copyWith({
    AirQualityReading? airQualityReading,
    String? site,
  }) {
    return LocationHistory(
      name: name,
      location: location,
      placeId: placeId,
      latitude: latitude,
      longitude: longitude,
      airQualityReading: airQualityReading ?? this.airQualityReading,
      site: site ?? this.site,
      dateTime: dateTime,
    );
  }

  Map<String, dynamic> toJson() => _$LocationHistoryToJson(this);

  Map<String, dynamic> toAPIJson(String firebaseUserId) {
    return toJson()
      ..addAll({
        "firebase_user_id": firebaseUserId,
      });
  }

  Point get point => Point(latitude, longitude);

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
