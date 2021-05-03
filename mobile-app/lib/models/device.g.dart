// GENERATED CODE - DO NOT MODIFY BY HAND

part of 'device.dart';

// **************************************************************************
// JsonSerializableGenerator
// **************************************************************************

Devices _$DevicesFromJson(Map<String, dynamic> json) {
  return Devices(
    devices: (json['devices'] as List<dynamic>)
        .map((e) => Device.fromJson(e as Map<String, dynamic>))
        .toList(),
  );
}

Map<String, dynamic> _$DevicesToJson(Devices instance) => <String, dynamic>{
      'devices': instance.devices,
    };

Device _$DeviceFromJson(Map<String, dynamic> json) {
  return Device(
    channelID: json['channelID'] as int,
    id: json['id'] as String,
    description: json['description'] as String,
    isActive: json['isActive'] as bool,
    locationName: json['locationName'] as String,
    siteName: json['siteName'] as String,
    name: json['name'] as String,
    createdAt: json['createdAt'] as String,
  );
}

Map<String, dynamic> _$DeviceToJson(Device instance) => <String, dynamic>{
      'id': instance.id,
      'name': instance.name,
      'createdAt': instance.createdAt,
      'description': instance.description,
      'isActive': instance.isActive,
      'siteName': instance.siteName,
      'locationName': instance.locationName,
      'channelID': instance.channelID,
    };
