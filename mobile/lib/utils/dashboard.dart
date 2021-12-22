import 'package:app/constants/config.dart';
import 'package:app/utils/string_extension.dart';
import 'package:shared_preferences/shared_preferences.dart';

String getNextDashboardRegion(SharedPreferences sharedPreferences) {
  var currentRegion = sharedPreferences.getString(Config.prefDashboardRegion);

  if (currentRegion == null) {
    sharedPreferences.setString(Config.prefDashboardRegion, 'Central Region');
    return 'Central Region';
  }

  if (currentRegion.equalsIgnoreCase('central region')) {
    sharedPreferences.setString(Config.prefDashboardRegion, 'Eastern Region');
    return 'Eastern Region';
  } else if (currentRegion.equalsIgnoreCase('eastern region')) {
    sharedPreferences.setString(Config.prefDashboardRegion, 'Western Region');
    return 'Western Region';
  } else if (currentRegion.equalsIgnoreCase('western region')) {
    sharedPreferences.setString(Config.prefDashboardRegion, 'Central Region');
    return 'Central Region';
  } else {
    sharedPreferences.setString(Config.prefDashboardRegion, 'Central Region');
    return 'Central Region';
  }
}
