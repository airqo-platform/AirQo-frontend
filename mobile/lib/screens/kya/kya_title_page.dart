import 'package:app/models/models.dart';
import 'package:app/services/services.dart';
import 'package:app/themes/theme.dart';
import 'package:app/widgets/widgets.dart';
import 'package:cached_network_image/cached_network_image.dart';
import 'package:flutter/material.dart';
import 'package:flutter_cache_manager/flutter_cache_manager.dart';

import 'kya_lessons_page.dart';
import 'kya_widgets.dart';

class KyaTitlePage extends StatelessWidget {
  const KyaTitlePage(this.kya, {super.key});
  final Kya kya;

  @override
  Widget build(BuildContext context) {
    return FutureBuilder<Kya?>(
      future: AppService.getKya(kya.id),
      builder: (context, snapshot) {
        if (snapshot.hasError) {
          return const KyaNotFoundWidget(); // TODO check for internet connection errors
        }

        if (snapshot.hasData) {
          final Kya? kya = snapshot.data;
          if (kya == null) {
            return const KyaNotFoundWidget();
          }

          final String buttonText =
              kya.progress > 0 && kya.progress < kya.lessons.length
                  ? 'Resume'
                  : 'Begin';

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
                ),
                Align(
                  alignment: AlignmentDirectional.bottomCenter,
                  child: Padding(
                    padding: const EdgeInsets.only(
                      left: 24,
                      right: 24,
                      bottom: 32,
                    ),
                    child: GestureDetector(
                      onTap: () {
                        Navigator.pushReplacement(
                          context,
                          MaterialPageRoute(
                            builder: (context) {
                              return KyaLessonsPage(kya);
                            },
                          ),
                        );
                      },
                      child: NextButton(
                        text: buttonText,
                        buttonColor: CustomColors.appColorBlue,
                        // TODO: add callback function
                        // callBack: () async {
                        //   await Navigator.pushReplacement(
                        //     context,
                        //     MaterialPageRoute(
                        //       builder: (context) {
                        //         return KyaLessonsPage(kya);
                        //       },
                        //     ),
                        //   );
                        // },
                      ),
                    ),
                  ),
                ),
                Positioned.fill(
                  child: Align(
                    alignment: Alignment.center,
                    child: Padding(
                      padding: const EdgeInsets.symmetric(horizontal: 24),
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
                                    padding: const EdgeInsets.symmetric(
                                      horizontal: 40,
                                    ),
                                    child: Text(
                                      kya.title,
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

        return const KyaLoadingWidget();
      },
    );
  }
}
