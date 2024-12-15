 import '../../app/dashboard/models/airquality_response.dart';

final aqiRanges = AqiRanges(
    good: RangeValue(min: 0, max: 9),
    moderate: RangeValue(min: 9.1, max: 35.4),
    u4sg: RangeValue(min: 35.5, max: 55.4),
    unhealthy: RangeValue(min: 55.5, max: 125.4),
    veryUnhealthy: RangeValue(min: 125.5, max: 225.4),
    hazardous: RangeValue(min: 225.5, max: null),
  );