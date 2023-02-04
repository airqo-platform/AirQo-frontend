part of 'search_bloc.dart';

abstract class SearchEvent extends Equatable {
  const SearchEvent();
}

class InitializeSearchFilter extends SearchEvent {
  const InitializeSearchFilter();

  @override
  List<Object> get props => [];
}

class ReloadSearchFilter extends SearchEvent {
  const ReloadSearchFilter();

  @override
  List<Object> get props => [];
}

class InitializeSearchView extends SearchEvent {
  const InitializeSearchView();

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

class GetSearchRecommendations extends SearchEvent {
  const GetSearchRecommendations(this.searchResult);
  final SearchResult searchResult;

  @override
  List<Object> get props => [searchResult];
}
