import 'package:app/constants/config.dart';
import 'package:app/models/kya.dart';
import 'package:flutter/material.dart';
import 'package:flutter_svg/svg.dart';

import '../widgets/kya_cards.dart';

class KyaLessonAnimation extends StatefulWidget {
  final Kya kya;

  const KyaLessonAnimation(this.kya, {Key? key}) : super(key: key);

  @override
  _KyaLessonAnimationState createState() => _KyaLessonAnimationState();
}

class _KyaLessonAnimationState extends State<KyaLessonAnimation>
    with TickerProviderStateMixin {
  late AnimationController _animationController;
  late Animation<double> rotate;
  late Animation<double> right;
  int flag = 0;
  final _tipsProgress = 0.1;
  late List<KyaLesson> kyaLessons;

  void addLesson(KyaLesson kyaLesson) {
    setState(() {
      kyaLessons.remove(kyaLesson);
    });
  }

  @override
  Widget build(BuildContext context) {
    return (Scaffold(
        appBar: AppBar(
          automaticallyImplyLeading: false,
          elevation: 0,
          backgroundColor: Config.appBodyColor,
          centerTitle: false,
          titleSpacing: 0,
          title: Padding(
            padding: const EdgeInsets.only(left: 24, right: 24),
            child: Row(
              children: [
                GestureDetector(
                  onTap: () {
                    // updateKyaProgress();
                    Navigator.of(context).pop();
                  },
                  child: SvgPicture.asset(
                    'assets/icon/close.svg',
                    height: 20,
                    width: 20,
                  ),
                ),
                const SizedBox(
                  width: 7,
                ),
                Expanded(
                    child: LinearProgressIndicator(
                  color: Config.appColorBlue,
                  value: _tipsProgress,
                  backgroundColor: Config.appColorDisabled.withOpacity(0.2),
                )),
                const SizedBox(
                  width: 7,
                ),
                GestureDetector(
                  onTap: () {
                    // _shareService.shareKya(context, _globalKey);
                  },
                  child: SvgPicture.asset(
                    'assets/icon/share_icon.svg',
                    color: Config.greyColor,
                    height: 16,
                    width: 16,
                  ),
                ),
              ],
            ),
          ),
        ),
        body: Container(
            alignment: Alignment.center,
            color: Config.appBodyColor,
            child: Column(
              children: [
                const Spacer(),
                kyaLessons.isNotEmpty
                    ? Stack(
                        alignment: AlignmentDirectional.center,
                        children: kyaLessons.map((item) {
                          if (kyaLessons.indexOf(item) ==
                              kyaLessons.length - 1) {
                            return kyaLessonCard(
                                item,
                                right.value,
                                0.0,
                                rotate.value,
                                rotate.value < -10 ? 0.1 : 0.0,
                                context,
                                dismissLesson,
                                flag,
                                addLesson,
                                swipeRight,
                                swipeLeft);
                          } else {
                            return kyaDummyLessonCard(item, context);
                          }
                        }).toList())
                    : const Text('No Event Left',
                        style: TextStyle(color: Colors.white, fontSize: 50.0)),
                const Spacer(),
                Padding(
                  padding: const EdgeInsets.only(left: 20, right: 20),
                  child: Row(
                    mainAxisAlignment: MainAxisAlignment.spaceBetween,
                    children: [
                      GestureDetector(
                          onTap: swipeLeft,
                          child:
                              circularButton('assets/icon/previous_arrow.svg')),
                      GestureDetector(
                          onTap: swipeRight,
                          child: circularButton('assets/icon/next_arrow.svg')),
                    ],
                  ),
                ),
                const SizedBox(
                  height: 40,
                ),
              ],
            ))));
  }

  Widget circularButton(String icon) {
    return Container(
      height: 48,
      width: 48,
      padding: const EdgeInsets.all(15.0),
      decoration: BoxDecoration(
        color: Config.appColorPaleBlue,
        shape: BoxShape.circle,
      ),
      child: SvgPicture.asset(
        icon,
        color: Config.appColorBlue,
      ),
    );
  }

  void dismissLesson(KyaLesson kyaLesson) {
    setState(() {
      kyaLessons.remove(kyaLesson);
    });
    _updateProgress(kyaLesson);
  }

  @override
  void dispose() {
    _animationController.dispose();
    super.dispose();
  }

  @override
  void initState() {
    super.initState();
    kyaLessons = widget.kya.lessons.reversed.toList();
    _animationController = AnimationController(
        duration: const Duration(milliseconds: 1000),
        reverseDuration: const Duration(milliseconds: 1000),
        vsync: this);

    rotate = Tween<double>(
      begin: -0.0,
      end: -40.0,
    ).animate(
      CurvedAnimation(
        parent: _animationController,
        curve: Curves.ease,
      ),
    );
    rotate.addListener(() {
      setState(() {
        if (rotate.isCompleted) {
          var i = kyaLessons.removeLast();
          kyaLessons.insert(0, i);

          _animationController.reset();
        }
      });
    });

    right = Tween<double>(
      begin: 0.0,
      end: 400.0,
    ).animate(
      CurvedAnimation(
        parent: _animationController,
        curve: Curves.ease,
      ),
    )..addStatusListener((status) {
        if (status == AnimationStatus.completed) {
          setState(() {});
          // _buttonController.reverse();
        } else if (status == AnimationStatus.dismissed) {
          setState(() {});
          // _buttonController.forward();
        }
      });
  }

  void swipeLeft() {
    if (flag == 1) {
      setState(() {
        flag = 0;
      });
    }
    _swipeAnimationRight();
  }

  void swipeRight() {
    if (flag == 0) {
      setState(() {
        flag = 1;
      });
    }
    _swipeAnimationRight();
  }

  Future<void> _swipeAnimationRight() async {
    try {
      await _animationController.forward();
    } on Error catch (exception, stackTrace) {
      debugPrint('$exception\n$stackTrace');
    }
  }

  void _updateProgress(KyaLesson kyaLesson) {
    /// update local db
    /// update online db
  }
}
