import 'package:json_annotation/json_annotation.dart';

part 'place.g.dart';

@JsonSerializable()
class Place {
  Place({
    required this.geometry,
    required this.name,
  });

  factory Place.fromJson(Map<String, dynamic> json) => _$PlaceFromJson(json);

  Map<String, dynamic> toJson() => _$PlaceToJson(this);

  String name;
  Geometry geometry;
}

@JsonSerializable()
class Geometry {
  Geometry({
    required this.location,
  });

  factory Geometry.fromJson(Map<String, dynamic> json) =>
      _$GeometryFromJson(json);

  Map<String, dynamic> toJson() => _$GeometryToJson(this);

  Location location;
}

@JsonSerializable()
class Location {
  Location({
    required this.lat,
    required this.lng,
  });

  factory Location.fromJson(Map<String, dynamic> json) =>
      _$LocationFromJson(json);

  Map<String, dynamic> toJson() => _$LocationToJson(this);

  double lat;
  double lng;
}
