import 'package:airqo/src/app/dashboard/models/countries_response.dart';
import 'package:airqo/src/app/dashboard/repository/dashboard_repository.dart';
import 'package:bloc/bloc.dart';
import 'package:equatable/equatable.dart';

part 'dashboard_countries_event.dart';
part 'dashboard_countries_state.dart';

class DashboardCountriesBloc
    extends Bloc<DashboardCountriesEvent, DashboardCountriesState> {
  final DashboardRepository repository;
  DashboardCountriesBloc(this.repository) : super(DashboardCountriesInitial()) {
    on<DashboardCountriesEvent>((event, emit) async {
      if (event is LoadCountries) {
        emit(CountriesLoading());
        try {
          CountriesResponse response =
              await repository.fetchCountryAirQualityReadings();

          emit(CountriesLoaded(response));
        } catch (e) {
          print(e.toString());
          emit(CountriesLoadingError(e.toString()));
        }
      }
    });
  }
}
