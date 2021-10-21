import 'package:app/constants/app_constants.dart';
import 'package:app/widgets/custom_widgets.dart';
import 'package:flutter/material.dart';
import 'package:flutter_svg/svg.dart';

class TipsPage extends StatefulWidget {
  const TipsPage({Key? key}) : super(key: key);

  @override
  _TipsPageState createState() => _TipsPageState();
}

class _TipsPageState extends State<TipsPage> {
  @override
  Widget build(BuildContext context) {
    var width = MediaQuery.of(context).size.width * 0.7;

    return Scaffold(
      extendBodyBehindAppBar: true,
      appBar: knowYourAirAppBar(context),
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
                  padding: const EdgeInsets.only(left: 20, right: 20),
                  child: Column(
                    children: [
                      const Spacer(),
                      // CarouselSlider(
                      //   options: CarouselOptions(
                      //       height: MediaQuery.of(context).size.height*0.7
                      //   ),
                      //   items: [1,2,3,4,5].map((i) {
                      //     return Builder(
                      //       builder: (BuildContext context) {
                      //         return Padding(
                      //           padding: EdgeInsets.only(left: 10, right: 10),
                      //           child: Container(
                      //             decoration: const BoxDecoration(
                      //                 color: Colors.white,
                      //                 borderRadius: BorderRadius.all(Radius.circular(8.0))
                      //             ),
                      //             // height: MediaQuery.of(context).size.height*0.7,
                      //             child: Column(
                      //               mainAxisAlignment: MainAxisAlignment.center,
                      //               crossAxisAlignment: CrossAxisAlignment.center,
                      //               children: [
                      //                 const Text('Together, let\'s reduce '
                      //                     'air pollution to breathe clean!',
                      //                   textAlign: TextAlign.center,
                      //                   style: TextStyle(
                      //                       fontSize: 20,
                      //                       fontWeight: FontWeight.bold
                      //                   ),),
                      //                 const SizedBox(height: 20,),
                      //                 Text('Here are 9 ways you can get '
                      //                     'involved and reduce air pollutions',
                      //                     textAlign: TextAlign.center,
                      //                     style: TextStyle(
                      //                         fontSize: 20,
                      //                         fontWeight: FontWeight.bold,
                      //                         color: ColorConstants.appColorBlue
                      //                     )),
                      //               ],
                      //             ),
                      //           ),
                      //         );
                      //       },
                      //     );
                      //   }).toList(),
                      // ),
                      Container(
                        height: MediaQuery.of(context).size.height * 0.7,
                        child: ListView(
                          scrollDirection: Axis.horizontal,
                          children: [
                            Container(
                              decoration: const BoxDecoration(
                                  color: Colors.white,
                                  borderRadius:
                                      BorderRadius.all(Radius.circular(8.0))),
                              height: MediaQuery.of(context).size.height * 0.7,
                              width: MediaQuery.of(context).size.width * 0.9,
                              child: Column(
                                mainAxisAlignment: MainAxisAlignment.center,
                                crossAxisAlignment: CrossAxisAlignment.center,
                                children: [
                                  const Text(
                                    'Together, let\'s reduce '
                                    'air pollution to breathe clean!',
                                    textAlign: TextAlign.center,
                                    style: TextStyle(
                                        fontSize: 20,
                                        fontWeight: FontWeight.bold),
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
                            const SizedBox(
                              width: 10,
                            ),
                            Container(
                              decoration: const BoxDecoration(
                                  color: Colors.white,
                                  borderRadius:
                                      BorderRadius.all(Radius.circular(8.0))),
                              height: MediaQuery.of(context).size.height * 0.7,
                              width: MediaQuery.of(context).size.width * 0.85,
                              child: Column(
                                mainAxisAlignment: MainAxisAlignment.center,
                                crossAxisAlignment: CrossAxisAlignment.center,
                                children: [
                                  const Text(
                                    'Together, let\'s reduce '
                                    'air pollution to breathe clean!',
                                    textAlign: TextAlign.center,
                                    style: TextStyle(
                                        fontSize: 20,
                                        fontWeight: FontWeight.bold),
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
                          ],
                        ),
                      ),

                      const SizedBox(
                        height: 16,
                      ),
                      Container(
                          decoration: const BoxDecoration(
                              color: Colors.white,
                              borderRadius:
                                  BorderRadius.all(Radius.circular(8.0))),
                          height: 60,
                          child: Row(
                            mainAxisAlignment: MainAxisAlignment.spaceEvenly,
                            children: [
                              iconTextButton(
                                  SvgPicture.asset(
                                    'assets/icon/share_icon.svg',
                                    semanticsLabel: 'Share',
                                  ),
                                  'Share'),
                              iconTextButton(
                                  SvgPicture.asset(
                                    'assets/icon/fav_icon.svg',
                                    semanticsLabel: 'Share',
                                  ),
                                  'Next'),
                            ],
                          )),

                      const SizedBox(
                        height: 20,
                      ),
                    ],
                  ),
                )),
          ),
        ]),
      ),
    );
  }
}
