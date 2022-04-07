import 'package:app/constants/config.dart';
import 'package:flutter/cupertino.dart';
import 'package:flutter/material.dart';
import 'package:shimmer/shimmer.dart';

Widget circularLoadingAnimation(double size) {
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

Widget containerLoadingAnimation(
    {required double height, required double radius}) {
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

void loadingScreen(BuildContext _context) async {
  await showDialog(
      context: _context,
      barrierDismissible: false,
      builder: (ctx) => Container(
          decoration:
              BoxDecoration(color: Config.appColorBlue.withOpacity(0.05)),
          child: Center(
              child: CircularProgressIndicator(
            color: Config.appColorBlue,
          ))));
}

Widget refreshIndicator(
    {required SliverChildDelegate sliverChildDelegate,
    Future Function()? onRefresh}) {
  return CustomScrollView(
    physics: const BouncingScrollPhysics(),
    slivers: [
      CupertinoSliverRefreshControl(
        refreshTriggerPullDistance: 70,
        refreshIndicatorExtent: 60,
        onRefresh: onRefresh,
      ),
      SliverList(
        delegate: sliverChildDelegate,
      ),
    ],
  );
}

Widget sizedContainerLoadingAnimation(
    double height, double width, double radius) {
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

Widget textLoadingAnimation(double height, double width) {
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

class LoadingOverlay {
  BuildContext _context;

  factory LoadingOverlay.of(BuildContext context) {
    return LoadingOverlay._create(context);
  }

  LoadingOverlay._create(this._context);

  Future<T> during<T>(Future<T> future) {
    show();
    return future.whenComplete(hide);
  }

  void hide() {
    Navigator.of(_context).pop();
  }

  void show() {
    showDialog(
        context: _context,
        barrierDismissible: false,
        builder: (ctx) => Container(
            decoration:
                const BoxDecoration(color: Color.fromRGBO(0, 0, 0, 0.5)),
            child: const Center(child: CircularProgressIndicator())));
  }
}
