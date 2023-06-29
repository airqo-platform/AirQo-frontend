import 'dart:async';
import 'dart:convert';

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

  final AppService _appService = AppService();

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
    try {
      Set<FavouritePlace> favouritePlaces = List.of(state).toSet();

      if (favouritePlaces.contains(event.favouritePlace)) {
        if (await _appService.checkInternetConnectivity()) {
        
          bool removed =
              await AirqoApiClient().deleteFavoritePlaces(event.favouritePlace);
          if (removed) {
            favouritePlaces.remove(event.favouritePlace);
          }
        } else {
         
          String storedFav = jsonEncode(event.favouritePlace.toJson());
          await _appService.storeFavoritesLocally("remove", storedFav);
        }
      } else {
        if (await _appService.checkInternetConnectivity()) {
          bool added =
              await AirqoApiClient().addFavoritePlaces(event.favouritePlace);
          if (added) {
            favouritePlaces.add(event.favouritePlace);
          }
        } else {
          String storedFav = jsonEncode(event.favouritePlace.toJson());
          await _appService.storeFavoritesLocally("add", storedFav);
        }
      }

      _onEmitFavouritePlaces(favouritePlaces, emit);

      if (favouritePlaces.length >= 5) {
        await CloudAnalytics.logEvent(
          CloudAnalyticsEvent.savesFiveFavorites,
        );
      }
    } catch (exception, stackTrace) {
      await logException(
        exception,
        stackTrace,
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
    if (await _appService.checkInternetConnectivity()) {
      List<String> addedFavorites = await _appService.getStoredFavorites("add");

      for (String favorite in addedFavorites) {
        FavouritePlace fav = FavouritePlace.fromJson(
          jsonDecode(favorite) as Map<String, dynamic>,
        );

        await AirqoApiClient().addFavoritePlaces(fav);
      }

      List<String> removedFavorites =
          await _appService.getStoredFavorites("remove");

      for (String favorite in removedFavorites) {
        FavouritePlace fav = FavouritePlace.fromJson(
          jsonDecode(favorite) as Map<String, dynamic>,
        );
        await AirqoApiClient().deleteFavoritePlaces(fav);
      }
    }
    List<FavouritePlace> userFavoritePlaces =
        await AirqoApiClient().fetchFavoritePlaces();

    Set<FavouritePlace> favouritePlaces = state.toSet();
    favouritePlaces.addAll(userFavoritePlaces);

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
