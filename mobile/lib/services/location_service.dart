import 'package:app/constants/config.dart';
import 'package:app/models/measurement.dart';
import 'package:app/models/site.dart';
import 'package:app/services/firebase_service.dart';
import 'package:app/services/local_storage.dart';
import 'package:app/utils/distance.dart';
import 'package:app/utils/extensions.dart';
import 'package:flutter/material.dart';
import 'package:flutter/rendering.dart';
import 'package:geocoding/geocoding.dart';
import 'package:geolocator/geolocator.dart';
import 'package:location/location.dart' as locate_api;

import '../models/analytics.dart';
import '../models/enum_constants.dart';
import '../models/profile.dart';
import 'firebase_service.dart';
import 'native_api.dart';

class LocationService {
  static Future<bool> allowLocationAccess() async {
    final enabled = await PermissionService.checkPermission(
      AppPermission.location,
      request: true,
    );
    if (enabled) {
      await Future.wait([
        CloudAnalytics.logEvent(
          AnalyticsEvent.allowLocation,
        ),
        Profile.getProfile().then(
          (profile) => profile.update(),
        ),
      ]);
    }

    return enabled;
  }

  static Future<List<String>> getAddresses(double lat, double lng) async {
    final placeMarks = await placemarkFromCoordinates(lat, lng);
    final addresses = <String>[];
    for (final place in placeMarks) {
      var name = place.thoroughfare ?? place.name;
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
            final site = await getNearestSite(latitude, longitude);
            final addresses = await getAddresses(latitude, longitude);
            if (site != null) {
              final analytics = Analytics.init()
                ..site = site.id
                ..location = site.location
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
      final site = await getNearestSite(latitude, longitude);
      final addresses = await getAddresses(latitude, longitude);
      if (site != null) {
        final analytics = Analytics.init()
          ..site = site.id
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

  static Future<List<Measurement>> getNearbyLocationReadings() async {
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
      final latestMeasurements = await DBHelper().getLatestMeasurements();

      final nearestMeasurements = <Measurement>[];

      for (final measurement in latestMeasurements) {
        final distanceInMeters = metersToKmDouble(
          Geolocator.distanceBetween(
            measurement.site.latitude,
            measurement.site.longitude,
            location.latitude!,
            location.longitude!,
          ),
        );
        if (distanceInMeters < (Config.maxSearchRadius.toDouble() * 2)) {
          measurement.site.distance = distanceInMeters;
          nearestMeasurements.add(measurement);
        }
      }

      if (nearestMeasurements.isEmpty) {
        return [];
      }

      final measurements =
          Measurement.sortByDistance(nearestMeasurements).take(2).toList();
      measurements[0].site.name = addresses[0];

      return measurements;
    } catch (exception, stackTrace) {
      debugPrint('$exception\n$stackTrace');

      return [];
    }
  }

  static Future<Site?> getNearestSite(double latitude, double longitude) async {
    try {
      final nearestSites = await getNearestSites(latitude, longitude);
      if (nearestSites.isEmpty) {
        return null;
      }

      var nearestSite = nearestSites.first;

      for (final site in nearestSites) {
        if (nearestSite.site.distance > site.site.distance) {
          nearestSite = site;
        }
      }

      return nearestSite.site;
    } catch (exception, stackTrace) {
      debugPrint('$exception\n$stackTrace');

      return null;
    }
  }

  static Future<List<Measurement>> getNearestSites(
    double latitude,
    double longitude,
  ) async {
    final nearestSites = <Measurement>[];
    double distanceInMeters;
    final dbHelper = DBHelper();
    final latestMeasurements = await dbHelper.getLatestMeasurements();

    for (final measurement in latestMeasurements) {
      distanceInMeters = metersToKmDouble(
        Geolocator.distanceBetween(
          measurement.site.latitude,
          measurement.site.longitude,
          latitude,
          longitude,
        ),
      );
      if (distanceInMeters < Config.maxSearchRadius.toDouble()) {
        measurement.site.distance = distanceInMeters;
        nearestSites.add(measurement);
      }
    }

    return Measurement.sortByDistance(nearestSites);
  }

  static Future<bool> revokePermission() async {
    final profile = await Profile.getProfile();
    await profile.update(enableLocation: false);

    return false;
  }

  static Future<List<Measurement>> searchNearestSites(
    double latitude,
    double longitude,
    String term,
  ) async {
    final nearestSites = <Measurement>[];
    double distanceInMeters;
    final dbHelper = DBHelper();
    final latestMeasurements = await dbHelper.getLatestMeasurements();

    for (final measurement in latestMeasurements) {
      distanceInMeters = metersToKmDouble(
        Geolocator.distanceBetween(
          measurement.site.latitude,
          measurement.site.longitude,
          latitude,
          longitude,
        ),
      );
      if (measurement.site.name.inStatement(term)) {
        measurement.site.distance = distanceInMeters;
        nearestSites.add(measurement);
      } else {
        if (distanceInMeters < Config.maxSearchRadius.toDouble()) {
          measurement.site.distance = distanceInMeters;
          nearestSites.add(measurement);
        }
      }
    }

    return nearestSites;
  }

  static List<Measurement> textSearchNearestSites(
    String term,
    List<Measurement> measurements,
  ) {
    final nearestSites = <Measurement>[];

    for (final measurement in measurements) {
      if (measurement.site.name
              .trim()
              .toLowerCase()
              .contains(term.trim().toLowerCase()) ||
          measurement.site.location
              .trim()
              .toLowerCase()
              .contains(term.trim().toLowerCase())) {
        nearestSites.add(measurement);
      }
    }

    return nearestSites;
  }
}
