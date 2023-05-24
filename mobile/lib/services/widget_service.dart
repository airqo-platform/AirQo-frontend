import 'package:app/models/air_quality_reading.dart';
import 'package:app/models/favourite_place.dart';
import 'package:app/services/location_service.dart';
import 'package:flutter/src/widgets/framework.dart';
import 'package:flutter_bloc/flutter_bloc.dart';
import 'package:home_widget/home_widget.dart';
import 'package:collection/collection.dart';
import 'package:path/path.dart';
import '../blocs/favourite_place/favourite_place_bloc.dart';
import '../models/widget_data.dart';

class WidgetService {
  static Future<void> sendData() async {
    final currentLocation = await LocationService.getCurrentLocation();
    final airQualityReading = currentLocation != null
        ? await LocationService.getNearestSite(
              currentLocation.latitude,
              currentLocation.longitude,
            ) ??
            (await LocationService.getSurroundingSites(
              latitude: currentLocation.latitude,
              longitude: currentLocation.longitude,
            ))
                .firstOrNull
        : (BlocProvider.of<FavouritePlaceBloc>(context as BuildContext)
                .state
                .isNotEmpty
            ? await LocationService.getNearestSite(
                  BlocProvider.of<FavouritePlaceBloc>(context as BuildContext)
                      .state
                      .first
                      .latitude,
                  BlocProvider.of<FavouritePlaceBloc>(context as BuildContext)
                      .state
                      .first
                      .longitude,
                ) ??
                (await LocationService.getSurroundingSites(
                  latitude: BlocProvider.of<FavouritePlaceBloc>(
                          context as BuildContext)
                      .state
                      .first
                      .latitude,
                  longitude: BlocProvider.of<FavouritePlaceBloc>(
                          context as BuildContext)
                      .state
                      .first
                      .longitude,
                ))
                    .firstOrNull
            : null);

    if (airQualityReading != null) {
      final widgetData =
          WidgetData.initializeFromAirQualityReading(airQualityReading);
      await Future.wait(widgetData.idMapping().entries.map(
            (entry) =>
                HomeWidget.saveWidgetData<String>(entry.key, entry.value),
          ));
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
      iOSName: 'AirQoCircularWidget',
      qualifiedAndroidName: 'com.airqo.app.AirQoCircularWidget',
    );
  }

  static Future<void> sendAndUpdate() async {
    await sendData();
    await updateWidget();
  }
}
