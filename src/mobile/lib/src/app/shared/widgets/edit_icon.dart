import 'package:flutter/material.dart';

class EditIcon extends StatelessWidget {
  final Color color;
  final double size;

  const EditIcon({
    super.key,
    this.color = const Color(0xFF536A87),
    this.size = 24.0,
  });

  @override
  Widget build(BuildContext context) {
    return SizedBox(
      width: size,
      height: size,
      child: CustomPaint(
        painter: _EditIconPainter(color: color),
      ),
    );
  }
}

class _EditIconPainter extends CustomPainter {
  final Color color;
  const _EditIconPainter({required this.color});

  @override
  void paint(Canvas canvas, Size size) {
    final paint = Paint()
      ..color = color
      ..style = PaintingStyle.stroke
      ..strokeWidth = 1.5
      ..strokeCap = StrokeCap.round
      ..strokeJoin = StrokeJoin.round;

    final scaleX = size.width / 21.6213;
    final scaleY = size.height / 21.6213;

    final path = Path();

    // Document outline
    path.moveTo(9.75 * scaleX, 2.87132 * scaleY);
    path.lineTo(5.55 * scaleX, 2.87132 * scaleY);
    path.cubicTo(3.86984 * scaleX, 2.87132 * scaleY, 3.02976 * scaleX, 2.87132 * scaleY, 2.38803 * scaleX, 3.1983 * scaleY);
    path.cubicTo(1.82354 * scaleX, 3.48592 * scaleY, 1.3646 * scaleX, 3.94486 * scaleY, 1.07698 * scaleX, 4.50935 * scaleY);
    path.cubicTo(0.75 * scaleX, 5.15109 * scaleY, 0.75 * scaleX, 5.99116 * scaleY, 0.75 * scaleX, 7.67132 * scaleY);
    path.lineTo(0.75 * scaleX, 16.0713 * scaleY);
    path.cubicTo(0.75 * scaleX, 17.7515 * scaleY, 0.75 * scaleX, 18.5916 * scaleY, 1.07698 * scaleX, 19.2333 * scaleY);
    path.cubicTo(1.3646 * scaleX, 19.7978 * scaleY, 1.82354 * scaleX, 20.2567 * scaleY, 2.38803 * scaleX, 20.5443 * scaleY);
    path.cubicTo(3.02976 * scaleX, 20.8713 * scaleY, 3.86984 * scaleX, 20.8713 * scaleY, 5.55 * scaleX, 20.8713 * scaleY);
    path.lineTo(13.95 * scaleX, 20.8713 * scaleY);
    path.cubicTo(15.6302 * scaleX, 20.8713 * scaleY, 16.4702 * scaleX, 20.8713 * scaleY, 17.112 * scaleX, 20.5443 * scaleY);
    path.cubicTo(17.6765 * scaleX, 20.2567 * scaleY, 18.1354 * scaleX, 19.7978 * scaleY, 18.423 * scaleX, 19.2333 * scaleY);
    path.cubicTo(18.75 * scaleX, 18.5916 * scaleY, 18.75 * scaleX, 17.7515 * scaleY, 18.75 * scaleX, 16.0713 * scaleY);
    path.lineTo(18.75 * scaleX, 11.8713 * scaleY);

    // Pencil
    path.moveTo(6.74997 * scaleX, 14.8713 * scaleY);
    path.lineTo(8.42452 * scaleX, 14.8713 * scaleY);
    path.cubicTo(8.9137 * scaleX, 14.8713 * scaleY, 9.15829 * scaleX, 14.8713 * scaleY, 9.38846 * scaleX, 14.8161 * scaleY);
    path.cubicTo(9.59254 * scaleX, 14.7671 * scaleY, 9.78763 * scaleX, 14.6863 * scaleY, 9.96657 * scaleX, 14.5766 * scaleY);
    path.cubicTo(10.1684 * scaleX, 14.4529 * scaleY, 10.3414 * scaleX, 14.28 * scaleY, 10.6873 * scaleX, 13.9341 * scaleY);
    path.lineTo(20.25 * scaleX, 4.37132 * scaleY);
    path.cubicTo(21.0784 * scaleX, 3.54289 * scaleY, 21.0784 * scaleX, 2.19975 * scaleY, 20.25 * scaleX, 1.37132 * scaleY);
    path.cubicTo(19.4216 * scaleX, 0.542894 * scaleY, 18.0784 * scaleX, 0.542893 * scaleY, 17.25 * scaleX, 1.37132 * scaleY);
    path.lineTo(7.68723 * scaleX, 10.9341 * scaleY);
    path.cubicTo(7.34133 * scaleX, 11.28 * scaleY, 7.16838 * scaleX, 11.4529 * scaleY, 7.04469 * scaleX, 11.6548 * scaleY);
    path.cubicTo(6.93504 * scaleX, 11.8337 * scaleY, 6.85423 * scaleX, 12.0288 * scaleY, 6.80523 * scaleX, 12.2329 * scaleY);
    path.cubicTo(6.74997 * scaleX, 12.463 * scaleY, 6.74997 * scaleX, 12.7076 * scaleY, 6.74997 * scaleX, 13.1968 * scaleY);
    path.lineTo(6.74997 * scaleX, 14.8713 * scaleY);

    canvas.drawPath(path, paint);
  }

  @override
  bool shouldRepaint(covariant CustomPainter oldDelegate) => false;
}
