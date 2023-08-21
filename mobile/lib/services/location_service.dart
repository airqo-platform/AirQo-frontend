import 'dart:async';

import 'package:app/constants/constants.dart';
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

  static Future<CurrentLocation?> getCurrentLocation() async {
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

      return CurrentLocation.fromPosition(position);
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

  static Future<AirQualityReading?> getNearestSite(
    double latitude,
    double longitude,
  ) async {
    List<AirQualityReading> nearestSites =
        HiveService().getAirQualityReadings();

    nearestSites = nearestSites.map((element) {
      final double distanceInMeters = metersToKmDouble(
        Geolocator.distanceBetween(
          element.latitude,
          element.longitude,
          latitude,
          longitude,
        ),
      );

      return element.copyWith(distanceToReferenceSite: distanceInMeters);
    }).toList();

    nearestSites = nearestSites
        .where((element) =>
            element.distanceToReferenceSite < Config.searchRadius.toDouble())
        .toList();

    nearestSites.sortByDistanceToReferenceSite();

    return nearestSites.isEmpty ? null : nearestSites.first;
  }

  static Future<List<AirQualityReading>> getSurroundingSites({
    required double latitude,
    required double longitude,
  }) async {
    List<AirQualityReading> airQualityReadings =
        HiveService().getAirQualityReadings();

    airQualityReadings = airQualityReadings.map((element) {
      final double distanceInMeters = metersToKmDouble(
        Geolocator.distanceBetween(
          element.latitude,
          element.longitude,
          latitude,
          longitude,
        ),
      );

      return element.copyWith(distanceToReferenceSite: distanceInMeters);
    }).toList();

    airQualityReadings = airQualityReadings
        .where((element) =>
            element.distanceToReferenceSite < Config.searchRadius.toDouble())
        .toList();

    airQualityReadings.sortByDistanceToReferenceSite();

    return airQualityReadings;
  }

  static Future<AirQualityReading?> getSearchAirQuality(
    SearchResult result,
  ) async {
    final SearchResult? searchResult =
        await SearchApiClient().getPlaceDetails(result);

    if (searchResult == null) {
      return null;
    }

    AirQualityReading? airQualityReading = await LocationService.getNearestSite(
      searchResult.latitude,
      searchResult.longitude,
    );

    if (airQualityReading != null) {
      airQualityReading = airQualityReading.copyWith(
        name: searchResult.name,
        location: searchResult.location,
        latitude: searchResult.latitude,
        longitude: searchResult.longitude,
      );
    }

    return airQualityReading;
  }
}
