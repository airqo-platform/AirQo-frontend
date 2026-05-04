import 'package:airqo/src/app/dashboard/models/airquality_response.dart';
import 'package:geolocator/geolocator.dart';
import 'package:google_maps_flutter/google_maps_flutter.dart';
import 'package:loggy/loggy.dart';

class MapCameraController with UiLoggy {
  GoogleMapController? _controller;

  static const LatLng _center = LatLng(0.347596, 32.582520);

  bool get isInitialized => _controller != null;

  void onCreated(GoogleMapController controller) {
    _controller = controller;
  }

  void dispose() {
    // GoogleMapController does not expose a public dispose; nothing to clean up.
  }

  Future<void> snapToPosition(Position position) async {
    if (!isInitialized) return;
    await _controller!.animateCamera(
      CameraUpdate.newLatLngZoom(
        LatLng(position.latitude, position.longitude),
        12,
      ),
    );
  }

  Future<void> fitMeasurementsInView(List<Measurement> measurements) async {
    if (!isInitialized || measurements.isEmpty) return;
    try {
      double minLat = 90.0, maxLat = -90.0, minLng = 180.0, maxLng = -180.0;
      for (final measurement in measurements) {
        final lat = measurement.siteDetails?.approximateLatitude;
        final lng = measurement.siteDetails?.approximateLongitude;
        if (lat == null || lng == null) continue;
        if (lat < minLat) minLat = lat;
        if (lat > maxLat) maxLat = lat;
        if (lng < minLng) minLng = lng;
        if (lng > maxLng) maxLng = lng;
      }
      if (minLat == 90.0 || minLng == 180.0) return;
      if (minLat == maxLat && minLng == maxLng) {
        await _controller!.animateCamera(
          CameraUpdate.newLatLngZoom(LatLng(minLat, minLng), 12),
        );
        return;
      }
      final latPad = (maxLat - minLat) * 0.1;
      final lngPad = (maxLng - minLng) * 0.1;
      await _controller!.animateCamera(
        CameraUpdate.newLatLngBounds(
          LatLngBounds(
            southwest: LatLng(minLat - latPad, minLng - lngPad),
            northeast: LatLng(maxLat + latPad, maxLng + lngPad),
          ),
          50.0,
        ),
      );
    } catch (e) {
      loggy.error('Error fitting markers to bounds: $e');
      _controller!.animateCamera(CameraUpdate.newLatLngZoom(_center, 6));
    }
  }

  Future<void> zoomToCluster(List<Measurement> members) async {
    if (!isInitialized) return;
    try {
      double minLat = 90.0, maxLat = -90.0, minLng = 180.0, maxLng = -180.0;
      for (final measurement in members) {
        final lat = measurement.siteDetails!.approximateLatitude!;
        final lng = measurement.siteDetails!.approximateLongitude!;
        if (lat < minLat) minLat = lat;
        if (lat > maxLat) maxLat = lat;
        if (lng < minLng) minLng = lng;
        if (lng > maxLng) maxLng = lng;
      }
      // LatLngBounds requires SW != NE — use simple zoom for single-point clusters.
      if (minLat == maxLat && minLng == maxLng) {
        await _controller!.animateCamera(
          CameraUpdate.newLatLngZoom(LatLng(minLat, minLng), 14),
        );
      } else {
        await _controller!.animateCamera(
          CameraUpdate.newLatLngBounds(
            LatLngBounds(
              southwest: LatLng(minLat, minLng),
              northeast: LatLng(maxLat, maxLng),
            ),
            60,
          ),
        );
      }
    } catch (e) {
      loggy.warning('Failed to zoom to cluster: $e');
      final zoom = await _controller!.getZoomLevel();
      await _controller!.animateCamera(CameraUpdate.zoomTo(zoom + 2));
    }
  }

  Future<void> increaseZoom() async {
    if (!isInitialized) return;
    final zoom = await _controller!.getZoomLevel();
    _controller!.animateCamera(CameraUpdate.zoomTo(zoom + 2));
  }

  Future<void> reduceZoom() async {
    if (!isInitialized) return;
    final zoom = await _controller!.getZoomLevel();
    _controller!.animateCamera(CameraUpdate.zoomTo(zoom - 2));
  }

  Future<void> animateTo(LatLng position, {double zoom = 14.0}) async {
    if (!isInitialized) return;
    await _controller!.animateCamera(
      CameraUpdate.newLatLngZoom(position, zoom),
    );
  }
}
