import 'package:auto_size_text/auto_size_text.dart';
import 'package:cached_network_image/cached_network_image.dart';
import 'package:flutter/material.dart';
import 'package:flutter_svg/svg.dart';

import '../../constants/config.dart';
import '../../models/kya.dart';
import '../../themes/light_theme.dart';
import 'kya_title_page.dart';

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

class KyaViewWidget extends StatelessWidget {
  final Kya kya;
  const KyaViewWidget({Key? key, required this.kya}) : super(key: key);

  @override
  Widget build(BuildContext context) {
    return Padding(
      padding: const EdgeInsets.only(top: 8),
      child: GestureDetector(
          onTap: () async {
            await Navigator.push(context, MaterialPageRoute(builder: (context) {
              return KyaTitlePage(kya);
            }));
          },
          child: Container(
            padding: const EdgeInsets.fromLTRB(16.0, 8.0, 8.0, 8.0),
            decoration: const BoxDecoration(
                color: Colors.white,
                borderRadius: BorderRadius.all(Radius.circular(16.0))),
            child: Row(
              crossAxisAlignment: CrossAxisAlignment.center,
              children: [
                Expanded(
                  child: Column(
                    children: [
                      AutoSizeText(
                        kya.title,
                        maxLines: 4,
                        overflow: TextOverflow.ellipsis,
                        style: CustomTextStyle.headline10(context),
                      ),
                      const SizedBox(
                        height: 28,
                      ),
                      Row(
                        crossAxisAlignment: CrossAxisAlignment.center,
                        mainAxisAlignment: MainAxisAlignment.start,
                        children: [
                          KyaMessage(
                            kya: kya,
                          ),
                          const SizedBox(
                            width: 6,
                          ),
                          SvgPicture.asset(
                            'assets/icon/more_arrow.svg',
                            semanticsLabel: 'more',
                            height: 6.99,
                            width: 4,
                          ),
                        ],
                      ),
                      SizedBox(
                        height:
                            getKyaMessage(kya: kya).toLowerCase() == 'continue'
                                ? 2
                                : 0,
                      ),
                      KyaProgressBar(kya: kya),
                    ],
                  ),
                ),
                const SizedBox(
                  width: 16,
                ),
                Container(
                  width: 104,
                  height: 104,
                  decoration: BoxDecoration(
                    borderRadius: BorderRadius.circular(8.0),
                    image: DecorationImage(
                      fit: BoxFit.cover,
                      image: CachedNetworkImageProvider(
                        kya.imageUrl,
                      ),
                    ),
                  ),
                ),
              ],
            ),
          )),
    );
  }
}
