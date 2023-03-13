part of 'favourite_place_bloc.dart';

enum FavouritePlaceStatus {
  error,
  noInternetConnection,
  initial;
}

class FavouritePlaceState extends Equatable {
  const FavouritePlaceState({
    this.favouritePlaces = const [],
    this.status = FavouritePlaceStatus.initial,
  });

  FavouritePlaceState copyWith({
    List<FavouritePlace>? favouritePlaces,
    FavouritePlaceStatus? status,
  }) {
    return FavouritePlaceState(
      favouritePlaces: favouritePlaces ?? this.favouritePlaces,
      status: status ?? this.status,
    );
  }

  final List<FavouritePlace> favouritePlaces;
  final FavouritePlaceStatus status;

  @override
  List<Object?> get props => [
        favouritePlaces,
        status,
      ];
}
