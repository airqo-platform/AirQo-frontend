import 'package:json_annotation/json_annotation.dart';

part 'device.g.dart';

@JsonSerializable()
class Device {
  @JsonKey(defaultValue: '', required: false)
  final String nickName;

  @JsonKey(defaultValue: 0.0, required: false)
  final double distance;

  @JsonKey(defaultValue: '')
  final String name;

  @JsonKey(defaultValue: '')
  final String description;

  @JsonKey(defaultValue: '')
  final String siteName;

  @JsonKey(defaultValue: '')
  final String locationName;

  @JsonKey(defaultValue: 0.0)
  final double latitude;

  @JsonKey(defaultValue: 0.0)
  final double longitude;

  @JsonKey(defaultValue: true, required: false)
  final bool isActive;

  Device(
      {required this.distance,
      required this.nickName,
      required this.description,
      required this.latitude,
      required this.longitude,
      required this.locationName,
      required this.siteName,
      required this.name,
      required this.isActive});

  factory Device.fromJson(Map<String, dynamic> json) => _$DeviceFromJson(json);

  Map<String, dynamic> toJson() => _$DeviceToJson(this);

  static String createTableStmt() => 'CREATE TABLE IF NOT EXISTS ${dbName()} ('
      '${dbDeviceName()} PRIMARY KEY, '
      '${dbSiteName()} null, '
      '${dbLocationName()} null, '
      '${dbLongitude()} null, '
      '${dbLatitude()} null, '
      '${dbDescription()} null, '
      '${dbNickName()} null )';

  static String dbDescription() => 'description';

  static String dbDeviceName() => 'name';

  static String dbDistance() => 'distance';

  static String dbLatitude() => 'latitude';

  static String dbLocationName() => 'location_name';

  static String dbLongitude() => 'longitude';

  static String dbName() => 'devices';

  static String dbNickName() => 'nickname';

  static String dbSiteName() => 'site_name';

  static String devicesTableDropStmt() => 'DROP TABLE IF EXISTS ${dbName()}';

  static Map<String, dynamic> fromDbMap(Map<String, dynamic> json) {
    return {
      'nickName': json['${dbNickName()}'] as String,
      'description': json['${dbDescription()}'] as String,
      'name': json['${dbDeviceName()}'] as String,
      'siteName': json['${dbSiteName()}'] as String,
      'locationName': json['${dbLocationName()}'] as String,
      'latitude': json['${dbLatitude()}'] as double,
      'longitude': json['${dbLongitude()}'] as double,
    };
  }

  static List<Device> parseDevices(dynamic jsonBody) {

    var allDevices = Devices.fromJson(jsonBody).devices;
    var devices = <Device>[];

    for (var device in allDevices) {
      try {
        if(device.locationName != '' && device.siteName != '') {
          devices.add(device);
        }
      } on Error catch (e) {
        print('Transform Devices error: $e');
      }
    }

    return devices;
  }

  static List<Device> parseDevicesV2(dynamic jsonBody) {
    var devices = <Device>[];

    for (var t in jsonBody) {
      try {
        var device = Device.fromJson(t);
        if(device.locationName != '' && device.siteName != '') {
          devices.add(device);
        }
      } on Error catch (e) {
        print('Transform Devices error: $e');
      }
    }

    return devices;
  }

  static Map<String, dynamic> toDbMap(Device device) => {
        '${dbNickName()}':
            device.nickName == '' ? device.locationName : device.nickName,
        '${dbDescription()}': device.description,
        '${dbSiteName()}': device.siteName,
        '${dbLocationName()}': device.locationName,
        '${dbDeviceName()}': device.name,
        '${dbLatitude()}': device.latitude,
        '${dbLongitude()}': device.longitude,
      };
}

@JsonSerializable()
class Devices {
  final List<Device> devices;

  Devices({
    required this.devices,
  });

  factory Devices.fromJson(Map<String, dynamic> json) =>
      _$DevicesFromJson(json);

  Map<String, dynamic> toJson() => _$DevicesToJson(this);
}
