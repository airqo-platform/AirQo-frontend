import 'dart:ui' as ui;

import 'package:airqo/src/app/dashboard/models/airquality_response.dart';
import 'package:airqo/src/app/map/utils/map_aq_presentation.dart';
import 'package:airqo/src/meta/utils/utils.dart';
import 'package:airqo/src/meta/utils/widget_to_map_icon.dart';
import 'package:flutter/material.dart';
import 'package:google_maps_flutter/google_maps_flutter.dart';

class MapMarkerBuilder {
  final Map<String, Future<BitmapDescriptor>> _clusterIconCache = {};

  Future<List<Marker>> buildMarkers({
    required List<Measurement> measurements,
    required double zoom,
    required ValueChanged<Measurement> onMeasurementTap,
    required ValueChanged<List<Measurement>> onClusterTap,
  }) async {
    final valid = measurements.where(_hasMappableReading).toList();
    if (valid.isEmpty) return [];

    final params = _clusterParams(zoom);
    final spatialIndex = _buildSpatialIndex(valid, params.gridSize);
    final markers = <Marker>[];

    for (final entry in spatialIndex.entries) {
      final members = entry.value;
      if (members.length >= params.minSize) {
        markers.add(await _clusterMarker(entry.key, members, onClusterTap));
        continue;
      }

      for (final measurement in members) {
        markers.add(await _measurementMarker(measurement, onMeasurementTap));
      }
    }

    return markers;
  }

  bool _hasMappableReading(Measurement measurement) {
    return measurement.id != null &&
        measurement.pm25?.value != null &&
        measurement.siteDetails?.approximateLatitude != null &&
        measurement.siteDetails?.approximateLongitude != null;
  }

  Map<String, List<Measurement>> _buildSpatialIndex(
    List<Measurement> measurements,
    double gridSize,
  ) {
    final index = <String, List<Measurement>>{};
    for (final measurement in measurements) {
      final lat = measurement.siteDetails!.approximateLatitude!;
      final lng = measurement.siteDetails!.approximateLongitude!;
      final key = '${(lat / gridSize).floor()},${(lng / gridSize).floor()}';
      index.putIfAbsent(key, () => []).add(measurement);
    }
    return index;
  }

  ({double gridSize, int minSize}) _clusterParams(double zoom) {
    final z = zoom.floor();
    if (z < 4) return (gridSize: 4.0, minSize: 2);
    if (z < 6) return (gridSize: 2.0, minSize: 2);
    if (z < 8) return (gridSize: 1.0, minSize: 2);
    if (z < 10) return (gridSize: 0.5, minSize: 3);
    return (gridSize: 0.1, minSize: 99);
  }

  Future<Marker> _measurementMarker(
    Measurement measurement,
    ValueChanged<Measurement> onTap,
  ) async {
    final pmValue = measurement.pm25!.value!;
    final iconPath = getAirQualityIcon(measurement, pmValue);
    final resolvedPath =
        iconPath.isNotEmpty ? iconPath : mapAqLevelFromPm25(pmValue).asset;

    return Marker(
      onTap: () => onTap(measurement),
      icon: await bitmapDescriptorFromSvgAsset(resolvedPath),
      position: LatLng(
        measurement.siteDetails!.approximateLatitude!,
        measurement.siteDetails!.approximateLongitude!,
      ),
      markerId: MarkerId(measurement.id!),
    );
  }

  Future<Marker> _clusterMarker(
    String key,
    List<Measurement> members,
    ValueChanged<List<Measurement>> onTap,
  ) async {
    final avgLat = members
            .map((m) => m.siteDetails!.approximateLatitude!)
            .reduce((a, b) => a + b) /
        members.length;
    final avgLng = members
            .map((m) => m.siteDetails!.approximateLongitude!)
            .reduce((a, b) => a + b) /
        members.length;
    final avgPm25 = members.map((m) => m.pm25!.value!).reduce((a, b) => a + b) /
        members.length;
    final color = mapAqLevelFromPm25(avgPm25).color;

    return Marker(
      markerId: MarkerId('cluster-$key-${members.length}'),
      position: LatLng(avgLat, avgLng),
      icon: await _clusterIcon(members.length, color),
      onTap: () => onTap(members),
    );
  }

  Future<BitmapDescriptor> _clusterIcon(int count, Color color) {
    final views = ui.PlatformDispatcher.instance.views;
    final devicePixelRatio =
        views.isNotEmpty ? views.first.devicePixelRatio : 1.0;
    final cacheKey = '$count:${color.toARGB32()}:$devicePixelRatio';
    return _clusterIconCache.putIfAbsent(
      cacheKey,
      () => _drawClusterIcon(count, color, devicePixelRatio),
    );
  }

  Future<BitmapDescriptor> _drawClusterIcon(
    int count,
    Color color,
    double devicePixelRatio,
  ) async {
    const logicalSize = 30.0;
    final size = (logicalSize * devicePixelRatio).round();
    final recorder = ui.PictureRecorder();
    final canvas = ui.Canvas(recorder);
    canvas.scale(devicePixelRatio);

    const center = Offset(logicalSize / 2, logicalSize / 2);
    final fillPaint = Paint()
      ..color = color
      ..style = PaintingStyle.fill;
    final borderPaint = Paint()
      ..color = Colors.white
      ..style = PaintingStyle.stroke
      ..strokeWidth = 2;

    canvas.drawCircle(center, 14, fillPaint);
    canvas.drawCircle(center, 14, borderPaint);

    final textPainter = TextPainter(
      text: TextSpan(
        text: count > 99 ? '99+' : count.toString(),
        style: const TextStyle(
          color: Colors.white,
          fontSize: 10,
          fontWeight: FontWeight.w700,
        ),
      ),
      textAlign: TextAlign.center,
      textDirection: TextDirection.ltr,
    )..layout(maxWidth: logicalSize);
    textPainter.paint(
      canvas,
      Offset(
        (logicalSize - textPainter.width) / 2,
        (logicalSize - textPainter.height) / 2,
      ),
    );

    final picture = recorder.endRecording();
    final image = await picture.toImage(size, size);
    final byteData = await image.toByteData(format: ui.ImageByteFormat.png);
    if (byteData == null) {
      return BitmapDescriptor.defaultMarker;
    }
    return BitmapDescriptor.bytes(byteData.buffer.asUint8List());
  }
}
