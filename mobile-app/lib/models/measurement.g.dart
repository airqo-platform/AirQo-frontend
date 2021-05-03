// GENERATED CODE - DO NOT MODIFY BY HAND

part of 'measurement.dart';

// **************************************************************************
// JsonSerializableGenerator
// **************************************************************************

Measurements _$MeasurementsFromJson(Map<String, dynamic> json) {
  return Measurements(
    measurements: (json['measurements'] as List<dynamic>)
        .map((e) => Measurement.fromJson(e as Map<String, dynamic>))
        .toList(),
  );
}

Map<String, dynamic> _$MeasurementsToJson(Measurements instance) =>
    <String, dynamic>{
      'measurements': instance.measurements,
    };

Measurement _$MeasurementFromJson(Map<String, dynamic> json) {
  return Measurement(
    status: json['status'] as String,
    address: json['address'] as String,
    channelID: json['channelID'] as int,
    time: json['time'] as String,
    pm2_5: Value.fromJson(json['pm2_5'] as Map<String, dynamic>),
    pm10: Value.fromJson(json['pm10'] as Map<String, dynamic>),
    s2_pm2_5: Value.fromJson(json['s2_pm2_5'] as Map<String, dynamic>),
    location: Location.fromJson(json['location'] as Map<String, dynamic>),
    s2_pm10: Value.fromJson(json['s2_pm10'] as Map<String, dynamic>),
  );
}

Map<String, dynamic> _$MeasurementToJson(Measurement instance) =>
    <String, dynamic>{
      'channelID': instance.channelID,
      'time': instance.time,
      'pm2_5': instance.pm2_5,
      'pm10': instance.pm10,
      's2_pm2_5': instance.s2_pm2_5,
      'location': instance.location,
      's2_pm10': instance.s2_pm10,
      'address': instance.address,
      'status': instance.status,
    };

Value _$ValueFromJson(Map<String, dynamic> json) {
  return Value(
    value: (json['value'] as num).toDouble(),
  );
}

Map<String, dynamic> _$ValueToJson(Value instance) => <String, dynamic>{
      'value': instance.value,
    };

Location _$LocationFromJson(Map<String, dynamic> json) {
  return Location(
    latitude: Value.fromJson(json['latitude'] as Map<String, dynamic>),
    longitude: Value.fromJson(json['longitude'] as Map<String, dynamic>),
  );
}

Map<String, dynamic> _$LocationToJson(Location instance) => <String, dynamic>{
      'latitude': instance.latitude,
      'longitude': instance.longitude,
    };
