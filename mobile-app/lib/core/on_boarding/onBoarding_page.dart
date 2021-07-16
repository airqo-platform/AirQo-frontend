import 'package:app/constants/app_constants.dart';
import 'package:app/models/onBoardingData.dart';
import 'package:flutter/material.dart';

import 'onBoardingButtons.dart';
import 'slide_page.dart';

class OnBoardingPage extends StatefulWidget {
  @override
  _OnBoardingPageState createState() => _OnBoardingPageState();
}

class _OnBoardingPageState extends State<OnBoardingPage> {
  final _controller = PageController();

  int _currentIndex = 0;

  List<OnBoardingData> data = [
    OnBoardingData(
        description: 'Select locations important to you using MyPlaces',
        title: 'MyPlaces',
        localImageSrc: 'assets/svg/historical.png'),
    OnBoardingData(
        description: 'View various locations on a map',
        title: 'Map',
        localImageSrc: 'assets/svg/map.png'),
    OnBoardingData(
        description: 'See air quality for the last 48 hours and '
            'forecast for your next 24 hours',
        title: 'Historical and Forecast',
        localImageSrc: 'assets/svg/historical.png'),
  ];

  @override
  Widget build(BuildContext context) {
    return Scaffold(
        body: Container(
            color: appColor,
            child: SafeArea(
                child: Container(
              padding: const EdgeInsets.all(16),
              decoration: const BoxDecoration(
                  gradient: LinearGradient(
                      begin: Alignment.topCenter,
                      end: Alignment.bottomCenter,
                      colors: [
                    appColor,
                    appColorPale,
                  ])),
              alignment: Alignment.center,
              child: Column(children: [
                Expanded(
                  child: Column(
                    children: [
                      Expanded(
                        flex: 4,
                        child: Container(
                            alignment: Alignment.center,
                            child: PageView(
                                scrollDirection: Axis.horizontal,
                                controller: _controller,
                                onPageChanged: (value) {
                                  setState(() {
                                    _currentIndex = value;
                                  });
                                },
                                children: data
                                    .map((e) => SlidePage(data: e))
                                    .toList())),
                      ),
                      Expanded(
                          flex: 1,
                          child: Column(
                            mainAxisAlignment: MainAxisAlignment.spaceBetween,
                            children: [
                              Container(
                                  margin:
                                      const EdgeInsets.symmetric(vertical: 24),
                                  child: Row(
                                    mainAxisAlignment: MainAxisAlignment.center,
                                    children: List.generate(
                                        data.length, createCircle),
                                  )),
                              OnBoardingButtons(
                                currentIndex: _currentIndex,
                                dataLength: data.length,
                                controller: _controller,
                              )
                            ],
                          ))
                    ],
                  ),
                )
              ]),
            ))));
  }

  AnimatedContainer createCircle(var index) {
    return AnimatedContainer(
        duration: const Duration(milliseconds: 100),
        margin: const EdgeInsets.only(right: 4),
        height: 5,
        width: _currentIndex == index ? 15 : 5,
        decoration: BoxDecoration(
            color: Colors.white, borderRadius: BorderRadius.circular(3)));
  }
}
