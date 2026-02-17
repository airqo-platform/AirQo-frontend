import 'package:equatable/equatable.dart';

class LocationDataPoint extends Equatable {
  final String id;
  final double latitude;
  final double longitude;
  final DateTime timestamp;
  final double? accuracy;
  final bool isSharedWithResearchers;

  const LocationDataPoint({
    required this.id,
    required this.latitude,
    required this.longitude,
    required this.timestamp,
    this.accuracy,
    this.isSharedWithResearchers = false,
  });

  @override
  List<Object?> get props => [
        id,
        latitude,
        longitude,
        timestamp,
        accuracy,
        isSharedWithResearchers,
      ];

  LocationDataPoint copyWith({
    String? id,
    double? latitude,
    double? longitude,
    DateTime? timestamp,
    double? accuracy,
    bool? isSharedWithResearchers,
  }) {
    return LocationDataPoint(
      id: id ?? this.id,
      latitude: latitude ?? this.latitude,
      longitude: longitude ?? this.longitude,
      timestamp: timestamp ?? this.timestamp,
      accuracy: accuracy ?? this.accuracy,
      isSharedWithResearchers: isSharedWithResearchers ?? this.isSharedWithResearchers,
    );
  }

  Map<String, dynamic> toJson() => {
        'id': id,
        'latitude': latitude,
        'longitude': longitude,
        'timestamp': timestamp.toIso8601String(),
        if (accuracy != null) 'accuracy': accuracy,
        'isSharedWithResearchers': isSharedWithResearchers,
      };

  factory LocationDataPoint.fromJson(Map<String, dynamic> json) =>
      LocationDataPoint(
        id: json['id'] ?? '',
        latitude: (json['latitude'] ?? 0.0).toDouble(),
        longitude: (json['longitude'] ?? 0.0).toDouble(),
        timestamp: DateTime.parse(json['timestamp'] ?? DateTime.now().toIso8601String()),
        accuracy: json['accuracy']?.toDouble(),
        isSharedWithResearchers: json['isSharedWithResearchers'] ?? false,
      );
}

class LocationDataResponse extends Equatable {
  final List<LocationDataPoint> data;
  final int total;
  final int limit;
  final int skip;

  const LocationDataResponse({
    required this.data,
    required this.total,
    required this.limit,
    required this.skip,
  });

  @override
  List<Object?> get props => [data, total, limit, skip];

  factory LocationDataResponse.fromJson(Map<String, dynamic> json) {
    final dataList = (json['data'] as List<dynamic>? ?? [])
        .map((item) => LocationDataPoint.fromJson(item as Map<String, dynamic>))
        .toList();

    return LocationDataResponse(
      data: dataList,
      total: json['total'] ?? 0,
      limit: json['limit'] ?? 0,
      skip: json['skip'] ?? 0,
    );
  }
}

class DeleteLocationDataRangeRequest extends Equatable {
  final DateTime startDate;
  final DateTime endDate;

  const DeleteLocationDataRangeRequest({
    required this.startDate,
    required this.endDate,
  });

  @override
  List<Object?> get props => [startDate, endDate];

  Map<String, dynamic> toJson() => {
        'startDate': startDate.toIso8601String(),
        'endDate': endDate.toIso8601String(),
      };
}