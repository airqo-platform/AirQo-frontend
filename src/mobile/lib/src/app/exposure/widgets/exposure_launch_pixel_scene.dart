import 'dart:math' as math;

import 'package:flutter/material.dart';
import 'package:flutter/scheduler.dart';

/// Quiet 2D run: a man runs right and hops AirQo AQI faces.
class ExposureLaunchPixelScene extends StatefulWidget {
  const ExposureLaunchPixelScene({super.key});

  @override
  State<ExposureLaunchPixelScene> createState() =>
      _ExposureLaunchPixelSceneState();
}

class _ExposureLaunchPixelSceneState extends State<ExposureLaunchPixelScene>
    with SingleTickerProviderStateMixin {
  late final Ticker _ticker;
  Duration _elapsed = Duration.zero;

  @override
  void initState() {
    super.initState();
    _ticker = createTicker((elapsed) {
      setState(() => _elapsed = elapsed);
    });
  }

  @override
  void didChangeDependencies() {
    super.didChangeDependencies();
    final reduceMotion =
        MediaQuery.maybeOf(context)?.disableAnimations ?? false;
    if (reduceMotion) {
      if (_ticker.isActive) _ticker.stop();
    } else if (!_ticker.isActive) {
      _ticker.start();
    }
  }

  @override
  void dispose() {
    _ticker.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    return ColoredBox(
      color: const Color(0xFF8BB6D6),
      child: CustomPaint(
        painter: _PixelScenePainter(t: _elapsed.inMilliseconds / 16.0),
        child: const SizedBox.expand(),
      ),
    );
  }
}

class _AqiFace {
  const _AqiFace({
    required this.fill,
    required this.ink,
    required this.smile,
  });

  final Color fill;
  final Color ink;
  final bool smile;
}

class _PixelScenePainter extends CustomPainter {
  _PixelScenePainter({required this.t});

  final double t;

  static const _cols = 160.0;
  static const _rows = 88.0;
  static const _groundY = 70.0;
  static const _runnerX = 38.0;
  static const _speed = 1.15;
  static const _gap = 56.0;

  static const _sky = Color(0xFF8BB6D6);
  static const _haze = Color(0xFFD7C4A3);
  static const _sun = Color(0xFFF2C14E);
  static const _leaf = Color(0xFF3F8F3A);
  static const _leafDark = Color(0xFF2C6B28);
  static const _trunk = Color(0xFF6B3A24);
  static const _dukaWall = Color(0xFFE8D5B5);
  static const _dukaWall2 = Color(0xFFD9A066);
  static const _roof = Color(0xFF7A4A28);
  static const _awning = Color(0xFFE85D04);
  static const _awning2 = Color(0xFFF2D04B);
  static const _crate = Color(0xFFC57A3A);
  static const _dirt = Color(0xFFD89A58);
  static const _skin = Color(0xFF6B3A24);
  static const _skinHi = Color(0xFF8A5132);
  static const _shirt = Color(0xFF145FFF);
  static const _shorts = Color(0xFF1C1D20);
  static const _shoe = Color(0xFFF4F1EA);
  static const _black = Color(0xFF1C1D20);
  static const _matatu = Color(0xFF2F9E44);
  static const _matatuStripe = Color(0xFFF2D04B);
  static const _win = Color(0xFF3E5A73);
  static const _boda = Color(0xFF1C1D20);
  static const _bodaRed = Color(0xFFC0392B);
  static const _kitenge = Color(0xFF145FFF);

  static const _faces = <_AqiFace>[
    _AqiFace(fill: Color(0xFF8FE6A4), ink: Color(0xFF34C759), smile: true),
    _AqiFace(fill: Color(0xFFFDC412), ink: Color(0xFFB8860B), smile: true),
    _AqiFace(fill: Color(0xFFFF851F), ink: Color(0xFFC45A00), smile: false),
    _AqiFace(fill: Color(0xFFFE726B), ink: Color(0xFFC9443E), smile: false),
  ];

  @override
  void paint(Canvas canvas, Size size) {
    final sx = size.width / _cols;
    final sy = size.height / _rows;
    canvas.save();
    canvas.scale(sx, sy);

    void px(double x, double y, double w, double h, Color color) {
      canvas.drawRect(
        Rect.fromLTWH(x.roundToDouble(), y.roundToDouble(), w, h),
        Paint()..color = color,
      );
    }

    canvas.drawRect(
      const Rect.fromLTWH(0, 0, _cols, 58),
      Paint()
        ..shader = const LinearGradient(
          begin: Alignment.topCenter,
          end: Alignment.bottomCenter,
          colors: [_sky, _haze],
        ).createShader(const Rect.fromLTWH(0, 0, _cols, 58)),
    );
    px(128, 10, 7, 7, _sun);

    _drawAcacia(px, 4, 28);
    _drawDuka(px, 62, 42, _dukaWall);
    _drawMango(px, 96, 24);
    _drawDuka(px, 128, 42, _dukaWall2);
    px(0, _groundY - 6, 160, 24, _dirt);
    px(0, _groundY, 160, 18, const Color(0xFFB56A32));
    px(12, _groundY + 3, 18, 2, const Color(0x66FFFFFF));
    px(58, _groundY + 4, 14, 2, const Color(0x55FFFFFF));
    px(108, _groundY + 3, 16, 2, const Color(0x66FFFFFF));

    final scroll = t * _speed;
    double wrap(double x, double span) => ((x % span) + span) % span - 28;
    _drawMatatu(px, wrap(scroll * 0.45 + 80, 220), _groundY - 22);
    _drawBoda(px, wrap(scroll * 0.85 + 10, 200), _groundY - 16, (t / 6).floor());

    var jump = 0.0;
    for (var i = 0; i < 8; i++) {
      final worldX = 90.0 + i * _gap;
      final x = worldX - (scroll % (_gap * 4)) - 20;
      if (x < -16 || x > 170) continue;
      final face = _faces[i % _faces.length];
      _drawFace(px, x, _groundY - 14, face);

      final dx = x - _runnerX;
      if (dx > -6 && dx < 22) {
        final p = ((dx + 6) / 28).clamp(0.0, 1.0);
        jump = math.max(jump, math.sin(p * math.pi) * 18);
      }
    }

    _drawRunner(px, _runnerX, _groundY - 16 - jump, (t / 5).floor());
    canvas.restore();
  }

