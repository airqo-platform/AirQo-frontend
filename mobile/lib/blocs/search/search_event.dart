part of 'search_bloc.dart';

abstract class SearchEvent extends Equatable {
  const SearchEvent();
}

class InitializeSearchPage extends SearchEvent {
  const InitializeSearchPage();

  @override
  List<Object> get props => [];
}

class ReloadSearchPage extends SearchEvent {
  const ReloadSearchPage();

  @override
  List<Object> get props => [];
}

class FilterByAirQuality extends SearchEvent {
  const FilterByAirQuality(this.airQuality);
  final AirQuality airQuality;

  @override
  List<Object> get props => [airQuality];
}

class SearchTermChanged extends SearchEvent {
  const SearchTermChanged(this.text);

  final String text;

  @override
  List<Object> get props => [text];
}
