import 'package:app/constants/app_constants.dart';
import 'package:app/widgets/custom_widgets.dart';
import 'package:flutter/material.dart';
import 'package:flutter_svg/svg.dart';

class TipPage extends StatefulWidget {
  const TipPage({Key? key}) : super(key: key);

  @override
  _TipPageState createState() => _TipPageState();
}

class _TipPageState extends State<TipPage> {
  @override
  Widget build(BuildContext context) {
    return Scaffold(
      extendBodyBehindAppBar: true,
      appBar: knowYourAirAppBar(context, 'Know Your Air'),
      body: AnimatedSwitcher(
          duration: const Duration(seconds: 3),
          transitionBuilder: (Widget child, Animation<double> animation) {
            return FadeTransition(opacity: animation, child: child);
          },
          child: Container(
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
              Positioned(
                top: 230,
                child: Padding(
                  padding: const EdgeInsets.only(left: 20, right: 20),
                  child: Container(
                    padding: const EdgeInsets.all(20),
                    height: MediaQuery.of(context).size.height * 0.7,
                    width: MediaQuery.of(context).size.width * 0.9,
                    decoration: const BoxDecoration(
                        color: Colors.white,
                        borderRadius: BorderRadius.all(Radius.circular(8.0))),
                    child: Column(
                      mainAxisAlignment: MainAxisAlignment.center,
                      crossAxisAlignment: CrossAxisAlignment.center,
                      children: [
                        Image.asset(
                          'assets/images/skate.png',
                        ),
                        const Text(
                          'Avoid burning rubbish',
                          textAlign: TextAlign.center,
                          style: TextStyle(
                              fontSize: 20, fontWeight: FontWeight.bold),
                        ),
                        const SizedBox(
                          height: 20,
                        ),
                        Text(
                            'Air quality around kampala seems good!'
                            ' It’s about time to hit the '
                            'road and get in that work. ',
                            textAlign: TextAlign.center,
                            style: TextStyle(
                                fontSize: 14,
                                color: Colors.black.withOpacity(0.5))),
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
                ),
              ),
              Visibility(
                visible: false,
                child: Positioned(
                  top: 230,
                  child: Align(
                      alignment: Alignment.bottomCenter,
                      child: Padding(
                        padding: const EdgeInsets.only(left: 20, right: 20),
                        child: Container(
                          padding: const EdgeInsets.all(20),
                          height: MediaQuery.of(context).size.height * 0.7,
                          width: MediaQuery.of(context).size.width * 0.9,
                          decoration: const BoxDecoration(
                              color: Colors.white,
                              borderRadius:
                                  BorderRadius.all(Radius.circular(8.0))),
                          child: Column(
                            mainAxisAlignment: MainAxisAlignment.center,
                            crossAxisAlignment: CrossAxisAlignment.center,
                            children: [
                              Image.asset(
                                'assets/images/skate.png',
                              ),
                              const Text(
                                'Avoid burning rubbish',
                                textAlign: TextAlign.center,
                                style: TextStyle(
                                    fontSize: 20, fontWeight: FontWeight.bold),
                              ),
                              const SizedBox(
                                height: 20,
                              ),
                              Text(
                                  'Air quality around kampala seems good!'
                                  ' It’s about time to hit the '
                                  'road and get in that work. ',
                                  textAlign: TextAlign.center,
                                  style: TextStyle(
                                      fontSize: 14,
                                      color: Colors.black.withOpacity(0.5))),
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
                      )),
                ),
              )
            ]),
          )),
    );
  }
}
