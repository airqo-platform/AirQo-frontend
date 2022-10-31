part of 'search_bloc.dart';

abstract class SearchEvent extends Equatable {
  const SearchEvent();
}

class ResetSearch extends SearchEvent {
  const ResetSearch();

  @override
  List<Object> get props => ['reset'];

  @override
  String toString() => 'Search has been reset';
}

class SearchTermChanged extends SearchEvent {
  const SearchTermChanged({required this.text});

  final String text;

  @override
  List<Object> get props => [text];

  @override
  String toString() => 'Search text changed to : $text }';
}
