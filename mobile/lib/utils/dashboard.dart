import 'package:app/constants/config.dart';
import 'package:app/models/enum_constants.dart';
import 'package:app/utils/extensions.dart';
import 'package:shared_preferences/shared_preferences.dart';

Region getNextDashboardRegion(SharedPreferences sharedPreferences) {
  var currentRegion = getRegionConstant(
      sharedPreferences.getString(Config.prefDashboardRegion) ?? '');

  if (currentRegion == Region.central) {
    sharedPreferences.setString(
        Config.prefDashboardRegion, Region.eastern.getName());
    return Region.eastern;
  } else if (currentRegion == Region.eastern) {
    sharedPreferences.setString(
        Config.prefDashboardRegion, Region.western.getName());
    return Region.western;
  } else if (currentRegion == Region.western) {
    sharedPreferences.setString(
        Config.prefDashboardRegion, Region.central.getName());
    return Region.central;
  } else {
    sharedPreferences.setString(
        Config.prefDashboardRegion, Region.central.getName());
    return Region.central;
  }
}
