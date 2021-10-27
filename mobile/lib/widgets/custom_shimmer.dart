import 'package:app/constants/app_constants.dart';
import 'package:flutter/cupertino.dart';
import 'package:flutter/material.dart';
import 'package:shimmer/shimmer.dart';

Widget loadingAnimation(double height, double radius) {
  return SizedBox(
    height: height,
    child: Shimmer.fromColors(
      baseColor: ColorConstants.appColorBlue.withOpacity(0.1),
      highlightColor: ColorConstants.appColorBlue.withOpacity(0.2),
      child: Container(
          decoration: BoxDecoration(
              color: ColorConstants.appColorBlue,
              borderRadius: BorderRadius.all(Radius.circular(radius)))),
    ),
  );
}
