import 'package:app/constants/app_constants.dart';
import 'package:app/models/measurement.dart';
import 'package:app/models/site.dart';
import 'package:app/services/local_storage.dart';
import 'package:app/utils/distance.dart';
import 'package:app/utils/string_extension.dart';
import 'package:flutter/material.dart';
import 'package:geocoding/geocoding.dart';
import 'package:geolocator/geolocator.dart';
import 'package:location/location.dart' as locate_api;

import 'fb_notifications.dart';

class LocationService {
  final locate_api.Location _location = locate_api.Location();
  final DBHelper _dbHelper = DBHelper();
  final CustomAuth _customAuth = CustomAuth();
  final CloudStore _cloudStore = CloudStore();

  Future<bool> checkPermission() async {
    try {
      var status = await _location.hasPermission();
      if (status == locate_api.PermissionStatus.granted) {
        return true;
      }
    } catch (e) {
      debugPrint(e.toString());
    }
    return false;
  }

  bool containsWord(String body, String term) {
    var words = body.toLowerCase().split(' ');
    var terms = term.toLowerCase().split(' ');
    for (var word in words) {
      if (terms.first.trim() == word.trim()) {
        return true;
      }
    }
    return false;
  }

  Future<Measurement?> defaultLocationPlace() async {
    var measurement = await _dbHelper.getNearestMeasurement(
        AppConfig.defaultLatitude, AppConfig.defaultLongitude);

    if (measurement == null) {
      return null;
    }

    // var returnMeasurement = measurement;
    // var address =
    //     await getAddress(AppConfig.defaultLatitude,
    //     AppConfig.defaultLongitude);
    // returnMeasurement.site.name = address.thoroughfare;
    // returnMeasurement.site.description = address.thoroughfare;

    return measurement;
  }

  // Future<Address> getAddress(double lat, double lng) async {
  //   var addresses = await getAddressGoogle(lat, lng);
  //   if (addresses.isEmpty) {
  //     addresses = await getLocalAddress(lat, lng);
  //   }
  //   return addresses.first;
  // }

  Future<String> getAddress(double lat, double lng) async {
    var placeMarks = await placemarkFromCoordinates(lat, lng);
    var place = placeMarks[0];
    var name = place.thoroughfare ?? place.name;
    name = name ?? place.subLocality;
    name = name ?? place.locality;
    name = name ?? '';

    return name;
  }

  // Future<List<Address>> getAddressGoogle(double lat, double lang) async {
  //   final coordinates = Coordinates(lat, lang);
  //   List<Address> googleAddresses =
  //       await Geocoder.google(AppConfig.googleApiKey)
  //           .findAddressesFromCoordinates(coordinates);
  //   return googleAddresses;
  // }

  Future<Measurement?> getCurrentLocationReadings() async {
    try {
      var nearestMeasurements = <Measurement>[];
      double distanceInMeters;

      var location = await getLocation();
      if (location.longitude != null && location.latitude != null) {
        var address = await getAddress(location.latitude!, location.longitude!);
        Measurement? nearestMeasurement;
        var latestMeasurements = await _dbHelper.getLatestMeasurements();

        for (var measurement in latestMeasurements) {
          distanceInMeters = metersToKmDouble(Geolocator.distanceBetween(
              measurement.site.latitude,
              measurement.site.longitude,
              location.latitude!,
              location.longitude!));
          if (distanceInMeters < AppConfig.maxSearchRadius.toDouble()) {
            measurement.site.distance = distanceInMeters;
            try {
              // if (!address.thoroughfare.isNull()) {
              //   measurement.site.name = address.thoroughfare;
              //   measurement.site.description = address.thoroughfare;
              // }

              if (!address.isNull()) {
                measurement.site.name = address;
                measurement.site.searchName = address;
                measurement.site.description = address;
              }
            } catch (e) {
              debugPrint(e.toString());
            }
            nearestMeasurements.add(measurement);
          }
        }

        if (nearestMeasurements.isNotEmpty) {
          nearestMeasurement = nearestMeasurements.first;
          for (var measurement in nearestMeasurements) {
            if (nearestMeasurement!.site.distance > measurement.site.distance) {
              nearestMeasurement = measurement;
            }
          }
        }
        return nearestMeasurement;
      }
    } catch (e) {
      debugPrint('error $e');
      return null;
    }
  }

