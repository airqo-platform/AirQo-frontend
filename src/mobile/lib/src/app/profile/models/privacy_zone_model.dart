import 'package:equatable/equatable.dart';

class PrivacyZone extends Equatable {
  final String id;
  final String name;
  final double latitude;
  final double longitude;
  final double radius;
  final DateTime createdAt;

  const PrivacyZone({
    required this.id,
    required this.name,
    required this.latitude,
    required this.longitude,
    required this.radius,
    required this.createdAt,
  });

  @override
  List<Object?> get props => [
        id,
        name,
        latitude,
        longitude,
        radius,
        createdAt,
      ];

  PrivacyZone copyWith({
    String? id,
    String? name,
    double? latitude,
    double? longitude,
    double? radius,
    DateTime? createdAt,
  }) {
    return PrivacyZone(
      id: id ?? this.id,
      name: name ?? this.name,
      latitude: latitude ?? this.latitude,
      longitude: longitude ?? this.longitude,
      radius: radius ?? this.radius,
      createdAt: createdAt ?? this.createdAt,
    );
  }

  Map<String, dynamic> toJson() => {
        'id': id,
        'name': name,
        'latitude': latitude,
        'longitude': longitude,
        'radius': radius,
        'createdAt': createdAt.toIso8601String(),
      };

  factory PrivacyZone.fromJson(Map<String, dynamic> json) => PrivacyZone(
        id: json['id'] ?? '',
        name: json['name'] ?? '',
        latitude: (json['latitude'] ?? 0.0).toDouble(),
        longitude: (json['longitude'] ?? 0.0).toDouble(),
        radius: (json['radius'] ?? 0.0).toDouble(),
        createdAt: DateTime.parse(json['createdAt'] ?? DateTime.now().toIso8601String()),
      );

  Map<String, dynamic> toCreateRequest() => {
        'name': name,
        'latitude': latitude,
        'longitude': longitude,
        'radius': radius,
      };
}