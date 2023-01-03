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
  final AppinioSwiperController swipeController = AppinioSwiperController();
  List<Card> _kyaCards = [];
  int _visibleCardIndex = 0;
  final List<GlobalKey> _globalKeys = <GlobalKey>[];
  bool _shareLoading = false;
  Map<int, int> indexMappings = {};

  @override
  void dispose() {
    swipeController.dispose();
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
        titleSpacing: 0,
        title: Row(
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
              child: Padding(
                padding: const EdgeInsets.symmetric(horizontal: 7),
                child: SvgPicture.asset(
                  'assets/icon/close.svg',
                  height: 20,
                  width: 20,
                ),
              ),
            ),
            Expanded(
              child: KyaProgressBar(context.read<KyaProgressCubit>().state),
            ),
            InkWell(
              onTap: () async => _share(),
              child: Padding(
                padding: const EdgeInsets.only(left: 7, right: 24),
                child: _shareLoading
                    ? const LoadingIcon(radius: 10)
                    : SvgPicture.asset(
                        'assets/icon/share_icon.svg',
                        color: CustomColors.greyColor,
                        height: 16,
                        width: 16,
                      ),
              ),
            ),
          ],
        ),
      ),
      body: Container(
        color: CustomColors.appBodyColor,
        child: Column(
          children: [
            Visibility(
              visible: _visibleCardIndex <= 0,
              replacement: const SizedBox(
                height: 100,
                width: double.infinity,
              ),
              child: SizedBox(
                height: 100,
                width: double.infinity,
                child: AutoSizeText(
                  'Swipe Left Or Right to Move to Next Card',
                  style: CustomTextStyle.headline7(context)?.copyWith(
                    color: CustomColors.appColorBlue,
                  ),
                  textAlign: TextAlign.center,
                ),
              ),
            ),
            SizedBox(
              height: MediaQuery.of(context).size.height * 0.6,
              child: AppinioSwiper(
                cards: _kyaCards,
                allowUnswipe: true,
                unlimitedUnswipe: true,
                controller: swipeController,
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
            Padding(
              padding: const EdgeInsets.symmetric(horizontal: 20),
              child: Row(
                mainAxisAlignment: MainAxisAlignment.spaceBetween,
                children: [
                  Visibility(
                    visible: _visibleCardIndex >= 1,
                    child: GestureDetector(
                      onTap: () => swipeController.unswipe(),
                      child: const CircularKyaButton(
                        icon: 'assets/icon/previous_arrow.svg',
                      ),
                    ),
                  ),
                  GestureDetector(
                    onTap: () => swipeController.swipe(),
                    child: const CircularKyaButton(
                      icon: 'assets/icon/next_arrow.svg',
                    ),
                  ),
                ],
              ),
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
      indexMappings[widget.kya.lessons.reversed.toList().indexOf(kyaLesson)] =
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
    _kyaCards = widget.kya.lessons.reversed.map((e) => _kyaCard(e)).toList();
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
    int index = indexMappings[reversedIndex]!;
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
