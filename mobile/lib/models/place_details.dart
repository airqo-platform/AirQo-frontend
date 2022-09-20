import 'package:app/models/air_quality_reading.dart';
import 'package:uuid/uuid.dart';

class PlaceDetails {
  PlaceDetails({
    required this.name,
    required this.location,
    required this.siteId,
    required this.placeId,
    required this.latitude,
    required this.longitude,
  });

  factory PlaceDetails.fromAirQualityReading(
    AirQualityReading airQualityReading,
  ) {
    return PlaceDetails(
      name: airQualityReading.name,
      location: airQualityReading.location,
      siteId: airQualityReading.referenceSite,
      placeId: airQualityReading.placeId,
      latitude: airQualityReading.latitude,
      longitude: airQualityReading.longitude,
    );
  }

  String name = '';
  String location = '';
  String siteId;
  String placeId = const Uuid().v4();
  double latitude;
  double longitude;
}
