import 'dart:async';

import 'package:app/constants/constants.dart';
import 'package:app/models/models.dart';
import 'package:app/utils/utils.dart';
import 'package:flutter/foundation.dart';
import 'package:geocoding/geocoding.dart';
import 'package:geolocator/geolocator.dart';
import 'package:hive_flutter/hive_flutter.dart';

import 'firebase_service.dart';
import 'hive_service.dart';
import 'native_api.dart';
import 'rest_api.dart';

class LocationService {
  static Future<String> getAddress({
    required double latitude,
    required double longitude,
  }) async {
    List<Placemark> landMarks =
        await placemarkFromCoordinates(latitude, longitude);

    if (landMarks.isEmpty) {
      return '';
    }

    final Placemark landMark = landMarks.first;

    String? address = landMark.thoroughfare ?? landMark.subLocality;
    address = address ?? landMark.locality;

    return address ?? '';
  }

  static Future<Position?> getCurrentPosition() async {
    try {
      return await Geolocator.getCurrentPosition(
        desiredAccuracy: LocationAccuracy.medium,
        forceAndroidLocationManager: true,
        timeLimit: const Duration(seconds: 20),
      );
    } on TimeoutException catch (exception, stackTrace) {
      debugPrint(exception.message);
      debugPrintStack(stackTrace: stackTrace);
    } catch (exception, stackTrace) {
      await logException(
        exception,
        stackTrace,
      );
    }

    try {
      return await Geolocator.getLastKnownPosition(
        forceAndroidLocationManager: true,
      );
    } catch (exception, stackTrace) {
      await logException(
        exception,
        stackTrace,
      );
    }

    return null;
  }

  static Future<List<AirQualityReading>> getNearbyAirQualityReadings({
    Position? position,
  }) async {
    position ??= await getCurrentPosition();

    if (position == null) {
      final geoCoordinates = await AirqoApiClient().getLocation();
      if (!geoCoordinates.keys.contains('latitude') ||
          !geoCoordinates.keys.contains('longitude')) {
        return [];
      }

      position = Position(
        longitude: geoCoordinates['longitude'] as double,
        latitude: geoCoordinates['latitude'] as double,
        timestamp: DateTime.now(),
        accuracy: 0.0,
        altitude: 0.0,
        heading: 0.0,
        speed: 0.0,
        speedAccuracy: 0.0,
      );
    }

    List<AirQualityReading> airQualityReadings = await getNearestSites(
      position.latitude,
      position.longitude,
    );
    airQualityReadings = airQualityReadings.sortByDistanceToReferenceSite();

    String address = await getAddress(
      latitude: position.latitude,
      longitude: position.longitude,
    );

    if (airQualityReadings.isNotEmpty && address.isNotEmpty) {
      airQualityReadings.first = airQualityReadings.first.copyWith(
        name: address,
      );
    }

    return airQualityReadings;
  }

  static Future<bool> allowLocationAccess() async {
    final enabled = await PermissionService.checkPermission(
      AppPermission.location,
      request: true,
    );
    if (enabled) {
      final profile = await Profile.getProfile();

      await Future.wait([
        CloudAnalytics.logEvent(
          AnalyticsEvent.allowLocation,
        ),
        profile.update(enableLocation: true),
      ]);
    }

    return enabled;
  }

  static Future<void> revokePermission() async {
    final profile = await Profile.getProfile();
    await profile.update(enableLocation: false);
  }

  static Future<void> listenToLocationUpdates() async {
    late LocationSettings locationSettings;

    if (defaultTargetPlatform == TargetPlatform.android) {
      locationSettings = AndroidSettings(
        accuracy: LocationAccuracy.high,
        distanceFilter: 100,
        forceLocationManager: true,
        intervalDuration: const Duration(seconds: 10),
      );
    } else if (defaultTargetPlatform == TargetPlatform.iOS ||
        defaultTargetPlatform == TargetPlatform.macOS) {
      locationSettings = AppleSettings(
        accuracy: LocationAccuracy.high,
        activityType: ActivityType.fitness,
        distanceFilter: 100,
        pauseLocationUpdatesAutomatically: true,
        showBackgroundLocationIndicator: false,
      );
    } else {
      locationSettings = const LocationSettings(
        accuracy: LocationAccuracy.high,
        distanceFilter: 100,
      );
    }

    final permissionGranted =
        await PermissionService.checkPermission(AppPermission.location);

    if (!permissionGranted) {
      return;
    }

    bool? serviceEnabled = await Geolocator.isLocationServiceEnabled();
    if (!serviceEnabled) {
      return;
    }

    Geolocator.getPositionStream(locationSettings: locationSettings).listen(
      (Position? position) async {
        if (position != null) {
          final nearbyAirQualityReadings =
              await LocationService.getNearbyAirQualityReadings(
            position: position,
          );
          await HiveService.updateNearbyAirQualityReadings(
            nearbyAirQualityReadings,
          );
        }
      },
      onError: (error) {
        debugPrint('error listening to locations : $error');
      },
    );
  }

  static Future<AirQualityReading?> getNearestSite(
    double latitude,
    double longitude,
  ) async {
    List<AirQualityReading> nearestSites = await getNearestSites(
      latitude,
      longitude,
    );

    return nearestSites.isEmpty
        ? null
        : nearestSites.sortByDistanceToReferenceSite().first;
  }

  static Future<List<AirQualityReading>> getNearestSites(
    double latitude,
    double longitude,
  ) async {
    List<AirQualityReading> airQualityReadings =
        Hive.box<AirQualityReading>(HiveBox.airQualityReadings).values.toList();

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

    return airQualityReadings.where((element) {
      return element.distanceToReferenceSite < Config.searchRadius.toDouble();
    }).toList();
  }
}
