part of 'google_places_bloc.dart';

sealed class GooglePlacesState extends Equatable {
  const GooglePlacesState();

  @override
  List<Object> get props => [];
}

final class GooglePlacesInitial extends GooglePlacesState {}

class SearchLoading extends GooglePlacesState {}

class SearchLoaded extends GooglePlacesState {
  final AutoCompleteResponse response;

  const SearchLoaded(this.response);
}

class SearchLoadingError extends GooglePlacesState {
  final String message;

  const SearchLoadingError(this.message);
}

class PlaceDetailsLoading extends GooglePlacesState {}

class PlaceDetailsLoaded extends GooglePlacesState {
  final AirqoLatLngResponse response;

  const PlaceDetailsLoaded(this.response);
}

class PlaceDetailsLoadingError extends GooglePlacesState {
  final String message;

  const PlaceDetailsLoadingError(this.message);
}
