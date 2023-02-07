part of 'favourite_place_bloc.dart';

abstract class FavouritePlaceEvent extends Equatable {
  const FavouritePlaceEvent();
}

class LoadFavouritePlaces extends FavouritePlaceEvent {
  const LoadFavouritePlaces();
  @override
  List<Object?> get props => [];
}

class RefreshFavouritePlaces extends FavouritePlaceEvent {
  const RefreshFavouritePlaces();
  @override
  List<Object?> get props => [];
}

class FetchFavouritePlaces extends FavouritePlaceEvent {
  const FetchFavouritePlaces();
  @override
  List<Object?> get props => [];
}

class ClearFavouritePlaces extends FavouritePlaceEvent {
  const ClearFavouritePlaces();
  @override
  List<Object?> get props => [];
}

class UpdateFavouritePlace extends FavouritePlaceEvent {
  const UpdateFavouritePlace(this.airQualityReading);
  final AirQualityReading airQualityReading;
  @override
  List<Object?> get props => [airQualityReading];
}
