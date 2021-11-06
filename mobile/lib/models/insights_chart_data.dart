import 'package:app/models/place_details.dart';
import 'package:intl/intl.dart';

import 'historical_measurement.dart';

class InsightsChartData {
  DateTime time;
  double value;
  String pollutant;
  bool available = false;
  String name;
  String location;
  String day;

  InsightsChartData(this.time, this.value, this.pollutant, this.available,
      this.name, this.location, this.day);

  @override
  String toString() {
    return 'InsightsChartData{time: $time,}';
  }

  static List<InsightsChartData> formatData(List<InsightsChartData> data) {
    data.sort((x, y) {
      return x.time.compareTo(y.time);
    });

    return data;
  }

  static List<InsightsChartData> getDailyInsightsData(
      List<HistoricalMeasurement> measurements,
      String pollutant,
      PlaceDetails placeDetails) {
    var insights = <InsightsChartData>[];
    for (var measurement in measurements) {
      var value = measurement.getPm2_5Value();
      if (pollutant == 'pm10') {
        value = measurement.getPm10Value();
      }
      var insight = InsightsChartData(
          DateTime.parse(measurement.time),
          value,
          pollutant,
          true,
          placeDetails.name,
          placeDetails.location,
          DateFormat('EEE').format(DateTime.parse(measurement.time)));

      insights.add(insight);
    }

    var lastInsight = insights.last;
    while (insights.length != 7) {
      var nextTime = lastInsight.time.add(const Duration(days: 1));

      insights.add(InsightsChartData(
          nextTime,
          lastInsight.value,
          pollutant,
          false,
          placeDetails.name,
          placeDetails.location,
          DateFormat('EEE').format(nextTime)));

      lastInsight = insights.last;
    }

    return formatData(insights);
  }

  static List<InsightsChartData> getHourlyInsightsData(
      List<HistoricalMeasurement> measurements,
      String pollutant,
      PlaceDetails placeDetails) {
    var insights = <InsightsChartData>[];
    for (var measurement in measurements) {
      var value = measurement.getPm2_5Value();
      if (pollutant == 'pm10') {
        value = measurement.getPm10Value();
      }
      var insight = InsightsChartData(
          DateTime.parse(measurement.time),
          value,
          pollutant,
          true,
          placeDetails.name,
          placeDetails.location,
          DateFormat('EEE').format(DateTime.parse(measurement.time)));

      insights.add(insight);
    }

    // var lastInsight = insights.last;
    // while(insights.length != 24){
    //
    //   var nextTime = lastInsight.time.add(const Duration(days: 1));
    //
    //   insights.add(InsightsChartData(nextTime,
    //       lastInsight.value, pollutant, false, placeDetails.name,
    //       placeDetails.location,
    //       DateFormat('EEE').format(nextTime)));
    //
    //   lastInsight = insights.last;
    // }
    return formatData(insights);
  }

  static InsightsChartData historicalDataToInsightsData(
      HistoricalMeasurement measurement,
      String pollutant,
      PlaceDetails placeDetails) {
    var value = measurement.getPm2_5Value();

    if (pollutant == 'pm10') {
      value = measurement.getPm10Value();
    }

    return InsightsChartData(
        DateTime.parse(measurement.time),
        value,
        pollutant,
        true,
        placeDetails.name,
        placeDetails.location,
        DateFormat('EEE').format(DateTime.parse(measurement.time)));
  }
}
