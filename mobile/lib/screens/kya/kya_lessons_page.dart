import 'package:app/blocs/blocs.dart';
import 'package:app/models/models.dart';
import 'package:app/services/services.dart';
import 'package:app/themes/theme.dart';
import 'package:app/widgets/widgets.dart';
import 'package:appinio_swiper/appinio_swiper.dart';
import 'package:auto_size_text/auto_size_text.dart';
import 'package:flutter/material.dart';
import 'package:flutter_bloc/flutter_bloc.dart';
import 'package:flutter_svg/svg.dart';

import 'kya_final_page.dart';
import 'kya_widgets.dart';
import 'package:flutter_gen/gen_l10n/app_localizations.dart';

class KyaLessonsPage extends StatefulWidget {
  const KyaLessonsPage(
    this.kyaLesson, {
    super.key,
  });

  final KyaLesson kyaLesson;

  @override
  State<KyaLessonsPage> createState() => _KyaLessonsPageState();
}

class _KyaLessonsPageState extends State<KyaLessonsPage> {
  final AppinioSwiperController _swipeController = AppinioSwiperController();
  late int currentLesson;

  @override
  void dispose() {
    _swipeController.dispose();
    super.dispose();
  }

  @override
  void initState() {
    super.initState();
    currentLesson = widget.kyaLesson.activeTask <= widget.kyaLesson.tasks.length
        ? widget.kyaLesson.activeTask
        : 1;
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
                await popNavigation(context);
              },
              child: SvgPicture.asset(
                'assets/icon/close.svg',
                height: 40,
                width: 40,
              ),
            ),
            FutureBuilder<Uri>(
              future: ShareService.createShareLink(kya: widget.kyaLesson),
              builder: (context, snapshot) {
                if (snapshot.hasError) {
                  showSnackBar(context,
                      AppLocalizations.of(context)!.couldNotCreateAShareLink);
                }
                if (snapshot.hasData) {
                  return InkWell(
                    onTap: () async {
                      Uri? link = snapshot.data;
                      if (link != null) {
                        await ShareService.shareLink(
                          link,
                          context,
                          kya: widget.kyaLesson,
                        );
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
                    showSnackBar(context,
                        AppLocalizations.of(context)!.creatingShareLink);
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
        child: BlocBuilder<KyaBloc, KyaState>(
          builder: (context, state) {
            KyaLesson kyaLesson = state.lessons.firstWhere(
              (element) => element == widget.kyaLesson,
            );
            return Column(
              children: [
                Visibility(
                  visible: kyaLesson.activeTask <= 1,
                  child: SizedBox(
                    height: 50,
                    child: Center(
                      child: Padding(
                        padding: const EdgeInsets.symmetric(horizontal: 20.0),
                        child: AutoSizeText(
                          AppLocalizations.of(context)!
                              .swipeLeftOrRightToMoveToNextCard,
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
                  visible: kyaLesson.activeTask > 1,
                  child: SizedBox(
                    height: 50,
                    child: Padding(
                      padding: const EdgeInsets.symmetric(vertical: 20.0),
                      child: KyaLessonProgressBar(kyaLesson),
                    ),
                  ),
                ),
                const Spacer(),
                SizedBox(
                  height: 400,
                  child: AppinioSwiper(
                    padding: EdgeInsets.zero,
                    cardsCount: kyaLesson.tasks.length,
                    cardsBuilder: (BuildContext context, int index) {
                      return KyaLessonCard(
                        kyaLesson.tasks[kyaLesson.activeTask - 1],
                        kyaLesson,
                      );
                    },
                    swipeOptions: const AppinioSwipeOptions.symmetric(
                      horizontal: true,
                    ),
                    allowUnswipe: true,
                    unlimitedUnswipe: true,
                    controller: _swipeController,
                    onSwipe: _onSwipe,
                    duration: const Duration(milliseconds: 300),
                    unswipe: _onUnSwipe,
                    loop: true,
                    onEnd: _onEnd,
                  ),
                ),
                const Spacer(),
                Row(
                  mainAxisAlignment: MainAxisAlignment.center,
                  children: [
                    GestureDetector(
                      onTap: () => {
                        currentLesson > 1 ? _swipeController.swipeRight() : null
                      },
                      child: CircularKyaButton(
                        icon: 'assets/icon/previous_arrow.svg',
                        isActive: kyaLesson.activeTask > 1,
                      ),
                    ),
                    const SizedBox(
                      width: 38,
                    ),
                    GestureDetector(
                      onTap: () => {
                        currentLesson >= widget.kyaLesson.tasks.length
                            ? _onEnd()
                            : _swipeController.swipeLeft()
                      },
                      child: const CircularKyaButton(
                        icon: 'assets/icon/next_arrow.svg',
                      ),
                    ),
                  ],
                ),
                const SizedBox(
                  height: 40,
                ),
              ],
            );
          },
        ),
      ),
    );
  }

  Future<void> _onEnd() async {
    KyaLesson kyaLesson = context.read<KyaBloc>().state.lessons.firstWhere(
          (element) => element == widget.kyaLesson,
        );
    if (kyaLesson.status == KyaLessonStatus.complete) {
      context.read<KyaBloc>().add(
            UpdateKyaProgress(
              kyaLesson.copyWith(
                activeTask: 1,
                status: KyaLessonStatus.complete,
              ),
              updateRemote: true,
            ),
          );
      await popNavigation(context);

      return;
    }
    await Navigator.pushReplacement(
      context,
      MaterialPageRoute(
        builder: (context) {
          return KyaFinalPage(kyaLesson);
        },
      ),
    );
  }

  Future<void> _onSwipe(int previousTaskIndex,
      AppinioSwiperDirection appinioSwiperDirection) async {
    KyaBloc kyaBloc = context.read<KyaBloc>();
    KyaLesson kyaLesson = context
        .read<KyaBloc>()
        .state
        .lessons
        .firstWhere((element) => element == widget.kyaLesson);

    if (appinioSwiperDirection == AppinioSwiperDirection.left) {
      int activeTask = currentLesson + 1;
      if (activeTask <= kyaLesson.tasks.length) {
        currentLesson = activeTask;

        kyaBloc
            .add(UpdateKyaProgress(kyaLesson.copyWith(activeTask: activeTask)));
      } else {
        await _navigateToEndPage();
      }
    } else if (appinioSwiperDirection == AppinioSwiperDirection.right) {
      _onUnSwipe(true);
    }
  }

  Future<void> _navigateToEndPage() async {
    KyaLesson kyaLesson = context
        .read<KyaBloc>()
        .state
        .lessons
        .firstWhere((element) => element == widget.kyaLesson);

    await Navigator.pushReplacement(
      context,
      MaterialPageRoute(
        builder: (context) {
          return KyaFinalPage(kyaLesson);
        },
      ),
    );
  }

  void _onUnSwipe(bool unSwiped) {
    KyaLesson kyaLesson = context
        .read<KyaBloc>()
        .state
        .lessons
        .firstWhere((element) => element == widget.kyaLesson);

    if (unSwiped && kyaLesson.activeTask > 1) {
      int previousTask = --currentLesson;
      context
          .read<KyaBloc>()
          .add(UpdateKyaProgress(kyaLesson.copyWith(activeTask: previousTask)));
    }
  }
}
