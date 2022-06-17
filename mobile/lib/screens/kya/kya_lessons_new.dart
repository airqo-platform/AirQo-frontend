import 'package:app/utils/extensions.dart';
import 'package:auto_size_text/auto_size_text.dart';
import 'package:cached_network_image/cached_network_image.dart';
import 'package:flutter/material.dart';
import 'package:flutter_cache_manager/flutter_cache_manager.dart';
import 'package:flutter_svg/svg.dart';

import '../../models/kya.dart';
import '../../services/native_api.dart';
import '../../themes/app_theme.dart';
import '../../themes/colors.dart';
import '../../widgets/custom_shimmer.dart';

class KyaLessonsPage1 extends StatefulWidget {
  const KyaLessonsPage1({Key? key}) : super(key: key);

  @override
  State<KyaLessonsPage1> createState() => _KyaLessonsPage1State();
}

class _KyaLessonsPage1State extends State<KyaLessonsPage1> {
  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: Text('Hey'),
      ),
      // body: KyaCard(), TODO: Add body
    );
  }
}

//New card
class KyaCard extends StatelessWidget {
  const KyaCard({Key? key, required this.kya, required this.kyaItem})
      : super(key: key);
  final Kya kya;
  final KyaLesson kyaItem;

  @override
  Widget build(BuildContext context) {
    return Card(
      color: Colors.white,
      elevation: 5,
      margin: EdgeInsets.zero,
      shadowColor: CustomColors.appBodyColor,
      shape: RoundedRectangleBorder(
        borderRadius: BorderRadius.circular(16),
      ),
      child: RepaintBoundary(
        child: Column(
          mainAxisSize: MainAxisSize.min,
          crossAxisAlignment: CrossAxisAlignment.center,
          children: [
            Padding(
              padding: const EdgeInsets.only(
                left: 8.0,
                right: 8.0,
                top: 8.0,
              ),
              child: ClipRRect(
                borderRadius: BorderRadius.circular(8),
                child: CachedNetworkImage(
                  fit: BoxFit.fill,
                  placeholder: (context, url) => const SizedBox(
                    child: ContainerLoadingAnimation(
                      height: 180,
                      radius: 8,
                    ),
                  ),
                  imageUrl: kyaItem.imageUrl,
                  errorWidget: (context, url, error) => Icon(
                    Icons.error_outline,
                    color: CustomColors.aqiRed,
                  ),
                  cacheKey: kyaItem.imageUrlCacheKey(kya),
                  cacheManager: CacheManager(
                    CacheService.cacheConfig(
                      kyaItem.imageUrlCacheKey(kya),
                    ),
                  ),
                ),
              ),
            ),
            Padding(
              padding: const EdgeInsets.only(left: 36, right: 36, top: 12.0),
              child: AutoSizeText(
                kyaItem.title,
                maxLines: 2,
                minFontSize: 20,
                overflow: TextOverflow.ellipsis,
                textAlign: TextAlign.center,
                style: CustomTextStyle.headline9(context),
              ),
            ),
            Benjamin(kyaItem: kyaItem),
            const Spacer(),
            SvgPicture.asset(
              'assets/icon/tips_graphics.svg',
              semanticsLabel: 'tips_graphics',
            ),
            const SizedBox(
              height: 30,
            ),
          ],
        ),
      ),
    );
  }
}

class Benjamin extends StatelessWidget {
  const Benjamin({
    Key? key,
    required this.kyaItem,
  }) : super(key: key);

  final KyaLesson kyaItem;

  @override
  Widget build(BuildContext context) {
    return Padding(
      padding: const EdgeInsets.only(left: 16, right: 16, top: 8.0),
      child: AutoSizeText(
        kyaItem.body,
        maxLines: 3,
        overflow: TextOverflow.ellipsis,
        textAlign: TextAlign.center,
        minFontSize: 16,
        style: Theme.of(context).textTheme.subtitle1?.copyWith(
              color: CustomColors.appColorBlack.withOpacity(0.5),
            ),
      ),
    );
  }
}
