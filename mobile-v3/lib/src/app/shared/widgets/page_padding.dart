import 'package:flutter/material.dart';

class PagePadding extends StatelessWidget {
  final Widget child;
  final double? padding;

  PagePadding({required this.child, this.padding = 16});

  @override
  Widget build(BuildContext context) {
    return Padding(
      padding: EdgeInsets.symmetric(horizontal: padding!),
      child: child,
    );
  }
}
