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
    var enabled = await PermissionService.checkPermission(
        AppPermission.location,
        request: true);
    if (enabled) {
      await Future.wait([
        CloudAnalytics.logEvent(AnalyticsEvent.allowLocation),
        Profile.getProfile().then((profile) => profile.update())
      ]);
    }

    return enabled;
  }

  static Future<Measurement?> defaultLocationPlace() async {
    final dbHelper = DBHelper();
    var measurement = await dbHelper.getNearestMeasurement(
        Config.defaultLatitude, Config.defaultLongitude);

    if (measurement == null) {
      return null;
    }

    return measurement;
  }

  static Future<List<String>> getAddresses(double lat, double lng) async {
    var placeMarks = await placemarkFromCoordinates(lat, lng);
    var addresses = <String>[];
    for (var place in placeMarks) {
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
      location.onLocationChanged
          .listen((locate_api.LocationData locationData) async {
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
      });
    }
  }

  static Future<locate_api.LocationData?> getLocation() async {
    bool _serviceEnabled;
    locate_api.PermissionStatus _permissionGranted;
    final location = locate_api.Location();
    _serviceEnabled = await location.serviceEnabled();
    if (!_serviceEnabled) {
      _serviceEnabled = await location.requestService();
      if (!_serviceEnabled) {
        return null;
      }
    }

    _permissionGranted = await location.hasPermission();
    if (_permissionGranted == locate_api.PermissionStatus.denied) {
      _permissionGranted = await location.requestPermission();
      if (_permissionGranted != locate_api.PermissionStatus.granted) {
        return null;
      }
    }

    var locationData = await location.getLocation();
    await updateAnalytics(locationData);
    return locationData;
  }

  static Future<void> updateAnalytics(
      locate_api.LocationData? locationData) async {
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
      var nearestMeasurements = <Measurement>[];
      double distanceInMeters;

      var location = await getLocation();
      if (location == null) {
        return [];
      }

      if (location.longitude != null && location.latitude != null) {
        var addresses =
            await getAddresses(location.latitude!, location.longitude!);
        Measurement? nearestMeasurement;
        final dbHelper = DBHelper();
        var latestMeasurements = await dbHelper.getLatestMeasurements();

        for (var measurement in latestMeasurements) {
          distanceInMeters = metersToKmDouble(Geolocator.distanceBetween(
              measurement.site.latitude,
              measurement.site.longitude,
              location.latitude!,
              location.longitude!));
          if (distanceInMeters < (Config.maxSearchRadius.toDouble() * 2)) {
            measurement.site.distance = distanceInMeters;
            nearestMeasurements.add(measurement);
          }
        }

        var measurements = <Measurement>[];

        /// Get Actual location measurements
        if (nearestMeasurements.isNotEmpty) {
          nearestMeasurement = nearestMeasurements.first;
          for (var measurement in nearestMeasurements) {
            if (nearestMeasurement!.site.distance > measurement.site.distance) {
              nearestMeasurement = measurement;
            }
          }
          nearestMeasurements.remove(nearestMeasurement);

          for (var address in addresses) {
            nearestMeasurement?.site.name = address;
            measurements.add(nearestMeasurement!);
          }
        }

        /// Get Alternative location measurements
        if (nearestMeasurements.isNotEmpty) {
          nearestMeasurement = nearestMeasurements.first;
          for (var measurement in nearestMeasurements) {
            if (nearestMeasurement!.site.distance > measurement.site.distance) {
              nearestMeasurement = measurement;
            }
          }
          final exists = measurements
              .where(
                  (element) => element.site.id == nearestMeasurement?.site.id)
              .toList();
          if (exists.isEmpty) {
            measurements.add(nearestMeasurement!);
          }
        }

        return measurements;
      }
    } catch (exception, stackTrace) {
      debugPrint('$exception\n$stackTrace');
      return [];
    }
    return [];
  }

  static Future<Site?> getNearestSite(double latitude, double longitude) async {
    try {
      var nearestSites = await getNearestSites(latitude, longitude);
      if (nearestSites.isEmpty) {
        return null;
      }

      var nearestSite = nearestSites.first;

      for (var site in nearestSites) {
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
      double latitude, double longitude) async {
    var nearestSites = <Measurement>[];
    double distanceInMeters;
    final dbHelper = DBHelper();
    var latestMeasurements = await dbHelper.getLatestMeasurements();

    for (var measurement in latestMeasurements) {
      distanceInMeters = metersToKmDouble(Geolocator.distanceBetween(
          measurement.site.latitude,
          measurement.site.longitude,
          latitude,
          longitude));
      if (distanceInMeters < Config.maxSearchRadius.toDouble()) {
        measurement.site.distance = distanceInMeters;
        nearestSites.add(measurement);
      }
    }

    return nearestSites;
  }

  static Future<bool> revokePermission() async {
    final profile = await Profile.getProfile();
    await profile.update(enableLocation: false);
    return false;
  }

  static Future<List<Measurement>> searchNearestSites(
      double latitude, double longitude, String term) async {
    var nearestSites = <Measurement>[];
    double distanceInMeters;
    final dbHelper = DBHelper();
    var latestMeasurements = await dbHelper.getLatestMeasurements();

    for (var measurement in latestMeasurements) {
      distanceInMeters = metersToKmDouble(Geolocator.distanceBetween(
          measurement.site.latitude,
          measurement.site.longitude,
          latitude,
          longitude));
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
      String term, List<Measurement> measurements) {
    var nearestSites = <Measurement>[];

    for (var measurement in measurements) {
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
