import 'package:airqo/src/app/shared/widgets/translated_text.dart';
import 'package:flutter/material.dart';

class BreatheClean extends StatelessWidget {
  const BreatheClean({super.key});

  @override
  Widget build(BuildContext context) {
    return Container(
      width: MediaQuery.of(context).size.width,
      height: MediaQuery.of(context).size.height * 0.6,
      padding: const EdgeInsets.symmetric(
        vertical: 70,
      ),
      child: Column(
        children: [
          Spacer(),
          Image.asset("assets/images/auth/stacked_emojis.png", height: 130),
          Column(
            mainAxisAlignment: MainAxisAlignment.start,
            crossAxisAlignment: CrossAxisAlignment.center,
            children: [
              SizedBox(
                height: 10,
              ),
              Padding(
                padding: EdgeInsets.fromLTRB(20, 40, 20, 10),
                child: Column(
                  mainAxisAlignment: MainAxisAlignment.center,
                  crossAxisAlignment: CrossAxisAlignment.center,
                  children: [
                    TranslatedText(
                      '🌿 Breathe Clean',
                      textAlign: TextAlign.center,
                      style: const TextStyle(
                        fontWeight: FontWeight.w400,
                        fontStyle: FontStyle.normal,
                        fontFamily: 'inter',
                        fontSize: 16,
                      ),
                    ),
                    const SizedBox(
                      height: 16,
                    ),
                    TranslatedText(
                      'Track and monitor the quality of air you breathe',
                      maxLines: 2,
                      textAlign: TextAlign.center,
                      style: const TextStyle(
                        fontWeight: FontWeight.w700,
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
}
