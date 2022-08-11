import 'package:auto_size_text/auto_size_text.dart';
import 'package:cached_network_image/cached_network_image.dart';
import 'package:flutter/material.dart';
import 'package:flutter_cache_manager/flutter_cache_manager.dart';
import 'package:flutter_svg/svg.dart';

import '../../models/enum_constants.dart';
import '../../models/kya.dart';
import '../../services/native_api.dart';
import '../../themes/app_theme.dart';
import '../../themes/colors.dart';
import '../../widgets/custom_shimmer.dart';
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

class KyaLessonCard extends StatelessWidget {
  const KyaLessonCard({
    Key? key,
    required this.kyaLesson,
  }) : super(key: key);
  final KyaLesson kyaLesson;

  @override
  Widget build(BuildContext context) {
    return Container(
      height: MediaQuery.of(context).size.height * 0.5,
      width: MediaQuery.of(context).size.width * 0.9,
      decoration: ShapeDecoration(
        color: Colors.white,
        shape: RoundedRectangleBorder(
          borderRadius: BorderRadius.circular(10),
        ),
        shadows: <BoxShadow>[
          BoxShadow(
            color: Colors.black.withOpacity(0.05),
            blurRadius: 8,
          ),
        ],
      ),
      padding: const EdgeInsets.symmetric(horizontal: 8),
      child: Column(
        mainAxisSize: MainAxisSize.min,
        crossAxisAlignment: CrossAxisAlignment.center,
        children: [
          Padding(
            padding: const EdgeInsets.only(left: 8.0, right: 8.0, top: 8.0),
            child: ClipRRect(
              borderRadius: BorderRadius.circular(8),
              child: CachedNetworkImage(
                fit: BoxFit.contain,
                placeholder: (context, url) => const SizedBox(
                  child: ContainerLoadingAnimation(
                    height: 180,
                    radius: 8,
                  ),
                ),
                imageUrl: kyaLesson.imageUrl,
                errorWidget: (context, url, error) => Icon(
                  Icons.error_outline,
                  color: CustomColors.aqiRed,
                ),
              ),
            ),
          ),
          Padding(
            padding: const EdgeInsets.only(left: 36, right: 36, top: 12.0),
            child: AutoSizeText(
              kyaLesson.title,
              maxLines: 2,
              minFontSize: 20,
              overflow: TextOverflow.ellipsis,
              textAlign: TextAlign.center,
              style: CustomTextStyle.headline9(context),
            ),
          ),
          Padding(
            padding: const EdgeInsets.only(left: 16, right: 16, top: 8.0),
            child: AutoSizeText(
              kyaLesson.body,
              maxLines: 3,
              overflow: TextOverflow.ellipsis,
              textAlign: TextAlign.center,
              minFontSize: 16,
              style: Theme.of(context).textTheme.subtitle1?.copyWith(
                    color: CustomColors.appColorBlack.withOpacity(0.5),
                  ),
            ),
          ),
          const Spacer(),
          SvgPicture.asset(
            'assets/icon/tips_graphics.svg',
            semanticsLabel: 'tips_graphics',
          ),
          const SizedBox(
            height: 20,
          ),
        ],
      ),
    );
  }
}

class KyaDragWidget extends StatefulWidget {
  const KyaDragWidget({
    Key? key,
    required this.kyaLesson,
    required this.index,
    required this.swipeNotifier,
    this.isLastCard = false,
  }) : super(key: key);
  final KyaLesson kyaLesson;
  final int index;
  final ValueNotifier<Swipe> swipeNotifier;
  final bool isLastCard;

  @override
  State<KyaDragWidget> createState() => _KyaDragWidgetState();
}

class _KyaDragWidgetState extends State<KyaDragWidget> {
  @override
  Widget build(BuildContext context) {
    return Center(
      child: Draggable<int>(
        data: widget.index,
        feedback: Material(
          color: Colors.transparent,
          child: ValueListenableBuilder(
            valueListenable: widget.swipeNotifier,
            builder: (context, swipe, _) {
              return RotationTransition(
                turns: widget.swipeNotifier.value != Swipe.none
                    ? widget.swipeNotifier.value == Swipe.left
                        ? const AlwaysStoppedAnimation(-15 / 360)
                        : const AlwaysStoppedAnimation(15 / 360)
                    : const AlwaysStoppedAnimation(0),
                child: KyaLessonCard(kyaLesson: widget.kyaLesson),
              );
            },
          ),
        ),
        onDragUpdate: (DragUpdateDetails dragUpdateDetails) {
          if (dragUpdateDetails.delta.dx > 0 &&
              dragUpdateDetails.globalPosition.dx >
                  MediaQuery.of(context).size.width / 2) {
            widget.swipeNotifier.value = Swipe.right;
          }
          if (dragUpdateDetails.delta.dx < 0 &&
              dragUpdateDetails.globalPosition.dx <
                  MediaQuery.of(context).size.width / 2) {
            widget.swipeNotifier.value = Swipe.left;
          }
        },
        onDragEnd: (drag) {
          widget.swipeNotifier.value = Swipe.none;
        },

        childWhenDragging: Container(
          color: Colors.transparent,
        ),

        //This will be visible when we press action button
        child: ValueListenableBuilder(
          valueListenable: widget.swipeNotifier,
          builder: (BuildContext context, Swipe swipe, Widget? child) {
            return KyaLessonCard(kyaLesson: widget.kyaLesson);
          },
        ),
      ),
    );
  }
}
