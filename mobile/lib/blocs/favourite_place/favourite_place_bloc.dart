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

  Future<void> _onUpdateFavouritePlace(
    UpdateFavouritePlace event,
    Emitter<List<FavouritePlace>> emit,
  ) async {
    List<FavouritePlace> favouritePlaces = List.of(state);
    if (favouritePlaces
        .map((e) => e.placeId)
        .toList()
        .contains(event.airQualityReading.placeId)) {
      favouritePlaces
          .removeWhere((e) => e.placeId == event.airQualityReading.placeId);
    } else {
      favouritePlaces
          .add(FavouritePlace.fromAirQualityReading(event.airQualityReading));
    }

    emit(favouritePlaces.toSet().toList());

    final hasConnection = await hasNetworkConnection();
    if (hasConnection) {
      await CloudStore.updateFavouritePlaces(state);
      if (favouritePlaces.length >= 5) {
        await CloudAnalytics.logEvent(
          CloudAnalyticsEvent.savesFiveFavorites,
        );
      }
    }
  }

  void _onClearFavouritePlaces(
    ClearFavouritePlaces _,
    Emitter<List<FavouritePlace>> emit,
  ) {
    emit([]);
  }

  Future<void> _onSyncFavouritePlaces(
    SyncFavouritePlaces _,
    Emitter<List<FavouritePlace>> emit,
  ) async {
    List<FavouritePlace> favoritePlaces = await CloudStore.getFavouritePlaces();

    Set<FavouritePlace> favouritePlacesSet = state.toSet();
    favouritePlacesSet.addAll(favoritePlaces.toSet());

    emit(favouritePlacesSet.toList());

    Set<FavouritePlace> updatedFavouritePlaces = {};

    for (final favPlace in favouritePlacesSet) {
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

    emit(updatedFavouritePlaces.toList());
    await CloudStore.updateFavouritePlaces(updatedFavouritePlaces.toList());
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
