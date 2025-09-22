import 'package:flutter/material.dart';
import 'package:google_maps_flutter/google_maps_flutter.dart';
import 'package:airqo/src/app/exposure/models/exposure_models.dart';
import 'package:airqo/src/meta/utils/colors.dart';

/// Widget that displays user movement on a map with pollution overlay
class ExposureMapWidget extends StatefulWidget {
  final DailyExposureSummary exposureSummary;
  final bool showFullscreen;
  final VoidCallback? onToggleFullscreen;

  const ExposureMapWidget({
    super.key,
    required this.exposureSummary,
    this.showFullscreen = false,
    this.onToggleFullscreen,
  });

  @override
  State<ExposureMapWidget> createState() => _ExposureMapWidgetState();
}

class _ExposureMapWidgetState extends State<ExposureMapWidget> {
  GoogleMapController? _mapController;
  Set<Marker> _markers = {};
  Set<Polyline> _polylines = {};
  Set<Circle> _circles = {};
  bool _isLoading = true;
  String? _errorMessage;

  @override
  void initState() {
    super.initState();
    _initializeMap();
  }

  @override
  void didUpdateWidget(ExposureMapWidget oldWidget) {
    super.didUpdateWidget(oldWidget);
    if (oldWidget.exposureSummary != widget.exposureSummary) {
      _initializeMap();
    }
  }

  Future<void> _initializeMap() async {
    try {
      setState(() {
        _isLoading = true;
        _errorMessage = null;
      });

      await _createMarkersAndPolylines();
      
      setState(() {
        _isLoading = false;
      });
    } catch (e) {
      setState(() {
        _errorMessage = 'Failed to load map data: $e';
        _isLoading = false;
      });
    }
  }

  Future<void> _createMarkersAndPolylines() async {
    final dataPoints = widget.exposureSummary.dataPoints;
    if (dataPoints.isEmpty) return;

    // Sort points by timestamp for polyline
    final sortedPoints = List<ExposureDataPoint>.from(dataPoints)
      ..sort((a, b) => a.timestamp.compareTo(b.timestamp));

    // Create markers for significant exposure points
    final markers = <Marker>{};
    final circles = <Circle>{};
    final polylinePoints = <LatLng>[];

    for (int i = 0; i < sortedPoints.length; i++) {
      final point = sortedPoints[i];
      final latLng = LatLng(point.latitude, point.longitude);
      polylinePoints.add(latLng);

      // Create marker for points with significant exposure or time spent
      if (point.exposureScore > 1.0 || 
          (point.durationAtLocation?.inMinutes ?? 0) > 10) {
        
        final marker = await _createExposureMarker(point, i);
        markers.add(marker);
      }

      // Create pollution circle overlay
      circles.add(Circle(
        circleId: CircleId('pollution_${point.id}'),
        center: latLng,
        radius: _getCircleRadius(point),
        fillColor: _getPollutionColor(point).withOpacity(0.3),
        strokeColor: _getPollutionColor(point),
        strokeWidth: 2,
      ));
    }

    // Create movement polyline
    final polylines = <Polyline>{};
    if (polylinePoints.length > 1) {
      polylines.add(Polyline(
        polylineId: const PolylineId('movement_path'),
        points: polylinePoints,
        color: AppColors.primaryColor,
        width: 3,
        patterns: [PatternItem.dash(10), PatternItem.gap(5)],
      ));
    }

    setState(() {
      _markers = markers;
      _polylines = polylines;
      _circles = circles;
    });
  }

  Future<Marker> _createExposureMarker(ExposureDataPoint point, int index) async {
    final color = _getPollutionColor(point);
    final icon = await _createCustomMarkerIcon(color, point.exposureScore);
    
    return Marker(
      markerId: MarkerId('exposure_${point.id}'),
      position: LatLng(point.latitude, point.longitude),
      icon: icon,
      infoWindow: InfoWindow(
        title: _getLocationTitle(point),
        snippet: _getExposureSnippet(point),
      ),
      onTap: () => _showExposureDetails(point),
    );
  }

