import 'package:cached_network_image/cached_network_image.dart';
import 'package:flutter/material.dart';
import 'package:flutter/foundation.dart';

import 'card_body.dart';

class AirQualityCard extends StatefulWidget {
  @override
  _AirQualityCardState createState() => _AirQualityCardState();
}

class _AirQualityCardState extends State<AirQualityCard> {
  static const height = 298.0;

  // late final ShapeBorder shape;

  @override
  Widget build(BuildContext context) {
    return SafeArea(
      top: false,
      bottom: false,
      child: Padding(
        padding: const EdgeInsets.all(8),
        child: Column(
          children: [
            SizedBox(
              height: height,
              child: Card(
                // This ensures that the Card's children (including the ink splash) are clipped correctly.
                clipBehavior: Clip.antiAlias,
                // shape: shape,
                child: InkWell(
                    onTap: () {
                      print('Card was tapped');
                    },
                    // Generally, material cards use onSurface with 12% opacity for the pressed state.
                    splashColor: Theme.of(context)
                        .colorScheme
                        .onSurface
                        .withOpacity(0.12),
                    // Generally, material cards do not have a highlight overlay.
                    highlightColor: Colors.transparent,
                    child: Column(
                      children: [
                        TitleSection(),
                        CardBody(),
                      ],
                    )),
              ),
            ),
          ],
        ),
      ),
    );
  }
}

class BodySection extends StatelessWidget {
  // const BodySection({required this.destination})
  //     : assert(destination != null),
  //       super();

  @override
  Widget build(BuildContext context) {
    return CardBody();
  }
}

class TitleSection extends StatelessWidget {
  // const SectionTitle({
  //
  // }) : super();

  // final String pm2_5;
  // final String place;
  //
  //
  // final String icon_image;
  // final String place;
  @override
  Widget build(BuildContext context) {
    return Container(
        decoration: BoxDecoration(
            gradient: LinearGradient(
                begin: Alignment.topCenter,
                end: Alignment.bottomCenter,
                colors: [
              Color(0xff7CA2F8),
              Color(0xffFFFFFF),
            ])),
        child: Padding(
          padding: const EdgeInsets.fromLTRB(4, 12, 4, 4),
          child: Row(
            crossAxisAlignment: CrossAxisAlignment.center,
            mainAxisAlignment: MainAxisAlignment.spaceEvenly,
            children: [
              Padding(
                padding: const EdgeInsets.fromLTRB(10, 10, 10, 10),
                child: Image.asset(
                  'assets/images/happy_face.png',
                  height: 40,
                  width: 40,
                ),
              ),
              Expanded(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  mainAxisAlignment: MainAxisAlignment.center,
                  children: [
                    const Text('Makerere University'),
                    const Text('2.5 µg/m3'),
                    const Text('Good')
                  ],
                ),
              )
            ],
          ),
        ));
    //
    // return Padding(
    //   padding: const EdgeInsets.fromLTRB(4, 12, 4, 4),
    //   child: Row(
    //   crossAxisAlignment: CrossAxisAlignment.center,
    //   mainAxisAlignment: MainAxisAlignment.spaceEvenly,
    //   children: [
    //     Column(
    //       crossAxisAlignment: CrossAxisAlignment.center,
    //       mainAxisAlignment: MainAxisAlignment.center,
    //       children: [
    //         CircleAvatar(
    //           backgroundImage: NetworkImage('https://avatars.githubusercontent.com/u/37845280?v=4'),
    //           maxRadius: 30,
    //         ),
    //       ],
    //     ),
    //
    //     Column(
    //       crossAxisAlignment: CrossAxisAlignment.start,
    //       mainAxisAlignment: MainAxisAlignment.center,
    //       children: [
    //
    //         const Text('Makerere University'),
    //         const Text('2.5 µg/m3'),
    //         const Text('Good')
    //       ],
    //     ),
    //   ],
    // ),
    //
    // );
  }
}
