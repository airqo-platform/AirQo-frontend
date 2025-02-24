import 'dart:io';

import 'package:app/themes/theme.dart';
import 'package:flutter/cupertino.dart';
import 'package:flutter/material.dart';
import 'package:shimmer/shimmer.dart';

class CircularLoadingIndicator extends StatelessWidget {
  const CircularLoadingIndicator({
    super.key,
    required this.loading,
  });
  final bool loading;

  @override
  Widget build(BuildContext context) {
    if (!loading) {
      return Container();
    }

    if (Platform.isAndroid) {
      return SizedBox(
        height: 8,
        width: 8,
        child: CircularProgressIndicator(
          strokeWidth: 1,
          color: CustomColors.appColorBlue,
        ),
      );
    }

    return SizedBox(
      height: 8,
      width: 8,
      child: CupertinoActivityIndicator(
        radius: 7,
        color: CustomColors.appColorBlue,
      ),
    );
  }
}

class CircularLoadingAnimation extends StatelessWidget {
  const CircularLoadingAnimation({
    super.key,
    required this.size,
  });
  final double size;

  @override
  Widget build(BuildContext context) {
    return SizedBox(
      height: size,
      width: size,
      child: Shimmer.fromColors(
        baseColor: CustomColors.appLoadingColor,
        highlightColor: Colors.white,
        child: Container(
          decoration: BoxDecoration(
            color: CustomColors.appLoadingColor,
            shape: BoxShape.circle,
          ),
        ),
      ),
    );
  }
}

class ContainerLoadingAnimation extends StatelessWidget {
  const ContainerLoadingAnimation({
    super.key,
    required this.radius,
    required this.height,
  });
  final double radius;
  final double height;

  @override
  Widget build(BuildContext context) {
    return SizedBox(
      height: height,
      child: Shimmer.fromColors(
        baseColor: CustomColors.appLoadingColor,
        highlightColor: Colors.white,
        child: Container(
          constraints: BoxConstraints(
            minHeight: height,
            maxHeight: height,
          ),
          decoration: BoxDecoration(
            color: CustomColors.appLoadingColor,
            borderRadius: BorderRadius.all(
              Radius.circular(radius),
            ),
          ),
        ),
      ),
    );
  }
}

class LoadingIcon extends StatelessWidget {
  const LoadingIcon({
    super.key,
    this.radius,
  });

  final double? radius;

  @override
  Widget build(BuildContext context) {
    return CupertinoActivityIndicator(
      radius: radius ?? 16,
      color: CustomColors.appColorBlue,
    );
  }
}

void loadingScreen(BuildContext context) async {
  await showDialog(
    barrierColor: Colors.transparent,
    context: context,
    barrierDismissible: false,
    builder: (ctx) => CupertinoActivityIndicator(
      radius: 25,
      color: CustomColors.appColorBlue,
    ),
  );
}

class SizedContainerLoadingAnimation extends StatelessWidget {
  const SizedContainerLoadingAnimation({
    super.key,
    required this.height,
    required this.width,
    required this.radius,
  });
  final double height;
  final double width;
  final double radius;

  @override
  Widget build(BuildContext context) {
    return SizedBox(
      height: height,
      width: width,
      child: Shimmer.fromColors(
        baseColor: CustomColors.appLoadingColor,
        highlightColor: Colors.white,
        child: Container(
          constraints: BoxConstraints(
            minWidth: width,
            minHeight: height,
            maxWidth: width,
            maxHeight: height,
          ),
          decoration: BoxDecoration(
            color: CustomColors.appLoadingColor,
            borderRadius: BorderRadius.all(
              Radius.circular(radius),
            ),
          ),
        ),
      ),
    );
  }
}
