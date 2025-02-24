import 'package:flutter_dotenv/flutter_dotenv.dart';

class ApiUtils {
  const ApiUtils._();

  static String baseUrl =
      dotenv.env['AIRQO_API_URL'] ?? "http://localhost:3001";

  static String map = "/api/v2/devices/readings/map";

  static String fetchLessons = "/api/v2/devices/kya/lessons";

  static String fetchForecasts = "/api/v2/predict/daily-forecast";
}
