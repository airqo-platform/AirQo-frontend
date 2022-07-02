import 'package:airqo_api/airqo_api.dart';
import 'package:equatable/equatable.dart';
import 'package:json_annotation/json_annotation.dart';

part 'site_reading.g.dart';

@JsonSerializable()
class SiteReading extends Equatable {
  const SiteReading({
    required this.siteId,
    required this.latitude,
    required this.longitude,
    required this.country,
    required this.name,
    required this.location,
    required this.region,
    required this.dateTime,
    required this.pm2_5,
    required this.pm10,
    required this.source,
  });

  factory SiteReading.fromMeasurement(Measurement measurement) {
    return SiteReading(
        siteId: measurement.site.id,
        latitude: measurement.site.latitude,
        longitude: measurement.site.longitude,
        country: measurement.site.country,
        name: measurement.site.name,
        location: measurement.site.location,
        region: measurement.site.region,
        dateTime: measurement.dateTime,
        pm2_5: double.parse(
            (measurement.pm2_5.calibratedValue ?? measurement.pm2_5.value)
                .toStringAsFixed(2)),
        pm10: double.parse(
            (measurement.pm10.calibratedValue ?? measurement.pm10.value)
                .toStringAsFixed(2)),
        source: measurement.site.tenant);
  }

  factory SiteReading.fromJson(Map<String, dynamic> json) =>
      _$SiteReadingFromJson(json);

  Map<String, dynamic> toJson() => _$SiteReadingToJson(this);

  final String siteId;
  final double latitude;
  final double longitude;
  final String country;
  final String name;
  final String source;
  final String location;
  final String region;
  final DateTime dateTime;
  final double pm2_5;
  final double pm10;

  @override
  List<Object?> get props => [name, dateTime, pm2_5];
}

List<SiteReading> parseSitesReadings(List<Measurement> measurements) {
  final airQuality = <SiteReading>[];
  for (final measurement in measurements) {
    try {
      airQuality.add(SiteReading.fromMeasurement(measurement));
    } catch (exception) {
      // TODO create utils package
      // await logException(
      //   exception,
      //   stackTrace,
      // );
    }
  }
  airQuality.sort(
    (x, y) => x.dateTime.compareTo(y.dateTime),
  );

  return airQuality;
}
