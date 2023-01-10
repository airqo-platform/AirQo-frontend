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
  final AirQuality? airQuality;

  @override
  List<Object?> get props => [airQuality];
}

class SearchTermChanged extends SearchEvent {
  const SearchTermChanged(this.text);

  final String text;

  @override
  List<Object> get props => [text];
}

class SearchAirQuality extends SearchEvent {
  const SearchAirQuality(this.searchPlace);
  final SearchPlace searchPlace;

  @override
  List<Object> get props => [searchPlace];
}

class ClearSearchResult extends SearchEvent {
  const ClearSearchResult();

  @override
  List<Object> get props => [];
}
