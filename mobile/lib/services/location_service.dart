import 'dart:async';

import 'package:app/constants/config.dart';
import 'package:app/models/models.dart';
import 'package:app/services/firebase_service.dart';
import 'package:app/utils/distance.dart';
import 'package:flutter/foundation.dart';
import 'package:geocoding/geocoding.dart';
import 'package:geolocator/geolocator.dart';
import 'package:hive_flutter/hive_flutter.dart';

import 'hive_service.dart';
import 'native_api.dart';

class LocationService {
  static Future<List<String>> getAddresses(double lat, double lng) async {
    final placeMarks = await placemarkFromCoordinates(lat, lng);
    final addresses = <String>[];
    for (final place in placeMarks) {
      // print('subThoroughfare : ${place.subThoroughfare}');
      // print('thoroughfare ${place.thoroughfare}');
      // print('name ${place.name}');
      // print('locality ${place.locality}');
      // print('subLocality ${place.subLocality}');
      // print('subAdministrativeArea ${place.subAdministrativeArea}');
      // print('administrativeArea ${place.administrativeArea}');
      // print('street ${place.street}');

      var name = place.name ?? place.thoroughfare;
      name = name ?? place.subLocality;
      name = name ?? place.locality;
      name = name ?? '';
      if (name != '') {
        addresses.add(name);
      }
    }

    return addresses;
  }

  static Future<Position?> getCurrentPosition() async {
    try {
      return await Geolocator.getCurrentPosition(
        desiredAccuracy: LocationAccuracy.best,
        forceAndroidLocationManager: true,
      );
    } catch (exception) {
      // TODO: handle exceptions

      try {
        return await Geolocator.getLastKnownPosition(
          forceAndroidLocationManager: true,
        );
      } catch (exception) {
        debugPrint(exception.toString());
      }
    }

    return null;
  }

  static Future<List<AirQualityReading>> getNearbyAirQualityReadings({
    int top = 5,
    Position? position,
  }) async {
    try {
      position ??= await getCurrentPosition();

      if (position == null) {
        // TODO: get nearest air quality readings
        return [];
      }

      final addresses = await getAddresses(
        position.latitude,
        position.longitude,
      );
      final airQualityReadings =
          Hive.box<AirQualityReading>(HiveBox.airQualityReadings)
              .values
              .toList();

      if (airQualityReadings.isEmpty) {
        return [];
      }

      final nearestAirQualityReadings = <AirQualityReading>[];

      for (final airQualityReading in airQualityReadings) {
        final distanceInMeters = metersToKmDouble(
          Geolocator.distanceBetween(
            airQualityReading.latitude,
            airQualityReading.longitude,
            position.latitude,
            position.longitude,
          ),
        );
        nearestAirQualityReadings.add(
          AirQualityReading.duplicate(airQualityReading).copyWith(
            distanceToReferenceSite: distanceInMeters,
          ),
        );
      }

      final sortedReadings =
          sortAirQualityReadingsByDistance(nearestAirQualityReadings)
              .take(top)
              .toList();
      sortedReadings[0] = sortedReadings[0].copyWith(name: addresses[0]);

      return sortedReadings;
    } catch (exception, stackTrace) {
      debugPrint('$exception\n$stackTrace');

      return [];
    }
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
        foregroundNotificationConfig: const ForegroundNotificationConfig(
          notificationText:
              'AirQo app continue to receive your location and update the air quality readings',
          notificationTitle: 'Running in Background',
          enableWakeLock: true,
        ),
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

    Geolocator.getPositionStream(locationSettings: locationSettings)
        .listen((Position? position) async {
      if (position != null) {
        final nearbyAirQualityReadings =
            await LocationService.getNearbyAirQualityReadings(
          position: position,
        );
        await HiveService.updateNearbyAirQualityReadings(
          nearbyAirQualityReadings,
        );
      }
    });
  }

  static Future<AirQualityReading?> getNearestSiteAirQualityReading(
    double latitude,
    double longitude,
  ) async {
    try {
      final nearestSites = await getNearestSites(latitude, longitude);
      if (nearestSites.isEmpty) {
        return null;
      }

      var nearestSite = nearestSites.first;

      for (final site in nearestSites) {
        if (nearestSite.distanceToReferenceSite >
            site.distanceToReferenceSite) {
          nearestSite = site;
        }
      }

      return nearestSite;
    } catch (exception, stackTrace) {
      debugPrint('$exception\n$stackTrace');

      return null;
    }
  }

  static Future<List<AirQualityReading>> getNearestSites(
    double latitude,
    double longitude,
  ) async {
    final nearestSites = <AirQualityReading>[];
    double distanceInMeters;
    final airQualityReadings =
        Hive.box<AirQualityReading>(HiveBox.airQualityReadings).values.toList();

    for (final airQualityReading in airQualityReadings) {
      distanceInMeters = metersToKmDouble(
        Geolocator.distanceBetween(
          airQualityReading.latitude,
          airQualityReading.longitude,
          latitude,
          longitude,
        ),
      );
      if (distanceInMeters < Config.maxSearchRadius.toDouble()) {
        nearestSites.add(airQualityReading.copyWith(
          distanceToReferenceSite: distanceInMeters,
        ));
      }
    }

    return sortAirQualityReadingsByDistance(nearestSites);
  }
}
