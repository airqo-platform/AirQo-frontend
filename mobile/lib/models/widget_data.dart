import 'package:app/models/air_quality_reading.dart';
import 'package:intl/intl.dart';

import 'database.dart';

class WidgetData {
  const WidgetData({
    required this.location,
    required this.circularLocation,
    required this.date,
    required this.circularDate,
    required this.pmValue,
    required this.circularPmValue,
    required this.forecastValue1,
    required this.forecastTime1,
    required this.forecastValue2,
    required this.forecastTime2,
    required this.forecastValue3,
    required this.forecastTime3,
  });

  final String location;
  final String circularLocation;
  final String date;
  final String circularDate;
  final String pmValue;
  final String circularPmValue;
  final String forecastValue1;
  final String forecastTime1;
  final String forecastValue2;
  final String forecastTime2;
  final String forecastValue3;
  final String forecastTime3;

  factory WidgetData.initializeFromAirQualityReading(
      AirQualityReading airQualityReading) {
    return WidgetData(
      location: airQualityReading.name,
      circularLocation: airQualityReading.name,
      date: DateFormat('dd/MM, h:mm a').format(DateTime.now().toLocal()),
      circularDate: DateFormat('h:mm a').format(DateTime.now().toLocal()),
      pmValue: airQualityReading.pm2_5.toInt().toString(),
      circularPmValue: airQualityReading.pm2_5.toInt().toString(),
      forecastValue1: '',
      forecastTime1: '',
      forecastValue2: '',
      forecastTime2: '',
      forecastValue3: '',
      forecastTime3: '',
    );
  }

  WidgetData copyWith(List<ForecastInsight> forecast) {
    if (forecast.length < 2) {
      return this;
    }
    List<ForecastInsight> widgetForecast = forecast.take(3).toList();

    return WidgetData(
      location: location,
      circularLocation: circularLocation,
      date: date,
      circularDate: circularDate,
      pmValue: pmValue,
      circularPmValue: circularPmValue,
      forecastValue1: widgetForecast.first.pm2_5.toInt().toString(),
      forecastTime1: DateFormat('h a').format(widgetForecast.first.time),
      forecastValue2: widgetForecast[1].pm2_5.toInt().toString(),
      forecastTime2: DateFormat('h a').format(widgetForecast[1].time),
      forecastValue3: widgetForecast.last.pm2_5.toInt().toString(),
      forecastTime3: DateFormat('h a').format(widgetForecast.last.time),
    );
  }

  Map<String, String> idMapping() {
    return {
      'location': location,
      'circular_location': circularLocation,
      'date': date,
      'circular_date': circularDate,
      'pm_value': pmValue,
      'circular_pm_value': circularPmValue,
      'forecastValue1': forecastValue1,
      'forecastTime1': forecastTime1,
      'forecastValue2': forecastValue2,
      'forecastTime2': forecastTime2,
      'forecastValue3': forecastValue3,
      'forecastTime3': forecastTime3,
    };
  }
}
