import 'package:app/constants/app_constants.dart';
import 'package:geocoder/geocoder.dart';
import 'package:location/location.dart';

class LocationApi {
  Location location = Location();

  Future<List<Address>> getAddress(double lat, double lang) async {
    final coordinates = Coordinates(lat, lang);
    List<Address> localAddresses =
        await Geocoder.local.findAddressesFromCoordinates(coordinates);
    return localAddresses;
  }

  Future<List<Address>> getAddressGoogle(double lat, double lang) async {
    final coordinates = Coordinates(lat, lang);
    List<Address> googleAddresses =
        await Geocoder.google(AppConfig.googleApiKey)
            .findAddressesFromCoordinates(coordinates);
    return googleAddresses;
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

    await location.changeSettings(accuracy: LocationAccuracy.balanced);
    await location.enableBackgroundMode(enable: true);
    location.onLocationChanged.listen((LocationData locationData) {
      print('${locationData.longitude} : ${locationData.longitude}');
    });

    var _locationData = await location.getLocation();
    return _locationData;
  }
}
