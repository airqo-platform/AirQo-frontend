import 'package:flutter/material.dart';
import 'package:flutter_svg/flutter_svg.dart';
import 'package:geolocator/geolocator.dart';
import 'package:loggy/loggy.dart';
import 'package:airqo/src/meta/utils/colors.dart';
import 'package:airqo/src/app/dashboard/models/airquality_response.dart';
import 'package:airqo/src/app/dashboard/repository/dashboard_repository.dart';
import 'package:airqo/src/app/dashboard/services/enhanced_location_service_manager.dart';
import 'package:airqo/src/app/exposure/models/exposure_models.dart';
import 'package:airqo/src/app/exposure/utils/exposure_utils.dart';

class ExposurePeakCard extends StatelessWidget with UiLoggy {
  final DailyExposureSummary data;

  ExposurePeakCard({super.key, required this.data});

  @override
  Widget build(BuildContext context) {
    return FutureBuilder<Map<String, dynamic>?>(
      future: _getPeakAirQualityReading(),
      builder: (context, snapshot) {
        String timeString;
        String locationDescription;
        String peakCategory;
        double peakPm25;
        Color peakColor;

        if (snapshot.hasData && snapshot.data != null) {
          final peakData = snapshot.data!;
          peakPm25 = peakData['pm25'] as double;
          timeString = peakData['timeString'] as String;
          peakCategory = peakData['category'] as String;
          locationDescription = 'near ${peakData['location'] as String}';
          peakColor = getPeakCategoryColor(peakCategory);
        } else {
          ExposureDataPoint? peakPoint;
          double tempPeakPm25 = 0.0;

          for (final point in data.dataPoints) {
            if (point.pm25Value != null && point.pm25Value! > tempPeakPm25) {
              tempPeakPm25 = point.pm25Value!;
              peakPoint = point;
            }
          }

          if (peakPoint == null) return const SizedBox.shrink();

          final hour = peakPoint.timestamp.hour;
          final minute = peakPoint.timestamp.minute;
          final period = hour >= 12 ? 'PM' : 'AM';
          final displayHour = hour == 0 ? 12 : (hour > 12 ? hour - 12 : hour);
          timeString = '$displayHour:${minute.toString().padLeft(2, '0')} $period';

          peakPm25 = tempPeakPm25;
          peakCategory = peakPoint.aqiCategory ?? 'Unknown';
          locationDescription = getLocationDescription(peakPoint);
          peakColor = getPeakCategoryColor(peakCategory);
        }

        return Container(
          margin: const EdgeInsets.symmetric(horizontal: 16, vertical: 8),
          decoration: BoxDecoration(
            color: Theme.of(context).cardColor,
            borderRadius: BorderRadius.circular(12),
            boxShadow: [
              BoxShadow(
                color: Colors.black.withValues(alpha: 0.1),
                blurRadius: 4,
                offset: Offset(0, 2),
              ),
            ],
          ),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Divider(
                thickness: .5,
                color: Theme.of(context).brightness == Brightness.dark
                    ? AppColors.dividerColordark
                    : AppColors.dividerColorlight,
              ),
              Padding(
                padding: const EdgeInsets.only(
                    left: 16, right: 16, bottom: 16, top: 4),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Row(
                      mainAxisAlignment: MainAxisAlignment.spaceBetween,
                      crossAxisAlignment: CrossAxisAlignment.center,
                      children: [
                        Expanded(
                          child: Column(
                            crossAxisAlignment: CrossAxisAlignment.start,
                            children: [
                              Row(
                                children: [
                                  SvgPicture.asset(
                                      Theme.of(context).brightness ==
                                              Brightness.light
                                          ? "assets/images/shared/pm_rating_white.svg"
                                          : 'assets/images/shared/pm_rating.svg'),
                                  const SizedBox(width: 2),
                                  Text(
                                    " PM2.5",
                                    style: TextStyle(
                                      color: Theme.of(context)
                                          .textTheme
                                          .headlineSmall
                                          ?.color,
                                    ),
                                  ),
                                ],
                              ),
                              Row(children: [
                                Text(
                                  peakPm25.toStringAsFixed(1),
                                  style: TextStyle(
                                      fontWeight: FontWeight.w700,
                                      fontSize: 36,
                                      color: Theme.of(context)
                                          .textTheme
                                          .headlineLarge
                                          ?.color),
                                ),
                                Text(" μg/m³",
                                    style: TextStyle(
                                        fontWeight: FontWeight.w600,
                                        fontSize: 14,
                                        color: Theme.of(context)
                                            .textTheme
                                            .headlineLarge
                                            ?.color)),
                              ]),
                              Container(
                                margin: EdgeInsets.only(bottom: 12, top: 8),
                                padding: EdgeInsets.symmetric(
                                    horizontal: 16, vertical: 8),
                                decoration: BoxDecoration(
                                  color: peakColor.withValues(alpha: 0.15),
                                  borderRadius: BorderRadius.circular(20),
                                ),
                                child: Text(
                                  peakCategory,
                                  style: TextStyle(
                                    fontSize: 14,
                                    fontWeight: FontWeight.w600,
                                    color: peakColor,
                                  ),
                                ),
                              ),
                            ],
                          ),
                        ),
                        SizedBox(width: 8),
                        SvgPicture.asset(
                          getAirQualityIconPath(peakCategory, peakPm25),
                          width: 86,
                          height: 86,
                        ),
                      ],
                    ),
                    SizedBox(height: 12),
                    Divider(
                      thickness: 0.5,
                      color: Theme.of(context).brightness == Brightness.dark
                          ? AppColors.dividerColordark
                          : AppColors.dividerColorlight,
                    ),
                    SizedBox(height: 8),
                    Text(
                      'Peak occurred at $timeString $locationDescription',
                      style: TextStyle(
                        fontSize: 12,
                        color: Theme.of(context)
                            .textTheme
                            .bodyMedium
                            ?.color
                            ?.withValues(alpha: 0.7),
                      ),
                    ),
                  ],
                ),
              ),
            ],
          ),
        );
      },
    );
  }

  Future<Map<String, dynamic>?> _getPeakAirQualityReading() async {
    try {
      final dashboardRepository = DashboardImpl();
      final response = await dashboardRepository.fetchAirQualityReadings();

      if (response.measurements == null || response.measurements!.isEmpty) {
        return null;
      }

      final locationService = EnhancedLocationServiceManager();
      final locationResult = await locationService.getCurrentPosition();

      if (!locationResult.isSuccess || locationResult.position == null) {
        loggy.warning('Could not get user location for peak exposure filtering');
        return null;
      }

      final userPosition = locationResult.position!;
      const double maxDistanceKm = 10.0;

      List<Map<String, dynamic>> nearbySensors = [];

      for (final measurement in response.measurements!) {
        if (measurement.pm25?.value == null) continue;

        final siteDetails = measurement.siteDetails;
        if (siteDetails == null) continue;

        double? latitude = siteDetails.approximateLatitude ?? siteDetails.siteCategory?.latitude;
        double? longitude = siteDetails.approximateLongitude ?? siteDetails.siteCategory?.longitude;

        if (latitude == null || longitude == null) continue;

        final distance = Geolocator.distanceBetween(
              userPosition.latitude,
              userPosition.longitude,
              latitude,
              longitude,
            ) /
            1000;

        if (distance <= maxDistanceKm) {
          nearbySensors.add({
            'measurement': measurement,
            'distance': distance,
            'pm25': measurement.pm25!.value!,
          });
        }
      }

      if (nearbySensors.isEmpty) return null;

      nearbySensors.sort((a, b) => (a['distance'] as double).compareTo(b['distance'] as double));

      Measurement? peakMeasurement;
      double peakPm25 = 0.0;

      const double veryCloseDistanceKm = 3.0;
      final closestDistance = nearbySensors.first['distance'] as double;

      if (closestDistance <= veryCloseDistanceKm) {
        final veryCloseSensors = nearbySensors
            .where((sensor) => (sensor['distance'] as double) <= veryCloseDistanceKm)
            .toList();

        if (veryCloseSensors.length > 1) {
          veryCloseSensors.sort((a, b) => (b['pm25'] as double).compareTo(a['pm25'] as double));
        }
        peakMeasurement = veryCloseSensors.first['measurement'] as Measurement;
        peakPm25 = veryCloseSensors.first['pm25'] as double;
      } else {
        peakMeasurement = nearbySensors.first['measurement'] as Measurement;
        peakPm25 = nearbySensors.first['pm25'] as double;
      }

      String locationName = 'unknown location';

      if (peakMeasurement.siteDetails != null) {
        locationName = peakMeasurement.siteDetails!.searchName ??
            peakMeasurement.siteDetails!.locationName ??
            peakMeasurement.siteDetails!.name ??
            'unknown location';
      }

      String timeString = 'Unknown time';
      if (peakMeasurement.time != null) {
        final measurementTime = DateTime.tryParse(peakMeasurement.time!);
        if (measurementTime != null) {
          final hour = measurementTime.hour;
          final minute = measurementTime.minute;
          final period = hour >= 12 ? 'PM' : 'AM';
          final displayHour = hour == 0 ? 12 : (hour > 12 ? hour - 12 : hour);
          timeString = '$displayHour:${minute.toString().padLeft(2, '0')} $period';
        }
      }

      return {
        'pm25': peakPm25,
        'timeString': timeString,
        'category': peakMeasurement.aqiCategory ?? 'Unknown',
        'location': locationName,
      };
    } catch (e) {
      loggy.error('Error getting peak air quality reading: $e');
      return null;
    }
  }
}
