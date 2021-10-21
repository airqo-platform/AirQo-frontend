import 'package:app/constants/app_constants.dart';
import 'package:app/widgets/custom_widgets.dart';
import 'package:flutter/material.dart';

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
      appBar: knowYourAirAppBar(context),
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
                top: 0.0,
                child: Padding(
                  padding: const EdgeInsets.only(left: 20, right: 20),
                  child: Container(
                    height: MediaQuery.of(context).size.height * 0.7,
                    width: MediaQuery.of(context).size.width * 0.9,
                    decoration: const BoxDecoration(
                        color: Colors.transparent,
                        borderRadius: BorderRadius.all(Radius.circular(8.0))),
                    child: Row(
                      children: [
                        backButton(context),
                        // const Text('Together, let\'s reduce '
                        //     'air pollution to breathe clean!',
                        //   textAlign: TextAlign.center,
                        //   style: TextStyle(
                        //       fontSize: 20,
                        //       fontWeight: FontWeight.bold
                        //   ),),
                        // const SizedBox(height: 20,),
                        // Text('Here are 9 ways you can get '
                        //     'involved and reduce air pollutions',
                        //     textAlign: TextAlign.center,
                        //     style: TextStyle(
                        //         fontSize: 20,
                        //         fontWeight: FontWeight.bold,
                        //         color: ColorConstants.appColorBlue
                        //     )),
                      ],
                    ),
                  ),
                ),
              ),
              Positioned(
                child: Align(
                    alignment: Alignment.center,
                    child: Padding(
                      padding: const EdgeInsets.only(left: 20, right: 20),
                      child: Container(
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
                            const Text(
                              'Together, let\'s reduce '
                              'air pollution to breathe clean!',
                              textAlign: TextAlign.center,
                              style: TextStyle(
                                  fontSize: 20, fontWeight: FontWeight.bold),
                            ),
                            const SizedBox(
                              height: 20,
                            ),
                            Text(
                                'Here are 9 ways you can get '
                                'involved and reduce air pollutions',
                                textAlign: TextAlign.center,
                                style: TextStyle(
                                    fontSize: 20,
                                    fontWeight: FontWeight.bold,
                                    color: ColorConstants.appColorBlue)),
                          ],
                        ),
                      ),
                    )),
              ),
            ]),
          )),
    );
  }
}
