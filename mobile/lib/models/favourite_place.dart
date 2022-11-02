import 'package:app/models/air_quality_reading.dart';
import 'package:app/models/place_details.dart';
import 'package:cloud_firestore/cloud_firestore.dart';
import 'package:hive_flutter/hive_flutter.dart';
import 'package:json_annotation/json_annotation.dart';

part 'favourite_place.g.dart';

@JsonSerializable()
@HiveType(typeId: 60, adapterName: 'FavouritePlaceAdapter')
class FavouritePlace extends HiveObject {
  FavouritePlace({
    required this.name,
    required this.location,
    required this.referenceSite,
    required this.placeId,
    required this.latitude,
    required this.longitude,
  });

  factory FavouritePlace.fromAirQualityReading(
    AirQualityReading airQualityReading,
  ) {
    return FavouritePlace(
      name: airQualityReading.name,
      location: airQualityReading.location,
      referenceSite: airQualityReading.referenceSite,
      placeId: airQualityReading.placeId,
      latitude: airQualityReading.latitude,
      longitude: airQualityReading.longitude,
    );
  }

  factory FavouritePlace.fromFirestore({
    required DocumentSnapshot<Map<String, dynamic>> snapshot,
  }) {
    final data = snapshot.data() as Map<String, dynamic>;

    var referenceSite = '';
    if (data.keys.contains('referenceSite')) {
      referenceSite = data['referenceSite'] as String;
    } else if (data.keys.contains('siteId')) {
      referenceSite = data['siteId'] as String;
    }

    return FavouritePlace(
      name: data['name'] as String,
      location: data['location'] as String,
      referenceSite: referenceSite,
      placeId: data['placeId'] as String,
      latitude: data['latitude'] as double,
      longitude: data['longitude'] as double,
    );
  }

  factory FavouritePlace.fromPlaceDetails(PlaceDetails placeDetails) {
    return FavouritePlace(
      name: placeDetails.name,
      location: placeDetails.location,
      referenceSite: placeDetails.siteId,
      placeId: placeDetails.placeId,
      latitude: placeDetails.latitude,
      longitude: placeDetails.longitude,
    );
  }

  factory FavouritePlace.fromJson(Map<String, dynamic> json) =>
      _$FavouritePlaceFromJson(json);

  FavouritePlace copyWith({String? referenceSite}) {
    return FavouritePlace(
      name: name,
      location: location,
      referenceSite: referenceSite ?? this.referenceSite,
      placeId: placeId,
      latitude: latitude,
      longitude: longitude,
    );
  }

  Map<String, dynamic> toJson() => _$FavouritePlaceToJson(this);

  @HiveField(0)
  @JsonKey(defaultValue: '')
  final String name;

  @HiveField(1)
  @JsonKey(defaultValue: '')
  final String location;

  @HiveField(2)
  @JsonKey(defaultValue: '')
  final String referenceSite;

  @HiveField(3)
  @JsonKey(defaultValue: '')
  final String placeId;

  @HiveField(4)
  @JsonKey(defaultValue: 0.0)
  final double latitude;

  @HiveField(5)
  @JsonKey(defaultValue: 0.0)
  final double longitude;
}
