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
    favourite: json['favourite'] as bool? ?? false,
    nickName: json['nickName'] as String? ?? '',
    channelID: json['channelID'] as int,
    description: json['description'] as String,
    latitude: (json['latitude'] as num).toDouble(),
    longitude: (json['longitude'] as num).toDouble(),
    isActive: json['isActive'] as bool,
    locationName: json['locationName'] as String,
    siteName: json['siteName'] as String,
    name: json['name'] as String,
  );
}

Map<String, dynamic> _$DeviceToJson(Device instance) => <String, dynamic>{
      'nickName': instance.nickName,
      'name': instance.name,
      'description': instance.description,
      'isActive': instance.isActive,
      'siteName': instance.siteName,
      'locationName': instance.locationName,
      'channelID': instance.channelID,
      'latitude': instance.latitude,
      'longitude': instance.longitude,
      'favourite': instance.favourite,
    };
