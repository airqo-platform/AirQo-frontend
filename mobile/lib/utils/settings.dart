import 'package:app/constants/app_constants.dart';
import 'package:app/models/measurement.dart';
import 'package:app/services/local_storage.dart';
import 'package:app/services/native_api.dart';
import 'package:flutter/material.dart';
import 'package:shared_preferences/shared_preferences.dart';

class Settings {
  final DBHelper _dbHelper = DBHelper();
  final LocationService _locationService = LocationService();

  Future<Measurement?> dashboardMeasurement() async {
    try {
      var prefs = await SharedPreferences.getInstance();
      var dashboardMeasurement =
          prefs.getString(PrefConstant.dashboardSite) ?? '';

      if (dashboardMeasurement != '') {
        return await _dbHelper.getMeasurement(dashboardMeasurement);
      }

      var lastKnown = prefs.getStringList(PrefConstant.lastKnownLocation);

      if (lastKnown != null && lastKnown.length >= 2) {
        var locationName = lastKnown.first;
        var measurement = await _dbHelper.getMeasurement(lastKnown.last);
        if (measurement != null) {
          measurement.site.userLocation = locationName;
          return measurement;
        }
      }

      return _defaultLocation();
    } catch (e) {
      debugPrint(e.toString());
      return null;
    }
  }

  Future<Measurement?> _defaultLocation() async {
    var address = await _locationService
        .getAddress(AppConfig.defaultLatitude, AppConfig.defaultLongitude);

    var measurement = await _dbHelper.getNearestMeasurement(
        AppConfig.defaultLatitude, AppConfig.defaultLongitude);

    if (measurement == null) {
      return null;
    }

    measurement.site.userLocation = address.thoroughfare;

    return measurement;
  }
}
