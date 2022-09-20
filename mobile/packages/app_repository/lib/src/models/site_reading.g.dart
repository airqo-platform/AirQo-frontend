// GENERATED CODE - DO NOT MODIFY BY HAND

part of 'site_reading.dart';

// **************************************************************************
// JsonSerializableGenerator
// **************************************************************************

SiteReading _$SiteReadingFromJson(Map<String, dynamic> json) => $checkedCreate(
      'SiteReading',
      json,
      ($checkedConvert) {
        final val = SiteReading(
          siteId: $checkedConvert('site_id', (v) => v as String),
          latitude: $checkedConvert('latitude', (v) => (v as num).toDouble()),
          longitude: $checkedConvert('longitude', (v) => (v as num).toDouble()),
          country: $checkedConvert('country', (v) => v as String),
          name: $checkedConvert('name', (v) => v as String),
          location: $checkedConvert('location', (v) => v as String),
          region: $checkedConvert('region', (v) => v as String),
          dateTime:
              $checkedConvert('date_time', (v) => DateTime.parse(v as String)),
          pm2_5: $checkedConvert('pm2_5', (v) => (v as num).toDouble()),
          pm10: $checkedConvert('pm10', (v) => (v as num).toDouble()),
          source: $checkedConvert('source', (v) => v as String),
        );
        return val;
      },
      fieldKeyMap: const {'siteId': 'site_id', 'dateTime': 'date_time'},
    );

Map<String, dynamic> _$SiteReadingToJson(SiteReading instance) =>
    <String, dynamic>{
      'site_id': instance.siteId,
      'latitude': instance.latitude,
      'longitude': instance.longitude,
      'country': instance.country,
      'name': instance.name,
      'source': instance.source,
      'location': instance.location,
      'region': instance.region,
      'date_time': instance.dateTime.toIso8601String(),
      'pm2_5': instance.pm2_5,
      'pm10': instance.pm10,
    };
