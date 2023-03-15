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
    on<RefreshFavouritePlaces>(_onRefreshFavouritePlaces);
    on<FetchFavouritePlaces>(_fetchFavouritePlaces);
    on<ClearFavouritePlaces>(_onClearFavouritePlaces);
    on<UpdateFavouritePlace>(_onUpdateFavouritePlace);
  }

  final AppService appService = AppService();

  Future<void> _onUpdateFavouritePlace(
    UpdateFavouritePlace event,
    Emitter<List<FavouritePlace>> emit,
  ) async {
    List<FavouritePlace> favouritePlaces = List.of(state);
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

    emit(favouritePlaces.sortByName());

    final hasConnection = await hasNetworkConnection();
    if (hasConnection) {
      await CloudStore.updateFavouritePlaces();
      if (favouritePlaces.length >= 5) {
        await CloudAnalytics.logEvent(
          CloudAnalyticsEvent.savesFiveFavorites,
        );
      }
    }
  }

  Future<void> _fetchFavouritePlaces(
    FetchFavouritePlaces _,
    Emitter<List<FavouritePlace>> emit,
  ) async {
    List<FavouritePlace> places = await CloudStore.getFavouritePlaces();
    emit(places);
  }

  Future<void> _onClearFavouritePlaces(
    ClearFavouritePlaces _,
    Emitter<List<FavouritePlace>> emit,
  ) async {
    emit([]);
  }

  Future<void> _onRefreshFavouritePlaces(
    RefreshFavouritePlaces _,
    Emitter<List<FavouritePlace>> emit,
  ) async {
    for (final favPlace in state) {
      final nearestSite = await LocationService.getNearestSite(
        favPlace.latitude,
        favPlace.longitude,
      );
      if (nearestSite != null) {
        // updatedFavouritePlaces
        //     .add(favPlace.copyWith(referenceSite: nearestSite.referenceSite));
      } else {
        // updatedFavouritePlaces.add(favPlace);
      }
    }

    await _onRefreshFavouritePlacesInsights();
  }

  Future<void> _onRefreshFavouritePlacesInsights() async {
    for (final favouritePlace in state) {
      await appService.fetchInsightsData(favouritePlace.referenceSite);
    }
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
