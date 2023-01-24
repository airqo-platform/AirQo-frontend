import 'package:app/blocs/blocs.dart';
import 'package:app/models/models.dart';
import 'package:app/services/services.dart';
import 'package:app/themes/theme.dart';
import 'package:app/utils/extensions.dart';
import 'package:app/widgets/widgets.dart';
import 'package:auto_size_text/auto_size_text.dart';
import 'package:cached_network_image/cached_network_image.dart';
import 'package:flutter/material.dart';
import 'package:flutter_bloc/flutter_bloc.dart';
import 'package:flutter_cache_manager/flutter_cache_manager.dart';
import 'package:flutter_svg/svg.dart';
import 'package:appinio_swiper/appinio_swiper.dart';
import 'kya_final_page.dart';
import 'kya_widgets.dart';

class KyaLessonsPage extends StatefulWidget {
  const KyaLessonsPage(
    this.kya, {
    super.key,
  });

  final Kya kya;

  @override
  State<KyaLessonsPage> createState() => _KyaLessonsPageState();
}

class _KyaLessonsPageState extends State<KyaLessonsPage> {
  final AppinioSwiperController _swipeController = AppinioSwiperController();
  List<Card> _kyaCards = [];
  int _visibleCardIndex = 0;
  final List<GlobalKey> _globalKeys = <GlobalKey>[];
  bool _shareLoading = false;
  final Map<int, int> _indexMappings = {};

  @override
  void dispose() {
    _swipeController.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: CustomColors.appBodyColor,
      appBar: AppBar(
        automaticallyImplyLeading: false,
        elevation: 0,
        backgroundColor: Colors.transparent,
        centerTitle: false,
        titleSpacing: 20,
        title: Row(
          mainAxisAlignment: MainAxisAlignment.spaceBetween,
          children: [
            InkWell(
              onTap: () {
                Navigator.of(context).pop(true);
                context.read<KyaBloc>().add(
                      UpdateKyaProgress(
                        kya: widget.kya,
                        visibleCardIndex: _visibleCardIndex,
                      ),
                    );
              },
              child: SvgPicture.asset(
                'assets/icon/close.svg',
                height: 40,
                width: 40,
              ),
            ),
            InkWell(
              onTap: () async {
                await _share();
              },
              child: _shareLoading
                  ? const LoadingIcon(radius: 20)
                  : SvgPicture.asset(
                      'assets/icon/share_icon.svg',
                      color: CustomColors.greyColor,
                      height: 26,
                      width: 26,
                    ),
            ),
          ],
        ),
      ),
      body: Container(
        color: CustomColors.appBodyColor,
        padding: const EdgeInsets.symmetric(horizontal: 20),
        child: Column(
          children: [
            Visibility(
              visible: _visibleCardIndex <= 0,
              child: SizedBox(
                height: 50,
                child: Center(
                  child: Padding(
                    padding: const EdgeInsets.symmetric(horizontal: 20.0),
                    child: AutoSizeText(
                      'Swipe Left Or Right to Move to Next Card',
                      maxLines: 2,
                      style: CustomTextStyle.headline7(context)?.copyWith(
                        color: CustomColors.appColorBlue,
                      ),
                      textAlign: TextAlign.center,
                    ),
                  ),
                ),
              ),
            ),
            Visibility(
              visible: _visibleCardIndex >= 1,
              child: SizedBox(
                height: 50,
                child: Padding(
                  padding: const EdgeInsets.symmetric(vertical: 20.0),
                  child: KyaProgressBar(context.read<KyaProgressCubit>().state),
                ),
              ),
            ),
            const Spacer(),
            SizedBox(
              height: 400,
              child: AppinioSwiper(
                padding: EdgeInsets.zero,
                cards: _kyaCards,
                allowUnswipe: true,
                unlimitedUnswipe: true,
                controller: _swipeController,
                onSwipe: _swipe,
                duration: const Duration(milliseconds: 300),
                unswipe: _unSwipe,
                onEnd: () {
                  Navigator.pushReplacement(
                    context,
                    MaterialPageRoute(
                      builder: (context) {
                        return KyaFinalPage(widget.kya);
                      },
                    ),
                  );
                },
              ),
            ),
            const Spacer(),
            Row(
              mainAxisAlignment: MainAxisAlignment.center,
              children: [
                GestureDetector(
                  onTap: () {
                    if (_visibleCardIndex >= 1) {
                      _swipeController.unswipe();
                    }
                  },
                  child: CircularKyaButton(
                    icon: 'assets/icon/previous_arrow.svg',
                    isActive: _visibleCardIndex >= 1,
                  ),
                ),
                const SizedBox(
                  width: 38,
                ),
                GestureDetector(
                  onTap: () => _swipeController.swipe(),
                  child: const CircularKyaButton(
                    icon: 'assets/icon/next_arrow.svg',
                    isActive: true,
                  ),
                ),
              ],
            ),
            const SizedBox(
              height: 40,
            ),
          ],
        ),
      ),
    );
  }

  @override
  initState() {
    super.initState();
    for (final kyaLesson in widget.kya.lessons) {
      _indexMappings[widget.kya.lessons.reversed.toList().indexOf(kyaLesson)] =
          widget.kya.lessons.indexOf(kyaLesson);
      _globalKeys.add(
        GlobalKey(),
      );
    }
    context
        .read<KyaProgressCubit>()
        .updateProgress(widget.kya.getProgress(_visibleCardIndex));
  }

  @override
  void didChangeDependencies() {
    super.didChangeDependencies();
    _kyaCards = widget.kya.lessons.map((e) => _kyaCard(e)).toList();
  }

  Future<void> _share() async {
    if (_shareLoading) {
      return;
    }
    setState(() => _shareLoading = true);
    final complete = await ShareService.shareWidget(
      buildContext: context,
      globalKey: _globalKeys[_visibleCardIndex],
      imageName: 'airqo_know_your_air',
    );
    if (complete && mounted) {
      setState(() => _shareLoading = false);
    }
  }

  void _swipe(int reversedIndex, AppinioSwiperDirection _) {
    int index = _indexMappings[reversedIndex]!;
    setState(() {
      _visibleCardIndex = index + 1;
    });
    context
        .read<KyaProgressCubit>()
        .updateProgress(widget.kya.getProgress(_visibleCardIndex));
  }

  void _unSwipe(bool unSwiped) {
    if (unSwiped) {
      setState(() {
        _visibleCardIndex = _visibleCardIndex - 1;
      });
      context
          .read<KyaProgressCubit>()
          .updateProgress(widget.kya.getProgress(_visibleCardIndex));
    }
  }

  Card _kyaCard(KyaLesson kyaItem) {
    final int index = widget.kya.lessons.indexOf(kyaItem);

    return Card(
      color: Colors.white,
      elevation: 5,
      margin: EdgeInsets.zero,
      shadowColor: CustomColors.appBodyColor,
      shape: RoundedRectangleBorder(
        borderRadius: BorderRadius.circular(16),
      ),
      child: RepaintBoundary(
        key: _globalKeys[index],
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
                  cacheKey: kyaItem.imageUrlCacheKey(widget.kya),
                  cacheManager: CacheManager(
                    CacheService.cacheConfig(
                      kyaItem.imageUrlCacheKey(widget.kya),
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
            Padding(
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
            ),
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