  void _drawAcacia(
    void Function(double, double, double, double, Color) px,
    double x,
    double y,
  ) {
    px(x + 7, y + 18, 3, 18, _trunk);
    px(x, y + 8, 18, 8, _leafDark);
    px(x + 2, y + 4, 14, 8, _leaf);
    px(x + 5, y, 8, 6, _leaf);
  }

  void _drawMango(
    void Function(double, double, double, double, Color) px,
    double x,
    double y,
  ) {
    px(x + 8, y + 16, 3, 20, _trunk);
    px(x + 2, y + 6, 16, 14, _leaf);
    px(x + 5, y, 10, 10, _leafDark);
    px(x + 4, y + 10, 2, 3, const Color(0xFFE85D04));
    px(x + 12, y + 12, 2, 3, const Color(0xFFE85D04));
  }

  void _drawDuka(
    void Function(double, double, double, double, Color) px,
    double x,
    double y,
    Color wall,
  ) {
    px(x, y + 8, 22, 16, wall);
    px(x - 1, y + 4, 24, 4, _roof);
    px(x, y + 8, 22, 3, _awning);
    px(x + 2, y + 9, 4, 2, _awning2);
    px(x + 10, y + 9, 4, 2, _awning2);
    px(x + 8, y + 14, 5, 10, _black);
    px(x + 3, y + 14, 4, 4, _win);
    px(x + 15, y + 14, 4, 4, _win);
    px(x + 1, y + 22, 3, 2, _crate);
    px(x + 17, y + 22, 3, 2, _crate);
  }

  void _drawMatatu(
    void Function(double, double, double, double, Color) px,
    double x,
    double y,
  ) {
    px(x, y, 24, 12, _matatu);
    px(x, y + 5, 24, 2, _matatuStripe);
    px(x + 2, y + 2, 4, 3, _win);
    px(x + 8, y + 2, 4, 3, _win);
    px(x + 14, y + 2, 4, 3, _win);
    px(x + 20, y + 3, 3, 3, _win);
    px(x + 2, y + 11, 5, 3, _black);
    px(x + 17, y + 11, 5, 3, _black);
    px(x + 10, y - 1, 4, 1, const Color(0xFFE85D04));
  }

  void _drawBoda(
    void Function(double, double, double, double, Color) px,
    double x,
    double y,
    int frame,
  ) {
    final lean = frame.isEven ? 0.0 : 1.0;
    px(x + 7 + lean, y, 3, 3, _skinHi);
    px(x + 6 + lean, y + 3, 5, 4, _bodaRed);
    px(x + 11 + lean, y + 1, 3, 3, _skin);
    px(x + 10 + lean, y + 4, 4, 3, _kitenge);
    px(x + 2, y + 7, 14, 2, _boda);
    px(x + 1, y + 8, 3, 3, _black);
    px(x + 13, y + 8, 3, 3, _black);
  }

  void _drawFace(
    void Function(double, double, double, double, Color) px,
    double x,
    double y,
    _AqiFace face,
  ) {
    px(x + 1, y, 12, 12, face.fill);
    px(x + 3, y + 3, 2, 2, face.ink);
    px(x + 8, y + 3, 2, 2, face.ink);
    if (face.smile) {
      px(x + 3, y + 8, 8, 2, face.ink);
      px(x + 3, y + 7, 1, 1, face.ink);
      px(x + 10, y + 7, 1, 1, face.ink);
    } else {
      px(x + 3, y + 8, 8, 2, face.ink);
      px(x + 3, y + 9, 1, 1, face.ink);
      px(x + 10, y + 9, 1, 1, face.ink);
    }
  }

  void _drawRunner(
    void Function(double, double, double, double, Color) px,
    double x,
    double y,
    int frame,
  ) {
    final stride = frame.isEven;
    px(x + 5, y, 5, 5, _skinHi);
    px(x + 6, y + 1, 3, 1, _black);
    px(x + 9, y + 2, 1, 1, _skin);
    px(x + 4, y + 5, 7, 6, _shirt);
    px(x + 11, y + 6, 3, 2, _skin);
    px(x + 3, y + 6, 2, 2, _skin);
    px(x + 5, y + 11, 6, 3, _shorts);
    if (stride) {
      px(x + 4, y + 14, 2, 4, _skin);
      px(x + 9, y + 14, 2, 3, _skin);
      px(x + 4, y + 18, 3, 2, _shoe);
      px(x + 9, y + 17, 3, 2, _shoe);
    } else {
      px(x + 3, y + 14, 2, 3, _skin);
      px(x + 10, y + 14, 2, 4, _skin);
      px(x + 3, y + 17, 3, 2, _shoe);
      px(x + 10, y + 18, 3, 2, _shoe);
    }
  }

  @override
  bool shouldRepaint(covariant _PixelScenePainter oldDelegate) =>
      oldDelegate.t != t;
}
