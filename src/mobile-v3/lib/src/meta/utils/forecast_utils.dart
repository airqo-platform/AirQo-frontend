import 'package:airqo/src/app/dashboard/models/forecast_response.dart';

String getForecastAirQualityIcon(double value, Map<String, AqiRange> aqiRanges) {
  switch (getAirQuality(value, aqiRanges)) {
    case "Good":
      return "assets/images/shared/airquality_indicators/good.svg";

    case "Moderate":
      return "assets/images/shared/airquality_indicators/moderate.svg";

    case "Unhealthy":
      return "assets/images/shared/airquality_indicators/unhealthy.svg";

    case "Unhealthy for Sensitive Groups":
      return "assets/images/shared/airquality_indicators/unhealthy-sensitive.svg";

    case "Very Unhealthy":
      return "assets/images/shared/airquality_indicators/very-unhealthy.svg";

    case "Hazardous":
      return "assets/images/shared/airquality_indicators/hazardous.svg";


    case "Unavailable":
      return "assets/images/shared/airquality_indicators/unavailable.svg";


    default:
      return "";
  }
}

String getAirQuality(double value, Map<String, AqiRange> aqiRanges) {
  for (var range in aqiRanges.values) {
    if (value >= range.min && (range.max == null || value <= range.max!)) {
      return range.aqiCategory;
    }
  }
  return "Unavailable";
}