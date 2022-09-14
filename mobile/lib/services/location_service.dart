import 'package:app/constants/config.dart';
import 'package:app/models/models.dart';
import 'package:app/services/firebase_service.dart';
import 'package:app/utils/distance.dart';
import 'package:app/utils/extensions.dart';
import 'package:flutter/material.dart';
import 'package:flutter/rendering.dart';
import 'package:geocoding/geocoding.dart';
import 'package:geolocator/geolocator.dart';
import 'package:hive_flutter/hive_flutter.dart';
import 'package:location/location.dart' as locate_api;

import 'hive_service.dart';
import 'native_api.dart';

class LocationService {
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

  static Future<void> listenToLocation() async {
    final hasPermission =
        await PermissionService.checkPermission(AppPermission.location);
    if (hasPermission) {
      final location = locate_api.Location();
      await location.changeSettings(accuracy: locate_api.LocationAccuracy.high);
      await location.enableBackgroundMode(enable: true);
      location.onLocationChanged.listen(
        (locate_api.LocationData locationData) async {
          final latitude = locationData.latitude;
          final longitude = locationData.longitude;

          if (latitude != null && longitude != null) {
            final airQualityReading =
                await getNearestSiteAirQualityReading(latitude, longitude);
            final addresses = await getAddresses(latitude, longitude);
            if (airQualityReading != null) {
              final analytics = Analytics.init()
                ..site = airQualityReading.referenceSite
                ..location = airQualityReading.location
                ..latitude = latitude
                ..longitude = longitude
                ..name = addresses.first;
              await analytics.add();
            }
          }

          debugPrint('${locationData.longitude} : '
              '${locationData.longitude} : ${locationData.time}');
        },
      );
    }
  }

  static Future<locate_api.LocationData?> getLocation() async {
    bool serviceEnabled;
    locate_api.PermissionStatus permissionGranted;
    final location = locate_api.Location();
    await location.changeSettings(
      accuracy: locate_api.LocationAccuracy.balanced,
    );

    serviceEnabled = await location.serviceEnabled();
    if (!serviceEnabled) {
      serviceEnabled = await location.requestService();
      if (!serviceEnabled) {
        return null;
      }
    }

    permissionGranted = await location.hasPermission();
    if (permissionGranted == locate_api.PermissionStatus.denied) {
      permissionGranted = await location.requestPermission();
      if (permissionGranted != locate_api.PermissionStatus.granted) {
        return null;
      }
    }

    final locationData = await location.getLocation();
    await updateAnalytics(
      locationData,
    );

    return locationData;
  }

  static Future<void> updateAnalytics(
    locate_api.LocationData? locationData,
  ) async {
    if (locationData == null) {
      return;
    }

    final latitude = locationData.latitude;
    final longitude = locationData.longitude;

    if (latitude != null && longitude != null) {
      final site = await getNearestSiteAirQualityReading(latitude, longitude);
      final addresses = await getAddresses(latitude, longitude);
      if (site != null) {
        final analytics = Analytics.init()
          ..site = site.referenceSite
          ..location = site.location
          ..latitude = latitude
          ..longitude = longitude
          ..name = addresses.first;
        await analytics.add();
      }
    }
  }

  static Future<Position> getLocationUsingGeoLocator() async {
    bool serviceEnabled;
    LocationPermission permission;

    serviceEnabled = await Geolocator.isLocationServiceEnabled();
    if (!serviceEnabled) {
      return Future.error('Location services are disabled.');
    }

    permission = await Geolocator.checkPermission();
    if (permission == LocationPermission.denied) {
      permission = await Geolocator.requestPermission();
      if (permission == LocationPermission.denied) {
        throw Exception('Please enable'
            ' permission to access your location');
      }
    }

    if (permission == LocationPermission.deniedForever) {
      throw Exception('Location permissions are permanently denied, '
          'please enable permission to access your location');
    }

    return await Geolocator.getCurrentPosition();
  }

  static Future<List<AirQualityReading>> getNearbyAirQualityReadings({
    int top = 5,
  }) async {
    try {
      final location = await getLocation();

      if (location == null ||
          location.longitude == null ||
          location.latitude == null) {
        return [];
      }

      final addresses = await getAddresses(
        location.latitude!,
        location.longitude!,
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
            location.latitude!,
            location.longitude!,
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

  static Future<List<AirQualityReading>> getNearbyLocationReadings() async {
    try {
      final location = await getLocation();
      if (location == null ||
          location.longitude == null ||
          location.latitude == null) {
        return [];
      }

      final addresses = await getAddresses(
        location.latitude!,
        location.longitude!,
      );
      final airQualityReadings =
          Hive.box<AirQualityReading>(HiveBox.airQualityReadings)
              .values
              .toList();

      final nearestAirQualityReadings = <AirQualityReading>[];

      for (final airQualityReading in airQualityReadings) {
        final distanceInMeters = metersToKmDouble(
          Geolocator.distanceBetween(
            airQualityReading.latitude,
            airQualityReading.longitude,
            location.latitude!,
            location.longitude!,
          ),
        );
        if (distanceInMeters < (Config.maxSearchRadius.toDouble() * 2)) {
          nearestAirQualityReadings.add(airQualityReading.copyWith(
            distanceToReferenceSite: distanceInMeters,
          ));
        }
      }

      if (nearestAirQualityReadings.isEmpty) {
        return [];
      }

      final sortedReadings =
          sortAirQualityReadingsByDistance(nearestAirQualityReadings)
              .take(2)
              .toList();
      sortedReadings[0] = sortedReadings[0].copyWith(name: addresses[0]);

      return airQualityReadings;
    } catch (exception, stackTrace) {
      debugPrint('$exception\n$stackTrace');

      return [];
    }
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

  static Future<void> revokePermission() async {
    final profile = await Profile.getProfile();
    await profile.update(enableLocation: false);
  }

  static Future<List<AirQualityReading>> searchNearestSites(
    double latitude,
    double longitude,
    String term,
  ) async {
    final nearestSites = <AirQualityReading>[];
    double distanceInMeters;

    final latestAirQualityReadings =
        Hive.box<AirQualityReading>(HiveBox.airQualityReadings).values.toList();

    for (final airQualityReading in latestAirQualityReadings) {
      distanceInMeters = metersToKmDouble(
        Geolocator.distanceBetween(
          airQualityReading.latitude,
          airQualityReading.longitude,
          latitude,
          longitude,
        ),
      );
      if (airQualityReading.name.inStatement(term)) {
        nearestSites.add(airQualityReading.copyWith(
          distanceToReferenceSite: distanceInMeters,
        ));
      } else {
        if (distanceInMeters < Config.maxSearchRadius.toDouble()) {
          nearestSites.add(airQualityReading.copyWith(
            distanceToReferenceSite: distanceInMeters,
          ));
        }
      }
    }

    return nearestSites;
  }

  static List<AirQualityReading> textSearchNearestSites(String term) {
    final nearestReadings = <AirQualityReading>[];
    final airQualityReadings =
        Hive.box<AirQualityReading>(HiveBox.airQualityReadings).values.toList();

    for (final airQualityReading in airQualityReadings) {
      if (airQualityReading.name
              .trim()
              .toLowerCase()
              .contains(term.trim().toLowerCase()) ||
          airQualityReading.location
              .trim()
              .toLowerCase()
              .contains(term.trim().toLowerCase())) {
        nearestReadings.add(airQualityReading);
      }
    }

    return nearestReadings;
  }
}
