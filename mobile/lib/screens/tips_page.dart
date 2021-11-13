import 'package:app/constants/app_constants.dart';
import 'package:app/utils/string_extension.dart';
import 'package:app/widgets/custom_widgets.dart';
import 'package:flutter/material.dart';
import 'package:flutter_svg/svg.dart';
import 'package:shared_preferences/shared_preferences.dart';

class TipsPage extends StatefulWidget {
  const TipsPage({Key? key}) : super(key: key);

  @override
  _TipsPageState createState() => _TipsPageState();
}

class _TipsPageState extends State<TipsPage> {
  List<String> slides = [
    '',
    'Avoid burning rubbish',
    'Dispose of your rubbish properly',
    'Recycle and reuse',
    'Walk, cycle or use public transport',
    'Service your car or Boda boda regularly ',
    'Cut down on single-use plastic products',
    'Avoid idling your car engine in traffic',
    'Turn off the lights when not in use',
    'Use LED bulbs'
  ];
  final PageController controller = PageController();
  int currentPage = 0;

  @override
  Widget build(BuildContext context) {
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
          child: Image.asset(
            'assets/images/tips-image.png',
            fit: BoxFit.cover,
          ),
        ),
        Positioned.fill(
          child: Align(
              alignment: Alignment.bottomCenter,
              child: Padding(
                padding: const EdgeInsets.only(left: 10, right: 10),
                child: Column(
                  children: [
                    const Spacer(),
                    Container(
                      padding: const EdgeInsets.only(left: 5, right: 5),
                      height: MediaQuery.of(context).size.height * 0.6,
                      child: PageView.builder(
                        scrollDirection: Axis.horizontal,
                        physics: const BouncingScrollPhysics(),
                        controller: controller,
                        onPageChanged: (page) {
                          setState(() {
                            currentPage = page;
                          });
                        },
                        itemBuilder: (BuildContext context, int index) {
                          return slides[index] == slides[0]
                              ? slideHeadCard()
                              : slideChildCard(slides[index], index);
                        },
                        itemCount: slides.length,
                      ),
                    ),
                    const SizedBox(
                      height: 16,
                    ),
                    Padding(
                      padding: const EdgeInsets.only(left: 15, right: 15),
                      child: Container(
                          decoration: const BoxDecoration(
                              color: Colors.white,
                              borderRadius:
                                  BorderRadius.all(Radius.circular(8.0))),
                          height: 60,
                          child: Row(
                            mainAxisAlignment: MainAxisAlignment.spaceEvenly,
                            children: [
                              TextButton(
                                onPressed: () async {
                                  if (currentPage != 0) {
                                    await controller.animateToPage(
                                        currentPage - 1,
                                        duration:
                                            const Duration(milliseconds: 200),
                                        curve: Curves.bounceOut);
                                  } else {
                                    controller.jumpToPage(0);
                                  }
                                },
                                style: ButtonStyle(
                                    foregroundColor: currentPage == 0
                                        ? MaterialStateProperty.all<Color>(
                                            ColorConstants.appColorBlack
                                                .withOpacity(0.5))
                                        : MaterialStateProperty.all<Color>(
                                            ColorConstants.appColorBlue),
                                    elevation: MaterialStateProperty.all(0)),
                                child: const Text(
                                  'Back',
                                  style: TextStyle(fontSize: 14),
                                ),
                              ),
                              TextButton(
                                onPressed: () async {
                                  if (currentPage != slides.length - 1) {
                                    await controller.animateToPage(
                                        currentPage + 1,
                                        duration:
                                            const Duration(milliseconds: 200),
                                        curve: Curves.bounceIn);
                                    if (controller.page != null) {
                                      await updateProgress();
                                    }
                                  } else {
                                    controller.jumpToPage(slides.length - 1);
                                  }
                                },
                                style: ButtonStyle(
                                    foregroundColor:
                                        currentPage == slides.length - 1
                                            ? MaterialStateProperty.all<Color>(
                                                ColorConstants.appColorBlack
                                                    .withOpacity(0.5))
                                            : MaterialStateProperty.all<Color>(
                                                ColorConstants.appColorBlue),
                                    elevation: MaterialStateProperty.all(0)),
                                child: const Text(
                                  'Next',
                                  style: TextStyle(fontSize: 14),
                                ),
                              ),
                            ],
                          )),
                    ),
                    const SizedBox(
                      height: 20,
                    ),
                  ],
                ),
              )),
        ),
      ]),
    );
  }

  @override
  void dispose() {
    controller.dispose();
    super.dispose();
  }

  Widget slideChildCard(String value, int index) {
    return Padding(
      padding: const EdgeInsets.only(left: 10, right: 10),
      child: Container(
        padding: const EdgeInsets.only(left: 44, right: 44),
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
            const SizedBox(
              height: 10,
            ),
            SizedBox(
                height: 51,
                width: 51,
                child: Stack(
                  alignment: Alignment.center,
                  children: [
                    Positioned.fill(
                      child: SvgPicture.asset(
                        'assets/icon/star.svg',
                      ),
                    ),
                    Text(
                      '$index',
                      style: TextStyle(
                          fontSize: 20,
                          fontWeight: FontWeight.bold,
                          color: ColorConstants.appColorBlue),
                    )
                  ],
                )),
            const SizedBox(
              height: 7,
            ),
            SizedBox(
              height: 60,
              child: Text(value,
                  textAlign: TextAlign.center,
                  style: const TextStyle(
                    fontSize: 20,
                    fontWeight: FontWeight.bold,
                  )),
            ),
            const SizedBox(
              height: 20,
            ),
            SvgPicture.asset(
              'assets/icon/tips_graphics.svg',
              semanticsLabel: 'tips_graphics',
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

  Future<void> updateProgress() async {
    try {
      var preferences = await SharedPreferences.getInstance();

      var progress = preferences.getDouble(PrefConstant.homePageTips) ?? 0.0;
      var newProgress = (controller.page! / 10) + 0.1;

      if (newProgress > progress) {
        await preferences.setDouble(PrefConstant.homePageTips, newProgress);
      }
    } catch (e) {
      debugPrint(e.toString());
    }
  }
}
