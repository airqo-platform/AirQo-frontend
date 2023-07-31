import 'package:equatable/equatable.dart';
import 'package:json_annotation/json_annotation.dart';

import 'air_quality_reading.dart';

part 'search_history.g.dart';

@JsonSerializable(explicitToJson: true)
class SearchHistory extends Equatable {
  const SearchHistory({
    required this.latitude,
    required this.longitude,
    required this.name,
    required this.location,
    required this.dateTime,
    required this.placeId,
    this.airQualityReading,
  });

  factory SearchHistory.fromJson(Map<String, dynamic> json) =>
      _$SearchHistoryFromJson(json);

  Map<String, dynamic> toJson() => _$SearchHistoryToJson(this);

  Map<String, dynamic> toAPIJson(String firebaseUserId) {
    return toJson()
      ..addAll({
        "firebase_user_id": firebaseUserId,
      });
  }

  factory SearchHistory.fromAirQualityReading(
    AirQualityReading airQualityReading,
  ) =>
      SearchHistory(
        name: airQualityReading.name,
        latitude: airQualityReading.latitude,
        longitude: airQualityReading.longitude,
        location: airQualityReading.location,
        dateTime: DateTime.now(),
        placeId: airQualityReading.placeId,
      );

  @JsonKey(name: "place_id")
  final String placeId;

  @JsonKey()
  final double latitude;

  @JsonKey()
  final double longitude;

  @JsonKey()
  final String name;

  @JsonKey()
  final String location;

  @JsonKey(name: "date_time")
  final DateTime dateTime;

  @JsonKey(
    includeToJson: false,
    includeFromJson: false,
    includeIfNull: true,
    disallowNullValue: false,
  )
  final AirQualityReading? airQualityReading;

  SearchHistory copyWith({
    AirQualityReading? airQualityReading,
  }) {
    return SearchHistory(
      name: name,
      location: location,
      placeId: placeId,
      latitude: latitude,
      longitude: longitude,
      airQualityReading: airQualityReading ?? this.airQualityReading,
      dateTime: dateTime,
    );
  }

  @override
  List<Object?> get props => [placeId];
}
