import 'package:app/new_authentication/create_account.dart';
import 'package:app/new_authentication/create_account3.dart';
import 'package:app/new_authentication/widgets.dart';
import 'package:app/themes/colors.dart';
import 'package:auto_size_text/auto_size_text.dart';
import 'package:flutter/material.dart';
import 'package:carousel_slider/carousel_slider.dart';
import 'package:smooth_page_indicator/smooth_page_indicator.dart';

class MyHomePage extends StatefulWidget {
  const MyHomePage({super.key});

  @override
  State<MyHomePage> createState() => _MyHomePageState();
}

class _MyHomePageState extends State<MyHomePage> {
  int activeIndex = 0;

  @override
  Widget build(BuildContext context) {
    final List<Widget> screens = [
      screen1(context),
      screen2(context),
      screen3(context),
    ];
    return Scaffold(
      backgroundColor: const Color(0xff34373B),
      body: Column(
        mainAxisAlignment: MainAxisAlignment.start,
        crossAxisAlignment: CrossAxisAlignment.center,
        children: [
          SizedBox(
            width: MediaQuery.of(context).size.width,
            height: MediaQuery.of(context).size.height * 0.6,
            child: Column(
              children: [
                Expanded(
                  child: CarouselSlider.builder(
                    itemCount: screens.length,
                    itemBuilder: (context, index, realIndex) {
                      return screens[index];
                    },
                    options: CarouselOptions(
                      height: MediaQuery.of(context).size.height,
                      enableInfiniteScroll: true,
                      autoPlay: true,
                      autoPlayInterval: const Duration(seconds: 3),
                      autoPlayAnimationDuration:
                          const Duration(milliseconds: 800),
                      autoPlayCurve: Curves.fastOutSlowIn,
                      viewportFraction: 1.0,
                      onPageChanged: (index, reason) {
                        setState(() {
                          activeIndex = index;
                        });
                      },
                    ),
                  ),
                ),
                Padding(
                  padding: const EdgeInsets.all(8.0),
                  child: SmoothPageIndicator(
                    controller: PageController(initialPage: activeIndex),
                    count: screens.length,
                    effect: const ExpandingDotsEffect(
                      activeDotColor: Colors.white,
                      dotColor: Colors.grey,
                      dotHeight: 6,
                      dotWidth: 10,
                      spacing: 8,
                    ),
                  ),
                ),
              ],
            ),
          ),
          Column(
            children: [
              Padding(
                padding: const EdgeInsets.symmetric(horizontal: 20),
                child: NextButton(
                  textColor: Colors.white,
                  text: 'Create Account',
                  buttonColor: const Color(0xff145FFF),
                  callBack: () {
                    Navigator.push(
                      context,
                      MaterialPageRoute(
                        builder: (context) {
                          return const UserDetailsPage();
                        },
                      ),
                    );
                  },
                ),
              ),
              const SizedBox(
                height: 16,
              ),
              Padding(
                padding: const EdgeInsets.symmetric(horizontal: 20),
                child: NextButton(
                  textColor: Color(0xff485972),
                  text: 'Login here',
                  buttonColor: CustomColors.appBodyColor,
                  callBack: () {
                    Navigator.push(
                      context,
                      MaterialPageRoute(
                        builder: (context) {
                          return const UserDetailsPage3();
                        },
                      ),
                    );
                  },
                ),
              ),
              const SizedBox(
                height: 16,
              ),
              const ProceedAsGuest()
            ],
          ),
        ],
      ),
    );
  }
}

Widget screen1(BuildContext context) {
  return Stack(
    children: [
      Container(
        width: MediaQuery.of(context).size.width,
        height: MediaQuery.of(context).size.height * 0.7,
        decoration: BoxDecoration(
          image: const DecorationImage(
            fit: BoxFit.fill,
            image: AssetImage(
              'assets/images/nairobi_view.png',
            ),
          ),
          color: Theme.of(context).primaryColor,
        ),
      ),
      Padding(
        padding: const EdgeInsets.only(
          left: 20,
          right: 20,
          top: 56.14, // Adjust as necessary
        ),
        child: Column(
          mainAxisAlignment: MainAxisAlignment.start,
          crossAxisAlignment: CrossAxisAlignment.center,
          children: [
            Container(
              width: 80,
              height: 56.14,
              decoration: const BoxDecoration(
                color: Colors.transparent,
                image: DecorationImage(
                  image: AssetImage(
                    'assets/images/airQo-logo.png',
                  ),
                ),
              ),
            ),
            const SizedBox(
              height: 100,
            ),
            const Padding(
              padding: EdgeInsets.only(
                left: 20,
                right: 20,
              ),
              child: Column(
                mainAxisAlignment: MainAxisAlignment.center,
                crossAxisAlignment: CrossAxisAlignment.center,
                children: [
                  Text(
                    '👋 Welcome to AirQo!',
                    textAlign: TextAlign.center,
                    style: TextStyle(
                      fontWeight: FontWeight.w400,
                      fontStyle: FontStyle.normal,
                      fontFamily: 'inter',
                      fontSize: 20,
                    ),
                  ),
                  SizedBox(
                    height: 10,
                  ),
                  AutoSizeText(
                    'Clean Air for all African Cities.',
                    maxLines: 2,
                    textAlign: TextAlign.center,
                    style: TextStyle(
                      fontWeight: FontWeight.w700,
                      fontStyle: FontStyle.normal,
                      fontFamily: 'inter',
                      fontSize: 35,
                    ),
                  ),
                ],
              ),
            ),
          ],
        ),
      ),
    ],
  );
}

