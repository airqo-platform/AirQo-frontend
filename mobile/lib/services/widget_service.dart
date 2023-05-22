import 'dart:math';

import 'package:app/models/current_location.dart';
import 'package:app/services/location_service.dart';
import 'package:geolocator/geolocator.dart';
import 'package:home_widget/home_widget.dart';

//import location_service.dart';
import '../blocs/nearby_location/nearby_location_bloc.dart';
import '../blocs/search/search_bloc.dart';
import '../models/air_quality_reading.dart';
import '../models/widget_data.dart';
import 'hive_service.dart';

class WidgetService {
  static Future<void> sendData() async {
    CurrentLocation? currentLocation =
        await LocationService.getCurrentLocation();
    List<AirQualityReading> airQualityReadings =
        HiveService().getAirQualityReadings();

    AirQualityReading airQualityReading = airQualityReadings.firstWhere(
        (location) =>
            location.latitude == currentLocation!.latitude &&
            location.longitude == currentLocation.longitude,
        orElse: () => airQualityReadings[0]);

    if (currentLocation == null) {
      return;
    }

    WidgetData widgetData =
        WidgetData.initializeFromAirQualityReading(airQualityReading);
    widgetData.idMapping().forEach((key, value) async {
      await HomeWidget.saveWidgetData<String>(key, value);
    });

    return;
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