  Future<BitmapDescriptor> _createCustomMarkerIcon(Color color, double exposureScore) async {
    // Create a simple colored circle marker
    final size = exposureScore > 10 ? 60.0 : exposureScore > 5 ? 50.0 : 40.0;
    
    return await BitmapDescriptor.fromAssetImage(
      ImageConfiguration(size: Size(size, size)),
      'assets/icons/location_marker.png', // You might need to create this asset
    );
  }

  double _getCircleRadius(ExposureDataPoint point) {
    // Radius based on duration spent at location
    final minutes = point.durationAtLocation?.inMinutes ?? 5;
    return (minutes * 2).clamp(20.0, 100.0).toDouble();
  }

  Color _getPollutionColor(ExposureDataPoint point) {
    final pm25 = point.pm25Value ?? 0;
    
    if (pm25 <= 12) return Colors.green;
    if (pm25 <= 35) return Colors.yellow;
    if (pm25 <= 55) return Colors.orange;
    if (pm25 <= 150) return Colors.red;
    return Colors.purple;
  }

  String _getLocationTitle(ExposureDataPoint point) {
    final time = '${point.timestamp.hour.toString().padLeft(2, '0')}:${point.timestamp.minute.toString().padLeft(2, '0')}';
    return 'Location at $time';
  }

  String _getExposureSnippet(ExposureDataPoint point) {
    final pm25 = point.pm25Value?.toStringAsFixed(1) ?? 'N/A';
    final duration = point.durationAtLocation?.inMinutes ?? 0;
    return 'PM2.5: $pm25 μg/m³ • ${duration}min • ${point.aqiCategory ?? 'Unknown'}';
  }

  void _showExposureDetails(ExposureDataPoint point) {
    showModalBottomSheet(
      context: context,
      isScrollControlled: true,
      backgroundColor: Colors.transparent,
      builder: (context) => _buildExposureDetailsSheet(point),
    );
  }

