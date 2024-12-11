import 'package:airqo/src/app/dashboard/models/airquality_response.dart';
class ForecastResponse {
  List<Forecast> forecasts;

  ForecastResponse({
    required this.forecasts,
  });

  factory ForecastResponse.fromJson(Map<String, dynamic> json) =>
      ForecastResponse(
        forecasts: List<Forecast>.from(
            json["forecasts"].map((x) => Forecast.fromJson(x))),
      );

  Map<String, dynamic> toJson() => {
        "forecasts": List<dynamic>.from(forecasts.map((x) => x.toJson())),
      };
}

class Forecast {
  Measurement measurement;
  double pm25;
  DateTime time;

  Forecast({
    required this.measurement,
    required this.pm25,
    required this.time,
  });

  factory Forecast.fromJson(Map<String, dynamic> json) => Forecast(
        measurement: Measurement.fromJson(json["measurement"]),
        pm25: json["pm2_5"]?.toDouble(),
        time: DateTime.parse(json["time"]),
      );

  Map<String, dynamic> toJson() => {
        "pm2_5": pm25,
        "time": time.toIso8601String(),
      };
}
