import 'dart:async';

import 'package:app/models/models.dart';
import 'package:app/services/services.dart';
import 'package:app/utils/utils.dart';
import 'package:equatable/equatable.dart';
import 'package:flutter_bloc/flutter_bloc.dart';

part 'favourite_place_event.dart';
part 'favourite_place_state.dart';

class FavouritePlaceBloc
    extends Bloc<FavouritePlaceEvent, FavouritePlaceState> {
  FavouritePlaceBloc() : super(const FavouritePlaceState()) {
    on<RefreshFavouritePlaces>(_onRefreshFavouritePlaces);
    on<FetchFavouritePlaces>(_fetchFavouritePlaces);
    on<ClearFavouritePlaces>(_onClearFavouritePlaces);
    on<UpdateFavouritePlace>(_onUpdateFavouritePlace);
  }

  final AppService appService = AppService();

  Future<void> _onUpdateFavouritePlace(
    UpdateFavouritePlace event,
    Emitter<FavouritePlaceState> emit,
  ) async {
    List<FavouritePlace> favouritePlaces = List.of(state.favouritePlaces);
    final placesIds = favouritePlaces.map((e) => e.placeId);

    if (placesIds.contains(event.airQualityReading.placeId)) {
      favouritePlaces.removeWhere(
        (element) => element.placeId == event.airQualityReading.placeId,
      );
    } else {
      favouritePlaces.add(
        FavouritePlace.fromAirQualityReading(event.airQualityReading),
      );
    }

    await HiveService.loadFavouritePlaces(favouritePlaces);

    emit(state.copyWith(favouritePlaces: favouritePlaces.sortByName()));

    final hasConnection = await hasNetworkConnection();
    if (hasConnection) {
      await CloudStore.updateFavouritePlaces();
      if (favouritePlaces.length >= 5) {
        await CloudAnalytics.logEvent(
          Event.savesFiveFavorites,
        );
      }
    }
  }

  Future<void> _fetchFavouritePlaces(
    FetchFavouritePlaces _,
    Emitter<FavouritePlaceState> emit,
  ) async {
    List<FavouritePlace> places = await CloudStore.getFavouritePlaces();
    emit(const FavouritePlaceState().copyWith(favouritePlaces: places));
    await HiveService.loadFavouritePlaces(places);
  }

  Future<void> _onClearFavouritePlaces(
    ClearFavouritePlaces _,
    Emitter<FavouritePlaceState> emit,
  ) async {
    emit(const FavouritePlaceState());
    await HiveService.deleteFavouritePlaces();
  }

  Future<void> _onRefreshFavouritePlaces(
    RefreshFavouritePlaces _,
    Emitter<FavouritePlaceState> emit,
  ) async {
    List<FavouritePlace> places = HiveService.getFavouritePlaces();
    emit(const FavouritePlaceState().copyWith(
      favouritePlaces: places.sortByName(),
    ));

    final hasConnection = await hasNetworkConnection();
    if (!hasConnection) {
      return emit(
        state.copyWith(status: FavouritePlaceStatus.noInternetConnection),
      );
    }

    await appService.updateFavouritePlacesReferenceSites();
    await _onRefreshFavouritePlacesInsights();
  }

  Future<void> _onRefreshFavouritePlacesInsights() async {
    for (final favouritePlace in state.favouritePlaces) {
      await appService.fetchInsightsData(favouritePlace.referenceSite);
    }
  }
}
