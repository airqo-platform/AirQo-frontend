import 'package:app/constants/app_constants.dart';
import 'package:app/models/measurement.dart';
import 'package:app/services/local_storage.dart';
import 'package:app/utils/distance.dart';
import 'package:geocoder/geocoder.dart';
import 'package:geolocator/geolocator.dart';
import 'package:location/location.dart';

class LocationApi {
  Location location = Location();

  Future<Address> getAddress(double lat, double lng) async {
    var addresses = await getAddressGoogle(lat, lng);
    if (addresses.isEmpty) {
      addresses = await getLocalAddress(lat, lng);
    }
    return addresses.first;
  }

  Future<List<Address>> getAddressGoogle(double lat, double lang) async {
    final coordinates = Coordinates(lat, lang);
    List<Address> googleAddresses =
        await Geocoder.google(AppConfig.googleApiKey)
            .findAddressesFromCoordinates(coordinates);
    return googleAddresses;
  }

  Future<List<Address>> getLocalAddress(double lat, double lang) async {
    final coordinates = Coordinates(lat, lang);
    List<Address> localAddresses =
        await Geocoder.local.findAddressesFromCoordinates(coordinates);
    return localAddresses;
  }

  Future<LocationData> getLocation() async {
    bool _serviceEnabled;
    PermissionStatus _permissionGranted;

    _serviceEnabled = await location.serviceEnabled();
    if (!_serviceEnabled) {
      _serviceEnabled = await location.requestService();
      if (!_serviceEnabled) {
        throw Exception('Location not enabled');
      }
    }

    _permissionGranted = await location.hasPermission();
    if (_permissionGranted == PermissionStatus.denied) {
      _permissionGranted = await location.requestPermission();
      if (_permissionGranted != PermissionStatus.granted) {
        throw Exception('Location denied');
      }
    }

    // await location.changeSettings(accuracy: LocationAccuracy.balanced);
    // await location.enableBackgroundMode(enable: true);
    // location.onLocationChanged.listen((LocationData locationData) {
    //   print('${locationData.longitude} : ${locationData.longitude}');
    // });

    var _locationData = await location.getLocation();
    return _locationData;
  }

  Future<Measurement?> getLocationMeasurement() async {
    try {
      var nearestMeasurement;
      var nearestMeasurements = <Measurement>[];

      double distanceInMeters;

      var location = await LocationApi().getLocation();
      if (location.longitude != null && location.latitude != null) {
        var latitude = location.latitude;
        var longitude = location.longitude;
        var addresses =
            await LocationApi().getAddressGoogle(latitude!, longitude!);
        var userAddress = addresses.first;

        await DBHelper().getLatestMeasurements().then((measurements) => {
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
                      // print('$distanceInMeters : '
                      //     '${AppConfig.maxSearchRadius.toDouble()} : '
                      //     '${measurement.site.getName()}'),
                      measurement.site.distance = distanceInMeters,
                      measurement.site.userLocation = userAddress.thoroughfare,
                      nearestMeasurements.add(measurement)
                    }
                },
              if (nearestMeasurements.isNotEmpty)
                {
                  nearestMeasurement = nearestMeasurements.first,
                  for (var m in nearestMeasurements)
                    {
                      if (nearestMeasurement.site.distance > m.site.distance)
                        {nearestMeasurement = m}
                    }
                }
            });

        await LocationApi().getLocation().then((value) => {
              DBHelper().getLatestMeasurements().then((measurements) => {
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
                                // print('$distanceInMeters : '
                                //     '${AppConfig.maxSearchRadius.toDouble()} : '
                                //     '${measurement.site.getName()}'),
                                measurement.site.distance = distanceInMeters,
                                nearestMeasurements.add(measurement)
                              }
                          },
                        if (nearestMeasurements.isNotEmpty)
                          {
                            nearestMeasurement = nearestMeasurements.first,
                            for (var m in nearestMeasurements)
                              {
                                if (nearestMeasurement.site.distance >
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
      print('error $e');
      return null;
    }
  }
}
