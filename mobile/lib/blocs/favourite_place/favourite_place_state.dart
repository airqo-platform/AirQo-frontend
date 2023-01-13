part of 'favourite_place_bloc.dart';

enum FavouritePlaceError {
  noInternetConnection,
  none;
}

enum FavouritePlaceStatus {
  error,
  initial;
}

class FavouritePlaceState extends Equatable {
  const FavouritePlaceState._({
    this.favouritePlaces = const [],
    this.status = FavouritePlaceStatus.initial,
    this.error = FavouritePlaceError.none,
  });

  const FavouritePlaceState({
    this.favouritePlaces = const [],
    this.status = FavouritePlaceStatus.initial,
    this.error = FavouritePlaceError.none,
  });

  const FavouritePlaceState.initial() : this._();

  FavouritePlaceState copyWith({
    List<FavouritePlace>? favouritePlaces,
    FavouritePlaceStatus? status,
    FavouritePlaceError? error,
  }) {
    return FavouritePlaceState(
      favouritePlaces: favouritePlaces ?? this.favouritePlaces,
      status: status ?? this.status,
      error: error ?? this.error,
    );
  }

  final List<FavouritePlace> favouritePlaces;

  final FavouritePlaceStatus status;
  final FavouritePlaceError error;

  @override
  List<Object?> get props => [
        favouritePlaces,
        status,
        error,
      ];
}
