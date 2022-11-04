import 'package:app/models/models.dart';
import 'package:app/services/services.dart';
import 'package:app/themes/theme.dart';
import 'package:app/widgets/widgets.dart';
import 'package:cached_network_image/cached_network_image.dart';
import 'package:flutter/material.dart';
import 'package:flutter_cache_manager/flutter_cache_manager.dart';
import 'package:flutter_svg/svg.dart';

import 'kya_lessons_page.dart';

class KyaTitlePage extends StatefulWidget {
  const KyaTitlePage(
    this.kya, {
    super.key,
  });
  final Kya kya;

  @override
  State<KyaTitlePage> createState() => _KyaTitlePageState();
}

class _KyaTitlePageState extends State<KyaTitlePage> {
  @override
  Widget build(BuildContext context) {
    return Scaffold(
      extendBodyBehindAppBar: true,
      appBar: const KnowYourAirAppBar(),
      body: Stack(
        fit: StackFit.expand,
        children: [
          Container(
            color: CustomColors.appBodyColor,
            height: double.infinity,
            width: double.infinity,
          ),
          FractionallySizedBox(
            alignment: Alignment.topCenter,
            widthFactor: 1.0,
            heightFactor: 0.4,
            child: Container(
              decoration: BoxDecoration(
                image: DecorationImage(
                  fit: BoxFit.cover,
                  image: CachedNetworkImageProvider(
                    widget.kya.imageUrl,
                    cacheKey: widget.kya.imageUrlCacheKey(),
                    cacheManager: CacheManager(
                      CacheService.cacheConfig(
                        widget.kya.imageUrlCacheKey(),
                      ),
                    ),
                  ),
                ),
              ),
            ),
          ),
          Align(
            alignment: AlignmentDirectional.bottomCenter,
            child: Padding(
              padding: const EdgeInsets.only(left: 24, right: 24, bottom: 32),
              child: GestureDetector(
                onTap: () {
                  setState(
                    () {
                      Navigator.pushReplacement(
                        context,
                        MaterialPageRoute(
                          builder: (context) {
                            return KyaLessonsPage(widget.kya);
                          },
                        ),
                      );
                    },
                  );
                },
                child: NextButton(
                  text: 'Begin',
                  buttonColor: CustomColors.appColorBlue,
                ),
              ),
            ),
          ),
          Positioned.fill(
            child: Align(
              alignment: Alignment.center,
              child: Padding(
                padding: const EdgeInsets.only(left: 24, right: 24),
                child: Column(
                  children: [
                    const Spacer(),
                    Container(
                      decoration: const BoxDecoration(
                        color: Colors.white,
                        borderRadius: BorderRadius.all(
                          Radius.circular(16.0),
                        ),
                      ),
                      child: Center(
                        child: Column(
                          crossAxisAlignment: CrossAxisAlignment.center,
                          children: [
                            const SizedBox(
                              height: 48,
                            ),
                            Container(
                              constraints: const BoxConstraints(
                                maxWidth: 221.46,
                                maxHeight: 133.39,
                                minWidth: 221.46,
                                minHeight: 133.39,
                              ),
                              decoration: const BoxDecoration(
                                // borderRadius: BorderRadius.circular(8.0),
                                image: DecorationImage(
                                  fit: BoxFit.cover,
                                  image: AssetImage(
                                    'assets/images/kya_stars.png',
                                  ),
                                ),
                              ),
                            ),
                            const SizedBox(
                              height: 18,
                            ),
                            Padding(
                              padding:
                                  const EdgeInsets.symmetric(horizontal: 40),
                              child: Text(
                                widget.kya.title,
                                textAlign: TextAlign.center,
                                style: CustomTextStyle.headline11(context)
                                    ?.copyWith(
                                  color: CustomColors.appColorBlack,
                                ),
                              ),
                            ),
                            const SizedBox(
                              height: 64,
                            ),
                          ],
                        ),
                      ),
                    ),
                    const Spacer(),
                  ],
                ),
              ),
            ),
          ),
        ],
      ),
    );
  }

  Widget circularButton(String icon) {
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

  @override
  void didChangeDependencies() {
    final futures = <Future<void>>[];
    for (final lesson in widget.kya.lessons) {
      futures.add(
        precacheImage(
          CachedNetworkImageProvider(lesson.imageUrl),
          context,
        ),
      );
    }
    Future.wait(futures);
    super.didChangeDependencies();
  }
}
