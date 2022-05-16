import 'package:app/constants/config.dart';
import 'package:flutter/cupertino.dart';
import 'package:flutter/material.dart';
import 'package:shimmer/shimmer.dart';

class CircularLoadingAnimation extends StatelessWidget {
  final double size;
  const CircularLoadingAnimation({Key? key, required this.size})
      : super(key: key);

  @override
  Widget build(BuildContext context) {
    return SizedBox(
        height: size,
        width: size,
        child: Shimmer.fromColors(
          baseColor: Config.appLoadingColor,
          highlightColor: Colors.white,
          child: Container(
            decoration: BoxDecoration(
              color: Config.appLoadingColor,
              shape: BoxShape.circle,
            ),
          ),
        ));
  }
}

class ContainerLoadingAnimation extends StatelessWidget {
  final double radius;
  final double height;
  const ContainerLoadingAnimation(
      {Key? key, required this.radius, required this.height})
      : super(key: key);

  @override
  Widget build(BuildContext context) {
    return SizedBox(
      height: height,
      child: Shimmer.fromColors(
        baseColor: Config.appLoadingColor,
        highlightColor: Colors.white,
        child: Container(
            constraints: BoxConstraints(minHeight: height, maxHeight: height),
            decoration: BoxDecoration(
                color: Config.appLoadingColor,
                borderRadius: BorderRadius.all(Radius.circular(radius)))),
      ),
    );
  }
}

void loadingScreen(BuildContext _context) async {
  await showDialog(
      context: _context,
      barrierDismissible: false,
      builder: (ctx) => Container(
          decoration:
              BoxDecoration(color: Config.appColorBlue.withOpacity(0.005)),
          child: CupertinoActivityIndicator(
            radius: 20,
            color: Config.appColorBlue,
          )));
}

class SizedContainerLoadingAnimation extends StatelessWidget {
  final double height;
  final double width;
  final double radius;
  const SizedContainerLoadingAnimation(
      {Key? key,
      required this.height,
      required this.width,
      required this.radius})
      : super(key: key);

  @override
  Widget build(BuildContext context) {
    return SizedBox(
      height: height,
      width: width,
      child: Shimmer.fromColors(
        baseColor: Config.appLoadingColor,
        highlightColor: Colors.white,
        child: Container(
            constraints: BoxConstraints(
                minWidth: width,
                minHeight: height,
                maxWidth: width,
                maxHeight: height),
            decoration: BoxDecoration(
                color: Config.appLoadingColor,
                borderRadius: BorderRadius.all(Radius.circular(radius)))),
      ),
    );
  }
}

class TextLoadingAnimation extends StatelessWidget {
  final double height;
  final double width;
  const TextLoadingAnimation(
      {Key? key, required this.height, required this.width})
      : super(key: key);

  @override
  Widget build(BuildContext context) {
    return SizedBox(
      height: height,
      width: width,
      child: Shimmer.fromColors(
        baseColor: Config.appLoadingColor,
        highlightColor: Colors.white,
        child: Container(
            constraints: BoxConstraints(
                minWidth: width,
                minHeight: height,
                maxWidth: width,
                maxHeight: height),
            decoration: BoxDecoration(
                color: Config.appLoadingColor,
                borderRadius: const BorderRadius.all(Radius.circular(2)))),
      ),
    );
  }
}
