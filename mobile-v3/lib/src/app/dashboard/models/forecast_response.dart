class ForecastResponse {
  Map<String, AqiRange> aqiRanges;
  List<Forecast> forecasts;

  ForecastResponse({
    required this.aqiRanges,
    required this.forecasts,
  });

  factory ForecastResponse.fromJson(Map<String, dynamic> json) =>
      ForecastResponse(
        aqiRanges: Map<String, AqiRange>.from(json["aqi_ranges"].map((key, value) => MapEntry(key, AqiRange.fromJson(value)))),

        forecasts: List<Forecast>.from(json["forecasts"].map((x) => Forecast.fromJson(x))),
      );

  Map<String, dynamic> toJson() => {
        "forecasts": List<dynamic>.from(forecasts.map((x) => x.toJson())),
      };
}

class AqiRange {
  final String aqiCategory;
  final String aqiColor;
  final String aqiColorName;
  final String label;
  final double? max;
  final double min;

  AqiRange({
    required this.aqiCategory,
    required this.aqiColor,
    required this.aqiColorName,
    required this.label,
    required this.max,
    required this.min,
  });

  factory AqiRange.fromJson(Map<String, dynamic> json) {
    return AqiRange(
      aqiCategory: json['aqi_category'],
      aqiColor: json['aqi_color'],
      aqiColorName: json['aqi_color_name'],
      label: json['label'],
      max: json['max'] != null ? json['max'].toDouble() : null,
      min: json['min'].toDouble(),
    );
  }
}

class Forecast {
  final String aqiCategory;
  final String aqiColor;
  final String aqiColorName;
  final double pm25;
  final DateTime time;

  Forecast({
    required this.aqiCategory,
    required this.aqiColor,
    required this.aqiColorName,
    required this.pm25,
    required this.time,
  });

  factory Forecast.fromJson(Map<String, dynamic> json) => Forecast(
        aqiCategory: json["aqi_category"],  
        aqiColor: json["aqi_color"],
        aqiColorName: json["aqi_color_name"],
        pm25: json["pm2_5"]?.toDouble(), 
        time: DateTime.parse(json["time"]),
      );

  Map<String, dynamic> toJson() => {
        "pm2_5": pm25,
        "time": time.toIso8601String(),
      };
}
