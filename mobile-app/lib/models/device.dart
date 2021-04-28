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
    required this.id,
    required this.created_at,
    required this.description,
    required this.isActive,
    required this.locationName,
    required this.latitude,
    required this.longitude,
    required this.siteName,
    required this.name,
    required this.createdAt,

  });


  factory Device.fromJson(Map<String, dynamic> json) => _$DeviceFromJson(json);
  Map<String, dynamic> toJson() => _$DeviceToJson(this);


  final String id;
  final String name;
  final String createdAt;
  final String description;
  final String created_at;
  final bool isActive;
  final String siteName;
  final String locationName;
  final double latitude;
  final double longitude;

}
