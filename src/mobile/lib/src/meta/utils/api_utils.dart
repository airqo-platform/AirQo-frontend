import 'package:flutter_dotenv/flutter_dotenv.dart';

class ApiUtils {
  const ApiUtils._();

  static const String mobileUserAgent = 'AirQo-Mobile/3.0 (Flutter)';

  static String baseUrl =
      dotenv.env['AIRQO_API_URL'] ?? "http://localhost:3001";

  /// Latest reading per site within the backend lookback window. Backs both
  /// Near You and the map screen; not the separate /readings/map endpoint.
  static String recentReadings = "/api/v2/devices/readings/recent";

  static String sitesSearch = "/api/v2/devices/sites/summary";

  static String nearestSites = "/api/v2/devices/sites/nearest";

  static String learnCatalog = "/api/v2/devices/learn/catalog";

  static String learnSessions = "/api/v2/devices/learn/sessions/anonymous";

  static String learnProgress = "/api/v2/devices/learn/progress/lessons";

  static String learnProgressFetch = "/api/v2/devices/learn/progress";

  static String learnProgressSync = "/api/v2/devices/learn/progress/sync";

  static String learnProgressLink = "/api/v2/devices/learn/progress/link";

  static String fetchDailyForecasts = "/api/v2/predict/daily-forecasting";

  static String fetchHourlyForecasts = "/api/v2/predict/hourly-forecasting";

  static String fetchCountries = "/api/v2/devices/grids/countries";
}
