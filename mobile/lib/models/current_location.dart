import 'dart:math';

import 'package:equatable/equatable.dart';
import 'package:geolocator/geolocator.dart';

class CurrentLocation extends Equatable {
  const CurrentLocation({
    required this.referenceSite,
    required this.latitude,
    required this.longitude,
    required this.name,
    required this.location,
  });

  CurrentLocation copyWith({
    String? name,
    String? location,
    String? referenceSite,
    double? latitude,
    double? longitude,
  }) {
    return CurrentLocation(
      referenceSite: referenceSite ?? this.referenceSite,
      latitude: latitude ?? this.latitude,
      longitude: longitude ?? this.longitude,
      name: name ?? this.name,
      location: location ?? this.location,
    );
  }

  factory CurrentLocation.fromPosition(Position position) {
    return CurrentLocation(
      referenceSite: "",
      latitude: position.latitude,
      longitude: position.longitude,
      name: "",
      location: "",
    );
  }

  final String referenceSite;
  final double latitude;
  final double longitude;
  final String name;
  final String location;

  Point get point => Point(latitude, longitude);

  @override
  List<Object?> get props => [latitude, longitude];
}
