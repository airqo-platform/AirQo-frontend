import 'package:json_annotation/json_annotation.dart';

part 'place.g.dart';

@JsonSerializable()
class Geometry {
  factory Geometry.fromJson(Map<String, dynamic> json) =>
      _$GeometryFromJson(json);

  Geometry({
    required this.location,
  });
  Location location;

  Map<String, dynamic> toJson() => _$GeometryToJson(this);
}

@JsonSerializable()
class Location {
  Location({
    required this.lat,
    required this.lng,
  });

  factory Location.fromJson(Map<String, dynamic> json) =>
      _$LocationFromJson(json);
  double lat;

  double lng;

  Map<String, dynamic> toJson() => _$LocationToJson(this);
}

@JsonSerializable()
class Place {
  factory Place.fromJson(Map<String, dynamic> json) => _$PlaceFromJson(json);

  Place(this.geometry, this.name);
  String name;
  Geometry geometry;

  Map<String, dynamic> toJson() => _$PlaceToJson(this);
}