  Widget _buildExposureDetailsSheet(ExposureDataPoint point) {
    return Container(
      height: MediaQuery.of(context).size.height * 0.6,
      decoration: BoxDecoration(
        color: Theme.of(context).scaffoldBackgroundColor,
        borderRadius: const BorderRadius.vertical(top: Radius.circular(20)),
      ),
      child: Padding(
        padding: const EdgeInsets.all(24),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            // Handle bar
            Center(
              child: Container(
                width: 40,
                height: 4,
                decoration: BoxDecoration(
                  color: Colors.grey[300],
                  borderRadius: BorderRadius.circular(2),
                ),
              ),
            ),
            const SizedBox(height: 24),
            
            // Title
            Text(
              'Exposure Details',
              style: Theme.of(context).textTheme.headlineSmall?.copyWith(
                fontWeight: FontWeight.bold,
              ),
            ),
            const SizedBox(height: 8),
            
            // Time
            Text(
              'Time: ${point.timestamp.hour.toString().padLeft(2, '0')}:${point.timestamp.minute.toString().padLeft(2, '0')}',
              style: Theme.of(context).textTheme.bodyLarge?.copyWith(
                color: Colors.grey[600],
              ),
            ),
            const SizedBox(height: 24),
            
            // Pollution metrics
            _buildMetricRow('PM2.5', '${point.pm25Value?.toStringAsFixed(1) ?? 'N/A'} μg/m³', _getPollutionColor(point)),
            _buildMetricRow('PM10', '${point.pm10Value?.toStringAsFixed(1) ?? 'N/A'} μg/m³', Colors.blue),
            _buildMetricRow('AQI Category', point.aqiCategory ?? 'Unknown', Colors.grey),
            _buildMetricRow('Duration', '${point.durationAtLocation?.inMinutes ?? 0} minutes', Colors.purple),
            _buildMetricRow('Exposure Score', point.exposureScore.toStringAsFixed(1), Colors.orange),
            
            const SizedBox(height: 24),
            
            // Health impact
            Container(
              padding: const EdgeInsets.all(16),
              decoration: BoxDecoration(
                color: _getPollutionColor(point).withOpacity(0.1),
                borderRadius: BorderRadius.circular(12),
                border: Border.all(color: _getPollutionColor(point).withOpacity(0.3)),
              ),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(
                    'Health Impact',
                    style: Theme.of(context).textTheme.titleMedium?.copyWith(
                      fontWeight: FontWeight.bold,
                    ),
                  ),
                  const SizedBox(height: 8),
                  Text(
                    _getHealthImpactText(point),
                    style: Theme.of(context).textTheme.bodyMedium,
                  ),
                ],
              ),
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildMetricRow(String label, String value, Color color) {
    return Padding(
      padding: const EdgeInsets.symmetric(vertical: 8),
      child: Row(
        mainAxisAlignment: MainAxisAlignment.spaceBetween,
        children: [
          Text(
            label,
            style: Theme.of(context).textTheme.bodyMedium?.copyWith(
              color: Colors.grey[600],
            ),
          ),
          Container(
            padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 4),
            decoration: BoxDecoration(
              color: color.withOpacity(0.1),
              borderRadius: BorderRadius.circular(20),
              border: Border.all(color: color.withOpacity(0.3)),
            ),
            child: Text(
              value,
              style: Theme.of(context).textTheme.bodyMedium?.copyWith(
                color: color,
                fontWeight: FontWeight.bold,
              ),
            ),
          ),
        ],
      ),
    );
  }

  String _getHealthImpactText(ExposureDataPoint point) {
    final pm25 = point.pm25Value ?? 0;
    
    if (pm25 <= 12) return 'Good air quality with little or no health risk.';
    if (pm25 <= 35) return 'Moderate air quality. Sensitive individuals may experience minor symptoms.';
    if (pm25 <= 55) return 'Unhealthy for sensitive groups. Consider reducing prolonged outdoor activities.';
    if (pm25 <= 150) return 'Unhealthy air quality. Everyone may experience health effects.';
    return 'Very unhealthy air quality. Avoid outdoor activities and consider staying indoors.';
  }

  void _onMapCreated(GoogleMapController controller) {
    _mapController = controller;
    _fitMarkersInView();
  }

  void _fitMarkersInView() {
    if (_mapController == null || widget.exposureSummary.dataPoints.isEmpty) return;

    final dataPoints = widget.exposureSummary.dataPoints;
    if (dataPoints.length == 1) {
      _mapController!.animateCamera(
        CameraUpdate.newLatLngZoom(
          LatLng(dataPoints.first.latitude, dataPoints.first.longitude),
          15,
        ),
      );
      return;
    }

    // Calculate bounds
    double minLat = dataPoints.first.latitude;
    double maxLat = dataPoints.first.latitude;
    double minLng = dataPoints.first.longitude;
    double maxLng = dataPoints.first.longitude;

    for (final point in dataPoints) {
      minLat = point.latitude < minLat ? point.latitude : minLat;
      maxLat = point.latitude > maxLat ? point.latitude : maxLat;
      minLng = point.longitude < minLng ? point.longitude : minLng;
      maxLng = point.longitude > maxLng ? point.longitude : maxLng;
    }

    // Add padding
    final latPadding = (maxLat - minLat) * 0.2;
    final lngPadding = (maxLng - minLng) * 0.2;

    final bounds = LatLngBounds(
      southwest: LatLng(minLat - latPadding, minLng - lngPadding),
      northeast: LatLng(maxLat + latPadding, maxLng + lngPadding),
    );

    _mapController!.animateCamera(
      CameraUpdate.newLatLngBounds(bounds, 50),
    );
  }

  @override
  Widget build(BuildContext context) {
    if (_isLoading) {
      return _buildLoadingState();
    }

    if (_errorMessage != null) {
      return _buildErrorState();
    }

    if (widget.exposureSummary.dataPoints.isEmpty) {
      return _buildNoDataState();
    }

    return Container(
      height: widget.showFullscreen ? MediaQuery.of(context).size.height : 300,
      decoration: BoxDecoration(
        borderRadius: BorderRadius.circular(12),
        boxShadow: [
          BoxShadow(
            color: Colors.black.withOpacity(0.1),
            blurRadius: 4,
            offset: const Offset(0, 2),
          ),
        ],
      ),
      child: ClipRRect(
        borderRadius: BorderRadius.circular(12),
        child: Stack(
          children: [
            GoogleMap(
              onMapCreated: _onMapCreated,
              initialCameraPosition: CameraPosition(
                target: LatLng(
                  widget.exposureSummary.dataPoints.first.latitude,
                  widget.exposureSummary.dataPoints.first.longitude,
                ),
                zoom: 13,
              ),
              markers: _markers,
              polylines: _polylines,
              circles: _circles,
              mapType: MapType.normal,
              zoomControlsEnabled: false,
              myLocationEnabled: false,
              compassEnabled: false,
              mapToolbarEnabled: false,
            ),
            
            // Map overlay with info
            Positioned(
              top: 16,
              left: 16,
              right: 16,
              child: Container(
                padding: const EdgeInsets.all(12),
                decoration: BoxDecoration(
                  color: Colors.white.withOpacity(0.95),
                  borderRadius: BorderRadius.circular(8),
                  boxShadow: [
                    BoxShadow(
                      color: Colors.black.withOpacity(0.1),
                      blurRadius: 4,
                      offset: const Offset(0, 2),
                    ),
                  ],
                ),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Row(
                      mainAxisAlignment: MainAxisAlignment.spaceBetween,
                      children: [
                        Text(
                          'Daily Movement & Exposure',
                          style: Theme.of(context).textTheme.titleMedium?.copyWith(
                            fontWeight: FontWeight.bold,
                          ),
                        ),
                        if (widget.onToggleFullscreen != null)
                          IconButton(
                            icon: Icon(
                              widget.showFullscreen ? Icons.fullscreen_exit : Icons.fullscreen,
                              size: 20,
                            ),
                            onPressed: widget.onToggleFullscreen,
                          ),
                      ],
                    ),
                    const SizedBox(height: 4),
                    Row(
                      children: [
                        _buildLegendItem('Movement Path', AppColors.primaryColor),
                        const SizedBox(width: 16),
                        _buildLegendItem('Pollution Level', Colors.orange),
                      ],
                    ),
                  ],
                ),
              ),
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildLegendItem(String label, Color color) {
    return Row(
      children: [
        Container(
          width: 12,
          height: 12,
          decoration: BoxDecoration(
            color: color,
            borderRadius: BorderRadius.circular(6),
          ),
        ),
        const SizedBox(width: 4),
        Text(
          label,
          style: Theme.of(context).textTheme.bodySmall,
        ),
      ],
    );
  }

  Widget _buildLoadingState() {
    return Container(
      height: 300,
      decoration: BoxDecoration(
        color: Colors.grey[100],
        borderRadius: BorderRadius.circular(12),
      ),
      child: Center(
        child: Column(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            CircularProgressIndicator(
              valueColor: AlwaysStoppedAnimation<Color>(AppColors.primaryColor),
            ),
            const SizedBox(height: 16),
            Text(
              'Loading movement data...',
              style: Theme.of(context).textTheme.bodyMedium,
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildErrorState() {
    return Container(
      height: 300,
      decoration: BoxDecoration(
        color: Colors.grey[100],
        borderRadius: BorderRadius.circular(12),
      ),
      child: Center(
        child: Column(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            Icon(
              Icons.error_outline,
              size: 48,
              color: Colors.red.withOpacity(0.5),
            ),
            const SizedBox(height: 16),
            Text(
              'Failed to load map',
              style: Theme.of(context).textTheme.titleMedium,
            ),
            const SizedBox(height: 8),
            Text(
              _errorMessage!,
              style: Theme.of(context).textTheme.bodySmall,
              textAlign: TextAlign.center,
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildNoDataState() {
    return Container(
      height: 300,
      decoration: BoxDecoration(
        color: Colors.grey[100],
        borderRadius: BorderRadius.circular(12),
      ),
      child: Center(
        child: Column(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            Icon(
              Icons.location_off,
              size: 48,
              color: Colors.grey.withOpacity(0.5),
            ),
            const SizedBox(height: 16),
            Text(
              'No movement data available',
              style: Theme.of(context).textTheme.titleMedium,
            ),
            const SizedBox(height: 8),
            Text(
              'Enable location tracking to see your daily movement patterns.',
              style: Theme.of(context).textTheme.bodySmall,
              textAlign: TextAlign.center,
            ),
          ],
        ),
      ),
    );
  }
}