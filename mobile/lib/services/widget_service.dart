import 'dart:io';

import 'package:app/utils/utils.dart';
import 'package:home_widget/home_widget.dart';

import '../models/models.dart';
import 'services.dart';

class WidgetService {
  static Future<void> sendData() async {
    try {
      CurrentLocation? currentLocation =
          await LocationService.getCurrentLocation();
      AirQualityReading? airQualityReading;
      if (currentLocation != null) {
        airQualityReading = await LocationService.getNearestSite(
              currentLocation.latitude,
              currentLocation.longitude,
            ) ??
            (await LocationService.getSurroundingSites(
              latitude: currentLocation.latitude,
              longitude: currentLocation.longitude,
            ))
                .firstOrNull;
      }
      if (airQualityReading == null) {
        String userId = CustomAuth.getUserId();
        List<FavouritePlace> favouritePlaces = [];
        List<LocationHistory> locationHistory = [];
        String widgetLocation = '';
        favouritePlaces = await AirqoApiClient().fetchFavoritePlaces(userId)
          ..shuffle();

        if (favouritePlaces.isNotEmpty) {
          widgetLocation = (favouritePlaces.first).placeId;
        }

        if (widgetLocation == '') {
          locationHistory = await AirqoApiClient().fetchLocationHistory(userId)
            ..shuffle();
          if (locationHistory.isNotEmpty) {
            widgetLocation = (locationHistory.first).placeId;
          }
        }

        if (widgetLocation != '') {
          airQualityReading = await getAirQuality(widgetLocation);
        }
      }
      airQualityReading ??=
          HiveService().getNearbyAirQualityReadings().isNotEmpty
              ? (HiveService().getNearbyAirQualityReadings()..shuffle()).first
              : null;

      airQualityReading ??= HiveService().getAirQualityReadings().isNotEmpty
          ? (HiveService().getAirQualityReadings()..shuffle()).first
          : null;
      final widgetData =
          WidgetData.initializeFromAirQualityReading(airQualityReading!);
      await Future.wait(widgetData.idMapping().entries.map(
            (entry) =>
                HomeWidget.saveWidgetData<String>(entry.key, entry.value),
          ));
    } catch (e, stackTrace) {
      await logException(
        e,
        stackTrace,
      );
    }
  }

  static Future<void> updateWidget() async {
//TODO: Disabled for now
// var rectangleWidgetUpdate = HomeWidget.updateWidget(
//   name: 'AirQoHomeScreenWidget',
//   iOSName: 'AirQoHomeScreenWidget',
//   qualifiedAndroidName: 'com.airqo.app.AirQoHomeScreenWidget',
// );
// return Future.wait([rectangleWidgetUpdate, circularWidgetUpdate]);

    await HomeWidget.updateWidget(
      name: 'AirQoCircularWidget',
      androidName: 'AirQoCircularWidget',
      qualifiedAndroidName: 'com.airqo.app.AirQoCircularWidget',
    );
  }

  static Future<void> sendAndUpdate() async {
    if (Platform.isAndroid) {
      await sendData();
      await updateWidget();
    }
  }

  static Future<AirQualityReading> getAirQuality(String placeId) async {
    List<AirQualityReading> airQualityReadings =
        HiveService().getAirQualityReadings();
    AirQualityReading airQualityReading;
    airQualityReading = airQualityReadings.firstWhere(
      (element) => element.placeId == placeId,
    );
    return airQualityReading;
  }
}
