import 'dart:async';

import 'package:app/constants/constants.dart';
import 'package:app/models/models.dart';
import 'package:app/services/rest_api.dart';
import 'package:app/utils/utils.dart';
import 'package:flutter/services.dart';
import 'package:flutter/widgets.dart';
import 'package:geocoding/geocoding.dart';
import 'package:geolocator/geolocator.dart';
import 'package:permission_handler/permission_handler.dart';

import 'hive_service.dart';

class LocationService {
  static Future<bool> locationGranted() async {
    final permissionStatus = await Permission.location.status;

    switch (permissionStatus) {
      case PermissionStatus.permanentlyDenied:
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

  static Future<Map<String, String?>> getAddress({
    required double latitude,
    required double longitude,
  }) async {
    Map<String, String?> address = {};
    address["name"] = null;
    address["location"] = null;

    List<Placemark> landMarks = await placemarkFromCoordinates(
      latitude,
      longitude,
    );

    if (landMarks.isEmpty) {
      return address;
    }

    final Placemark landMark = landMarks.first;

    address["name"] = landMark.thoroughfare;
    address["name"] = address["name"].isValidLocationName()
        ? address["name"]
        : landMark.locality;
    address["name"] = address["name"].isValidLocationName()
        ? address["name"]
        : landMark.subLocality;
    address["name"] = address["name"].isValidLocationName()
        ? address["name"]
        : landMark.subThoroughfare;
    address["name"] =
        address["name"].isValidLocationName() ? address["name"] : landMark.name;

    if (landMark.subAdministrativeArea == null) {
      address["location"] =
          "${landMark.administrativeArea}, ${landMark.country}";
    } else {
      address["location"] =
          "${landMark.subAdministrativeArea}, ${landMark.administrativeArea}";
    }

    return address;
  }

  static Future<CurrentLocation?> getCurrentLocation() async {
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

  static Future<AirQualityReading?> getAirQuality(
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

    AirQualityReading? airQualityReading =
        nearestSites.isEmpty ? null : nearestSites.first;

    if (airQualityReading != null) {
      AirQualityEstimate? airQualityEstimate = await AirqoApiClient()
          .getEstimatedAirQuality(latitude: latitude, longitude: longitude);
      if (airQualityEstimate != null) {
        airQualityReading =
            AirQualityReading.fromAirQualityEstimate(airQualityEstimate);
      }
    }

    return airQualityReading;
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
}
