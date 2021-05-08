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
    required this.favourite,
    required this.nickName,
    required this.channelID,
    required this.description,
    required this.latitude,
    required this.longitude,
    required this.isActive,
    required this.locationName,
    required this.siteName,
    required this.name,
  });


  factory Device.fromJson(Map<String, dynamic> json) => _$DeviceFromJson(json);
  Map<String, dynamic> toJson() => _$DeviceToJson(this);


  @JsonKey(defaultValue: 'not set', required: false)
  final String nickName;
  final String name;
  final String description;
  final bool isActive;
  final String siteName;
  final String locationName;
  final int channelID;
  final double latitude;
  final double longitude;

  @JsonKey(required: false, defaultValue: false)
  bool favourite;

  void setFavourite(bool fav){
    favourite = fav;
  }


  static Map<String, dynamic> toDbMap(Device device) {

    var constants = DbConstants();

    return {
      constants.nickName: device.nickName,
      constants.channelID: device.channelID,
      constants.description: device.description,
      constants.siteName: device.siteName,
      constants.locationName: device.locationName,
      constants.name: device.name,
      constants.latitude: device.latitude,
      constants.longitude: device.longitude,
      constants.isActive: device.isActive ? 1 : 0,
    };
  }

  static Map<String, dynamic> fromDbMap(Map<String, dynamic> json) {

    var constants = DbConstants();

    return {
      'favourite': json[constants.favourite] == 0 ? false : true,
      'nickName': json[constants.nickName] as String,
      'channelID': json[constants.channelID] as int,
      'description': json[constants.description] as String,
      'isActive': json[constants.isActive] == 0 ? false : true,
      'name': json[constants.name] as String,
      'siteName': json[constants.siteName] as String,
      'locationName': json[constants.locationName] as String,
      'latitude': json[constants.latitude] as double,
      'longitude': json[constants.longitude] as double,
    };
  }

}
