import 'package:app/models/air_quality_reading.dart';
import 'package:intl/intl.dart';

import 'database.dart';

class WidgetData {
  const WidgetData({
    required this.location,
    required this.circular_location,
    required this.date,
    required this.circular_date,
    required this.pm_value,
    required this.circular_pm_value,
    required this.forecast_value1,
    required this.forecast_time1,
    required this.forecast_value2,
    required this.forecast_time2,
    required this.forecast_value3,
    required this.forecast_time3,
  });

  final String location;
  final String circular_location;
  final String date;
  final String circular_date;
  final String pm_value;
  final String circular_pm_value;
  final String forecast_value1;
  final String forecast_time1;
  final String forecast_value2;
  final String forecast_time2;
  final String forecast_value3;
  final String forecast_time3;

  factory WidgetData.initializeFromAirQualityReading(
      AirQualityReading airQualityReading) {
    return WidgetData(
      location: airQualityReading.name,
      circular_location: airQualityReading.name,
      date: DateFormat('dd/MM, h:mm a').format(DateTime.now().toLocal()),
      circular_date: DateFormat('h:mm a').format(DateTime.now().toLocal()),
      pm_value: airQualityReading.pm2_5.toInt().toString(),
      circular_pm_value: airQualityReading.pm2_5.toInt().toString(),
      forecast_value1: '',
      forecast_time1: '',
      forecast_value2: '',
      forecast_time2: '',
      forecast_value3: '',
      forecast_time3: '',
    );
  }

  WidgetData copyWith(List<ForecastInsight> forecast) {
    if (forecast.length < 2) {
      return this;
    }
    List<ForecastInsight> widgetForecast = forecast.take(3).toList();

    return WidgetData(
      location: location,
      circular_location: circular_location,
      date: date,
      circular_date: circular_date,
      pm_value: pm_value,
      circular_pm_value: circular_pm_value,
      forecast_value1: widgetForecast.first.pm2_5.toInt().toString(),
      forecast_time1: DateFormat('h a').format(widgetForecast.first.time),
      forecast_value2: widgetForecast[1].pm2_5.toInt().toString(),
      forecast_time2: DateFormat('h a').format(widgetForecast[1].time),
      forecast_value3: widgetForecast.last.pm2_5.toInt().toString(),
      forecast_time3: DateFormat('h a').format(widgetForecast.last.time),
    );
  }

  Map<String, String> idMapping() {
    return {
      'location': location,
      'circular_location': circular_location,
      'date': date,
      'circular_date': circular_date,
      'pm_value': pm_value,
      'circular_pm_value': circular_pm_value,
      'forecast_value1': forecast_value1,
      'forecast_time1': forecast_time1,
      'forecast_value2': forecast_value2,
      'forecast_time2': forecast_time2,
      'forecast_value3': forecast_value3,
      'forecast_time3': forecast_time3,
    };
  }
}
