import 'dart:async';
import 'dart:math';

import 'package:app/models/models.dart';
import 'package:app/utils/utils.dart';
import 'package:flutter/services.dart';
import 'package:flutter/widgets.dart';
import 'package:geolocator/geolocator.dart';
import 'package:permission_handler/permission_handler.dart';

import 'hive_service.dart';
import 'rest_api.dart';

class LocationService {
  static Future<bool> locationGranted() async {
    final permissionStatus = await Permission.location.status;

    switch (permissionStatus) {
      case PermissionStatus.permanentlyDenied:
      case PermissionStatus.provisional:
      case PermissionStatus.denied:
      case PermissionStatus.restricted:
        return false;
      case PermissionStatus.limited:
      case PermissionStatus.granted:
        break;
    }

    return true;
  }

  static Future<void> requestLocation() async {
    await Geolocator.requestPermission().then((value) async {
      switch (value) {
        case LocationPermission.deniedForever:
        case LocationPermission.denied:
          await Geolocator.openAppSettings();
          break;
        case LocationPermission.unableToDetermine:
          break;
        case LocationPermission.whileInUse:
        case LocationPermission.always:
          bool isLocationOn = await Geolocator.isLocationServiceEnabled();
          if (!isLocationOn) {
            await Geolocator.openLocationSettings();
          }
          break;
      }
    });
  }

  static Future<void> denyLocation() async {
    await Geolocator.openAppSettings();
  }

  static Future<AirQualityReading?> getLocationAirQuality() async {
    final locationGranted = await LocationService.locationGranted();
    if (!locationGranted) {
      return null;
    }

    final bool serviceEnabled = await Geolocator.isLocationServiceEnabled();
    if (!serviceEnabled) {
      return null;
    }

    try {
      Position position = await Geolocator.getCurrentPosition(
        desiredAccuracy: LocationAccuracy.best,
        forceAndroidLocationManager: true,
      ).timeout(const Duration(seconds: 60));
      Point point = Point(
        position.latitude,
        position.longitude,
      );

      AirQualityReading? airQualityReading =
          await LocationService.getSearchAirQuality(point);
      if (airQualityReading == null) {
        return null;
      }

      airQualityReading = airQualityReading.copyWith(
        latitude: point.latitude,
        longitude: point.longitude,
        dateTime: DateTime.now(),
      );

      Address? address = await SearchApiClient().getAddress(
        latitude: airQualityReading.latitude,
        longitude: airQualityReading.longitude,
      );

      if (address != null) {
        airQualityReading = airQualityReading.copyWith(
          name: address.name,
          location: address.location,
        );
      }

      return airQualityReading;
    } on TimeoutException catch (exception, stackTrace) {
      debugPrint(exception.message);
      debugPrintStack(stackTrace: stackTrace);
    } on PlatformException catch (exception, stackTrace) {
      debugPrint(exception.message);
      debugPrintStack(stackTrace: stackTrace);
    } catch (exception, stackTrace) {
      await logException(
        exception,
        stackTrace,
      );
    }

    return null;
  }

  static List<AirQualityReading> getSurroundingSites(
    Point point, {
    double? radius,
  }) {
    List<AirQualityReading> airQualityReadings =
        HiveService().getAirQualityReadings();
    airQualityReadings = airQualityReadings.getNearbyAirQuality(
      point,
      radius: radius,
    );
    airQualityReadings.sortByDistanceToReferenceSite();
    return airQualityReadings;
  }

  static Future<AirQualityReading?> getSearchAirQuality(
    Point point,
  ) async {
    AirQualityReading? airQualityReading = LocationService.getSurroundingSites(
      point,
    ).firstOrNull;

    airQualityReading ??= await AirqoApiClient().searchAirQuality(point);

    return airQualityReading;
  }
}
