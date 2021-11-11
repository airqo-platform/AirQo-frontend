import 'package:app/constants/app_constants.dart';
import 'package:app/models/kya.dart';
import 'package:app/services/fb_notifications.dart';
import 'package:app/utils/share.dart';
import 'package:app/widgets/buttons.dart';
import 'package:app/widgets/custom_widgets.dart';
import 'package:cached_network_image/cached_network_image.dart';
import 'package:flutter/cupertino.dart';
import 'package:flutter/material.dart';
import 'package:flutter_svg/svg.dart';
import 'package:shared_preferences/shared_preferences.dart';

import 'home_page.dart';

class AirPollutionWaysPage extends StatefulWidget {
  final Kya kya;
  final bool trackProgress;
  const AirPollutionWaysPage(this.kya, this.trackProgress, {Key? key})
      : super(key: key);

  @override
  _AirPollutionWaysPageState createState() => _AirPollutionWaysPageState();
}

class _AirPollutionWaysPageState extends State<AirPollutionWaysPage> {
  bool _showSlides = false;
  int _currentPage = 0;
  bool _showLastPage = false;
  double _tipsProgress = 0.1;
  bool isSaving = false;

  final PageController _controller = PageController();
  final CloudAnalytics _cloudAnalytics = CloudAnalytics();
  final CloudStore _cloudStore = CloudStore();
  final CustomAuth _customAuth = CustomAuth();
  final GlobalKey _globalKey = GlobalKey();

  @override
  Widget build(BuildContext context) {
    if (_showSlides) {
      return WillPopScope(
        onWillPop: _onWillPop,
        child: slidesView(),
      );
      // return slidesView();
    }

    if (_showLastPage) {
      if (widget.trackProgress) {
        completeProgress();
        Future.delayed(const Duration(seconds: 3), () async {
          await Navigator.pushAndRemoveUntil(context,
              MaterialPageRoute(builder: (context) {
            return const HomePage();
          }), (r) => false);
        });
        // return finalView();
        return WillPopScope(
          onWillPop: _onWillPop,
          child: finalView(),
        );
      } else {
        Navigator.pop(context, true);
      }
    }

    // return mainView();
    return WillPopScope(
      onWillPop: _onWillPop,
      child: mainView(),
    );
  }

  Widget circularButton(String icon) {
    return Container(
      height: 48,
      width: 48,
      padding: const EdgeInsets.all(15.0),
      decoration: BoxDecoration(
        color: ColorConstants.appColorPaleBlue,
        shape: BoxShape.circle,
      ),
      child: SvgPicture.asset(
        icon,
        color: ColorConstants.appColorBlue,
      ),
    );
  }

  Future<void> completeProgress() async {
    await SharedPreferences.getInstance()
        .then((value) => {value.setDouble(PrefConstant.tipsProgress, 2.0)});
  }

