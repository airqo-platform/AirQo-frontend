class ForecastMet {
  final double? airTemperature;
  final double? relativeHumidity;
  final double? windSpeed;
  final double? windFromDirection;
  final String? windDirectionCompass;
  final double? precipitationAmount;
  final double? cloudAreaFraction;
  final double? airPressureAtSeaLevel;

  const ForecastMet({
    this.airTemperature,
    this.relativeHumidity,
    this.windSpeed,
    this.windFromDirection,
    this.windDirectionCompass,
    this.precipitationAmount,
    this.cloudAreaFraction,
    this.airPressureAtSeaLevel,
  });

  factory ForecastMet.fromJson(Map<String, dynamic> json) => ForecastMet(
        airTemperature: json['air_temperature']?.toDouble(),
        relativeHumidity: json['relative_humidity']?.toDouble(),
        windSpeed: json['wind_speed']?.toDouble(),
        windFromDirection: json['wind_from_direction']?.toDouble(),
        windDirectionCompass: json['wind_direction_compass'] as String?,
        precipitationAmount: json['precipitation_amount']?.toDouble(),
        cloudAreaFraction: json['cloud_area_fraction']?.toDouble(),
        airPressureAtSeaLevel:
            json['air_pressure_at_sea_level']?.toDouble(),
      );

  Map<String, dynamic> toJson() => {
        if (airTemperature != null) 'air_temperature': airTemperature,
        if (relativeHumidity != null) 'relative_humidity': relativeHumidity,
        if (windSpeed != null) 'wind_speed': windSpeed,
        if (windFromDirection != null) 'wind_from_direction': windFromDirection,
        if (windDirectionCompass != null)
          'wind_direction_compass': windDirectionCompass,
        if (precipitationAmount != null)
          'precipitation_amount': precipitationAmount,
        if (cloudAreaFraction != null) 'cloud_area_fraction': cloudAreaFraction,
        if (airPressureAtSeaLevel != null)
          'air_pressure_at_sea_level': airPressureAtSeaLevel,
      };
}

class Forecast {
  final String aqiCategory;
  final String aqiColor;
  final String aqiColorName;
  final String? aqiLabel;
  final String? trendMessage;
  final double pm25;
  final double? pm25Low;
  final double? pm25High;
  final DateTime time;
  final double? forecastConfidence;
  final ForecastMet? met;

  const Forecast({
    required this.aqiCategory,
    required this.aqiColor,
    required this.aqiColorName,
    required this.pm25,
    required this.time,
    this.aqiLabel,
    this.trendMessage,
    this.pm25Low,
    this.pm25High,
    this.forecastConfidence,
    this.met,
  });

  factory Forecast.fromJson(Map<String, dynamic> json) {
    final aqi = json['aqi'] as Map<String, dynamic>? ?? {};
    final forecast = json['forecast'] as Map<String, dynamic>? ?? {};
    return Forecast(
      aqiCategory: aqi['aqi_category'] as String? ?? 'Unavailable',
      aqiColor: aqi['aqi_color'] as String? ?? '#9E9E9E',
      aqiColorName: aqi['aqi_color_name'] as String? ?? 'Grey',
      aqiLabel: aqi['label'] as String?,
      trendMessage: aqi['trend_message'] as String?,
      pm25: (forecast['pm2_5_mean'] ?? 0.0).toDouble(),
      pm25Low: forecast['pm2_5_low']?.toDouble(),
      pm25High: forecast['pm2_5_high']?.toDouble(),
      time: DateTime.tryParse(json['date'] as String? ?? '') ??
          DateTime.fromMillisecondsSinceEpoch(0),
      forecastConfidence: forecast['forecast_confidence']?.toDouble(),
      met: json['met'] != null
          ? ForecastMet.fromJson(json['met'] as Map<String, dynamic>)
          : null,
    );
  }

  Map<String, dynamic> toJson() => {
        'date': time.toIso8601String(),
        'forecast': {
          'pm2_5_mean': pm25,
          if (pm25Low != null) 'pm2_5_low': pm25Low,
          if (pm25High != null) 'pm2_5_high': pm25High,
          if (forecastConfidence != null)
            'forecast_confidence': forecastConfidence,
        },
        'aqi': {
          'aqi_category': aqiCategory,
          'aqi_color': aqiColor,
          'aqi_color_name': aqiColorName,
          if (aqiLabel != null) 'label': aqiLabel,
          if (trendMessage != null) 'trend_message': trendMessage,
        },
        if (met != null) 'met': met!.toJson(),
      };
}