  // Future<List<Address>> getLocalAddress(double lat, double lang) async {
  //   final coordinates = Coordinates(lat, lang);
  //   List<Address> localAddresses =
  //       await Geocoder.local.findAddressesFromCoordinates(coordinates);
  //   return localAddresses;
  // }

  Future<locate_api.LocationData> getLocation() async {
    bool _serviceEnabled;
    locate_api.PermissionStatus _permissionGranted;

    _serviceEnabled = await _location.serviceEnabled();
    if (!_serviceEnabled) {
      _serviceEnabled = await _location.requestService();
      if (!_serviceEnabled) {
        throw Exception('Please enable location');
      }
    }

    _permissionGranted = await _location.hasPermission();
    if (_permissionGranted == locate_api.PermissionStatus.denied) {
      _permissionGranted = await _location.requestPermission();
      if (_permissionGranted != locate_api.PermissionStatus.granted) {
        throw Exception('Please enable'
            ' permission to access your location');
      }
    }

    // await location.changeSettings(accuracy: LocationAccuracy.balanced);
    // await location.enableBackgroundMode(enable: true);
    // location.onLocationChanged.listen((LocationData locationData) {
    //   print('${locationData.longitude} : ${locationData.longitude}');
    // });

    var _locationData = await _location.getLocation();
    return _locationData;
  }

  Future<Measurement?> getLocationMeasurement() async {
    try {
      Measurement? nearestMeasurement;
      var nearestMeasurements = <Measurement>[];

      double distanceInMeters;

      var location = await getLocation();
      if (location.longitude != null && location.latitude != null) {
        // var latitude = location.latitude;
        // var longitude = location.longitude;
        // var addresses = await getAddressGoogle(latitude!, longitude!);
        // var userAddress = addresses.first;

        await _dbHelper.getLatestMeasurements().then((measurements) => {
              for (var measurement in measurements)
                {
                  distanceInMeters = metersToKmDouble(
                      Geolocator.distanceBetween(
                          measurement.site.latitude,
                          measurement.site.longitude,
                          location.latitude!,
                          location.longitude!)),
                  if (distanceInMeters < AppConfig.maxSearchRadius.toDouble())
                    {
                      measurement.site.distance = distanceInMeters,
                      nearestMeasurements.add(measurement)
                    }
                },
              if (nearestMeasurements.isNotEmpty)
                {
                  nearestMeasurement = nearestMeasurements.first,
                  for (var m in nearestMeasurements)
                    {
                      if (nearestMeasurement!.site.distance > m.site.distance)
                        {nearestMeasurement = m}
                    }
                }
            });

        await getLocation().then((value) => {
              _dbHelper.getLatestMeasurements().then((measurements) => {
                    if (location.longitude != null && location.latitude != null)
                      {
                        for (var measurement in measurements)
                          {
                            distanceInMeters = metersToKmDouble(
                                Geolocator.distanceBetween(
                                    measurement.site.latitude,
                                    measurement.site.longitude,
                                    location.latitude!,
                                    location.longitude!)),
                            if (distanceInMeters <
                                AppConfig.maxSearchRadius.toDouble())
                              {
                                measurement.site.distance = distanceInMeters,
                                nearestMeasurements.add(measurement)
                              }
                          },
                        if (nearestMeasurements.isNotEmpty)
                          {
                            nearestMeasurement = nearestMeasurements.first,
                            for (var m in nearestMeasurements)
                              {
                                if (nearestMeasurement!.site.distance >
                                    m.site.distance)
                                  {nearestMeasurement = m}
                              }
                          }
                      }
                  })
            });
      }

      return nearestMeasurement;
    } catch (e) {
      debugPrint('error $e');
      return null;
    }
  }