Widget screen2(BuildContext context) {
  return Container(
    color: Theme.of(context).primaryColor,
    padding: const EdgeInsets.fromLTRB(
      0,
      70,
      0,
      0,
    ),
    child: Stack(
      alignment: Alignment.topCenter,
      children: [
        Column(
          mainAxisAlignment: MainAxisAlignment.start,
          crossAxisAlignment: CrossAxisAlignment.center,
          children: [
            buildExpandedBox(
              color: Theme.of(context).primaryColor,
              children: [
                buildStackedEmojis(direction: TextDirection.rtl),
              ],
            ),
          ],
        ),
        const Column(
          mainAxisAlignment: MainAxisAlignment.start,
          crossAxisAlignment: CrossAxisAlignment.center,
          children: [
            SizedBox(
              height: 100,
            ),
            Padding(
              padding: EdgeInsets.fromLTRB(20, 40, 20, 10),
              child: Column(
                mainAxisAlignment: MainAxisAlignment.center,
                crossAxisAlignment: CrossAxisAlignment.center,
                children: [
                  Text(
                    '🌿 Breathe Clean',
                    textAlign: TextAlign.center,
                    style: TextStyle(
                      fontWeight: FontWeight.w400,
                      fontStyle: FontStyle.normal,
                      fontFamily: 'inter',
                      fontSize: 16,
                    ),
                  ),
                  SizedBox(
                    height: 10,
                  ),
                  AutoSizeText(
                    'Track and monitor the quality of air you breathe',
                    maxLines: 2,
                    textAlign: TextAlign.center,
                    style: TextStyle(
                      fontWeight: FontWeight.w700,
                      fontStyle: FontStyle.normal,
                      fontFamily: 'inter',
                      fontSize: 20,
                    ),
                  ),
                ],
              ),
            ),
          ],
        ),
      ],
    ),
  );
}

Widget buildExpandedBox({
  required List<Widget> children,
  required Color color,
}) =>
    Expanded(
      child: Container(
        color: color,
        child: Center(
          child: Column(
            mainAxisAlignment: MainAxisAlignment.start,
            crossAxisAlignment: CrossAxisAlignment.center,
            children: children,
          ),
        ),
      ),
    );

Widget buildStackedEmojis({
  TextDirection direction = TextDirection.ltr,
}) {
  const double size = 120;
  const double xShift = 20;
  final urlImages = [
    "assets/images/good_emoji.png",
    "assets/images/moderate_emoji.png",
  ];

  final items = urlImages.map((urlImage) => buildImage(urlImage)).toList();

  return StackedWidgets(
    direction: direction,
    items: items,
    size: size,
    xShift: xShift,
  );
}

Widget buildImage(String urlImage) {
  const double borderSize = 5;

  return ClipOval(
    child: Container(
      padding: const EdgeInsets.all(borderSize),
      color: Colors.white,
      child: ClipOval(
        child: Image.asset(
          urlImage,
          fit: BoxFit.cover,
        ),
      ),
    ),
  );
}

Widget screen3(BuildContext context) {
  return Container(
    color: Theme.of(context).primaryColor,
    padding: const EdgeInsets.fromLTRB(
      0,
      70,
      0,
      0,
    ),
    child: Stack(
      alignment: Alignment.topCenter,
      children: [
        buildExpandedBox(
          color: Theme.of(context).primaryColor,
          children: [
            buildStackedPeople(
              direction: TextDirection.ltr,
            )
          ],
        ),
        const Column(
          mainAxisAlignment: MainAxisAlignment.start,
          crossAxisAlignment: CrossAxisAlignment.center,
          children: [
            SizedBox(
              height: 100,
            ),
            Padding(
              padding: EdgeInsets.fromLTRB(20, 40, 20, 10),
              child: Column(
                mainAxisAlignment: MainAxisAlignment.center,
                crossAxisAlignment: CrossAxisAlignment.center,
                children: [
                  Text(
                    '✨ Know Your Air',
                    textAlign: TextAlign.center,
                    style: TextStyle(
                      fontWeight: FontWeight.w400,
                      fontStyle: FontStyle.normal,
                      fontFamily: 'inter',
                      fontSize: 16,
                    ),
                  ),
                  SizedBox(
                    height: 10,
                  ),
                  AutoSizeText(
                    'Learn and reduce air pollution in your community',
                    maxLines: 2,
                    textAlign: TextAlign.center,
                    style: TextStyle(
                      fontWeight: FontWeight.w700,
                      fontStyle: FontStyle.normal,
                      fontFamily: 'inter',
                      fontSize: 23,
                    ),
                  ),
                ],
              ),
            ),
          ],
        ),
      ],
    ),
  );
}

Widget buildStackedPeople({
  TextDirection direction = TextDirection.ltr,
}) {
  const double size = 120;
  const double xShift = 20;
  final urlImages = [
    "assets/images/person1.png",
    "assets/images/person2.png",
  ];

  final items = urlImages
      .map((urlImage) =>
          buildimageperson(imageUrl: urlImage, width: size, height: size))
      .toList();

  return StackedWidgets(
    direction: direction,
    items: items,
    size: size,
    xShift: xShift,
  );
}

Widget buildimageperson({
  required String imageUrl,
  required double width,
  required double height,
}) {
  return Image.asset(
    imageUrl,
    width: width,
    height: height,
    fit: BoxFit.cover,
  );
}
