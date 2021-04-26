import 'package:flutter/material.dart';

class AQI_Dialog extends StatelessWidget {
  String good = 'An air quality index is used by government agencies to '
      'communicate to the public how polluted the air currently '
      'is or how polluted it';

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        backgroundColor: Color(0xff5f1ee8),
        title: Text('AQI Guide'),
      ),
      body: Container(
        padding: EdgeInsets.all(20),
        child: ListView(
          children: [
            whatIsAQI,
            AQI_Quide('assets/images/happy_face.png', good),
            AQI_Quide('assets/images/happy_face.png', good),
            AQI_Quide('assets/images/happy_face.png', good),
            AQI_Quide('assets/images/happy_face.png', good),
            AQI_Quide('assets/images/happy_face.png', good),
            AQI_Quide('assets/images/happy_face.png', good),
          ],
        ),
      ),
    );
  }

  Widget whatIsAQI = Container(
    child: Text(
        'An air quality index is used by government agencies to communicate to '
        'the public how polluted the air currently is or how polluted it is '
        'forecast to become. Public health risks increase as the AQI rises. '
        'Different countries have their own air quality indices, '
        'corresponding to different national air quality standards.',
        softWrap: true,
        style: TextStyle(
          height: 1.2,
          // letterSpacing: 1.0
        )),
  );

  Widget AQI_Quide(String image, String body) {
    return Container(
      padding: EdgeInsets.fromLTRB(0, 2, 0, 0),
      child: Row(
        crossAxisAlignment: CrossAxisAlignment.start,
        mainAxisAlignment: MainAxisAlignment.start,
        children: [
          Padding(
            padding: EdgeInsets.all(5),
            child: Image.asset(
              image,
              height: 40,
              width: 40,
            ),
          ),
          Expanded(
            child: Padding(
              padding: EdgeInsets.all(5),
              child: Text(body,
                  softWrap: true,
                  style: TextStyle(
                    height: 1.2,
                    // letterSpacing: 1.0
                  )),
            ),
          )
        ],
      ),
    );
  }

  Widget AQI_Good = Container(
    padding: EdgeInsets.fromLTRB(0, 2, 0, 0),
    child: Row(
      crossAxisAlignment: CrossAxisAlignment.start,
      mainAxisAlignment: MainAxisAlignment.start,
      children: [
        Padding(
          padding: EdgeInsets.all(5),
          child: Image.asset(
            'assets/images/happy_face.png',
            height: 40,
            width: 40,
          ),
        ),
        Expanded(
          child: Padding(
            padding: EdgeInsets.all(5),
            child: Text(
              'An air quality index is used by government agencies to '
              'communicate to the public how polluted the air currently '
              'is or how polluted it',
              softWrap: true,
            ),
          ),
        )
      ],
    ),
  );
}
