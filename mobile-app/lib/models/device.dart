import 'package:app/constants/app_constants.dart';
import 'package:json_annotation/json_annotation.dart';

part 'device.g.dart';

@JsonSerializable()
class Devices {
  Devices({
    required this.devices,
  });

  factory Devices.fromJson(Map<String, dynamic> json) =>
      _$DevicesFromJson(json);

  Map<String, dynamic> toJson() => _$DevicesToJson(this);

  final List<Device> devices;
}

@JsonSerializable()
class Device {
  Device({
    required this.distance,
    required this.favourite,
    required this.nickName,
    required this.description,
    required this.latitude,
    required this.longitude,
    required this.locationName,
    required this.siteName,
    required this.name,
  });

  static String dbDeviceName() => 'name';
  static String dbName() => 'devices';
  static String dbDistance() => 'distance';
  static String dbNickName() => 'nickname';
  static String dbDescription() => 'description';
  static String dbLatitude() => 'latitude';
  static String dbLongitude() => 'longitude';
  static String dbSiteName() => 'site_name';
  static String dbLocationName() => 'location_name';
  static String dbFavourite() => 'favourite';

  static String createTableStmt() =>
      'CREATE TABLE IF NOT EXISTS ${dbName()} ('
          '${dbDeviceName()} PRIMARY KEY, '
          '${dbSiteName()} not null, '
          '${dbLocationName()} not null, '
          '${dbLongitude()} not null, '
          '${dbLatitude()} not null, '
          '${dbDescription()} not null, '
          '${dbDistance()} not null, '
          '${dbFavourite()} not null, '
          '${dbNickName()} not null )';

  factory Device.fromJson(Map<String, dynamic> json) => _$DeviceFromJson(json);

  Map<String, dynamic> toJson() => _$DeviceToJson(this);

  @JsonKey(defaultValue: '', required: false)
  final String nickName;
  @JsonKey(defaultValue: 0.0, required: false)
  final double distance;
  final String name;
  final String description;
  final String siteName;
  final String locationName;
  final double latitude;
  final double longitude;

  @JsonKey(required: false, defaultValue: false)
  bool favourite;

  void setFavourite(bool fav) {
    favourite = fav;
  }

  static Map<String, dynamic> toDbMap(Device device) =>
     {
      '${dbNickName()}': device.nickName == '' ? device.locationName
          : device.nickName,
      '${dbDescription()}': device.description,
      '${dbSiteName()}': device.siteName,
      '${dbLocationName()}': device.locationName,
      '${dbDeviceName()}': device.name,
      '${dbLatitude()}': device.latitude,
      '${dbLongitude()}': device.longitude,
      '${dbFavourite()}': device.favourite ? 'true' : 'false',
    };


  static Map<String, dynamic> fromDbMap(Map<String, dynamic> json) {

    return {
      'favourite': json['${dbFavourite()}'] == 'true' ? true : false,
      'nickName': json['${dbNickName()}'] as String,
      'description': json['${dbDescription()}'] as String,
      'name': json['${dbDeviceName()}'] as String,
      'siteName': json['${dbSiteName()}'] as String,
      'locationName': json['${dbLocationName()}'] as String,
      'latitude': json['${dbLatitude()}'] as double,
      'longitude': json['${dbLongitude()}'] as double,
    };
  }
}
