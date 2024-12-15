// To parse this JSON data, do
//
//     final forecastResponse = forecastResponseFromJson(jsonString);

import 'dart:convert';

ForecastResponse forecastResponseFromJson(String str) => ForecastResponse.fromJson(json.decode(str));

String forecastResponseToJson(ForecastResponse data) => json.encode(data.toJson());

class ForecastResponse {
    final List<Forecast> forecasts;

    ForecastResponse({
      required  this.forecasts,
    });

    factory ForecastResponse.fromJson(Map<String, dynamic> json) => ForecastResponse(
        forecasts: json["forecasts"] == null ? [] : List<Forecast>.from(json["forecasts"]!.map((x) => Forecast.fromJson(x))),
    );

    Map<String, dynamic> toJson() => {
        "forecasts":  List<dynamic>.from(forecasts.map((x) => x.toJson())),
    };
}

class Forecast {
    final double? pm25;
    final DateTime? time;

    Forecast({
        this.pm25,
        this.time,
    });

    factory Forecast.fromJson(Map<String, dynamic> json) => Forecast(
        pm25: json["pm2_5"]?.toDouble(),
        time: json["time"] == null ? null : DateTime.parse(json["time"]),
    );

    Map<String, dynamic> toJson() => {
        "pm2_5": pm25,
        "time": time?.toIso8601String(),
    };
}
