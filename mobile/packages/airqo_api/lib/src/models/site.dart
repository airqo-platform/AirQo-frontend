import 'package:json_annotation/json_annotation.dart';

part 'site.g.dart';

@JsonSerializable()
class Site {
  factory Site.fromJson(Map<String, dynamic> json) => _$SiteFromJson(json);

  const Site({
    required this.id,
    required this.latitude,
    required this.longitude,
    required this.country,
    required this.name,
    required this.location,
    required this.region,
    required this.tenant,
  });

  @JsonKey(name: '_id')
  final String id;
  final double latitude;
  final double longitude;
  final String country;
  @JsonKey(name: 'search_name')
  final String name;
  @JsonKey(name: 'location_name')
  final String location;
  final String region;
  @JsonKey(defaultValue: 'AirQo', required: false)
  final String tenant;
}
