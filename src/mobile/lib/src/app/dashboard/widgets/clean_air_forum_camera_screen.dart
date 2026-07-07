import 'dart:io';

import 'package:airqo/src/app/dashboard/models/airquality_response.dart';
import 'package:airqo/src/app/dashboard/utils/air_quality_card_utils.dart';
import 'package:airqo/src/app/dashboard/utils/clean_air_forum_branding.dart';
import 'package:airqo/src/app/dashboard/utils/measurement_location_utils.dart';
import 'package:camera/camera.dart';
import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:permission_handler/permission_handler.dart';

/// Live camera preview with the Clean Air Forum filter chrome drawn on top
/// (Snapchat-style), so users can see roughly how the branded card will
/// look — and where to place their face — before they tap the shutter.
///
/// Returns the captured photo as a [File] via `Navigator.pop`, or `null` if
/// the user backed out or the camera wasn't available (callers should fall
/// back to the system camera/gallery picker in that case).
class CleanAirForumCameraScreen extends StatefulWidget {
  final Measurement measurement;
  final String? fallbackLocationName;

  const CleanAirForumCameraScreen({
    super.key,
    required this.measurement,
    this.fallbackLocationName,
  });

  @override
  State<CleanAirForumCameraScreen> createState() =>
      _CleanAirForumCameraScreenState();
}

