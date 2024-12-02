String getAirQualityIcon(double value) {
  switch (getAirQuality(value)) {
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

String getAirQuality(double value) {
  if (value >= 0 && value <= 12) {
    return "Good";
  } else if (value >= 12.1 && value <= 35.4) {
    return "Moderate";
  } else if (value >= 35.5 && value <= 55.4) {
    return "Unhealthy for Sensitive Groups";
  } else if (value >= 55.5 && value <= 150.4) {
    return "Unhealthy";
  } else if (value >= 150.5 && value <= 250.4) {
    return "Very Unhealthy";
  } else if (value >= 250.5) {
    return "Hazardous";
  } else {
    return "Unavailable";
  }
}
