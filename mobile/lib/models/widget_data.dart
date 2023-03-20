import 'package:app/models/air_quality_reading.dart';
import 'package:intl/intl.dart';

import 'database.dart';
import 'enum_constants.dart';

class WidgetData {
  const WidgetData({
    required this.location,
    required this.circularLocation,
    required this.date,
    required this.circularDate,
    required this.pmValue,
    required this.airQuality,
    required this.circularPmValue,
    // required this.forecastValue1,
    // required this.forecastTime1,
    // required this.forecastValue2,
    // required this.forecastTime2,
    // required this.forecastValue3,
    // required this.forecastTime3,
  });

  final String location;
  final String circularLocation;
  final String date;
  final String circularDate;
  final double pmValue;
  final AirQuality airQuality;
  final double circularPmValue;

  // final String forecastValue1;
  // final String forecastTime1;
  // final String forecastValue2;
  // final String forecastTime2;
  // final String forecastValue3;
  // final String forecastTime3;

  factory WidgetData.initializeFromAirQualityReading(
    AirQualityReading airQualityReading,
  ) {
    return WidgetData(
      location: airQualityReading.name,
      circularLocation: airQualityReading.name,
      airQuality: Pollutant.pm2_5.airQuality(airQualityReading.pm2_5),
      date: DateFormat('dd/MM, h:mm a').format(DateTime.now().toLocal()),
      circularDate: DateFormat('h:mm a').format(DateTime.now().toLocal()),
      pmValue: airQualityReading.pm2_5,
      circularPmValue: airQualityReading.pm2_5,
      // forecastValue1: '',
      // forecastTime1: '',
      // forecastValue2: '',
      // forecastTime2: '',
      // forecastValue3: '',
      // forecastTime3: '',
    );
  }

  WidgetData copyWith() {
    // if (forecast.length < 2) {
    // return this;
    // }
    // List<ForecastInsight> widgetForecast = forecast.take(3).toList();

    return WidgetData(
      location: location,
      circularLocation: circularLocation,
      date: date,
      circularDate: circularDate,
      pmValue: pmValue,
      airQuality: Pollutant.pm2_5.airQuality(pmValue),
      circularPmValue: circularPmValue,
      referenceSite: referenceSite,

      // forecastValue1: widgetForecast.first.pm2_5.toInt().toString(),
      // forecastTime1: DateFormat('h a').format(widgetForecast.first.time),
      // forecastValue2: widgetForecast[1].pm2_5.toInt().toString(),
      // forecastTime2: DateFormat('h a').format(widgetForecast[1].time),
      // forecastValue3: widgetForecast.last.pm2_5.toInt().toString(),
      // forecastTime3: DateFormat('h a').format(widgetForecast.last.time),
    );
  }

  Map<String, String> idMapping() {
    return {
      'location': location,
      'circular_location': circularLocation,
      'date': date,
      'circular_date': circularDate,
      'pm_value': pmValue.toInt().toString(),
      'air_quality': airQuality.name,
      'circular_pm_value': circularPmValue.toInt().toString(),
      'reference_site': referenceSite,
      // 'forecast_value1': forecastValue1,
      // 'forecast_time1': forecastTime1,
      // 'forecast_value2': forecastValue2,
      // 'forecast_time2': forecastTime2,
      // 'forecast_value3': forecastValue3,
      // 'forecast_time3': forecastTime3,
    };
  }
}