class _CleanAirForumCameraScreenState extends State<CleanAirForumCameraScreen>
    with WidgetsBindingObserver {
  CameraController? _controller;
  List<CameraDescription> _cameras = const [];
  int _cameraIndex = 0;
  Future<void>? _initializeFuture;
  bool _isCapturing = false;
  String? _errorMessage;

  @override
  void initState() {
    super.initState();
    WidgetsBinding.instance.addObserver(this);
    SystemChrome.setPreferredOrientations([DeviceOrientation.portraitUp]);
    _initializeFuture = _setUp();
  }

  Future<void> _setUp() async {
    final status = await Permission.camera.request();
    if (!status.isGranted) {
      setState(() => _errorMessage =
          'Camera permission was denied. Enable it in system settings to '
              'use the live filter preview.');
      return;
    }

    try {
      _cameras = await availableCameras();
    } catch (_) {
      setState(() => _errorMessage = 'No camera is available on this device.');
      return;
    }

    if (_cameras.isEmpty) {
      setState(() => _errorMessage = 'No camera is available on this device.');
      return;
    }

    final frontIndex = _cameras
        .indexWhere((c) => c.lensDirection == CameraLensDirection.front);
    _cameraIndex = frontIndex != -1 ? frontIndex : 0;

    await _openCamera(_cameraIndex);
  }

  Future<void> _openCamera(int index) async {
    final previous = _controller;
    _controller = CameraController(
      _cameras[index],
      ResolutionPreset.high,
      enableAudio: false,
      imageFormatGroup: ImageFormatGroup.jpeg,
    );
    try {
      await _controller!.initialize();
    } catch (_) {
      setState(() => _errorMessage = 'Could not start the camera.');
      return;
    } finally {
      await previous?.dispose();
    }
    if (mounted) setState(() {});
  }

  Future<void> _switchCamera() async {
    if (_cameras.length < 2 || _controller == null) return;
    _cameraIndex = (_cameraIndex + 1) % _cameras.length;
    setState(() {});
    await _openCamera(_cameraIndex);
  }

  Future<void> _capture() async {
    final controller = _controller;
    if (controller == null || !controller.value.isInitialized || _isCapturing) {
      return;
    }

    setState(() => _isCapturing = true);
    try {
      final file = await controller.takePicture();
      if (!mounted) return;
      Navigator.of(context).pop(File(file.path));
    } catch (_) {
      if (mounted) setState(() => _isCapturing = false);
    }
  }

  @override
  void didChangeAppLifecycleState(AppLifecycleState state) {
    final controller = _controller;
    if (controller == null || !controller.value.isInitialized) return;

    if (state == AppLifecycleState.inactive) {
      // Clear the field before disposing — otherwise it keeps pointing at a
      // disposed controller (dispose() doesn't flip isInitialized back to
      // false), so a rebuild triggered before _openCamera() finishes on
      // resume could still try to paint CameraPreview against it.
      _controller = null;
      if (mounted) setState(() {});
      controller.dispose();
    } else if (state == AppLifecycleState.resumed) {
      _openCamera(_cameraIndex);
    }
  }

  @override
  void dispose() {
    WidgetsBinding.instance.removeObserver(this);
    SystemChrome.setPreferredOrientations(DeviceOrientation.values);
    _controller?.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: Colors.black,
      body: SafeArea(
        child: FutureBuilder<void>(
          future: _initializeFuture,
          builder: (context, snapshot) {
            if (_errorMessage != null) {
              return _ErrorState(message: _errorMessage!);
            }
            final controller = _controller;
            if (controller == null || !controller.value.isInitialized) {
              return const Center(
                child: CircularProgressIndicator(color: Colors.white),
              );
            }

            return Stack(
              fit: StackFit.expand,
              children: [
                Center(
                  child: AspectRatio(
                    aspectRatio: 1,
                    // Not mirrored — shows the same orientation as the
                    // photo that actually gets saved, so there's no
                    // surprise flip between preview and result.
                    child: ClipRect(
                      // CameraPreview stretches to fill whatever box it's
                      // given rather than preserving its native aspect
                      // ratio, which warps the feed (fisheye-looking) when
                      // that box (our 1:1 square) doesn't match the
                      // sensor's ratio. Size it at its true aspect ratio
                      // first, then cover-crop into the square so nothing
                      // gets stretched.
                      child: FittedBox(
                        fit: BoxFit.cover,
                        child: SizedBox(
                          width: 100,
                          height: 100 * controller.value.aspectRatio,
                          child: CameraPreview(controller),
                        ),
                      ),
                    ),
                  ),
                ),
                Center(
                  child: AspectRatio(
                    aspectRatio: 1,
                    child: _FilterGuideOverlay(
                      measurement: widget.measurement,
                      fallbackLocationName: widget.fallbackLocationName,
                    ),
                  ),
                ),
                Positioned(
                  top: 8,
                  left: 8,
                  child: _RoundIconButton(
                    icon: Icons.close_rounded,
                    onTap: () => Navigator.of(context).pop(),
                  ),
                ),
                if (_cameras.length > 1)
                  Positioned(
                    top: 8,
                    right: 8,
                    child: _RoundIconButton(
                      icon: Icons.flip_camera_ios_rounded,
                      onTap: _switchCamera,
                    ),
                  ),
                Positioned(
                  left: 0,
                  right: 0,
                  bottom: 28,
                  child: Center(
                    child: GestureDetector(
                      onTap: _capture,
                      child: Container(
                        width: 76,
                        height: 76,
                        decoration: BoxDecoration(
                          shape: BoxShape.circle,
                          border: Border.all(color: Colors.white, width: 4),
                        ),
                        padding: const EdgeInsets.all(4),
                        child: DecoratedBox(
                          decoration: BoxDecoration(
                            shape: BoxShape.circle,
                            color: _isCapturing ? Colors.white38 : Colors.white,
                          ),
                          child: _isCapturing
                              ? const Padding(
                                  padding: EdgeInsets.all(18),
                                  child: CircularProgressIndicator(
                                    strokeWidth: 2,
                                  ),
                                )
                              : null,
                        ),
                      ),
                    ),
                  ),
                ),
              ],
            );
          },
        ),
      ),
    );
  }
}

/// Semi-transparent replica of the [CleanAirForumFilterCard] chrome, drawn
/// over the live preview so users know where the brand header, AQI panel,
/// and face guide will land.
class _FilterGuideOverlay extends StatelessWidget {
  final Measurement measurement;
  final String? fallbackLocationName;

  const _FilterGuideOverlay({
    required this.measurement,
    this.fallbackLocationName,
  });

