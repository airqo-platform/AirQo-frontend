import 'package:app/screens/kya/kya_final_page.dart';
import 'package:app/themes/app_theme.dart';
import 'package:auto_size_text/auto_size_text.dart';
import 'package:flutter/material.dart';
import 'package:flutter_svg/svg.dart';
import '../../models/enum_constants.dart';
import '../../models/kya.dart';
import '../../services/native_api.dart';
import '../../themes/colors.dart';
import '../../widgets/custom_shimmer.dart';
import 'kya_widgets.dart';

class KyaLessonsPage extends StatefulWidget {
  const KyaLessonsPage({
    Key? key,
    required this.kya,
  }) : super(key: key);

  final Kya kya;

  @override
  State<KyaLessonsPage> createState() => _KyaLessonsPageState();
}

class _KyaLessonsPageState extends State<KyaLessonsPage>
    with SingleTickerProviderStateMixin {
  List<KyaLesson> _kyaLessons1 = []; //1st array to hold all stack
  final List<KyaLesson> _kyaLessons2 = []; //2nd  stores cards during swipe
  ValueNotifier<Swipe> swipeNotifier = ValueNotifier(Swipe.none);
  late final AnimationController _animationController;
  late double _tipsProgress = 0.1;
  late Kya kya;
  bool _shareLoading = false;
  final GlobalKey _globalKey = GlobalKey();

  @override
  void initState() {
    super.initState();
    _kyaLessons1 = widget.kya.lessons;
    _animationController = AnimationController(
      duration: const Duration(milliseconds: 500),
      vsync: this,
    );
    _animationController.addStatusListener((status) {
      if (status == AnimationStatus.completed) {
        _kyaLessons1.removeLast();
        _animationController.reset();
        swipeNotifier.value = Swipe.none;
      }
    });
  }

  @override
  Widget build(BuildContext context) {
    return WillPopScope(
      onWillPop: _onWillPop,
      child: Scaffold(
        appBar: AppBar(
          automaticallyImplyLeading: false,
          elevation: 0,
          backgroundColor: CustomColors.appBodyColor,
          centerTitle: false,
          titleSpacing: 0,
          title: Row(
            children: [
              InkWell(
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
        backgroundColor: CustomColors.appBodyColor,
        body: Column(
          children: [
            // const SizedBox(
            //   height: 10,
            // ),
            Expanded(
              flex: 0,
              child: Visibility(
                visible: _kyaLessons2.isEmpty,
                child: AutoSizeText(
                  'Swipe Left Or Right to Move to Next Card',
                  style: CustomTextStyle.headline7(context)?.copyWith(
                      color: CustomColors.appColorBlue,
                      
                      ),
                  textAlign: TextAlign.center,
                ),
              ),
            ),
            Expanded(
              flex: 4,
              child: Stack(
                clipBehavior: Clip.none,
                children: [
                  ClipRRect(
                    borderRadius: BorderRadius.circular(10),
                    child: RepaintBoundary(
                      key: _globalKey,
                      child: ValueListenableBuilder(
                        valueListenable: swipeNotifier,
                        builder: (context, swipe, _) => Stack(
                          clipBehavior: Clip.none,
                          alignment: Alignment.center,
                          children: List.generate(
                            _kyaLessons1.length,
                            (index) => (index == _kyaLessons1.length - 1)
                                ? PositionedTransition(
                                    rect: RelativeRectTween(
                                      begin: RelativeRect.fromSize(
                                        const Rect.fromLTWH(0, 0, 580, 340),
                                        const Size(580, 340),
                                      ),
                                      end: RelativeRect.fromSize(
                                        Rect.fromLTWH(
                                          swipe != Swipe.none
                                              ? swipe == Swipe.left
                                                  ? -300
                                                  : 300
                                              : 0,
                                          0,
                                          580,
                                          340,
                                        ),
                                        const Size(580, 340),
                                      ),
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
                                            : 0.0,
                                      ).animate(
                                        CurvedAnimation(
                                          parent: _animationController,
                                          curve: const Interval(
                                            0,
                                            0.4,
                                            curve: Curves.easeInOut,
                                          ),
                                        ),
                                      ),
                                      child: KyaDragWidget(
                                        kyaLesson: _kyaLessons1[index],
                                        index: index,
                                        swipeNotifier: swipeNotifier,
                                        isLastCard: true,
                                      ),
                                    ),
                                  )
                                : KyaDragWidget(
                                    kyaLesson: _kyaLessons1[index],
                                    index: index,
                                    swipeNotifier: swipeNotifier,
                                  ),
                          ),
                        ),
                      ),
                    ),
                  ),
                  Positioned(left: 0, child: dragTarget()),
                  Positioned(
                    right: 0,
                    child: dragTarget(),
                  ),
                ],
              ),
            ),
            // const Spacer(),
            Expanded(
              flex: 1,
              child: Padding(
                padding: const EdgeInsets.only(left: 20, right: 20, bottom: 50),
                child: Row(
                  mainAxisAlignment: MainAxisAlignment.spaceBetween,
                  children: [
                    Visibility(
                      visible: _kyaLessons2.isNotEmpty,
                      child: GestureDetector(
                        onTap: () {
                          setState(() {
                            //Returns cards to screen
                            _kyaLessons1.add(_kyaLessons2.last);
                            _kyaLessons2.removeLast();
                            _tipsProgress -= 0.1;
                          });
                        },
                        child: const CircularKyaButton(
                          icon: 'assets/icon/previous_arrow.svg',
                        ),
                      ),
                    ),
                    GestureDetector(
                      onTap: () {
                        if (_kyaLessons1.length == 1) {
                          Navigator.pushReplacement(
                            context,
                            MaterialPageRoute(
                              builder: (context) {
                                return KyaFinalPage(kya: widget.kya);
                              },
                            ),
                          );
                        } else {
                          swipeNotifier.value = Swipe.right;
                          _animationController.forward();
                          setState(() {
                            _kyaLessons2.add(_kyaLessons1.last);
                            _tipsProgress += 0.1;
                          });
                        }
                      },
                      child: const CircularKyaButton(
                        icon: 'assets/icon/next_arrow.svg',
                      ),
                    ),
                  ],
                ),
              ),
            ),
          ],
        ),
      ),
    );
  }

  DragTarget<int> dragTarget() {
    return DragTarget<int>(
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
        setState(
          () {
            if (_kyaLessons1.length == 1) {
              Navigator.pushReplacement(
                context,
                MaterialPageRoute(
                  builder: (context) {
                    return KyaFinalPage(kya: widget.kya);
                  },
                ),
              );
            } else {
              nextCard(
                index: index,
                lesson1: _kyaLessons1,
                lesson2: _kyaLessons2,
              );
              _tipsProgress += 0.1;
            }
          },
        );
      },
    );
  }

  void nextCard({
    required List<KyaLesson> lesson1,
    required List<KyaLesson> lesson2,
    required int index,
  }) {
    //used in updating the two arrays
    lesson2.add(lesson1[index]);
    lesson1.removeAt(index);
  }

  Future<void> _share() async {
    if (_shareLoading) {
      return;
    }
    setState(() => _shareLoading = true);
    final complete = await ShareService.shareWidget(
      buildContext: context,
      globalKey: _globalKey,
      imageName: 'airqo_know_your_air',
    );
    if (complete && mounted) {
      setState(() => _shareLoading = false);
    }
  }

  Future<void> updateProgress() async {
    if (widget.kya.progress == -1) {
      return;
    }
    final kya = widget.kya..progress = _kyaLessons1.length - 1;
    if (kya.progress > kya.lessons.length || kya.progress < 0) {
      kya.progress = kya.lessons.length - 1;
    }
    await kya.saveKya();
  }

  Future<bool> _onWillPop() {
    updateProgress();

    return Future.value(true);
  }
}
