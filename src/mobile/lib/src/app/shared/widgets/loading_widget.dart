import 'package:flutter/material.dart';
import 'package:shimmer/shimmer.dart';

class ShimmerContainer extends StatelessWidget {
  final double height;
  final double width;
  final double borderRadius;
  const ShimmerContainer(
      {super.key,
      required this.height,
      required this.borderRadius,
      required this.width});

  @override
  Widget build(BuildContext context) {
    return ClipRRect(
      borderRadius: BorderRadius.circular(borderRadius),
      child: SizedBox(
        width: width,
        height: height,
        child: Shimmer.fromColors(
          baseColor: Theme.of(context).brightness == Brightness.dark
              ? Color(0xff2A2B2E)
              : Colors.grey[200]!,
          highlightColor: Theme.of(context).brightness == Brightness.dark
              ? Color(0xff38393C)
              : Colors.grey[50]!,
          child: Container(
            color: Colors.black,
          ),
        ),
      ),
    );
  }
}

class ShimmerText extends StatelessWidget {
  final double? width;
  final double? height;
  const ShimmerText({super.key, this.width = 100, this.height = 10});

  @override
  Widget build(BuildContext context) {
    return Row(
      children: [
        ShimmerContainer(height: height!, borderRadius: 100, width: 10),
        SizedBox(width: 2),
        ShimmerContainer(height: height!, borderRadius: 100, width: width!),
      ],
    );
  }
}