  @override
  Widget build(BuildContext context) {
    final locationName = sanitizeCardText(
      measurementDisplayName(
        measurement,
        fallbackLocationName: fallbackLocationName,
      ),
    );
    final category = aqiCategoryLabel(
      sanitizeCardText(measurement.aqiCategory ?? 'Unavailable'),
    );
    final pm25Value = measurement.pm25?.value;
    final categoryColor = getMeasurementAqiColor(measurement);

    return LayoutBuilder(
      builder: (context, constraints) {
        final scale = constraints.maxWidth / kCafReferenceWidth;

        return IgnorePointer(
          child: Stack(
            fit: StackFit.expand,
            children: [
              Positioned(
                left: 0,
                right: 0,
                bottom: 0,
                height: constraints.maxWidth * 0.62,
                child: DecoratedBox(
                  decoration: BoxDecoration(
                    gradient: LinearGradient(
                      begin: Alignment.topCenter,
                      end: Alignment.bottomCenter,
                      colors: [
                        CleanAirForumBrand.scrimTeal.withValues(alpha: 0),
                        CleanAirForumBrand.scrimTeal.withValues(alpha: 0.75),
                      ],
                    ),
                  ),
                ),
              ),
              // Oval face guide so users know where to center themselves.
              Center(
                child: FractionallySizedBox(
                  widthFactor: 0.52,
                  heightFactor: 0.42,
                  child: DecoratedBox(
                    decoration: BoxDecoration(
                      shape: BoxShape.circle,
                      border: Border.all(
                        color: Colors.white.withValues(alpha: 0.55),
                        width: 2,
                      ),
                    ),
                  ),
                ),
              ),
              Positioned(
                top: 53 * scale,
                left: 44 * scale,
                right: 44 * scale,
                child: CleanAirForumBrandHeader(scale: scale),
              ),
              Positioned(
                left: 44 * scale,
                right: 31 * scale,
                bottom: 44 * scale,
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  mainAxisSize: MainAxisSize.min,
                  children: [
                    Text(
                      locationName,
                      maxLines: 1,
                      overflow: TextOverflow.ellipsis,
                      style: TextStyle(
                        color: Colors.white,
                        fontSize: 68.949 * scale,
                        fontWeight: FontWeight.w800,
                      ),
                    ),
                    SizedBox(height: 17 * scale),
                    Row(
                      crossAxisAlignment: CrossAxisAlignment.end,
                      children: [
                        Text(
                          pm25Value != null
                              ? pm25Value.toStringAsFixed(1)
                              : '--',
                          style: TextStyle(
                            color: Colors.white,
                            fontSize: 92.14 * scale,
                            fontWeight: FontWeight.w800,
                          ),
                        ),
                        SizedBox(width: 8 * scale),
                        Padding(
                          padding: EdgeInsets.only(bottom: 10 * scale),
                          child: Text(
                            'PM2.5 µg/m³',
                            style: TextStyle(
                              color: Colors.white,
                              fontSize: 21.021 * scale,
                              fontWeight: FontWeight.w700,
                            ),
                          ),
                        ),
                        SizedBox(width: 12 * scale),
                        Padding(
                          padding: EdgeInsets.only(bottom: 12 * scale),
                          child: Container(
                            padding: EdgeInsets.symmetric(
                              horizontal: 25.333 * scale,
                              vertical: 4.75 * scale,
                            ),
                            decoration: BoxDecoration(
                              color: aqiPillBackground(categoryColor),
                              borderRadius: BorderRadius.circular(999),
                            ),
                            child: Text(
                              category,
                              style: TextStyle(
                                color: categoryColor,
                                fontSize: 22.167 * scale,
                                fontWeight: FontWeight.w700,
                              ),
                            ),
                          ),
                        ),
                      ],
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
}

class _RoundIconButton extends StatelessWidget {
  final IconData icon;
  final VoidCallback onTap;

  const _RoundIconButton({required this.icon, required this.onTap});

  @override
  Widget build(BuildContext context) {
    return Material(
      color: Colors.black.withValues(alpha: 0.4),
      shape: const CircleBorder(),
      child: InkWell(
        customBorder: const CircleBorder(),
        onTap: onTap,
        child: Padding(
          padding: const EdgeInsets.all(10),
          child: Icon(icon, color: Colors.white, size: 22),
        ),
      ),
    );
  }
}

class _ErrorState extends StatelessWidget {
  final String message;

  const _ErrorState({required this.message});

  @override
  Widget build(BuildContext context) {
    return Center(
      child: Padding(
        padding: const EdgeInsets.all(24),
        child: Column(
          mainAxisSize: MainAxisSize.min,
          children: [
            const Icon(Icons.videocam_off_rounded,
                color: Colors.white70, size: 40),
            const SizedBox(height: 16),
            Text(
              message,
              textAlign: TextAlign.center,
              style: const TextStyle(color: Colors.white70, fontSize: 14),
            ),
            const SizedBox(height: 20),
            OutlinedButton(
              style: OutlinedButton.styleFrom(
                foregroundColor: Colors.white,
                side: const BorderSide(color: Colors.white54),
              ),
              onPressed: () => Navigator.of(context).pop(),
              child: const Text('Close'),
            ),
          ],
        ),
      ),
    );
  }
}
