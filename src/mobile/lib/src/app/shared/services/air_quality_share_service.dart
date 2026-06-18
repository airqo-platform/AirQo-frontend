import 'dart:typed_data';

import 'package:airqo/src/app/dashboard/models/airquality_response.dart';
import 'package:flutter/material.dart';
import 'package:share_plus/share_plus.dart';

class AirQualityShareService {
  const AirQualityShareService._();

  static Future<void> shareMeasurement(
    Measurement measurement, {
    String? fallbackLocationName,
    Rect? sharePositionOrigin,
  }) {
    final message = buildShareMessage(
      measurement,
      fallbackLocationName: fallbackLocationName,
    );

    return Share.share(
      message,
      subject: 'Air quality update from AirQo',
      sharePositionOrigin: sharePositionOrigin,
    );
  }

  static Future<void> shareMeasurementCard(
    Uint8List imageBytes,
    Measurement measurement, {
    String? fallbackLocationName,
    Rect? sharePositionOrigin,
  }) {
    return Share.shareXFiles(
      [
        XFile.fromData(
          imageBytes,
          mimeType: 'image/png',
          name: 'airqo-air-quality-card.png',
        ),
      ],
      text: buildShareMessage(
        measurement,
        fallbackLocationName: fallbackLocationName,
      ),
      subject: 'Air quality update from AirQo',
      sharePositionOrigin: sharePositionOrigin,
    );
  }

  static String buildShareMessage(
    Measurement measurement, {
    String? fallbackLocationName,
  }) {
    final locationName = measurement.siteDetails?.searchName ??
        measurement.siteDetails?.name ??
        fallbackLocationName ??
        'this location';
    final category = measurement.aqiCategory ?? 'Unavailable';
    final pm25Value = measurement.pm25?.value;
    final locationDescription = _locationDescription(measurement);
    final healthTip = measurement.healthTips?.firstOrNull?.tagLine ??
        measurement.healthTips?.firstOrNull?.description;

    final lines = <String>[
      'Air quality in $locationName is $category.',
      if (pm25Value != null) 'PM2.5: ${pm25Value.toStringAsFixed(1)} µg/m³',
      if (locationDescription.isNotEmpty) 'Location: $locationDescription',
      if (healthTip != null && healthTip.isNotEmpty) healthTip,
      '',
      'Shared from the AirQo app.',
    ];

    return lines.join('\n');
  }

  static String _locationDescription(Measurement measurement) {
    final siteDetails = measurement.siteDetails;
    if (siteDetails == null) return '';

    final parts = <String>[];

    if (siteDetails.city != null && siteDetails.city!.isNotEmpty) {
      parts.add(siteDetails.city!);
    } else if (siteDetails.town != null && siteDetails.town!.isNotEmpty) {
      parts.add(siteDetails.town!);
    }

    if (siteDetails.region != null && siteDetails.region!.isNotEmpty) {
      parts.add(siteDetails.region!);
    } else if (siteDetails.county != null && siteDetails.county!.isNotEmpty) {
      parts.add(siteDetails.county!);
    }

    if (siteDetails.country != null && siteDetails.country!.isNotEmpty) {
      parts.add(siteDetails.country!);
    }

    return parts.join(', ');
  }
}
