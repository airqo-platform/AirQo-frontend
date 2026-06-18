import 'package:flutter/material.dart';

class LearnLessonImage extends StatelessWidget {
  final String url;
  final double height;

  const LearnLessonImage({
    super.key,
    required this.url,
    this.height = 200,
  });

  @override
  Widget build(BuildContext context) {
    if (url.isEmpty) {
      return Container(
        height: height,
        color: Theme.of(context).highlightColor,
        alignment: Alignment.center,
        child: const Icon(Icons.image_not_supported),
      );
    }
    return Image.network(
      url,
      height: height,
      width: double.infinity,
      fit: BoxFit.cover,
      errorBuilder: (_, __, ___) => Container(
        height: height,
        color: Theme.of(context).highlightColor,
        alignment: Alignment.center,
        child: const Icon(Icons.broken_image_outlined),
      ),
    );
  }
}
