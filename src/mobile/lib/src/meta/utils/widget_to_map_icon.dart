import 'dart:math';
import 'dart:ui' as ui;
import 'package:flutter/services.dart';
import 'package:flutter_svg/flutter_svg.dart';
import 'package:google_maps_flutter/google_maps_flutter.dart';

final Map<String, Future<BitmapDescriptor>> _bitmapDescriptorCache = {};

Future<BitmapDescriptor> bitmapDescriptorFromSvgAsset(
  String assetName, [
  Size size = const Size(28, 28),
]) async {
  final devicePixelRatio =
      ui.PlatformDispatcher.instance.views.first.devicePixelRatio;
  final cacheKey = '$assetName:${size.width}x${size.height}:$devicePixelRatio';

  return _bitmapDescriptorCache.putIfAbsent(
    cacheKey,
    () => _rasterizeSvgAsset(assetName, size, devicePixelRatio),
  );
}

Future<BitmapDescriptor> _rasterizeSvgAsset(
  String assetName,
  Size size,
  double devicePixelRatio,
) async {
  final pictureInfo = await vg.loadPicture(SvgAssetLoader(assetName), null);

  final width = (size.width * devicePixelRatio).toInt();
  final height = (size.height * devicePixelRatio).toInt();

  final scaleFactor = min(
    width / pictureInfo.size.width,
    height / pictureInfo.size.height,
  );

  final recorder = ui.PictureRecorder();

  ui.Canvas(recorder)
    ..scale(scaleFactor)
    ..drawPicture(pictureInfo.picture);

  final rasterPicture = recorder.endRecording();

  final image = rasterPicture.toImageSync(width, height);
  final bytes = (await image.toByteData(format: ui.ImageByteFormat.png))!;

  return BitmapDescriptor.bytes(bytes.buffer.asUint8List());
}
