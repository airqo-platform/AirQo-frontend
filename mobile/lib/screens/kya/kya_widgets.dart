import 'package:app/models/models.dart';
import 'package:app/themes/theme.dart';
import 'package:auto_size_text/auto_size_text.dart';
import 'package:cached_network_image/cached_network_image.dart';
import 'package:flutter/material.dart';
import 'package:flutter_cache_manager/flutter_cache_manager.dart';
import 'package:flutter_svg/svg.dart';

import '../../services/native_api.dart';
import 'kya_title_page.dart';

class CircularKyaButton extends StatelessWidget {
  const CircularKyaButton({
    super.key,
    required this.icon,
  });
  final String icon;

  @override
  Widget build(BuildContext context) {
    return Container(
      height: 48,
      width: 48,
      padding: const EdgeInsets.all(15.0),
      decoration: BoxDecoration(
        color: CustomColors.appColorBlue.withOpacity(0.24),
        shape: BoxShape.circle,
      ),
      child: SvgPicture.asset(
        icon,
        color: CustomColors.appColorBlue,
      ),
    );
  }
}

String getKyaMessage({
  required Kya kya,
}) {
  final kyaItems = kya.lessons.length;
  final progress = kya.progress;
  if (progress > 0 && progress < kyaItems) {
    return 'Continue';
  } else if (progress >= kyaItems) {
    return 'Complete! Move to For You';
  } else {
    return 'Start learning';
  }
}

class KyaMessage extends StatelessWidget {
  const KyaMessage({
    super.key,
    required this.kya,
  });
  final Kya kya;

  @override
  Widget build(BuildContext context) {
    if (kya.progress >= kya.lessons.length) {
      return RichText(
        textAlign: TextAlign.start,
        overflow: TextOverflow.ellipsis,
        text: TextSpan(
          children: [
            TextSpan(
              text: 'Complete! Move to ',
              style: CustomTextStyle.caption3(context),
            ),
            TextSpan(
              text: 'For You',
              style: CustomTextStyle.caption3(context)?.copyWith(
                color: CustomColors.appColorBlue,
              ),
            ),
          ],
        ),
      );
    }

    return AutoSizeText(
      getKyaMessage(kya: kya),
      maxLines: 1,
      overflow: TextOverflow.ellipsis,
      textAlign: TextAlign.center,
      style: CustomTextStyle.caption3(context)?.copyWith(
        color: CustomColors.appColorBlue,
      ),
    );
  }
}

class KyaProgressBar extends StatelessWidget {
  const KyaProgressBar({
    super.key,
    required this.kya,
  });
  final Kya kya;

  @override
  Widget build(BuildContext context) {
    return Visibility(
      visible: getKyaMessage(kya: kya).toLowerCase() == 'continue',
      child: Container(
        height: 4,
        decoration: const BoxDecoration(
          borderRadius: BorderRadius.all(
            Radius.circular(8.0),
          ),
        ),
        child: LinearProgressIndicator(
          color: CustomColors.appColorBlue,
          value: kya.progress / kya.lessons.length,
          backgroundColor: CustomColors.appColorDisabled.withOpacity(0.2),
        ),
      ),
    );
  }
}

class KyaViewWidget extends StatelessWidget {
  const KyaViewWidget({super.key, required this.kya});
  final Kya kya;

  @override
  Widget build(BuildContext context) {
    return Padding(
      padding: const EdgeInsets.only(top: 8),
      child: GestureDetector(
        onTap: () async {
          await Navigator.push(
            context,
            MaterialPageRoute(
              builder: (context) {
                return KyaTitlePage(kya);
              },
            ),
          );
        },
        child: Container(
          padding: const EdgeInsets.fromLTRB(16.0, 8.0, 8.0, 8.0),
          decoration: const BoxDecoration(
            color: Colors.white,
            borderRadius: BorderRadius.all(
              Radius.circular(16.0),
            ),
          ),
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
                      cacheKey: kya.imageUrlCacheKey(),
                      cacheManager: CacheManager(
                        CacheService.cacheConfig(
                          kya.imageUrlCacheKey(),
                        ),
                      ),
                    ),
                  ),
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }
}

class EmptyKya extends StatelessWidget {
  const EmptyKya({super.key});

  @override
  Widget build(BuildContext context) {
    return Container(
      color: CustomColors.appBodyColor,
      padding: const EdgeInsets.all(40.0),
      child: const Center(
        child: Text('No Lessons at the moment'),
      ),
    );
  }
}
