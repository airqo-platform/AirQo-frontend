import 'dart:math';

import 'package:app/services/location_service.dart';
import 'package:geolocator/geolocator.dart';
import 'package:home_widget/home_widget.dart';

import '../blocs/search/search_bloc.dart';
import '../models/air_quality_reading.dart';
import '../models/widget_data.dart';
import 'hive_service.dart';

class WidgetService {
  static Future<void> sendData() async {
    AirQualityReading? airQualityReading;
    Position? position = await LocationService.getCurrentPosition();
    List<AirQualityReading> airQualityReadings = await LocationService.getNearbyAirQualityReadings(position: position);
    if (airQualityReadings.isEmpty) {
      final searchBloc = SearchBloc();
      if (searchBloc.state.searchHistory.isEmpty) {
        List<AirQualityReading> airQualityReadings =
        HiveService.getAirQualityReadings();
        if (airQualityReadings.isNotEmpty) {
          final random = Random();
          airQualityReading =
          airQualityReadings[random.nextInt(airQualityReadings.length)];
        }
      } else {
        airQualityReading = searchBloc.state.searchHistory.first;
      }
    } else {
      airQualityReading = airQualityReadings.first;
    }
    if (airQualityReading == null) return;

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
