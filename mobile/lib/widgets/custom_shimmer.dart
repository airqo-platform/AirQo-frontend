import 'package:app/constants/app_constants.dart';
import 'package:flutter/cupertino.dart';
import 'package:flutter/material.dart';
import 'package:shimmer/shimmer.dart';

Widget circularLoadingAnimation(double size) {
  return SizedBox(
      height: size,
      width: size,
      child: Shimmer.fromColors(
        baseColor: ColorConstants.appColorBlue.withOpacity(0.1),
        highlightColor: ColorConstants.appColorBlue.withOpacity(0.2),
        child: Container(
          decoration: BoxDecoration(
            color: ColorConstants.appColorBlue,
            shape: BoxShape.circle,
          ),
        ),
      ));
}

Widget containerLoadingAnimation(double height, double radius) {
  return SizedBox(
    height: height,
    child: Shimmer.fromColors(
      baseColor: ColorConstants.appColorBlue.withOpacity(0.1),
      highlightColor: ColorConstants.appColorBlue.withOpacity(0.2),
      child: Container(
          constraints: BoxConstraints(minHeight: height, maxHeight: height),
          decoration: BoxDecoration(
              color: ColorConstants.appColorBlue,
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
      baseColor: ColorConstants.appColorBlue.withOpacity(0.1),
      highlightColor: ColorConstants.appColorBlue.withOpacity(0.2),
      child: Container(
          constraints: BoxConstraints(
              minWidth: width,
              minHeight: height,
              maxWidth: width,
              maxHeight: height),
          decoration: BoxDecoration(
              color: ColorConstants.appColorBlue,
              borderRadius: BorderRadius.all(Radius.circular(radius)))),
    ),
  );
}

Widget textLoadingAnimation(double height, double width) {
  return SizedBox(
    height: height,
    width: width,
    child: Shimmer.fromColors(
      baseColor: ColorConstants.appColorBlue.withOpacity(0.1),
      highlightColor: ColorConstants.appColorBlue.withOpacity(0.2),
      child: Container(
          constraints: BoxConstraints(
              minWidth: width,
              minHeight: height,
              maxWidth: width,
              maxHeight: height),
          decoration: BoxDecoration(
              color: ColorConstants.appColorBlue,
              borderRadius: const BorderRadius.all(Radius.circular(2)))),
    ),
  );
}
