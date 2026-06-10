import 'package:equatable/equatable.dart';
import 'package:json_annotation/json_annotation.dart';

part 'nearest_places_model.g.dart';


@JsonSerializable()
class NearestSiteModel extends Equatable {

  @JsonKey(name: '_id')
  final String id;

  final String name;

  final double longitude;

  final double latitude;

  final double distanceKm;

  final Map<String, dynamic>? metadata;

  const NearestSiteModel({
    required this.id,
    required this.name,
    required this.longitude,
    required this.latitude,
    this.distanceKm = 0.0,
    this.metadata,
  });

  factory NearestSiteModel.fromJson(Map<String, dynamic> json) => 
      _$NearestSiteModelFromJson(json);

  Map<String, dynamic> toJson() => _$NearestSiteModelToJson(this);

  @override
  List<Object?> get props => [id, name, longitude, latitude, distanceKm];
}


@JsonSerializable()
class RecentMeasurementModel extends Equatable {
  @JsonKey(name: 'site_id')
  final String siteId;

  final DateTime timestamp;

  final Map<String, dynamic> readings;

  final Map<String, dynamic>? metadata;

  const RecentMeasurementModel({
    required this.siteId,
    required this.timestamp,
    required this.readings,
    this.metadata,
  });

  factory RecentMeasurementModel.fromJson(Map<String, dynamic> json) => 
      _$RecentMeasurementModelFromJson(json);


  Map<String, dynamic> toJson() => _$RecentMeasurementModelToJson(this);

  @override
  List<Object?> get props => [siteId, timestamp, readings];
}


@JsonSerializable()
class NearestPlacesResponseModel extends Equatable {

  final List<NearestSiteModel> sites;

  final List<RecentMeasurementModel> measurements;

  final Map<String, dynamic>? metadata;

  const NearestPlacesResponseModel({
    required this.sites,
    required this.measurements,
    this.metadata,
  });

  factory NearestPlacesResponseModel.fromJson(Map<String, dynamic> json) => 
      _$NearestPlacesResponseModelFromJson(json);

  Map<String, dynamic> toJson() => _$NearestPlacesResponseModelToJson(this);

  @override
  List<Object?> get props => [sites, measurements];
}

/// Enumeration for different types of environmental readings
enum ReadingType {
  @JsonValue('pm2.5')
  pm25,
  @JsonValue('pm10')
  pm10,
  @JsonValue('temperature')
  temperature,
  @JsonValue('humidity')
  humidity,
  @JsonValue('pressure')
  pressure,
  @JsonValue('other')
  other
}

extension ReadingTypeExtension on ReadingType {

  String get displayName {
    switch (this) {
      case ReadingType.pm25:
        return 'PM 2.5';
      case ReadingType.pm10:
        return 'PM 10';
      case ReadingType.temperature:
        return 'Temperature';
      case ReadingType.humidity:
        return 'Humidity';
      case ReadingType.pressure:
        return 'Pressure';
      case ReadingType.other:
        return 'Other';
    }
  }
}