  Widget finalView() {
    return Scaffold(
      appBar: AppBar(
        elevation: 0,
        toolbarHeight: 0,
        backgroundColor: ColorConstants.appBodyColor,
      ),
      body: Container(
          color: ColorConstants.appBodyColor,
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
                  Text(
                    'Congrats!',
                    style: TextStyle(
                        color: ColorConstants.appColorBlack,
                        fontSize: 28,
                        fontWeight: FontWeight.bold),
                  ),
                  const SizedBox(
                    height: 8.0,
                  ),
                  Text(
                    'You just finished your first \nKnow You Air Lesson',
                    textAlign: TextAlign.center,
                    style: TextStyle(
                        color: ColorConstants.appColorBlack.withOpacity(0.5),
                        fontSize: 16),
                  ),
                ]),
          )),
    );
  }

  @override
  void initState() {
    _cloudAnalytics.logScreenTransition('Air Pollution ways');
    super.initState();
  }

  Widget mainView() {
    return Scaffold(
      extendBodyBehindAppBar: true,
      appBar: knowYourAirAppBar(context, 'Know Your Air'),
      body: Stack(children: [
        Container(
          color: ColorConstants.appBodyColor,
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
                  widget.kya.imageUrl,
                ),
              ),
            ),
          ),
          // child: Image.asset(
          //   'assets/images/tips-image.png',
          //   fit: BoxFit.cover,
          // ),
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
                                BorderRadius.all(Radius.circular(8.0))),
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
                              Text(
                                widget.kya.title,
                                textAlign: TextAlign.center,
                                maxLines: 3,
                                overflow: TextOverflow.ellipsis,
                                style: TextStyle(
                                    fontWeight: FontWeight.bold,
                                    color: ColorConstants.appColorBlack,
                                    fontSize: 28),
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
                          _showSlides = true;
                          _showLastPage = false;
                        });
                      },
                      child: nextButton('Begin', ColorConstants.appColorBlue),
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

  Widget slideCard(KyaItem kyaItem, int index) {
    return Card(
      shadowColor: Colors.transparent,
      shape: RoundedRectangleBorder(
        borderRadius: BorderRadius.circular(16),
      ),
      elevation: 20,
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
              width: MediaQuery.of(context).size.width,
              height: 180,
              decoration: BoxDecoration(
                borderRadius: BorderRadius.circular(8),
                image: DecorationImage(
                  fit: BoxFit.cover,
                  image: CachedNetworkImageProvider(
                    kyaItem.imageUrl,
                  ),
                ),
              ),
            ),
          ),
          const SizedBox(
            height: 12,
          ),
          Padding(
            padding: const EdgeInsets.only(left: 36, right: 36),
            child: Text(
              kyaItem.title,
              maxLines: 2,
              overflow: TextOverflow.ellipsis,
              textAlign: TextAlign.center,
              style: TextStyle(
                  color: ColorConstants.appColorBlack,
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
          const SizedBox(
            height: 30,
          ),
          SvgPicture.asset(
            'assets/icon/tips_graphics.svg',
            semanticsLabel: 'tips_graphics',
          ),
          const SizedBox(
            height: 30,
          ),
        ],
      ),
    );
  }

  Widget slidesView() {
    return Scaffold(
      appBar: AppBar(
        automaticallyImplyLeading: false,
        elevation: 0,
        toolbarHeight: 24,
        backgroundColor: ColorConstants.appBodyColor,
      ),
      body: Container(
        color: ColorConstants.appBodyColor,
        padding: const EdgeInsets.only(left: 24, right: 24, bottom: 40),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.center,
          mainAxisAlignment: MainAxisAlignment.spaceBetween,
          children: [
            Row(
              children: [
                GestureDetector(
                  onTap: () {
                    updateKyaProgress();
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
                  color: ColorConstants.appColorBlue,
                  value: _tipsProgress,
                  backgroundColor:
                      ColorConstants.appColorDisabled.withOpacity(0.2),
                )),
                const SizedBox(
                  width: 7,
                ),
                GestureDetector(
                  onTap: () {
                    shareKya(context, _globalKey);
                  },
                  child: SvgPicture.asset(
                    'assets/icon/share_icon.svg',
                    color: ColorConstants.greyColor,
                    height: 16,
                    width: 16,
                  ),
                ),
              ],
            ),
            RepaintBoundary(
              key: _globalKey,
              child: SizedBox(
                // color: Colors.transparent,
                height: 410,
                child: PageView.builder(
                  scrollDirection: Axis.horizontal,
                  physics: const BouncingScrollPhysics(),
                  controller: _controller,
                  onPageChanged: (index) {
                    setState(() {
                      _currentPage = index;
                    });
                  },
                  itemBuilder: (BuildContext context, int index) {
                    return slideCard(widget.kya.kyaItems[index], index);
                  },
                  itemCount: widget.kya.kyaItems.length,
                ),
              ),
            ),
            Row(
              mainAxisAlignment: MainAxisAlignment.spaceBetween,
              children: [
                GestureDetector(
                    onTap: () async {
                      if (_currentPage > 0) {
                        await _controller.animateToPage(_currentPage - 1,
                            duration: const Duration(milliseconds: 200),
                            curve: Curves.bounceOut);
                        if (_tipsProgress > 0.1) {
                          setState(() {
                            _tipsProgress = _tipsProgress - 0.1;
                          });
                        }
                      }

                      if (_currentPage == 0) {
                        setState(() {
                          _tipsProgress = 0.1;
                        });
                      }
                    },
                    child: circularButton('assets/icon/previous_arrow.svg')),
                GestureDetector(
                    onTap: () async {
                      if (_currentPage == widget.kya.kyaItems.length - 1) {
                        setState(() {
                          _showLastPage = true;
                          _showSlides = false;
                        });
                      } else if (_currentPage <=
                          widget.kya.kyaItems.length - 1) {
                        await _controller.animateToPage(_currentPage + 1,
                            duration: const Duration(milliseconds: 200),
                            curve: Curves.bounceIn);
                        if (_controller.page != null) {
                          await updateProgress();
                        }
                      } else {
                        setState(() {
                          _showLastPage = true;
                          _showSlides = false;
                        });
                      }
                    },
                    child: circularButton('assets/icon/next_arrow.svg')),
              ],
            ),
          ],
        ),
      ),
    );
  }

  Widget textWidget(int index, String value) {
    return Text(
      '$index. $value',
      style: const TextStyle(fontSize: 14),
    );
  }

  Future<void> updateKyaProgress() async {
    if (isSaving) {
      return;
    }

    setState(() {
      isSaving = true;
    });

    if (widget.trackProgress) {
      var page = _controller.page;
      if (page != null) {
        var progress = (page / widget.kya.kyaItems.length) * 99;
        await _cloudStore.updateKyaProgress(
            _customAuth.getId(), widget.kya, progress);
      }
    }
  }

  Future<void> updateProgress() async {
    try {
      setState(() {
        _tipsProgress = _tipsProgress + 0.1;
      });
    } catch (e) {
      debugPrint(e.toString());
    }
  }

  Widget waysOfPollution(BuildContext context) {
    return Scaffold(
      extendBodyBehindAppBar: true,
      appBar: knowYourAirAppBar(context, ''),
      body: Container(
        color: ColorConstants.appBodyColor,
        child: Column(children: [
          SizedBox(
            height: 221,
            width: double.infinity,
            child: Image.asset(
              'assets/images/tips-image.png',
              fit: BoxFit.cover,
            ),
          ),
          const SizedBox(
            height: 24,
          ),
          Expanded(
            child: Padding(
                padding: const EdgeInsets.only(left: 24, right: 24),
                child: MediaQuery.removePadding(
                    context: context,
                    removeTop: true,
                    child: ListView(
                      children: [
                        const Text(
                          'Together, let\'s reduce air '
                          'pollution to breathe clean!',
                          style: TextStyle(
                              fontWeight: FontWeight.bold, fontSize: 15),
                        ),
                        const Text(
                          'Here are 9 ways you can get involved'
                          ' and reduce air pollutions.',
                          style: TextStyle(
                              fontWeight: FontWeight.bold, fontSize: 25),
                        ),
                        const SizedBox(
                          height: 16,
                        ),
                        Container(
                          padding:
                              const EdgeInsets.fromLTRB(16.0, 24.0, 16.0, 24.0),
                          decoration: BoxDecoration(
                              borderRadius:
                                  const BorderRadius.all(Radius.circular(8.0)),
                              color: Colors.white,
                              border: Border.all(color: Colors.transparent)),
                          child: Column(
                            crossAxisAlignment: CrossAxisAlignment.start,
                            children: [
                              textWidget(1, 'Avoid burning rubbish'),
                              const SizedBox(
                                height: 10,
                              ),
                              textWidget(2, 'Dispose of your rubbish properly'),
                              const SizedBox(
                                height: 10,
                              ),
                              textWidget(3, 'Recycle and reuse'),
                              const SizedBox(
                                height: 10,
                              ),
                              textWidget(
                                  4, 'Walk, cycle or use public transport'),
                              const SizedBox(
                                height: 10,
                              ),
                              textWidget(
                                  5, 'Service your car or Boda boda regularly'),
                              const SizedBox(
                                height: 10,
                              ),
                              textWidget(
                                  6, 'Cut down on single-use plastic products'),
                              const SizedBox(
                                height: 10,
                              ),
                              textWidget(
                                  7, 'Avoid idling your car engine in traffic'),
                              const SizedBox(
                                height: 10,
                              ),
                              textWidget(
                                  8, 'Turn off the lights when not in use'),
                              const SizedBox(
                                height: 10,
                              ),
                              textWidget(9, 'Use LED bulbs'),
                            ],
                          ),
                        )
                      ],
                    ))),
          ),
        ]),
      ),
    );
  }

  Future<bool> _onWillPop() {
    updateKyaProgress();
    return Future.value(true);
  }
}
