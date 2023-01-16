import 'package:app/blocs/blocs.dart';
import 'package:app/models/models.dart';
import 'package:app/utils/utils.dart';
import 'package:flutter/material.dart';
import 'package:flutter_bloc/flutter_bloc.dart';
import 'package:hive_flutter/hive_flutter.dart';

import 'hive_service.dart';
import 'location_service.dart';
import 'rest_api.dart';

class AppService {
  factory AppService() {
    return _instance;
  }

  AppService._internal();

  static final AppService _instance = AppService._internal();

  Future<InsightData> fetchInsightsData(
    String siteId, {
    Frequency? frequency,
  }) async {
    InsightData insights = await AirqoApiClient().fetchInsightsData(siteId);

    await AirQoDatabase().insertHistoricalInsights(insights.historical);
    await AirQoDatabase().insertForecastInsights(insights.forecast);

    if (frequency != null) {
      final historical = insights.historical
          .where((element) => element.frequency == frequency)
          .toList();
      final forecast = insights.forecast
          .where((element) => element.frequency == frequency)
          .toList();

      return InsightData(forecast: forecast, historical: historical);
    }

    return insights;
  }

  static void postSignInActions(BuildContext context) {
    context.read<AuthCodeBloc>().add(const ClearAuthCodeState());
    context.read<AccountBloc>().add(const FetchProfile());
    context.read<KyaBloc>().add(const FetchKya());
    context.read<AnalyticsBloc>().add(const FetchAnalytics());
    context.read<FavouritePlaceBloc>().add(const FetchFavouritePlaces());
    context.read<NotificationBloc>().add(const FetchNotifications());
  }

  static void postSignOutActions(BuildContext context) {
    context.read<AccountBloc>().add(const ClearProfile());
    context.read<KyaBloc>().add(const ClearKya());
    context.read<AnalyticsBloc>().add(const ClearAnalytics());
    context.read<FavouritePlaceBloc>().add(const ClearFavouritePlaces());
    context.read<NotificationBloc>().add(const ClearNotifications());
    // TODO clear search history
    // TODO SecureStorage().clearUserData()
  }

  Future<bool> refreshAirQualityReadings() async {
    try {
      final airQualityReadings =
          await AirqoApiClient().fetchAirQualityReadings();
      await HiveService.updateAirQualityReadings(airQualityReadings);

      return true;
    } catch (exception, stackTrace) {
      logException(exception, stackTrace);

      return false;
    }
  }

  // TODO listen to internet connection and sync data for all screens https://pub.dev/packages/connectivity_plus
  // TODO update other online collection in the background whenever changes are made

  Future<void> updateFavouritePlacesReferenceSites() async {
    // TODO Add to favourite places init bloc method
    final favouritePlaces =
        Hive.box<FavouritePlace>(HiveBox.favouritePlaces).values.toList();
    final updatedFavouritePlaces = <FavouritePlace>[];
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
    await HiveService.loadFavouritePlaces(updatedFavouritePlaces);
  }
}
