import 'dart:async';

import 'package:app/models/models.dart';
import 'package:app/services/services.dart';
import 'package:app/utils/utils.dart';
import 'package:equatable/equatable.dart';
import 'package:hydrated_bloc/hydrated_bloc.dart';

part 'favourite_place_event.dart';

class FavouritePlaceBloc
    extends HydratedBloc<FavouritePlaceEvent, List<FavouritePlace>> {
  FavouritePlaceBloc() : super([]) {
    on<SyncFavouritePlaces>(_onSyncFavouritePlaces);
    on<ClearFavouritePlaces>(_onClearFavouritePlaces);
    on<UpdateFavouritePlace>(_onUpdateFavouritePlace);
  }

  Future<Set<FavouritePlace>> _updateAirQuality(
    Set<FavouritePlace> data,
  ) async {
    Set<FavouritePlace> places = Set.of(data);
    places = places
        .map((place) async {
          try {
            AirQualityReading? airQualityReading =
                await LocationService.getSearchAirQuality(place.point);

            return place.copyWith(airQualityReading: airQualityReading);
          } catch (e) {
            return place;
          }
        })
        .cast<FavouritePlace>()
        .toSet();

    return places;
  }

  Future<void>? _onEmitFavouritePlaces(
    Set<FavouritePlace> favouritePlaces,
    Emitter<List<FavouritePlace>> emit,
  ) async {
    List<FavouritePlace> favouritePlacesList = favouritePlaces.toList();
    favouritePlacesList.sortByAirQuality();
    emit(favouritePlacesList);
    await AirqoApiClient().syncFavouritePlaces(
      favouritePlacesList,
      clear: true,
    );

    favouritePlaces = await _updateAirQuality(favouritePlaces);
    favouritePlacesList = favouritePlaces.toList();
    favouritePlacesList.sortByAirQuality();
    emit(favouritePlacesList);
  }

  Future<void> _onUpdateFavouritePlace(
    UpdateFavouritePlace event,
    Emitter<List<FavouritePlace>> emit,
  ) async {
    Set<FavouritePlace> favouritePlaces = List.of(state).toSet();

    bool exists = favouritePlaces.contains(event.favouritePlace);
    if (exists) {
      favouritePlaces.remove(event.favouritePlace);
    } else {
      favouritePlaces.add(event.favouritePlace);
    }

    _onEmitFavouritePlaces(favouritePlaces, emit);

    if (favouritePlaces.length >= 5) {
      await CloudAnalytics.logEvent(
        CloudAnalyticsEvent.savesFiveFavorites,
      );
    }
  }

  void _onClearFavouritePlaces(
    ClearFavouritePlaces _,
    Emitter<List<FavouritePlace>> emit,
  ) async {
    List<FavouritePlace> favouritePlaces = List.of(state);
    emit([]);
    await AirqoApiClient().syncFavouritePlaces(favouritePlaces, clear: true);
  }

  Future<void> _onSyncFavouritePlaces(
    SyncFavouritePlaces _,
    Emitter<List<FavouritePlace>> emit,
  ) async {
    String userId = CustomAuth.getUserId();
    List<FavouritePlace> apiFavouritePlaces =
        await AirqoApiClient().fetchFavoritePlaces(userId);

    Set<FavouritePlace> favouritePlaces = state.toSet();

    favouritePlaces.addAll(apiFavouritePlaces.toSet());

    _onEmitFavouritePlaces(favouritePlaces, emit);
  }

  @override
  List<FavouritePlace>? fromJson(Map<String, dynamic> json) {
    return FavouritePlaceList.fromJson(json).data;
  }

  @override
  Map<String, dynamic>? toJson(List<FavouritePlace> state) {
    return FavouritePlaceList(data: state).toJson();
  }
}
