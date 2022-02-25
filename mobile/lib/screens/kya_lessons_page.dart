import 'package:app/constants/config.dart';
import 'package:app/models/kya.dart';
import 'package:app/services/app_service.dart';
import 'package:auto_size_text/auto_size_text.dart';
import 'package:cached_network_image/cached_network_image.dart';
import 'package:flutter/material.dart';
import 'package:flutter_svg/svg.dart';
import 'package:scrollable_positioned_list/scrollable_positioned_list.dart';
import 'package:sentry_flutter/sentry_flutter.dart';
import 'package:visibility_detector/visibility_detector.dart';

import '../services/native_api.dart';
import '../widgets/buttons.dart';
import '../widgets/custom_shimmer.dart';
import '../widgets/custom_widgets.dart';
import 'home_page.dart';

class KyaLessonsPage extends StatefulWidget {
  final Kya kya;

  const KyaLessonsPage(this.kya, {Key? key}) : super(key: key);

  @override
  _KyaLessonsPageState createState() => _KyaLessonsPageState();
}

class _KyaLessonsPageState extends State<KyaLessonsPage> {
  final ItemScrollController itemScrollController = ItemScrollController();

  double _tipsProgress = 0.1;
  int currentIndex = 0;
  late List<KyaLesson> kyaLessons;
  late AppService _appService;
  bool _showTitleView = true;
  bool _showFinalView = false;
  final List<GlobalKey> _globalKeys = <GlobalKey>[];
  final ShareService _shareService = ShareService();
  GlobalKey bgImageKey = GlobalKey();

