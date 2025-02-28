import 'package:equatable/equatable.dart';
import 'package:json_annotation/json_annotation.dart';

part 'nearest_places_model.g.dart';

/// Represents a nearest site with its location and metadata
@JsonSerializable()
class NearestSiteModel extends Equatable {
  /// Unique identifier for the site
  @JsonKey(name: '_id')
  final String id;

  /// Name of the site
  final String name;

  /// Longitude coordinate
  final double longitude;

  /// Latitude coordinate
  final double latitude;

  /// Distance from the search point in kilometers
  final double distanceKm;

  /// Additional site metadata
  final Map<String, dynamic>? metadata;

  const NearestSiteModel({
    required this.id,
    required this.name,
    required this.longitude,
    required this.latitude,
    this.distanceKm = 0.0,
    this.metadata,
  });

  /// Creates an instance from a JSON map
  factory NearestSiteModel.fromJson(Map<String, dynamic> json) => 
      _$NearestSiteModelFromJson(json);

  /// Converts the instance to a JSON map
  Map<String, dynamic> toJson() => _$NearestSiteModelToJson(this);

  @override
  List<Object?> get props => [id, name, longitude, latitude, distanceKm];
}

/// Represents recent measurements for a site
@JsonSerializable()
class RecentMeasurementModel extends Equatable {
  /// Site identifier
  @JsonKey(name: 'site_id')
  final String siteId;

  /// Timestamp of the measurement
  final DateTime timestamp;

  /// Detailed readings
  final Map<String, dynamic> readings;

  /// Additional measurement metadata
  final Map<String, dynamic>? metadata;

  const RecentMeasurementModel({
    required this.siteId,
    required this.timestamp,
    required this.readings,
    this.metadata,
  });

  /// Creates an instance from a JSON map
  factory RecentMeasurementModel.fromJson(Map<String, dynamic> json) => 
      _$RecentMeasurementModelFromJson(json);

  /// Converts the instance to a JSON map
  Map<String, dynamic> toJson() => _$RecentMeasurementModelToJson(this);

  @override
  List<Object?> get props => [siteId, timestamp, readings];
}

/// Represents a comprehensive nearest places response
@JsonSerializable()
class NearestPlacesResponseModel extends Equatable {
  /// List of nearest sites
  final List<NearestSiteModel> sites;

  /// List of recent measurements
  final List<RecentMeasurementModel> measurements;

  /// Additional response metadata
  final Map<String, dynamic>? metadata;

  const NearestPlacesResponseModel({
    required this.sites,
    required this.measurements,
    this.metadata,
  });

  /// Creates an instance from a JSON map
  factory NearestPlacesResponseModel.fromJson(Map<String, dynamic> json) => 
      _$NearestPlacesResponseModelFromJson(json);

  /// Converts the instance to a JSON map
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

/// Extension to provide additional functionality to ReadingType
extension ReadingTypeExtension on ReadingType {
  /// Converts reading type to a human-readable string
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