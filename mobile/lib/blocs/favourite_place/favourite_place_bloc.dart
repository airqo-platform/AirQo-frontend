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

  Set<FavouritePlace> _updateAirQuality(Set<FavouritePlace> data) {
    List<AirQualityReading> airQualityReadings =
        HiveService().getAirQualityReadings();

    return Set.of(data).map((place) {
      try {
        AirQualityReading airQualityReading = airQualityReadings.firstWhere(
          (element) => element.referenceSite == place.referenceSite,
        );

        return place.copyWith(airQualityReading: airQualityReading);
      } catch (e) {
        return place;
      }
    }).toSet();
  }

  void _onEmitFavouritePlaces(
    Set<FavouritePlace> favouritePlaces,
    Emitter<List<FavouritePlace>> emit,
  ) {
    favouritePlaces = _updateAirQuality(favouritePlaces);
    List<FavouritePlace> favouritePlacesList = favouritePlaces.toList();
    favouritePlacesList.sortByAirQuality();
    emit(favouritePlacesList);
  }

  Future<void> _onUpdateFavouritePlace(
    UpdateFavouritePlace event,
    Emitter<List<FavouritePlace>> emit,
  ) async {
    Set<FavouritePlace> favouritePlaces = List.of(state).toSet();

    if (favouritePlaces.contains(event.favouritePlace)) {
      favouritePlaces.remove(event.favouritePlace);
    } else {
      favouritePlaces.add(event.favouritePlace);
    }

    _onEmitFavouritePlaces(favouritePlaces, emit);

    await CloudStore.updateFavouritePlaces(state);
    if (favouritePlaces.length >= 5) {
      await CloudAnalytics.logEvent(
        CloudAnalyticsEvent.savesFiveFavorites,
      );
    }
  }

  void _onClearFavouritePlaces(
    ClearFavouritePlaces _,
    Emitter<List<FavouritePlace>> emit,
  ) {
    _onEmitFavouritePlaces({}, emit);
  }

  Future<void> _onSyncFavouritePlaces(
    SyncFavouritePlaces _,
    Emitter<List<FavouritePlace>> emit,
  ) async {
    List<FavouritePlace> cloudFavoritePlaces =
        await CloudStore.getFavouritePlaces();

    Set<FavouritePlace> favouritePlaces = state.toSet();
    favouritePlaces.addAll(cloudFavoritePlaces);

    _onEmitFavouritePlaces(favouritePlaces, emit);

    Set<FavouritePlace> updatedFavouritePlaces = {};

    for (final favPlace in favouritePlaces) {
      final nearestSite = await LocationService.getNearestSite(
        favPlace.latitude,
        favPlace.longitude,
      );

      if (nearestSite != null) {
        updatedFavouritePlaces
            .add(favPlace.copyWith(referenceSite: nearestSite.referenceSite));
      } else {
        updatedFavouritePlaces.add(favPlace);
      }
    }

    updatedFavouritePlaces = _updateAirQuality(updatedFavouritePlaces);

    _onEmitFavouritePlaces(favouritePlaces, emit);
    await CloudStore.updateFavouritePlaces(updatedFavouritePlaces.toList());
  }

  @override
  List<FavouritePlace>? fromJson(Map<String, dynamic> json) {
    List<FavouritePlace> favouritePlaces =
        FavouritePlaceList.fromJson(json).data;
    favouritePlaces = _updateAirQuality(favouritePlaces.toSet()).toList();

    return favouritePlaces;
  }

  @override
  Map<String, dynamic>? toJson(List<FavouritePlace> state) {
    return FavouritePlaceList(data: state).toJson();
  }
}
