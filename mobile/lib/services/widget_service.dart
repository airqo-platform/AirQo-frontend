import 'package:home_widget/home_widget.dart';
import '../models/models.dart';
import 'services.dart';

class WidgetService {
  static Future<void> sendData() async {
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
    airQualityReading ??= HiveService().getNearbyAirQualityReadings().isNotEmpty
        ? (HiveService().getNearbyAirQualityReadings()..shuffle()).first
        : null;
    final widgetData =
        WidgetData.initializeFromAirQualityReading(airQualityReading!);
    await Future.wait(widgetData.idMapping().entries.map(
          (entry) => HomeWidget.saveWidgetData<String>(entry.key, entry.value),
        ));
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
    await sendData();
    await updateWidget();
  }
}
