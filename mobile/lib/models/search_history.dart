import 'package:equatable/equatable.dart';
import 'package:hive_flutter/hive_flutter.dart';
import 'package:json_annotation/json_annotation.dart';

import 'air_quality_reading.dart';
import 'hive_type_id.dart';

part 'search_history.g.dart';

@HiveType(typeId: searchHistoryTypeId)
class SearchHistory extends HiveObject with EquatableMixin {
  SearchHistory({
    required this.latitude,
    required this.longitude,
    required this.name,
    required this.location,
    required this.dateTime,
    required this.placeId,
  });

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

  @HiveField(0)
  @JsonKey()
  final String placeId;

  @HiveField(1)
  @JsonKey()
  final double latitude;

  @HiveField(2)
  @JsonKey()
  final double longitude;

  @HiveField(3)
  @JsonKey()
  final String name;

  @HiveField(4)
  @JsonKey()
  final String location;

  @HiveField(5)
  final DateTime dateTime;

  @override
  List<Object?> get props => [
        dateTime,
        name,
        location,
        longitude,
        latitude,
        placeId,
      ];
}
