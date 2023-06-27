import 'package:app/models/air_quality_reading.dart';
import 'package:equatable/equatable.dart';
import 'package:json_annotation/json_annotation.dart';

part 'favourite_place.g.dart';

@JsonSerializable(explicitToJson: true)
class FavouritePlace extends Equatable {
  factory FavouritePlace.fromJson(Map<String, dynamic> json) =>
      _$FavouritePlaceFromJson(json);

  const FavouritePlace({
    required this.name,
    required this.location,
    required this.referenceSite,
    required this.placeId,
    required this.latitude,
    required this.longitude,
    this.airQualityReading,
    this.favoriteId,
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


  FavouritePlace copyWith({
    String? referenceSite,
    AirQualityReading? airQualityReading,
  }) {
    return FavouritePlace(
      name: name,
      location: location,
      referenceSite: referenceSite ?? this.referenceSite,
      placeId: placeId,
      latitude: latitude,
      longitude: longitude,
      airQualityReading: airQualityReading ?? this.airQualityReading,
    );
  }

  Map<String, dynamic> toJson() => _$FavouritePlaceToJson(this);

  @JsonKey(defaultValue: '')
  final String name;

  @JsonKey(defaultValue: '')
  final String location;

  @JsonKey(defaultValue: '')
  final String referenceSite;

  @JsonKey(defaultValue: '', name: 'place_id')
  final dynamic placeId;

  @JsonKey(defaultValue: 0.0)
  final double latitude;

  @JsonKey(defaultValue: 0.0)
  final double longitude;

  @JsonKey(name: '_id')
  final dynamic favoriteId;

  @JsonKey(
    includeToJson: false,
    includeFromJson: false,
    includeIfNull: true,
    disallowNullValue: false,
  )
  final AirQualityReading? airQualityReading;

  @override
  List<Object?> get props => [name, location, placeId];
}

@JsonSerializable(explicitToJson: true)
class FavouritePlaceList {
  factory FavouritePlaceList.fromJson(Map<String, dynamic> json) =>
      _$FavouritePlaceListFromJson(json);

  FavouritePlaceList({required this.data});

  List<FavouritePlace> data;

  Map<String, dynamic> toJson() => _$FavouritePlaceListToJson(this);
}
