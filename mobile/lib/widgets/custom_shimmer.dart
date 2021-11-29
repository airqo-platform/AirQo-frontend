import 'package:app/constants/app_constants.dart';
import 'package:flutter/cupertino.dart';
import 'package:flutter/material.dart';
import 'package:shimmer/shimmer.dart';

Widget circularLoadingAnimation(double size) {
  return SizedBox(
      height: size,
      width: size,
      child: Shimmer.fromColors(
        baseColor: ColorConstants.appLoadingColor,
        highlightColor: Colors.white,
        child: Container(
          decoration: BoxDecoration(
            color: ColorConstants.appLoadingColor,
            shape: BoxShape.circle,
          ),
        ),
      ));
}

Widget containerLoadingAnimation(double height, double radius) {
  return SizedBox(
    height: height,
    child: Shimmer.fromColors(
      baseColor: ColorConstants.appLoadingColor,
      highlightColor: Colors.white,
      child: Container(
          constraints: BoxConstraints(minHeight: height, maxHeight: height),
          decoration: BoxDecoration(
              color: ColorConstants.appLoadingColor,
              borderRadius: BorderRadius.all(Radius.circular(radius)))),
    ),
  );
}

Widget sizedContainerLoadingAnimation(
    double height, double width, double radius) {
  return SizedBox(
    height: height,
    width: width,
    child: Shimmer.fromColors(
      baseColor: ColorConstants.appLoadingColor,
      highlightColor: Colors.white,
      child: Container(
          constraints: BoxConstraints(
              minWidth: width,
              minHeight: height,
              maxWidth: width,
              maxHeight: height),
          decoration: BoxDecoration(
              color: ColorConstants.appLoadingColor,
              borderRadius: BorderRadius.all(Radius.circular(radius)))),
    ),
  );
}

Widget textLoadingAnimation(double height, double width) {
  return SizedBox(
    height: height,
    width: width,
    child: Shimmer.fromColors(
      baseColor: ColorConstants.appLoadingColor,
      highlightColor: Colors.white,
      child: Container(
          constraints: BoxConstraints(
              minWidth: width,
              minHeight: height,
              maxWidth: width,
              maxHeight: height),
          decoration: BoxDecoration(
              color: ColorConstants.appLoadingColor,
              borderRadius: const BorderRadius.all(Radius.circular(2)))),
    ),
  );
}
