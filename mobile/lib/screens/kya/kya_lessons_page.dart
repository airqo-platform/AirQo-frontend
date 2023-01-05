import 'package:app/blocs/blocs.dart';
import 'package:app/models/models.dart';
import 'package:app/services/services.dart';
import 'package:app/themes/theme.dart';
import 'package:app/utils/extensions.dart';
import 'package:app/widgets/widgets.dart';
import 'package:auto_size_text/auto_size_text.dart';
import 'package:flutter/material.dart';
import 'package:flutter_bloc/flutter_bloc.dart';
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
  List<Widget> _kyaCards = [];
  int _visibleCardIndex = 0;
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
        titleSpacing: 0,
        title: Row(
          children: [
            InkWell(
              onTap: () async {
                context.read<KyaBloc>().add(
                      UpdateKyaProgress(
                        kya: widget.kya,
                        visibleCardIndex: _visibleCardIndex,
                      ),
                    );
                await popNavigation(context);
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
            FutureBuilder<Uri>(
              future: ShareService.createShareLink(kya: widget.kya),
              builder: (context, snapshot) {
                if (snapshot.hasError) {
                  // TODO implement this functionality
                }
                if (snapshot.hasData) {
                  return InkWell(
                    onTap: () async {
                      Uri? link = snapshot.data;
                      if (link != null) {
                        await ShareService.shareLink(
                          link,
                          kya: widget.kya,
                        );
                      }
                    },
                    child: Padding(
                      padding: const EdgeInsets.symmetric(horizontal: 7),
                      child: SvgPicture.asset(
                        'assets/icon/share_icon.svg',
                        color: CustomColors.greyColor,
                        height: 16,
                        width: 16,
                      ),
                    ),
                  );
                }

                return const LoadingIcon(radius: 14);
              },
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
            Padding(
              padding: const EdgeInsets.symmetric(horizontal: 20),
              child: Row(
                mainAxisAlignment: MainAxisAlignment.spaceBetween,
                children: [
                  Visibility(
                    visible: _visibleCardIndex >= 1,
                    child: GestureDetector(
                      onTap: () => _swipeController.unswipe(),
                      child: const CircularKyaButton(
                        icon: 'assets/icon/previous_arrow.svg',
                      ),
                    ),
                  ),
                  GestureDetector(
                    onTap: () => _swipeController.swipe(),
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
      _indexMappings[widget.kya.lessons.reversed.toList().indexOf(kyaLesson)] =
          widget.kya.lessons.indexOf(kyaLesson);
    }
    context
        .read<KyaProgressCubit>()
        .updateProgress(widget.kya.getProgress(_visibleCardIndex));
  }

  @override
  void didChangeDependencies() {
    super.didChangeDependencies();
    _kyaCards = widget.kya.lessons.reversed
        .map((e) => KyaLessonCard(e, widget.kya))
        .toList();
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
}
