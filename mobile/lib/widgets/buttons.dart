import 'package:flutter/material.dart';
import 'package:flutter_svg/svg.dart';

import '../constants/config.dart';

class NextButton extends StatelessWidget {
  final String? text;
  final Color buttonColor;
  const NextButton({Key? key, required this.buttonColor, this.text})
      : super(key: key);

  @override
  Widget build(BuildContext context) {
    return Container(
      height: 48,
      constraints: const BoxConstraints(minWidth: double.infinity),
      decoration: BoxDecoration(
          color: buttonColor,
          borderRadius: const BorderRadius.all(Radius.circular(8.0))),
      child: Row(
        crossAxisAlignment: CrossAxisAlignment.center,
        mainAxisAlignment: MainAxisAlignment.center,
        children: [
          Text(
            text ?? 'Next',
            style: const TextStyle(
                color: Colors.white, fontSize: 14, letterSpacing: 16 * -0.022),
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
  const AppBackButton({Key? key}) : super(key: key);

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
  final Widget iconWidget;
  final String text;
  const IconTextButton({Key? key, required this.iconWidget, required this.text})
      : super(key: key);

  @override
  Widget build(BuildContext context) {
    return Row(
      children: [
        iconWidget,
        const SizedBox(
          width: 10,
        ),
        Text(
          text,
          style: TextStyle(
              fontSize: 14, color: Config.appColorBlack, height: 18 / 14),
        )
      ],
    );
  }
}
