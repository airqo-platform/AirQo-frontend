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
    distance: (json['distance'] as num?)?.toDouble() ?? 0.0,
    nickName: json['nickName'] as String? ?? '',
    description: json['description'] as String? ?? '',
    latitude: (json['latitude'] as num?)?.toDouble() ?? 0.0,
    longitude: (json['longitude'] as num?)?.toDouble() ?? 0.0,
    locationName: json['locationName'] as String? ?? '',
    siteName: json['siteName'] as String? ?? '',
    name: json['name'] as String? ?? '',
  );
}

Map<String, dynamic> _$DeviceToJson(Device instance) => <String, dynamic>{
      'nickName': instance.nickName,
      'distance': instance.distance,
      'name': instance.name,
      'description': instance.description,
      'siteName': instance.siteName,
      'locationName': instance.locationName,
      'latitude': instance.latitude,
      'longitude': instance.longitude,
    };
