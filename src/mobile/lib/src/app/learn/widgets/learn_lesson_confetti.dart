import 'dart:math';
import 'package:flutter/material.dart';

class LearnLessonConfetti extends StatefulWidget {
  const LearnLessonConfetti({super.key});

  @override
  State<LearnLessonConfetti> createState() => _LearnLessonConfettiState();
}

class _LearnLessonConfettiState extends State<LearnLessonConfetti>
    with SingleTickerProviderStateMixin {
  late final AnimationController _controller;
  final _random = Random();

  @override
  void initState() {
    super.initState();
    _controller = AnimationController(
      vsync: this,
      duration: const Duration(milliseconds: 1200),
    )..forward();
  }

  @override
  void dispose() {
    _controller.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    return IgnorePointer(
      child: AnimatedBuilder(
        animation: _controller,
        builder: (context, _) {
          return Stack(
            children: List.generate(18, (i) {
              final left = _random.nextDouble();
              final delay = _random.nextDouble() * 0.4;
              final t = ((_controller.value - delay).clamp(0.0, 1.0));
              return Positioned(
                left: left * MediaQuery.of(context).size.width,
                top: -20 + t * 120,
                child: Opacity(
                  opacity: 1 - t,
                  child: Container(
                    width: 6,
                    height: 6,
                    decoration: BoxDecoration(
                      color: [
                        const Color(0xff145FFF),
                        const Color(0xff57D175),
                        const Color(0xffE24B4A),
                      ][_random.nextInt(3)],
                      borderRadius: BorderRadius.circular(1),
                    ),
                  ),
                ),
              );
            }),
          );
        },
      ),
    );
  }
}
