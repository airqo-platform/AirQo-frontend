import 'package:airqo/src/app/other/places/models/airqo_latlng_response.dart';
import 'package:airqo/src/app/other/places/models/auto_complete_response.dart';
import 'package:airqo/src/app/other/places/repository/google_places_repository.dart';
import 'package:bloc/bloc.dart';
import 'package:equatable/equatable.dart';

part 'google_places_event.dart';
part 'google_places_state.dart';

class GooglePlacesBloc extends Bloc<GooglePlacesEvent, GooglePlacesState> {
  final GooglePlacesRepository repository;
  GooglePlacesBloc(this.repository) : super(GooglePlacesInitial()) {
    on<GooglePlacesEvent>((event, emit) async {
      if (event is SearchPlace) {
        emit(SearchLoading());
        try {
          AutoCompleteResponse response =
              await repository.searchPlaces(event.term);
          emit(SearchLoaded(response));
        } catch (e) {
          emit(SearchLoadingError(e.toString()));
        }
      } else if (event is GetPlaceDetails) {
        emit(PlaceDetailsLoading());
        try {
          AirqoLatLngResponse response =
              await repository.getPlaceDetails(event.name);

          emit(PlaceDetailsLoaded(response));
        } catch (e) {
          emit(PlaceDetailsLoadingError(e.toString()));

          // todo: send error to slack here
        }
      } else if (event is ResetGooglePlaces) {
        emit(GooglePlacesInitial());
      }
    });
  }
}
