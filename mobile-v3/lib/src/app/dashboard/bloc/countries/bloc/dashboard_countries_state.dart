part of 'dashboard_countries_bloc.dart';

sealed class DashboardCountriesState extends Equatable {
  const DashboardCountriesState();

  @override
  List<Object> get props => [];
}

final class DashboardCountriesInitial extends DashboardCountriesState {}

class CountriesLoading extends DashboardCountriesState {}

class CountriesLoaded extends DashboardCountriesState {
  final CountriesResponse response;

  const CountriesLoaded(this.response);
}

class CountriesLoadingError extends DashboardCountriesState {
  final String message;

  const CountriesLoadingError(this.message);
}