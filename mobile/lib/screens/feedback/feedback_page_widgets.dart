import 'package:flutter/material.dart';
import 'package:flutter_svg/svg.dart';

import '../../constants/config.dart';

class FeedbackBackButton extends StatelessWidget {
  const FeedbackBackButton({
    Key? key,
  }) : super(key: key);

  @override
  Widget build(BuildContext context) {
    return Container(
      height: 48,
      width: 120,
      padding: const EdgeInsets.all(13),
      decoration: BoxDecoration(
          color: Config.appColorBlue.withOpacity(0.1),
          borderRadius: const BorderRadius.all(Radius.circular(8.0))),
      child: Row(
        crossAxisAlignment: CrossAxisAlignment.center,
        mainAxisAlignment: MainAxisAlignment.center,
        children: [
          Text(
            'Back',
            textAlign: TextAlign.center,
            style: TextStyle(color: Config.appColorBlue, fontSize: 14),
          ),
        ],
      ),
    );
  }
}

class FeedbackNextButton extends StatelessWidget {
  final String text;
  final Color buttonColor;
  const FeedbackNextButton(
      {Key? key, required this.text, required this.buttonColor})
      : super(key: key);

  @override
  Widget build(BuildContext context) {
    return Container(
      height: 48,
      width: 120,
      padding: const EdgeInsets.all(13),
      decoration: BoxDecoration(
          color: buttonColor,
          borderRadius: const BorderRadius.all(Radius.circular(8.0))),
      child: Row(
        crossAxisAlignment: CrossAxisAlignment.center,
        mainAxisAlignment: MainAxisAlignment.center,
        children: [
          Text(
            text,
            textAlign: TextAlign.center,
            style: const TextStyle(color: Colors.white, fontSize: 14),
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
