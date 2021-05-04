import 'package:app/constants/app_constants.dart';
import 'package:json_annotation/json_annotation.dart';

part 'device.g.dart';

@JsonSerializable()
class Devices {
  Devices({
    required this.devices,
  });

  factory Devices.fromJson(Map<String, dynamic> json) => _$DevicesFromJson(json);
  Map<String, dynamic> toJson() => _$DevicesToJson(this);

  final List<Device> devices;
}

@JsonSerializable()
class Device {
  Device({
    required this.channelID,
    required this.description,
    required this.isActive,
    required this.locationName,
    required this.siteName,
    required this.name,
  });


  factory Device.fromJson(Map<String, dynamic> json) => _$DeviceFromJson(json);
  Map<String, dynamic> toJson() => _$DeviceToJson(this);


  final String name;
  final String description;
  final bool isActive;
  final String siteName;
  final String locationName;
  final int channelID;

  static Map<String, dynamic> toDbMap(Device device) {

    var constants = DbConstants();

    return {
      constants.channelID: device.channelID,
      constants.description: device.description,
      constants.siteName: device.siteName,
      constants.locationName: device.locationName,
      constants.name: device.name,
    };
  }

  static Map<String, dynamic> fromDbMap(Map<String, dynamic> json) {

    var constants = DbConstants();

    return {

      'channelID': json[constants.channelID] as int,
      'description': json[constants.description] as String,
      'isActive': true,
      'name': json[constants.name] as String,
      'siteName': json[constants.siteName] as String,
      'locationName': json[constants.locationName] as String,

    };
  }

}
