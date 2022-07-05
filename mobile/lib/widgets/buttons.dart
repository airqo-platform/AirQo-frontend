import 'package:app/themes/colors.dart';
import 'package:flutter/material.dart';
import 'package:flutter_svg/svg.dart';

import '../themes/app_theme.dart';

class NextButton extends StatelessWidget {
  const NextButton({
    super.key,
    required this.buttonColor,
    this.text,
  });
  final String? text;
  final Color buttonColor;

  @override
  Widget build(BuildContext context) {
    return Container(
      height: 48,
      constraints: const BoxConstraints(
        minWidth: double.infinity,
      ),
      decoration: BoxDecoration(
        color: buttonColor,
        borderRadius: const BorderRadius.all(
          Radius.circular(8.0),
        ),
      ),
      child: Row(
        crossAxisAlignment: CrossAxisAlignment.center,
        mainAxisAlignment: MainAxisAlignment.center,
        children: [
          Text(
            text ?? 'Next',
            style: const TextStyle(
              color: Colors.white,
              fontSize: 14,
              letterSpacing: 16 * -0.022,
            ),
          ),
          const SizedBox(
            width: 11,
          ),
          SvgPicture.asset(
            'assets/icon/next_arrow.svg',
            semanticsLabel: 'Share',
            height: 17.42,
            width: 10.9,
          ),
        ],
      ),
    );
  }
}

class AppBackButton extends StatelessWidget {
  const AppBackButton({
    super.key,
  });

  @override
  Widget build(BuildContext context) {
    return GestureDetector(
      onTap: () {
        Navigator.pop(context);
      },
      child: SvgPicture.asset(
        'assets/icon/back_button.svg',
        semanticsLabel: 'more',
        height: 40,
        width: 40,
      ),
    );
  }
}

class IconTextButton extends StatelessWidget {
  const IconTextButton({
    super.key,
    required this.iconWidget,
    required this.text,
  });
  final Widget iconWidget;
  final String text;

  @override
  Widget build(BuildContext context) {
    return Row(
      mainAxisAlignment: MainAxisAlignment.center,
      children: [
        iconWidget,
        const SizedBox(
          width: 10,
        ),
        Text(
          text,
          style: TextStyle(
            fontSize: 14,
            color: CustomColors.appColorBlack,
            height: 18 / 14,
          ),
        ),
      ],
    );
  }
}

class TabButton extends StatelessWidget {
  const TabButton({
    super.key,
    required this.text,
    required this.index,
    required this.tabController,
  });
  final String text;
  final int index;
  final TabController? tabController;

  @override
  Widget build(BuildContext context) {
    return Container(
      constraints: const BoxConstraints(
        minWidth: double.infinity,
        maxHeight: 32,
      ),
      decoration: BoxDecoration(
        color: tabController?.index == index
            ? CustomColors.appColorBlue
            : Colors.white,
        borderRadius: const BorderRadius.all(
          Radius.circular(4.0),
        ),
      ),
      child: Tab(
        child: Text(
          text,
          style: CustomTextStyle.button1(context)?.copyWith(
            color: tabController?.index == index
                ? Colors.white
                : CustomColors.appColorBlue,
          ),
        ),
      ),
    );
  }
}
