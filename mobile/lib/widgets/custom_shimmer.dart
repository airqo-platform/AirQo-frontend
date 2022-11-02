import 'package:app/themes/theme.dart';
import 'package:flutter/cupertino.dart';
import 'package:flutter/material.dart';
import 'package:shimmer/shimmer.dart';

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
      radius: 20,
      color: CustomColors.appColorBlue,
    ),
  );
}

class LoadingWidget extends StatelessWidget {
  const LoadingWidget({super.key, this.backgroundColor});
  final Color? backgroundColor;

  @override
  Widget build(BuildContext context) {
    return Container(
      color: backgroundColor ?? CustomColors.appBodyColor,
      child: Center(
        child: CupertinoActivityIndicator(
          radius: 20,
          color: CustomColors.appColorBlue,
        ),
      ),
    );
  }
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

class TextLoadingAnimation extends StatelessWidget {
  const TextLoadingAnimation({
    super.key,
    required this.height,
    required this.width,
  });
  final double height;
  final double width;

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
            borderRadius: const BorderRadius.all(
              Radius.circular(2),
            ),
          ),
        ),
      ),
    );
  }
}

class AnalyticsCardLoading extends StatelessWidget {
  const AnalyticsCardLoading({super.key});

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: const EdgeInsets.only(
        top: 32,
        bottom: 22,
      ),
      constraints: const BoxConstraints(
        maxHeight: 251,
        minHeight: 251,
      ),
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: const BorderRadius.all(
          Radius.circular(
            16.0,
          ),
        ),
        border: Border.fromBorderSide(
          BorderSide(color: Colors.transparent),
        ),
      ),
      child: Column(
        children: [
          Padding(
            padding: const EdgeInsets.only(
              left: 24,
              right: 24,
            ),
            child: Row(
              children: [
                const CircularLoadingAnimation(size: 104),
                const SizedBox(
                  width: 16.0,
                ),
                Expanded(
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: const [
                      SizedContainerLoadingAnimation(
                        height: 15,
                        width: 139,
                        radius: 1000,
                      ),
                      SizedBox(
                        height: 9,
                      ),
                      SizedContainerLoadingAnimation(
                        height: 10,
                        width: 115,
                        radius: 1000,
                      ),
                      SizedBox(
                        height: 12,
                      ),
                      SizedContainerLoadingAnimation(
                        height: 24,
                        width: 115,
                        radius: 1000,
                      ),
                    ],
                  ),
                ),
              ],
            ),
          ),
          const SizedBox(height: 20),
          const Padding(
            padding: EdgeInsets.only(
              left: 24,
              right: 24,
            ),
            child: ContainerLoadingAnimation(
              height: 9,
              radius: 1000,
            ),
          ),
          const Divider(
            color: Color(0xffC4C4C4),
          ),
          const SizedBox(
            height: 16,
          ),
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceEvenly,
            children: const [
              SizedContainerLoadingAnimation(
                height: 20,
                width: 105,
                radius: 1000,
              ),
              SizedContainerLoadingAnimation(
                height: 20,
                width: 105,
                radius: 1000,
              ),
            ],
          ),
        ],
      ),
    );
  }
}
