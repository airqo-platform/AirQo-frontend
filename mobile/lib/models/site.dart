import 'package:json_annotation/json_annotation.dart';

import 'json_parsers.dart';

part 'site.g.dart';

@JsonSerializable()
class Site {
  @JsonKey(required: true, name: '_id')
  final String id;

  @JsonKey(required: true)
  final double latitude;

  @JsonKey(required: true)
  final double longitude;

  @JsonKey(required: true)
  final String country;

  @JsonKey(
    required: true,
    name: 'search_name',
  )
  String name;

  @JsonKey(required: true, name: 'location_name')
  String location;

  @JsonKey(required: true, defaultValue: '', fromJson: regionFromJson)
  final String region;

  @JsonKey(required: false, defaultValue: 0.0)
  double distance;

  Site(
      {required this.id,
      required this.latitude,
      required this.longitude,
      required this.country,
      required this.name,
      required this.location,
      required this.region,
      required this.distance});

  factory Site.fromJson(Map<String, dynamic> json) => _$SiteFromJson(json);

  Map<String, dynamic> toJson() => _$SiteToJson(this);

  static String createTableStmt() =>
      'CREATE TABLE IF NOT EXISTS ${sitesDbName()}('
      'id TEXT PRIMARY KEY, '
      'country TEXT, '
      'region TEXT, '
      'location TEXT, '
      'longitude REAL, '
      'latitude REAL, '
      'name TEXT )';

  static String dropTableStmt() => 'DROP TABLE IF EXISTS ${sitesDbName()}';

  static Map<String, dynamic> fromDbMap(Map<String, dynamic> json) => {
        'search_name': json['name'] as String,
        'location_name': json['location'] as String,
        'region': json['region'] as String,
        '_id': json['id'] as String,
        'country': json['country'] as String,
        'latitude': json['latitude'] as double,
        'longitude': json['longitude'] as double,
      };

  static String sitesDbName() => 'sites';

  static Map<String, dynamic> toDbMap(Site site) => {
        'name': site.name,
        'location': site.location,
        'region': site.region,
        'id': site.id,
        'country': site.country,
        'latitude': site.latitude,
        'longitude': site.longitude
      };
}