  @override
  Widget build(BuildContext context) {
    var screenSize = MediaQuery.of(context).size;

    return WillPopScope(
      onWillPop: _onWillPop,
      child: getView(screenSize: screenSize),
    );
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

  @override
  void didChangeDependencies() {
    downloadKyaImages();
    super.didChangeDependencies();
  }

  void downloadKyaImages() async {
    var futures = <Future<void>>[
      precacheImage(CachedNetworkImageProvider(widget.kya.imageUrl), context),
      precacheImage(
          CachedNetworkImageProvider(widget.kya.secondaryImageUrl), context)
    ];

    for (var lesson in widget.kya.lessons) {
      futures.add(
          precacheImage(CachedNetworkImageProvider(lesson.imageUrl), context));
    }
    await Future.wait(futures);
  }

  Widget getView({required Size screenSize}) {
    if (_showFinalView) {
      return _finalView();
    }
    if (_showTitleView) {
      return _titleView();
    } else {
      return _slidesView(screenSize);
    }
  }

  @override
  void initState() {
    super.initState();
    _appService = AppService(context);
    kyaLessons = widget.kya.lessons;
    currentIndex = 0;
    if (widget.kya.progress <= 0) {
      _showTitleView = true;
    } else {
      _showTitleView = false;
      // if (widget.kya.progress >= kyaLessons.length) {
      //   currentIndex = kyaLessons.length - 1;
      // }
      // else {
      //   currentIndex = kyaLessons.length;
      // }
    }
    for (var _ in widget.kya.lessons) {
      _globalKeys.add(GlobalKey());
    }
  }

  Widget kyaCard(KyaLesson kyaItem) {
    return Card(
      color: Colors.white,
      elevation: 20.0,
      shadowColor: Config.appBodyColor,
      shape: RoundedRectangleBorder(
        borderRadius: BorderRadius.circular(16),
      ),
      child: Container(
        alignment: Alignment.center,
        child: Column(
          mainAxisSize: MainAxisSize.min,
          crossAxisAlignment: CrossAxisAlignment.center,
          children: [
            const SizedBox(
              height: 8.0,
            ),
            Padding(
              padding: const EdgeInsets.only(left: 8.0, right: 8.0),
              child: Container(
                height: 180,
                decoration: BoxDecoration(
                  borderRadius: BorderRadius.circular(8),
                ),
                child: ClipRRect(
                    borderRadius: BorderRadius.circular(8),
                    child: CachedNetworkImage(
                      fit: BoxFit.fill,
                      placeholder: (context, url) => SizedBox(
                        child:
                            containerLoadingAnimation(height: 180, radius: 16),
                      ),
                      imageUrl: kyaItem.imageUrl,
                      errorWidget: (context, url, error) => Icon(
                        Icons.error_outline,
                        color: Config.red,
                      ),
                    )),
              ),
            ),
            // const SizedBox(
            //   height: 12,
            // ),
            const Spacer(),
            Padding(
              padding: const EdgeInsets.only(left: 36, right: 36),
              child: Text(
                kyaItem.title,
                maxLines: 2,
                overflow: TextOverflow.ellipsis,
                textAlign: TextAlign.center,
                style: TextStyle(
                    color: Config.appColorBlack,
                    fontSize: 20,
                    fontWeight: FontWeight.bold),
              ),
            ),
            const SizedBox(
              height: 8.0,
            ),
            Expanded(
              child: Padding(
                padding: const EdgeInsets.only(left: 16, right: 16),
                child: Text(
                  kyaItem.body,
                  maxLines: 4,
                  overflow: TextOverflow.ellipsis,
                  textAlign: TextAlign.center,
                  style: TextStyle(
                      color: Colors.black.withOpacity(0.5), fontSize: 16),
                ),
              ),
            ),
            const Spacer(),
            // const SizedBox(
            //   height: 20.0,
            // ),
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

  void scrollToCard({required int direction}) {
    if (direction == -1) {
      setState(() {
        currentIndex = currentIndex - 1;
      });
      itemScrollController.scrollTo(
          index: currentIndex,
          duration: const Duration(seconds: 1),
          curve: Curves.easeInOutCubic);
    } else {
      setState(() {
        currentIndex = currentIndex + 1;
      });
      if (currentIndex < kyaLessons.length) {
        itemScrollController.scrollTo(
            index: currentIndex,
            duration: const Duration(seconds: 1),
            curve: Curves.easeInOutCubic);
      } else {
        setState(() {
          _showFinalView = true;
        });
        Future.delayed(const Duration(seconds: 4), () {
          Navigator.pushAndRemoveUntil(context,
              MaterialPageRoute(builder: (context) {
            return const HomePage();
          }), (r) => false);
        });
        updateProgress(complete: true);
      }
    }

    Future.delayed(const Duration(milliseconds: 500), setTipsProgress);
  }

  void setTipsProgress() {
    setState(() {
      _tipsProgress = (currentIndex + 1) / kyaLessons.length;
    });
  }

  void updateProgress({required bool complete}) {
    var kya = widget.kya;

    if (kya.progress == -1) {
      return;
    }

    if (currentIndex > kya.progress) {
      kya.progress = currentIndex;
    }

    if (complete) {
      kya.progress = kya.lessons.length;
    }

    _appService.updateKya(kya);
  }

  Widget _finalView() {
    return Scaffold(
      appBar: AppBar(
        elevation: 0,
        toolbarHeight: 0,
        backgroundColor: Config.appBodyColor,
      ),
      body: Container(
          color: Config.appBodyColor,
          child: Center(
            child: Column(
                mainAxisAlignment: MainAxisAlignment.center,
                crossAxisAlignment: CrossAxisAlignment.center,
                children: [
                  SvgPicture.asset(
                    'assets/icon/learn_complete.svg',
                    height: 133,
                    width: 221,
                  ),
                  const SizedBox(
                    height: 33.61,
                  ),
                  Padding(
                    padding: const EdgeInsets.only(left: 40, right: 40),
                    child: Text(
                      'Congrats!',
                      style: TextStyle(
                          color: Config.appColorBlack,
                          fontSize: 28,
                          fontWeight: FontWeight.bold),
                    ),
                  ),
                  const SizedBox(
                    height: 8.0,
                  ),
                  Padding(
                    padding: const EdgeInsets.only(left: 60, right: 60),
                    child: Text(
                      widget.kya.completionMessage,
                      textAlign: TextAlign.center,
                      style: TextStyle(
                          color: Config.appColorBlack.withOpacity(0.5),
                          fontSize: 16),
                    ),
                  ),
                ]),
          )),
    );
  }

  Future<bool> _onWillPop() {
    updateProgress(complete: false);
    return Future.value(true);
  }

  Widget _slidesView(Size screenSize) {
    // Future.delayed(const Duration(milliseconds: 500), () {
    //   if(mounted && itemScrollController.isAttached){
    //
    //     itemScrollController.scrollTo(
    //         index: currentIndex,
    //         duration: const Duration(milliseconds: 500),
    //         curve: Curves.easeInOutCubic);
    //     setTipsProgress();
    //   }
    // });

    return Scaffold(
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
                    updateProgress(complete: false);
                    Navigator.of(context).pop(true);
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
                  backgroundColor: Config.appColorBlue.withOpacity(0.2),
                )),
                const SizedBox(
                  width: 7,
                ),
                GestureDetector(
                  onTap: () async {
                    try {
                      await _shareService.shareKya(
                          context, _globalKeys[currentIndex]);
                    } catch (exception, stackTrace) {
                      debugPrint('$exception\n$stackTrace');
                      await Sentry.captureException(
                        exception,
                        stackTrace: stackTrace,
                      );
                    }
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
                SizedBox(
                  height: screenSize.height * 0.75,
                  child: ScrollablePositionedList.builder(
                    scrollDirection: Axis.horizontal,
                    itemCount: kyaLessons.length,
                    itemBuilder: (context, index) {
                      return VisibilityDetector(
                        key: Key(index.toString()),
                        onVisibilityChanged: (VisibilityInfo visibilityInfo) {
                          // if ((visibilityInfo.visibleFraction >
                          //     0.3) &&
                          //     (currentIndex != index)) {
                          //   setState(() {
                          //     currentIndex = index;
                          //   });
                          //   scrollToCard();
                          // }
                        },
                        child: Padding(
                          padding: const EdgeInsets.only(
                              top: 52, bottom: 40, left: 19, right: 19),
                          child: RepaintBoundary(
                            key: _globalKeys[index],
                            child: SizedBox(
                                width: screenSize.width * 0.9,
                                child: kyaCard(kyaLessons[index])),
                          ),
                        ),
                      );
                    },
                    itemScrollController: itemScrollController,
                  ),
                ),
                const Spacer(),
                Padding(
                  padding: const EdgeInsets.only(left: 20, right: 20),
                  child: Row(
                    mainAxisAlignment: MainAxisAlignment.spaceBetween,
                    children: [
                      Visibility(
                        child: GestureDetector(
                            onTap: () {
                              scrollToCard(direction: -1);
                            },
                            child: circularButton(
                                'assets/icon/previous_arrow.svg')),
                        visible: currentIndex > 0,
                      ),
                      GestureDetector(
                          onTap: () {
                            scrollToCard(direction: 1);
                          },
                          child: circularButton('assets/icon/next_arrow.svg')),
                    ],
                  ),
                ),
                const SizedBox(
                  height: 40,
                ),
              ],
            )));
  }

  Widget _titleView() {
    return Scaffold(
      extendBodyBehindAppBar: true,
      appBar: knowYourAirAppBar(context, 'Know Your Air'),
      body: Stack(children: [
        Container(
          color: Config.appBodyColor,
          height: double.infinity,
          width: double.infinity,
        ),
        FractionallySizedBox(
          alignment: Alignment.topCenter,
          widthFactor: 1.0,
          heightFactor: 0.4,
          child: Container(
              decoration: BoxDecoration(
                image: DecorationImage(
                  fit: BoxFit.cover,
                  image: CachedNetworkImageProvider(
                    widget.kya.secondaryImageUrl.trim() == ''
                        ? widget.kya.imageUrl
                        : widget.kya.secondaryImageUrl,
                  ),
                ),
              ),
              child: Stack(
                children: [
                  CachedNetworkImage(
                    fit: BoxFit.fill,
                    placeholder: (context, url) => SizedBox(
                      child: containerLoadingAnimation(
                          height:
                              bgImageKey.currentContext?.size?.height ?? 180,
                          radius: 0),
                    ),
                    imageUrl: widget.kya.secondaryImageUrl.trim() == ''
                        ? widget.kya.imageUrl
                        : widget.kya.secondaryImageUrl,
                    errorWidget: (context, url, error) => Icon(
                      Icons.error_outline,
                      color: Config.red,
                    ),
                  ),
                  Container(
                    color: Config.appColorBlue.withOpacity(0.4),
                  ),
                ],
              )),
        ),
        Positioned.fill(
          child: Align(
              alignment: Alignment.bottomCenter,
              child: Padding(
                padding: const EdgeInsets.only(left: 24, right: 24),
                child: Column(
                  children: [
                    const Spacer(),
                    Container(
                        decoration: const BoxDecoration(
                            color: Colors.white,
                            borderRadius:
                                BorderRadius.all(Radius.circular(16.0))),
                        child: Center(
                          child: Column(
                            crossAxisAlignment: CrossAxisAlignment.center,
                            children: [
                              const SizedBox(
                                height: 48,
                              ),
                              SvgPicture.asset(
                                'assets/icon/kya_stars.svg',
                                height: 133.39,
                                width: 221.46,
                              ),
                              const SizedBox(
                                height: 18,
                              ),
                              Padding(
                                padding:
                                    const EdgeInsets.only(left: 16, right: 16),
                                child: AutoSizeText(
                                  widget.kya.title,
                                  textAlign: TextAlign.center,
                                  maxLines: 3,
                                  overflow: TextOverflow.ellipsis,
                                  maxFontSize: 28,
                                  style: TextStyle(
                                      fontWeight: FontWeight.bold,
                                      color: Config.appColorBlack,
                                      fontSize: 28),
                                ),
                              ),
                              const SizedBox(
                                height: 64,
                              ),
                            ],
                          ),
                        )),
                    const SizedBox(
                      height: 16,
                    ),
                    GestureDetector(
                      onTap: () {
                        setState(() {
                          _showTitleView = false;
                        });
                      },
                      child: nextButton('Begin', Config.appColorBlue),
                    ),
                    const SizedBox(
                      height: 32,
                    ),
                  ],
                ),
              )),
        ),
      ]),
    );
  }
}
