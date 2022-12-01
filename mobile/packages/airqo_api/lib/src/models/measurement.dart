import 'package:json_annotation/json_annotation.dart';

import 'measurement_value.dart';
import 'site.dart';

part 'measurement.g.dart';

/// Measurement model.
/// [dateTime] the time the measurement was taken
@JsonSerializable()
class Measurement {
  factory Measurement.fromJson(Map<String, dynamic> json) =>
      _$MeasurementFromJson(json);

  Measurement({
    required this.dateTime,
    required this.pm2_5,
    required this.pm10,
    required this.site,
  });

  @JsonKey(name: 'time')
  DateTime dateTime;
  final MeasurementValue pm2_5;
  final MeasurementValue pm10;
  @JsonKey(name: 'siteDetails')
  final Site site;
}

List<Measurement> parseMeasurements(dynamic jsonBody) {
  final measurements = <Measurement>[];

  final jsonArray = jsonBody['measurements'];
  final offSet = DateTime.now().timeZoneOffset.inHours;
  for (final jsonElement in jsonArray) {
    try {
      final measurement = Measurement.fromJson(jsonElement);
      measurement.dateTime = measurement.dateTime.add(Duration(hours: offSet));
      measurements.add(measurement);
    } catch (exception, _) {
      // TODO create utils package
      // await logException(
      //   exception,
      //   stackTrace,
      // );
    }
  }
  measurements.sort(
    (siteA, siteB) => siteA.site.name.toLowerCase().compareTo(
          siteB.site.name.toLowerCase(),
        ),
  );

  return measurements;
}
