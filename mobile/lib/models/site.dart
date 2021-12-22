import 'package:app/utils/string_extension.dart';
import 'package:flutter/cupertino.dart';
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
  final String district;

  @JsonKey(required: true)
  final String country;

  @JsonKey(required: true)
  String name;

  @JsonKey(required: false, name: 'search_name', defaultValue: '')
  String searchName;

  @JsonKey(required: false, defaultValue: '')
  String description;

  @JsonKey(required: true, defaultValue: '', fromJson: regionFromJson)
  final String region;

  @JsonKey(required: false, defaultValue: 0.0)
  double distance;

  Site(this.id, this.latitude, this.longitude, this.district, this.country,
      this.name, this.searchName, this.description, this.region, this.distance);

  factory Site.fromJson(Map<String, dynamic> json) => _$SiteFromJson(json);

  String getLocation() {
    return '$district $country'.toTitleCase();
  }

  String getName() {
    if (!searchName.isNull()) {
      return searchName;
    }

    if (!name.isNull()) {
      return name;
    }

    if (!description.isNull()) {
      return description;
    }
    return getLocation();
  }

  Map<String, dynamic> toJson() => _$SiteToJson(this);

  static String createTableStmt() =>
      'CREATE TABLE IF NOT EXISTS ${sitesDbName()}('
      '${dbId()} TEXT PRIMARY KEY, '
      '${dbCountry()} TEXT, '
      '${dbDistrict()} TEXT, '
      '${dbLongitude()} REAL, '
      '${dbLatitude()} REAL, '
      '${dbDescription()} TEXT, '
      '${dbSiteName()} TEXT )';

  static String dbCountry() => 'country';

  static String dbDescription() => 'description';

  static String dbDistance() => 'distance';

  static String dbDistrict() => 'district';

  static String dbId() => 'site_id';

  static String dbLatitude() => 'latitude';

  static String dbLongitude() => 'longitude';

  static String dbRegion() => 'region';

  static String dbSiteName() => 'site_name';

  static String dropTableStmt() => 'DROP TABLE IF EXISTS ${sitesDbName()}';

  static Map<String, dynamic> fromDbMap(Map<String, dynamic> json) => {
        'name': json[dbSiteName()] as String,
        'description': json[dbDescription()] as String,
        'region': json[dbRegion()] as String,
        '_id': json[dbId()] as String,
        'country': json[dbCountry()] as String,
        'district': json[dbDistrict()] as String,
        'latitude': json[dbLatitude()] as double,
        'longitude': json[dbLongitude()] as double,
      };

  static List<Site> parseSites(dynamic jsonBody) {
    var sites = <Site>[];

    var jsonArray = jsonBody['sites'];
    for (var jsonElement in jsonArray) {
      try {
        var site = Site.fromJson(jsonElement);
        sites.add(site);
      } catch (exception, stackTrace) {
        debugPrint('$exception\n$stackTrace');
      }
    }

    sites.sort((siteA, siteB) {
      return siteA.getName().compareTo(siteB.getName().toLowerCase());
    });

    return sites;
  }

  static String sitesDbName() => 'sites';

  static Map<String, dynamic> toDbMap(Site site) => {
        dbSiteName(): site.getName(),
        dbDescription(): site.description,
        dbRegion(): site.region,
        dbId(): site.id,
        dbCountry(): site.country,
        dbDistrict(): site.district,
        dbLatitude(): site.latitude,
        dbLongitude(): site.longitude
      };
}

@JsonSerializable()
class Sites {
  final List<Site> sites;

  Sites({
    required this.sites,
  });

  factory Sites.fromJson(Map<String, dynamic> json) => _$SitesFromJson(json);

  Map<String, dynamic> toJson() => _$SitesToJson(this);
}
