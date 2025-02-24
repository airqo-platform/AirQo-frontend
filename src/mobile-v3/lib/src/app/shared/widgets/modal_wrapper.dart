import 'package:flutter/material.dart';

class ModalWrapper extends StatelessWidget {
  final Widget child;
  const ModalWrapper({super.key, required this.child});

  @override
  Widget build(BuildContext context) {
    return Container(
      decoration: BoxDecoration(
        borderRadius: BorderRadius.vertical(top: Radius.circular(20.0)),
        color: Theme.of(context).scaffoldBackgroundColor,
      ),
      child: child,
    );
  }
}
