// GENERATED CODE - DO NOT MODIFY BY HAND

// ignore_for_file: implicit_dynamic_parameter

part of 'site.dart';

// **************************************************************************
// JsonSerializableGenerator
// **************************************************************************

Site _$SiteFromJson(Map<String, dynamic> json) => $checkedCreate(
      'Site',
      json,
      ($checkedConvert) {
        final val = Site(
          id: $checkedConvert('_id', (v) => v as String),
          latitude: $checkedConvert('latitude', (v) => (v as num).toDouble()),
          longitude: $checkedConvert('longitude', (v) => (v as num).toDouble()),
          country: $checkedConvert('country', (v) => v as String),
          name: $checkedConvert('search_name', (v) => v as String),
          location: $checkedConvert('location_name', (v) => v as String),
          region: $checkedConvert('region', (v) => v as String),
          tenant: $checkedConvert('tenant', (v) => v as String? ?? 'airqo'),
        );
        return val;
      },
      fieldKeyMap: const {
        'id': '_id',
        'name': 'search_name',
        'location': 'location_name'
      },
    );