class ForecastResponse {
  final List<Forecast> forecasts;

  const ForecastResponse({required this.forecasts});

  factory ForecastResponse.fromJson(Map<String, dynamic> json) {
    final data = json['data'] as Map<String, dynamic>?;
    if (data == null) return const ForecastResponse(forecasts: []);

    final siteForecastsList = data['forecasts'] as List?;
    if (siteForecastsList == null || siteForecastsList.isEmpty) {
      return const ForecastResponse(forecasts: []);
    }

    final siteData = siteForecastsList[0] as Map<String, dynamic>;
    final entries = (siteData['forecasts'] as List?) ?? [];
    return ForecastResponse(
      forecasts: entries
          .map((e) => Forecast.fromJson(e as Map<String, dynamic>))
          .toList(),
    );
  }

  Map<String, dynamic> toJson() => {
        'data': {
          'forecasts': [
            {'forecasts': forecasts.map((f) => f.toJson()).toList()},
          ],
        },
      };
}

class HourlyForecastEntry {
  final DateTime time;
  final double pm25Mean;
  final double? pm25Q10;
  final double? pm25Q90;
  final double? forecastConfidence;
  final String aqiCategory;
  final String aqiColor;
  final String? aqiLabel;
  final String? trendMessage;
  final ForecastMet? met;

  const HourlyForecastEntry({
    required this.time,
    required this.pm25Mean,
    required this.aqiCategory,
    required this.aqiColor,
    this.pm25Q10,
    this.pm25Q90,
    this.forecastConfidence,
    this.aqiLabel,
    this.trendMessage,
    this.met,
  });

  factory HourlyForecastEntry.fromJson(Map<String, dynamic> json) {
    final aqi = json['aqi'] as Map<String, dynamic>? ?? {};
    final forecast = json['forecast'] as Map<String, dynamic>? ?? {};
    return HourlyForecastEntry(
      time: DateTime.tryParse(json['timestamp'] as String? ?? '') ??
          DateTime.fromMillisecondsSinceEpoch(0),
      pm25Mean: (forecast['pm2_5_mean'] ?? 0.0).toDouble(),
      pm25Q10: forecast['pm2_5_q10']?.toDouble(),
      pm25Q90: forecast['pm2_5_q90']?.toDouble(),
      forecastConfidence: forecast['forecast_confidence']?.toDouble(),
      aqiCategory: aqi['aqi_category'] as String? ?? 'Unavailable',
      aqiColor: aqi['aqi_color'] as String? ?? '#9E9E9E',
      aqiLabel: aqi['label'] as String?,
      trendMessage: aqi['trend_message'] as String?,
      met: json['met'] != null
          ? ForecastMet.fromJson(json['met'] as Map<String, dynamic>)
          : null,
    );
  }

  Map<String, dynamic> toJson() => {
        'timestamp': time.toIso8601String(),
        'forecast': {
          'pm2_5_mean': pm25Mean,
          if (pm25Q10 != null) 'pm2_5_q10': pm25Q10,
          if (pm25Q90 != null) 'pm2_5_q90': pm25Q90,
          if (forecastConfidence != null)
            'forecast_confidence': forecastConfidence,
        },
        'aqi': {
          'aqi_category': aqiCategory,
          'aqi_color': aqiColor,
          if (aqiLabel != null) 'label': aqiLabel,
          if (trendMessage != null) 'trend_message': trendMessage,
        },
        if (met != null) 'met': met!.toJson(),
      };
}

class HourlyForecastResponse {
  final List<HourlyForecastEntry> forecasts;

  const HourlyForecastResponse({required this.forecasts});

  factory HourlyForecastResponse.fromJson(Map<String, dynamic> json) {
    final data = json['data'] as Map<String, dynamic>?;
    if (data == null) return const HourlyForecastResponse(forecasts: []);

    final siteForecastsList = data['forecasts'] as List?;
    if (siteForecastsList == null || siteForecastsList.isEmpty) {
      return const HourlyForecastResponse(forecasts: []);
    }

    final siteData = siteForecastsList[0] as Map<String, dynamic>;
    final entries = (siteData['forecasts'] as List?) ?? [];
    return HourlyForecastResponse(
      forecasts: entries
          .map((e) =>
              HourlyForecastEntry.fromJson(e as Map<String, dynamic>))
          .toList(),
    );
  }

  Map<String, dynamic> toJson() => {
        'data': {
          'forecasts': [
            {'forecasts': forecasts.map((f) => f.toJson()).toList()},
          ],
        },
      };
}
