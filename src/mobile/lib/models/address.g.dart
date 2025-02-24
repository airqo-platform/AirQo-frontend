// GENERATED CODE - DO NOT MODIFY BY HAND

part of 'address.dart';

// **************************************************************************
// JsonSerializableGenerator
// **************************************************************************

AddressComponent _$AddressComponentFromJson(Map<String, dynamic> json) =>
    AddressComponent(
      shortName: json['short_name'] as String,
      longName: json['long_name'] as String,
      types: (json['types'] as List<dynamic>).map((e) => e as String).toList(),
    );
