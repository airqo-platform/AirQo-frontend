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

  final KyaLesson kya;

  @override
  State<KyaLessonsPage> createState() => _KyaLessonsPageState();
}

class _KyaLessonsPageState extends State<KyaLessonsPage> {
  final AppinioSwiperController _swipeController = AppinioSwiperController();
  int lessonIndex = 0;

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
        backgroundColor: CustomColors.appBodyColor,
        centerTitle: false,
        titleSpacing: 20,
        title: Row(
          mainAxisAlignment: MainAxisAlignment.spaceBetween,
          children: [
            InkWell(
              onTap: () async {
                int lessonCount = widget.kya.tasks.length;

                double currentProgress = (lessonIndex) / lessonCount;

                context
                    .read<KyaBloc>()
                    .add(UpdateKyaProgress(widget.kya, currentProgress));
                context
                    .read<KyaProgressCubit>()
                    .updateProgress(currentProgress);

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
                          context,
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
                      colorFilter: ColorFilter.mode(
                        CustomColors.greyColor,
                        BlendMode.srcIn,
                      ),
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
      body: AppSafeArea(
        backgroundColor: CustomColors.appBodyColor,
        horizontalPadding: 20,
        child: Column(
          children: [
            BlocBuilder<KyaProgressCubit, double>(
              builder: (context, state) {
                if (state <= 0) {
                  return SizedBox(
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
                  );
                } else {
                  return SizedBox(
                    height: 50,
                    child: Padding(
                      padding: const EdgeInsets.symmetric(vertical: 20.0),
                      child: KyaProgressBar(
                        context.watch<KyaProgressCubit>().state,
                        height: widget.kya.tasks.length.toDouble(),
                      ),
                    ),
                  );
                }
              },
            ),
            const Spacer(),
            SizedBox(
              height: 400,
              child: AppinioSwiper(
                padding: EdgeInsets.zero,
                cardsCount: widget.kya.tasks.length,
                cardsBuilder: (BuildContext context, int index) {
                  if (lessonIndex >= widget.kya.tasks.length) {
                    lessonIndex = widget.kya.tasks.length - 1;
                  }
                  return KyaLessonCard(
                      widget.kya.tasks[lessonIndex], widget.kya);
                },
                allowUnswipe: true,
                unlimitedUnswipe: true,
                controller: _swipeController,
                onSwipe: _onSwipe,
                duration: const Duration(milliseconds: 300),
                unswipe: _onUnSwipe,
              ),
            ),
            const Spacer(),
            Row(
              mainAxisAlignment: MainAxisAlignment.center,
              children: [
                BlocBuilder<KyaProgressCubit, double>(
                  builder: (context, state) {
                    return GestureDetector(
                      onTap: () {
                        _swipeController.unswipe();
                      },
                      child: CircularKyaButton(
                        icon: 'assets/icon/previous_arrow.svg',
                        isActive: lessonIndex >= 1,
                      ),
                    );
                  },
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
    _initializeKya();
  }

  void _initializeKya() {
    double initialProgress = widget.kya.progress;
    if (initialProgress == 0 || initialProgress == -1) {
      initialProgress = 1 / widget.kya.tasks.length;
    }
    context.read<KyaProgressCubit>().updateProgress(initialProgress);

    int initialCardIndex =
        ((widget.kya.tasks.length * initialProgress).toInt() - 1);
    setState(() => lessonIndex = initialCardIndex);

  }

  void _onSwipe(int card, AppinioSwiperDirection _) {
    int lessonCount = widget.kya.tasks.length;
    if (lessonIndex >= lessonCount - 1) {
      Navigator.pushReplacement(
        context,
        MaterialPageRoute(
          builder: (context) {
            return KyaFinalPage(widget.kya);
          },
        ),
      );
    }

    int nextCard = lessonIndex + 2;
    double nextProgress = (nextCard) / lessonCount;
    context.read<KyaBloc>().add(UpdateKyaProgress(widget.kya, nextProgress));
    context.read<KyaProgressCubit>().updateProgress(nextProgress);
    setState(() => lessonIndex = lessonIndex + 1);
  }

  void _onUnSwipe(bool unSwiped) {
    int lessonCount = widget.kya.tasks.length;
    int prevCard = lessonIndex - 1;
    if (prevCard < 0) {
      return;
    }
    double nextProgress = (lessonIndex) / lessonCount;

    context.read<KyaBloc>().add(UpdateKyaProgress(widget.kya, nextProgress));
    context.read<KyaProgressCubit>().updateProgress(nextProgress);
    setState(() => lessonIndex = prevCard);
  }
}
