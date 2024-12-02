class ForecastResponse {
    List<Forecast> forecasts;

    ForecastResponse({
        required this.forecasts,
    });

    factory ForecastResponse.fromJson(Map<String, dynamic> json) => ForecastResponse(
        forecasts: List<Forecast>.from(json["forecasts"].map((x) => Forecast.fromJson(x))),
    );

    Map<String, dynamic> toJson() => {
        "forecasts": List<dynamic>.from(forecasts.map((x) => x.toJson())),
    };
}

class Forecast {
    double pm25;
    DateTime time;

    Forecast({
        required this.pm25,
        required this.time,
    });

    factory Forecast.fromJson(Map<String, dynamic> json) => Forecast(
        pm25: json["pm2_5"]?.toDouble(),
        time: DateTime.parse(json["time"]),
    );

    Map<String, dynamic> toJson() => {
        "pm2_5": pm25,
        "time": time.toIso8601String(),
    };
}
