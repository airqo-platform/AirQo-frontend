import 'dart:async';

import 'package:app/constants/config.dart';
import 'package:app/models/models.dart';
import 'package:app/services/firebase_service.dart';
import 'package:app/services/rest_api.dart';
import 'package:app/utils/distance.dart';
import 'package:flutter/foundation.dart';
import 'package:geocoding/geocoding.dart';
import 'package:geolocator/geolocator.dart';
import 'package:hive_flutter/hive_flutter.dart';

import '../utils/exception.dart';
import 'hive_service.dart';
import 'native_api.dart';

class LocationService {
  static Future<String> getAddress({
    required double latitude,
    required double longitude,
  }) async {
    try {
      final landMarks = await placemarkFromCoordinates(latitude, longitude);
      String? address = '';
      final landMark = landMarks.first;

      address = landMark.name ?? landMark.thoroughfare;
      address = address ?? landMark.subLocality;
      address = address ?? landMark.locality;

      return address ?? '';
    } catch (exception, stackTrace) {
      await logException(
        exception,
        stackTrace,
      );
    }

    return '';
  }

  static Future<Position?> getCurrentPosition() async {
    try {
      return await Geolocator.getCurrentPosition(
        desiredAccuracy: LocationAccuracy.best,
        forceAndroidLocationManager: true,
        timeLimit: const Duration(seconds: 10),
      );
    } on TimeoutException catch (exception, stackTrace) {
      debugPrint(exception.message);
      debugPrintStack(stackTrace: stackTrace);
    } catch (exception, stackTrace) {
      await logException(
        exception,
        stackTrace,
      );

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
    }

    return null;
  }

  static Future<List<AirQualityReading>> getNearbyAirQualityReadings({
    int top = 5,
    Position? position,
  }) async {
    try {
      position ??= await getCurrentPosition();
      var address = '';

      if (position == null) {
        final geoCoordinates = await AirqoApiClient().getLocation();
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
      } else {
        address = await getAddress(
          latitude: position.latitude,
          longitude: position.longitude,
        );
      }

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
      if (address.isNotEmpty) {
        sortedReadings[0] = sortedReadings[0].copyWith(name: address);
      }

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
