import 'package:airqo/src/app/dashboard/models/airquality_response.dart';

String getAirQualityIcon(Measurement measurement, double value) {
  String category = measurement.aqiRanges != null 
    ? _getDynamicAirQuality(measurement.aqiRanges!, value) 
    : getAirQuality(value);

  switch (category) {
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

String _getDynamicAirQuality(AqiRanges aqiRanges, double value) {
  if (aqiRanges.good != null &&
      value >= (aqiRanges.good!.min ?? double.negativeInfinity) &&
      value <= (aqiRanges.good!.max ?? double.infinity)){
    return "Good";
  }

  if (aqiRanges.moderate != null &&
      value >= (aqiRanges.moderate!.min ?? double.negativeInfinity) &&
      value <= (aqiRanges.moderate!.max ?? double.infinity)){
    return "Moderate";
  }

  if (aqiRanges.u4sg != null &&
      value >= (aqiRanges.u4sg!.min ?? double.negativeInfinity) &&
      value <= (aqiRanges.u4sg!.max ?? double.infinity)){
    return "Unhealthy for Sensitive Groups";
  }

  if (aqiRanges.unhealthy != null &&
      value >= (aqiRanges.unhealthy!.min ?? double.negativeInfinity) &&
      value <= (aqiRanges.unhealthy!.max ?? double.infinity)){
    return "Unhealthy";
  }

  if (aqiRanges.veryUnhealthy != null &&
      value >= (aqiRanges.veryUnhealthy!.min ?? double.negativeInfinity) &&
      value <= (aqiRanges.veryUnhealthy!.max ?? double.infinity)){
    return "Very Unhealthy";
  }

  if (aqiRanges.hazardous != null &&
      value >= (aqiRanges.hazardous!.min ?? double.negativeInfinity) &&
      value <= (aqiRanges.hazardous!.max ?? double.infinity)){
    return "Hazardous";
  }
  
  return "Unavailable";
}

String getAirQuality(double value) {
  if (value >= 0 && value <= 9) {
    return "Good";
  } else if (value >= 10 && value <= 35.4) {
    return "Moderate";
  } else if (value >= 35.5 && value <= 55.4) {
    return "Unhealthy for Sensitive Groups";
  } else if (value >= 55.5 && value <= 125.4) {
    return "Unhealthy";
  } else if (value >= 125.5 && value <= 225.4) {
    return "Very Unhealthy";
  } else if (value > 225.4) {
    return "Hazardous";
  } else {
    return "Unavailable";
  }
}