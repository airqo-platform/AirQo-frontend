import 'package:json_annotation/json_annotation.dart';

part 'site.g.dart';

@JsonSerializable()
class Site {
  @JsonKey(required: true, name: 'lat_long')
  final String id;

  @JsonKey(required: true)
  final double latitude;

  @JsonKey(required: true)
  final double longitude;

  @JsonKey(required: true)
  final String district;

  @JsonKey(required: true)
  final String country;

  @JsonKey(required: false, defaultValue: '')
  final String description;

  @JsonKey(required: false, defaultValue: '')
  final String nickName;

  @JsonKey(required: false, defaultValue: false)
  bool favourite;

  @JsonKey(required: false, defaultValue: 0.0)
  final double distance;

  Site(this.favourite,
      {required this.id,
      required this.latitude,
      required this.longitude,
      required this.district,
      required this.country,
      required this.description,
      required this.nickName,
      required this.distance});

  factory Site.fromJson(Map<String, dynamic> json) => _$SiteFromJson(json);

  void setFavourite(bool fav) {
    favourite = fav;
  }

  Map<String, dynamic> toJson() => _$SiteToJson(this);

  static String createTableStmt() => 'CREATE TABLE IF NOT EXISTS ${dbName()} ('
      '${dbId()} PRIMARY KEY TEXT, '
      '${dbCountry()} TEXT, '
      '${dbDistrict()} TEXT, '
      '${dbLongitude()} TEXT, '
      '${dbLatitude()} TEXT, '
      '${dbDescription()} TEXT, '
      '${dbFavourite()} TEXT, '
      '${dbNickName()} TEXT )';

  static String dbCountry() => 'country';

  static String dbDescription() => 'description';

  static String dbDistance() => 'distance';

  static String dbDistrict() => 'district';

  static String dbFavourite() => 'favourite';

  static String dbId() => 'id';

  static String dbLatitude() => 'latitude';

  static String dbLongitude() => 'longitude';

  static String dbName() => 'sites';

  static String dbNickName() => 'nickname';

  static String dropTableStmt() => 'DROP TABLE IF EXISTS ${dbName()}';

  static Map<String, dynamic> fromDbMap(Map<String, dynamic> json) => {
        'favourite': json['${dbFavourite()}'] == 'true' ? true : false,
        'nickName': json['${dbNickName()}'] as String,
        'description': json['${dbDescription()}'] as String,
        'lat_long': json['${dbId()}'] as String,
        'country': json['${dbCountry()}'] as String,
        'district': json['${dbDistrict()}'] as String,
        'latitude': json['${dbLatitude()}'] as double,
        'longitude': json['${dbLongitude()}'] as double,
      };

  static Map<String, dynamic> toDbMap(Site site) => {
        '${dbNickName()}': site.nickName == ''
            ? '${site.district} ${site.country}'
            : site.nickName,
        '${dbDescription()}': site.description,
        '${dbId()}': site.id,
        '${dbCountry()}': site.country,
        '${dbDistrict()}': site.district,
        '${dbLatitude()}': site.latitude,
        '${dbLongitude()}': site.longitude,
        '${dbFavourite()}': site.favourite ? 'true' : 'false',
      };
}

@JsonSerializable()
class Sites {
  Sites({
    required this.sites,
  });

  factory Sites.fromJson(Map<String, dynamic> json) => _$SitesFromJson(json);

  Map<String, dynamic> toJson() => _$SitesToJson(this);

  final List<Site> sites;
}
