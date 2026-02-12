part of 'google_places_bloc.dart';

sealed class GooglePlacesEvent extends Equatable {
  const GooglePlacesEvent();

  @override
  List<Object> get props => [];
}

class SearchPlace extends GooglePlacesEvent {
  final String term;

  const SearchPlace(this.term);
}

class GetPlaceDetails extends GooglePlacesEvent {
  final String name;

  const GetPlaceDetails(this.name);
}


class ResetGooglePlaces extends GooglePlacesEvent {}
