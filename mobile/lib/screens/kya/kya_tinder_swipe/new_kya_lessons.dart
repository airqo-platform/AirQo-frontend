import 'package:flutter/material.dart';
import 'package:flutter_svg/svg.dart';

import '../../../models/kya.dart';
import '../../../services/native_api.dart';
import '../../../themes/colors.dart';
import '../../../utils/exception.dart';
import '../kya_widgets.dart';
import 'kya_drag_widget.dart';

class KyaLessonsPage1 extends StatefulWidget {
  const KyaLessonsPage1({
    Key? key,
    required this.kya,
  }) : super(key: key);
  final Kya kya;

  @override
  State<KyaLessonsPage1> createState() => _KyaLessonsPage1State();
}

class _KyaLessonsPage1State extends State<KyaLessonsPage1>
    with SingleTickerProviderStateMixin {
  List<KyaLesson> _kyaLessons = [];
  final List<GlobalKey> _globalKeys = <GlobalKey>[];

  int currentIndex = 0;

  ValueNotifier<Swipe> swipeNotifier = ValueNotifier(Swipe.none);
  late final AnimationController _animationController;
  final double _tipsProgress = 0.1;

  @override
  void initState() {
    super.initState();
    _kyaLessons = widget.kya.lessons;
    _animationController = AnimationController(
      duration: const Duration(milliseconds: 500),
      vsync: this,
    );
    _animationController.addStatusListener((status) {
      if (status == AnimationStatus.completed) {
        _kyaLessons.removeLast();
        _animationController.reset();

        swipeNotifier.value = Swipe.none;
      }
    });
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        automaticallyImplyLeading: false,
        elevation: 0,
        backgroundColor: CustomColors.appBodyColor,
        centerTitle: false,
        titleSpacing: 0,
        title: Row(
          children: [
            GestureDetector(
              onTap: () {
                updateProgress();
                Navigator.of(context).pop(true);
              },
              child: Padding(
                padding: const EdgeInsets.only(left: 24, right: 7),
                child: SvgPicture.asset(
                  'assets/icon/close.svg',
                  height: 20,
                  width: 20,
                ),
              ),
            ),
            Expanded(
              child: LinearProgressIndicator(
                color: CustomColors.appColorBlue,
                value: _tipsProgress,
                backgroundColor: CustomColors.appColorBlue.withOpacity(0.2),
              ),
            ),
            GestureDetector(
              onTap: () async {
                try {
                  await ShareService.shareKya(
                    context,
                    _globalKeys[currentIndex],
                  );
                } catch (exception, stackTrace) {
                  await logException(
                    exception,
                    stackTrace,
                  );
                }
              },
              child: Padding(
                padding: const EdgeInsets.only(left: 7, right: 24),
                child: SvgPicture.asset(
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
      backgroundColor: CustomColors.appBodyColor,
      body: Column(
        children: [
          const SizedBox(
            height: 80,
          ),
          Stack(
            clipBehavior: Clip.none,
            children: [
              ClipRRect(
                borderRadius: BorderRadius.circular(10),
                child: ValueListenableBuilder(
                  valueListenable: swipeNotifier,
                  builder: (context, swipe, _) => Stack(
                    clipBehavior: Clip.none,
                    alignment: Alignment.center,
                    children: List.generate(_kyaLessons.length, (index) {
                      if (index == _kyaLessons.length - 1) {
                        return PositionedTransition(
                          rect: RelativeRectTween(
                            begin: RelativeRect.fromSize(
                                const Rect.fromLTWH(0, 0, 580, 340),
                                const Size(580, 340)),
                            end: RelativeRect.fromSize(
                                Rect.fromLTWH(
                                    swipe != Swipe.none
                                        ? swipe == Swipe.left
                                            ? -300
                                            : 300
                                        : 0,
                                    0,
                                    580,
                                    340),
                                const Size(580, 340)),
                          ).animate(CurvedAnimation(
                            parent: _animationController,
                            curve: Curves.easeInOut,
                          )),
                          child: RotationTransition(
                            turns: Tween<double>(
                                    begin: 0,
                                    end: swipe != Swipe.none
                                        ? swipe == Swipe.left
                                            ? -0.1 * 0.3
                                            : 0.1 * 0.3
                                        : 0.0)
                                .animate(
                              CurvedAnimation(
                                parent: _animationController,
                                curve: const Interval(0, 0.4,
                                    curve: Curves.easeInOut),
                              ),
                            ),
                            child: KyaDragWidget(
                              kyaLesson: _kyaLessons[index],
                              index: index,
                              swipeNotifier: swipeNotifier,
                              isLastCard: true,
                            ),
                          ),
                        );
                      } else {
                        return KyaDragWidget(
                          kyaLesson: _kyaLessons[index],
                          index: index,
                          swipeNotifier: swipeNotifier,
                        );
                      }
                    }),
                  ),
                ),
              ),
              Positioned(
                left: 0,
                child: DragTarget<int>(
                  builder: (
                    BuildContext context,
                    List<dynamic> accepted,
                    List<dynamic> rejected,
                  ) {
                    return IgnorePointer(
                      child: Container(
                        height: 700.0,
                        width: 80.0,
                        color: Colors.transparent,
                      ),
                    );
                  },
                  onAccept: (int index) {
                    setState(() => _kyaLessons.removeAt(index));
                  },
                ),
              ),
              Positioned(
                right: 0,
                child: DragTarget<int>(
                  builder: (
                    BuildContext context,
                    List<dynamic> accepted,
                    List<dynamic> rejected,
                  ) {
                    return IgnorePointer(
                      child: Container(
                        height: 700.0,
                        width: 80.0,
                        color: Colors.transparent,
                      ),
                    );
                  },
                  onAccept: (int index) {
                    setState(() => _kyaLessons.removeAt(index));
                  },
                ),
              ),
            ],
          ),
          const Spacer(),
          Padding(
            padding: const EdgeInsets.only(left: 20, right: 20, bottom: 50),
            child: Row(
              mainAxisAlignment: MainAxisAlignment.spaceBetween,
              children: [
                Visibility(
                  child: GestureDetector(
                    onTap: () {
                      // scrollToCard(direction: -1);
                      swipeNotifier.value = Swipe.left;
                      _animationController.forward();
                    },
                    child: const CircularKyaButton(
                      icon: 'assets/icon/previous_arrow.svg',
                    ),
                  ),
                  visible: currentIndex > 0,
                ),
                GestureDetector(
                  onTap: () {
                    // scrollToCard(direction: 1);
                    swipeNotifier.value = Swipe.right;
                    _animationController.forward();
                  },
                  child: const CircularKyaButton(
                    icon: 'assets/icon/next_arrow.svg',
                  ),
                ),
              ],
            ),
          ),
        ],
      ),
    );
  }

  Future<void> updateProgress() async {
    if (widget.kya.progress == -1) {
      return;
    }
    final kya = widget.kya..progress = currentIndex;
    if (kya.progress > kya.lessons.length || kya.progress < 0) {
      kya.progress = kya.lessons.length - 1;
    }
    await kya.saveKya();
  }
}
