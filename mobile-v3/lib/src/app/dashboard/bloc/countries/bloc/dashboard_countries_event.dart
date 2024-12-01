part of 'dashboard_countries_bloc.dart';

sealed class DashboardCountriesEvent extends Equatable {
  const DashboardCountriesEvent();

  @override
  List<Object> get props => [];
}

class LoadCountries extends DashboardCountriesEvent{}