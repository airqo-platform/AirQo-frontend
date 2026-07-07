import 'dart:typed_data';

import 'package:airqo/src/app/dashboard/models/airquality_response.dart';
import 'package:flutter/material.dart';
import 'package:share_plus/share_plus.dart';

class AirQualityShareService {
  const AirQualityShareService._();

  /// Included in shared card/filter messages so app installs from shares
  /// can be tracked back to this feature.
  static const String appLink = 'https://www.airqo.net/explore-data';

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
    return _shareImage(
      imageBytes,
      fileName: 'airqo-air-quality-card.png',
      text: buildShareMessage(
        measurement,
        fallbackLocationName: fallbackLocationName,
      ),
      sharePositionOrigin: sharePositionOrigin,
    );
  }

  /// Shares the composited selfie + Clean Air Forum branded card.
  static Future<void> shareCleanAirForumFilter(
    Uint8List imageBytes,
    Measurement measurement, {
    String? fallbackLocationName,
    Rect? sharePositionOrigin,
  }) {
    final locationName = measurement.siteDetails?.searchName ??
        fallbackLocationName ??
        'this location';

    return _shareImage(
      imageBytes,
      fileName: 'clean-air-forum-filter.png',
      text: "I'm checking the air quality in $locationName with AirQo at "
          'the Clean Air Forum! 🌍💨\n\n'
          'Join me on the app here: $appLink',
      subject: 'Clean Air Forum x AirQo',
      sharePositionOrigin: sharePositionOrigin,
    );
  }

  /// Shares the transparent branding sticker meant to be pasted onto an
  /// Instagram Story (or similar) as an overlay.
  static Future<void> shareStickerFrame(
    Uint8List imageBytes, {
    Rect? sharePositionOrigin,
  }) {
    return _shareImage(
      imageBytes,
      fileName: 'clean-air-forum-sticker.png',
      text: 'Add this to your Instagram Story! 🌍💨 #CleanAirForum #AirQo',
      subject: 'Clean Air Forum x AirQo',
      sharePositionOrigin: sharePositionOrigin,
    );
  }

  static Future<void> _shareImage(
    Uint8List imageBytes, {
    required String fileName,
    required String text,
    String subject = 'Air quality update from AirQo',
    Rect? sharePositionOrigin,
  }) {
    return Share.shareXFiles(
      [
        XFile.fromData(
          imageBytes,
          mimeType: 'image/png',
          name: fileName,
        ),
      ],
      text: text,
      subject: subject,
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
      'Join me on the app here: $appLink',
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
