import 'package:app/constants/app_constants.dart';
import 'package:app/models/measurement.dart';
import 'package:app/services/local_storage.dart';
import 'package:app/services/native_api.dart';
import 'package:shared_preferences/shared_preferences.dart';

class Settings {
  DBHelper db = DBHelper();

  Future<Measurement?> dashboardMeasurement() async {
    try {
      var prefs = await SharedPreferences.getInstance();
      var dashboardMeasurement =
          prefs.getString(PrefConstant.dashboardSite) ?? '';

      if (dashboardMeasurement != '') {
        return await db.getMeasurement(dashboardMeasurement);
      }

      var lastKnown = prefs.getStringList(PrefConstant.lastKnownLocation);

      if (lastKnown != null && lastKnown.length >= 2) {
        var locationName = lastKnown.first;
        var measurement = await db.getMeasurement(lastKnown.last);
        if (measurement != null) {
          measurement.site.userLocation = locationName;
          return measurement;
        }
      }

      return _defaultLocation();
    } catch (e) {
      print(e);
      return null;
    }

    // if(lastKnown == null){
    //   return _defaultLocation();
    // }
    //
    // var measurement = await db.getMeasurement(lastKnown.last);
    //
    // if(measurement == null){
    //   return null;
    // }
    //
    // measurement.site.userLocation = lastKnown.first;
    // return measurement;
  }

  Future<Measurement?> _defaultLocation() async {
    var address = await LocationApi()
        .getAddress(AppConfig.defaultLatitude, AppConfig.defaultLongitude);

    var measurement = await db.getNearestMeasurement(
        AppConfig.defaultLatitude, AppConfig.defaultLongitude);

    if (measurement == null) {
      return null;
    }

    measurement.site.userLocation = address.thoroughfare;

    return measurement;
  }
}
