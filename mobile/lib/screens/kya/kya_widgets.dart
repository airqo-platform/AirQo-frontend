import 'package:auto_size_text/auto_size_text.dart';
import 'package:flutter/material.dart';

import '../../constants/config.dart';
import '../../models/kya.dart';
import '../../themes/light_theme.dart';

String getKyaMessage({required Kya kya}) {
  var kyaItems = kya.lessons.length;
  var progress = kya.progress;
  if (progress > 0 && progress < kyaItems) {
    return 'Continue';
  } else if (progress >= kyaItems) {
    return 'Complete! Move to For You';
  } else {
    return 'Start learning';
  }
}

class KyaMessage extends StatelessWidget {
  final Kya kya;
  const KyaMessage({Key? key, required this.kya}) : super(key: key);

  @override
  Widget build(BuildContext context) {
    if (kya.progress >= kya.lessons.length) {
      return RichText(
          textAlign: TextAlign.start,
          overflow: TextOverflow.ellipsis,
          text: TextSpan(children: [
            TextSpan(
              text: 'Complete! Move to ',
              style: CustomTextStyle.caption3(context),
            ),
            TextSpan(
                text: 'For You',
                style: CustomTextStyle.caption3(context)
                    ?.copyWith(color: Config.appColorBlue)),
          ]));
    }
    return AutoSizeText(getKyaMessage(kya: kya),
        maxLines: 1,
        overflow: TextOverflow.ellipsis,
        textAlign: TextAlign.center,
        style: CustomTextStyle.caption3(context)
            ?.copyWith(color: Config.appColorBlue));
  }
}

class KyaProgressBar extends StatelessWidget {
  final Kya kya;
  const KyaProgressBar({Key? key, required this.kya}) : super(key: key);

  @override
  Widget build(BuildContext context) {
    return Visibility(
      visible: getKyaMessage(kya: kya).toLowerCase() == 'continue',
      child: Container(
          height: 4,
          decoration: const BoxDecoration(
            borderRadius: BorderRadius.all(Radius.circular(8.0)),
          ),
          child: LinearProgressIndicator(
            color: Config.appColorBlue,
            value: kya.progress / kya.lessons.length,
            backgroundColor: Config.appColorDisabled.withOpacity(0.2),
          )),
    );
  }
}
