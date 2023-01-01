import 'package:json_annotation/json_annotation.dart';
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

  @JsonKey(
    name: 'time',
    fromJson: _timeFromJson,
  )
  DateTime dateTime;
  final MeasurementValue pm2_5;
  final MeasurementValue pm10;
  @JsonKey(name: 'siteDetails')
  final Site site;

  static DateTime _timeFromJson(String json) {
    DateTime dateTime = DateTime.parse(json);
    final int offSet = DateTime.now().timeZoneOffset.inHours;
    return dateTime.add(Duration(hours: offSet));
  }
}

@JsonSerializable()
class MeasurementValue {
  factory MeasurementValue.fromJson(Map<String, dynamic> json) =>
      _$MeasurementValueFromJson(json);

  const MeasurementValue({
    required this.value,
    required this.calibratedValue,
  });

  @JsonKey(required: false, name: 'calibratedValue', fromJson: _valueFromJson)
  final double? calibratedValue;

  @JsonKey(required: false, name: 'value', fromJson: _valueFromJson)
  final double value;

  static double _valueFromJson(double json) {
    return double.parse(json.toStringAsFixed(2));
  }
}

List<Measurement> parseMeasurements(Map<String, dynamic> jsonBody) {
  final measurements = <Measurement>[];

  final jsonArray = jsonBody['measurements'];

  for (final jsonElement in jsonArray) {
    try {
      measurements.add(Measurement.fromJson(jsonElement));
    } catch (exception, _) {
      print(exception);
    }
  }

  return measurements;
}