  Future<Position> getLocationUsingGeoLocator() async {
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

  Future<Site?> getNearestSite(double latitude, double longitude) async {
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
    } catch (e) {
      debugPrint('error $e');
      return null;
    }
  }

  Future<List<Measurement>> getNearestSites(
      double latitude, double longitude) async {
    var nearestSites = <Measurement>[];
    double distanceInMeters;

    var latestMeasurements = await _dbHelper.getLatestMeasurements();

    for (var measurement in latestMeasurements) {
      distanceInMeters = metersToKmDouble(Geolocator.distanceBetween(
          measurement.site.latitude,
          measurement.site.longitude,
          latitude,
          longitude));
      if (distanceInMeters < AppConfig.maxSearchRadius.toDouble()) {
        measurement.site.distance = distanceInMeters;
        nearestSites.add(measurement);
      }
    }

    return nearestSites;
  }

  // Future<bool> requestLocationAccess() async {
  //   try {
  //     var status = await location.requestPermission();
  //     var id = _customAuth.getId();
  //     if (id != '') {
  //       await _cloudStore.updatePreferenceFields(
  //           id, 'location', status == PermissionStatus.granted, 'bool');
  //     }
  //     return status == PermissionStatus.granted;
  //   } catch (e) {
  //     debugPrint(e.toString());
  //   }
  //   return false;
  // }

  Future<bool> requestLocationAccess() async {
    try {
      var status = await Geolocator.requestPermission();
      return !(status == LocationPermission.denied);
    } catch (e) {
      debugPrint(e.toString());
    }
    return false;
  }

  Future<bool> revokePermission() async {
    // TODO: implement revoke permission

    var id = _customAuth.getId();

    if (id != '') {
      await _cloudStore.updatePreferenceFields(id, 'location', false, 'bool');
    }
    return false;
  }

  Future<List<Measurement>> searchNearestSites(
      double latitude, double longitude, String term) async {
    var nearestSites = <Measurement>[];
    double distanceInMeters;

    var latestMeasurements = await _dbHelper.getLatestMeasurements();

    for (var measurement in latestMeasurements) {
      distanceInMeters = metersToKmDouble(Geolocator.distanceBetween(
          measurement.site.latitude,
          measurement.site.longitude,
          latitude,
          longitude));
      if (containsWord(measurement.site.getName(), term)) {
        measurement.site.distance = distanceInMeters;
        nearestSites.add(measurement);
      } else {
        if (distanceInMeters < AppConfig.maxSearchRadius.toDouble()) {
          measurement.site.distance = distanceInMeters;
          nearestSites.add(measurement);
        }
      }
    }

    return nearestSites;
  }

  List<Measurement> textSearchNearestSites(
      String term, List<Measurement> measurements) {
    var nearestSites = <Measurement>[];

    for (var measurement in measurements) {
      if (measurement.site
              .getName()
              .trim()
              .toLowerCase()
              .contains(term.trim().toLowerCase()) ||
          measurement.site
              .getLocation()
              .trim()
              .toLowerCase()
              .contains(term.trim().toLowerCase())) {
        nearestSites.add(measurement);
      }
    }
    return nearestSites;
  }

  Future<List<Measurement>> textSearchNearestSitesV1(String term) async {
    var nearestSites = <Measurement>[];

    var latestMeasurements = await _dbHelper.getLatestMeasurements();

    for (var measurement in latestMeasurements) {
      if (measurement.site
              .getName()
              .trim()
              .toLowerCase()
              .contains(term.trim().toLowerCase()) ||
          measurement.site
              .getLocation()
              .trim()
              .toLowerCase()
              .contains(term.trim().toLowerCase())) {
        nearestSites.add(measurement);
      }
    }
    return nearestSites;
  }
}
