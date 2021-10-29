import 'package:app/constants/app_constants.dart';
import 'package:app/utils/string_extension.dart';
import 'package:app/widgets/buttons.dart';
import 'package:app/widgets/custom_widgets.dart';
import 'package:flutter/cupertino.dart';
import 'package:flutter/material.dart';
import 'package:flutter_svg/svg.dart';
import 'package:shared_preferences/shared_preferences.dart';

import 'home_page.dart';

class AirPollutionWaysPage extends StatefulWidget {
  const AirPollutionWaysPage({Key? key}) : super(key: key);

  @override
  _AirPollutionWaysPageState createState() => _AirPollutionWaysPageState();
}

class _AirPollutionWaysPageState extends State<AirPollutionWaysPage> {
  List<String> slides = [
    'Avoid burning rubbish',
    'Dispose of your rubbish properly',
    'Recycle and reuse',
    'Walk, cycle or use public transport',
    'Service your car or Boda boda regularly ',
    'Cut down on single-use plastic products',
    'Avoid idling your car engine in traffic',
    'Turn off the lights when not in use',
    'Use LED bulbs',
    'Use LED bulbs'
  ];

  bool showSlides = false;
  final PageController controller = PageController();
  int currentPage = 0;
  double tipsProgress = 0.1;

  @override
  Widget build(BuildContext context) {
    if (showSlides && tipsProgress < 1.0) {
      return slidesView();
    }

    if (tipsProgress > 1.0) {
      Future.delayed(const Duration(seconds: 3), () async {
        await Navigator.pushAndRemoveUntil(context,
            MaterialPageRoute(builder: (context) {
          return HomePage();
        }), (r) => false);
      });
      return finalView();
    }

    return mainView();
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

  Future<void> initialize() async {
    var preferences = await SharedPreferences.getInstance();
    setState(() {
      tipsProgress = preferences.getDouble(PrefConstant.tipsProgress) ?? 0.0;
    });
  }

  @override
  void initState() {
    super.initState();
  }

  Widget mainView() {
    return Scaffold(
      extendBodyBehindAppBar: true,
      appBar: knowYourAirAppBar(context, 'Know Your Air'),
      body: Container(
        child: Stack(children: [
          Container(
            color: ColorConstants.appBodyColor,
            height: double.infinity,
            width: double.infinity,
          ),
          FractionallySizedBox(
            alignment: Alignment.topCenter,
            widthFactor: 1.0,
            heightFactor: 0.4,
            child: Image.asset(
              'assets/images/tips-image.png',
              fit: BoxFit.cover,
            ),
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
                          // height: MediaQuery.of(context).size.height/2,
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
                                  'Actions you \n '
                                  'can take to reduce \n'
                                  'air pollution',
                                  textAlign: TextAlign.center,
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
                            showSlides = true;
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
      ),
    );
  }

  Widget slideCard(String value, int index) {
    return Card(
      shadowColor: Colors.white,
      shape: RoundedRectangleBorder(
        borderRadius: BorderRadius.circular(16),
      ),
      elevation: 10,
      color: Colors.white,
      child: Padding(
        padding: const EdgeInsets.all(8.0),
        child: Column(
          mainAxisAlignment: MainAxisAlignment.center,
          crossAxisAlignment: CrossAxisAlignment.center,
          children: [
            ClipRRect(
              borderRadius: BorderRadius.circular(8),
              child: Image.asset(
                'assets/images/skate.png',
                height: 180,
              ),
            ),
            const SizedBox(
              height: 24,
            ),
            Text(
              'Avoid burning garbage',
              style: TextStyle(
                  color: ColorConstants.appColorBlack,
                  fontSize: 20,
                  fontWeight: FontWeight.bold),
            ),
            const SizedBox(
              height: 8.0,
            ),
            Text(
              'Burning your household garbage is '
              'dangerous to your health and our environment',
              style: TextStyle(
                  color: ColorConstants.appColorBlack.withOpacity(0.5),
                  fontSize: 16),
            ),
            const SizedBox(
              height: 31.89,
            ),
            SvgPicture.asset(
              'assets/icon/tips_graphics.svg',
              semanticsLabel: 'tips_graphics',
            ),
            const SizedBox(
              height: 40.89,
            ),
          ],
        ),
      ),
    );
  }

  Widget slideHeadCard() {
    return Padding(
      padding: const EdgeInsets.only(left: 10, right: 10),
      child: Container(
        padding: const EdgeInsets.all(24),
        decoration: const BoxDecoration(
            color: Colors.white,
            borderRadius: BorderRadius.all(Radius.circular(8.0))),
        width: MediaQuery.of(context).size.width * 0.9,
        child: Column(
          mainAxisAlignment: MainAxisAlignment.center,
          crossAxisAlignment: CrossAxisAlignment.center,
          children: [
            Image.asset(
              'assets/images/skate.png',
              height: 150,
            ),
            const Text(
              'Together, let\'s reduce '
              'air pollution to breathe clean!',
              textAlign: TextAlign.center,
              style: TextStyle(
                fontSize: 16,
              ),
            ),
            Text(
                'Here are 9 ways you can get involved and reduce air pollutions'
                    .toTitleCase(),
                textAlign: TextAlign.center,
                style:
                    const TextStyle(fontSize: 16, fontWeight: FontWeight.bold)),
          ],
        ),
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
                    Navigator.of(context).pop();
                  },
                  child: SvgPicture.asset(
                    'assets/icon/close.svg',
                    semanticsLabel: 'Pm2.5',
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
                  value: tipsProgress,
                  backgroundColor:
                      ColorConstants.appColorDisabled.withOpacity(0.2),
                )),
                const SizedBox(
                  width: 7,
                ),
                SvgPicture.asset(
                  'assets/icon/share_icon.svg',
                  color: ColorConstants.greyColor,
                  semanticsLabel: 'Share',
                )
              ],
            ),
            Container(
              color: Colors.transparent,
              height: 420,
              child: PageView.builder(
                scrollDirection: Axis.horizontal,
                physics: const BouncingScrollPhysics(),
                controller: controller,
                onPageChanged: (num) {
                  setState(() {
                    currentPage = num;
                  });
                },
                itemBuilder: (BuildContext context, int index) {
                  return slideCard(slides[index], index);
                },
                itemCount: slides.length,
              ),
            ),
            Row(
              mainAxisAlignment: MainAxisAlignment.spaceBetween,
              children: [
                GestureDetector(
                    onTap: () async {
                      if (currentPage != 0) {
                        await controller.animateToPage(currentPage - 1,
                            duration: const Duration(milliseconds: 200),
                            curve: Curves.bounceOut);
                      } else {
                        controller.jumpToPage(0);
                      }

                      setState(() {
                        if (tipsProgress > 0.0) {
                          tipsProgress = tipsProgress - 0.1;
                        }
                      });
                    },
                    child: circularButton('assets/icon/previous_arrow.svg')),
                GestureDetector(
                    onTap: () async {
                      if (currentPage != slides.length - 1) {
                        await controller.animateToPage(currentPage + 1,
                            duration: const Duration(milliseconds: 200),
                            curve: Curves.bounceIn);
                        if (controller.page != null) {
                          await updateProgress();
                        }
                      } else {
                        controller.jumpToPage(slides.length - 1);
                      }

                      setState(() {
                        tipsProgress = tipsProgress + 0.1;
                      });
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

  Future<void> updateProgress() async {
    try {
      var preferences = await SharedPreferences.getInstance();

      var progress = preferences.getDouble(PrefConstant.tipsProgress) ?? 0.0;
      var newProgress = (controller.page! / 10);

      if (newProgress > progress) {
        print(tipsProgress);
        await preferences.setDouble(PrefConstant.tipsProgress, newProgress);
      }
    } catch (e) {
      print(e);
    }
  }

  Widget waysOfPollution(BuildContext context) {
    return Scaffold(
      extendBodyBehindAppBar: true,
      appBar: knowYourAirAppBar(context, ''),
      body: Container(
        color: ColorConstants.appBodyColor,
        child: Column(children: [
          Container(
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
}
