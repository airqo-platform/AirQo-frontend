import 'package:airqo/src/app/dashboard/models/airquality_response.dart';
import 'package:airqo/src/app/dashboard/repository/dashboard_repository.dart';
import 'package:bloc/bloc.dart';
import 'package:equatable/equatable.dart';

part 'dashboard_event.dart';
part 'dashboard_state.dart';

class DashboardBloc extends Bloc<DashboardEvent, DashboardState> {
  final DashboardRepository repository;
  DashboardBloc(this.repository) : super(DashboardInitial()) {
    on<DashboardEvent>((event, emit) async {
      if (event is LoadDashboard) {
        try {
          emit(DashboardLoading());

          AirQualityResponse response =
              await repository.fetchAirQualityReadings();

          emit(DashboardLoaded(response));
        } catch (e) {
          emit(DashboardLoadingError(e.toString()));
        }
      }
    });
  }
}
