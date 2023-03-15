import 'package:app/blocs/blocs.dart';
import 'package:app/models/models.dart';
import 'package:app/services/services.dart';
import 'package:app/themes/theme.dart';
import 'package:app/utils/extensions.dart';
import 'package:app/widgets/widgets.dart';
import 'package:appinio_swiper/appinio_swiper.dart';
import 'package:auto_size_text/auto_size_text.dart';
import 'package:flutter/material.dart';
import 'package:flutter_bloc/flutter_bloc.dart';
import 'package:flutter_svg/svg.dart';

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
        titleSpacing: 20,
        title: Row(
          mainAxisAlignment: MainAxisAlignment.spaceBetween,
          children: [
            InkWell(
              onTap: () async {
                context.read<KyaBloc>().add(
                      UpdateKyaProgress(
                        widget.kya,
                        visibleCardIndex: _visibleCardIndex,
                      ),
                    );
                await popNavigation(context);
              },
              child: SvgPicture.asset(
                'assets/icon/close.svg',
                height: 40,
                width: 40,
              ),
            ),
            FutureBuilder<Uri>(
              future: ShareService.createShareLink(kya: widget.kya),
              builder: (context, snapshot) {
                if (snapshot.hasError) {
                  showSnackBar(context, 'Could not create a share link.');
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
                        // disabling copying to clipboard
                        // if (link.toString().length >
                        //     Config.shareLinkMaxLength) {
                        //   await Clipboard.setData(
                        //     ClipboardData(text: link.toString()),
                        //   ).then((_) {
                        //     showSnackBar(context, 'Copied to your clipboard !');
                        //   });
                        // } else {
                        //   await ShareService.shareLink(
                        //     link,
                        //     kya: widget.kya,
                        //   );
                        // }
                      }
                    },
                    child: SvgPicture.asset(
                      'assets/icon/share_icon.svg',
                      color: CustomColors.greyColor,
                      height: 26,
                      width: 26,
                    ),
                  );
                }

                return GestureDetector(
                  onTap: () {
                    showSnackBar(context, 'Creating share link. Hold on tight');
                  },
                  child: const Center(
                    child: LoadingIcon(radius: 20),
                  ),
                );
              },
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
