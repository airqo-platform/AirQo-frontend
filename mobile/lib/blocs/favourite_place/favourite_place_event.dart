part of 'favourite_place_bloc.dart';

abstract class FavouritePlaceEvent extends Equatable {
  const FavouritePlaceEvent();
}

class SyncFavouritePlaces extends FavouritePlaceEvent {
  const SyncFavouritePlaces();

  @override
  List<Object?> get props => [];
}

class ClearFavouritePlaces extends FavouritePlaceEvent {
  const ClearFavouritePlaces();

  @override
  List<Object?> get props => [];
}

class UpdateFavouritePlace extends FavouritePlaceEvent {
  const UpdateFavouritePlace(this.favouritePlace);
  final FavouritePlace favouritePlace;

  @override
  List<Object?> get props => [favouritePlace];
}
