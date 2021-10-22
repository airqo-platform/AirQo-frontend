import 'package:animated_text_kit/animated_text_kit.dart';
import 'package:app/models/onBoardingInfo.dart';
import 'package:flutter/material.dart';

class SlidePage extends StatelessWidget {
  final OnBoardingInfo data;

  SlidePage({required this.data});

  @override
  Widget build(BuildContext context) {
    return Column(
      children: [
        Container(
            margin: const EdgeInsets.only(top: 24, bottom: 16),
            child: Image.asset(data.localImageSrc,
                height: MediaQuery.of(context).size.height * 0.33,
                alignment: Alignment.center)),
        Expanded(
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.center,
            mainAxisAlignment: MainAxisAlignment.center,
            children: [
              Text(
                data.title,
                style: const TextStyle(
                    fontSize: 32.0,
                    fontWeight: FontWeight.bold,
                    color: Colors.white),
                textAlign: TextAlign.center,
              ),
            ],
          ),
        ),
        Expanded(
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.center,
            mainAxisAlignment: MainAxisAlignment.start,
            children: [
              Container(
                padding: const EdgeInsets.symmetric(horizontal: 48),
                child: AnimatedTextKit(
                  totalRepeatCount: 1,
                  animatedTexts: [
                    TypewriterAnimatedText(
                      data.description,
                      textStyle: const TextStyle(
                          fontSize: 16.0,
                          height: 1.3,
                          color: Colors.white,
                          fontWeight: FontWeight.w200),
                      textAlign: TextAlign.center,
                    ),
                  ],
                ),
              )
            ],
          ),
        ),
      ],
    );
  }
}
