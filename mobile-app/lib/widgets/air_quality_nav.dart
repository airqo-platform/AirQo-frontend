import 'package:app/screens/place_details.dart';
import 'package:cached_network_image/cached_network_image.dart';
import 'package:flutter/material.dart';
import 'package:flutter/foundation.dart';

class AirQualityCard extends StatefulWidget {
  @override
  _AirQualityCardState createState() => _AirQualityCardState();
}

class _AirQualityCardState extends State<AirQualityCard> {

  @override
  Widget build(BuildContext context) {
    return Container(
      child: Padding(
        padding: const EdgeInsets.all(8),
        child: Column(
          children: [
            Card(
              clipBehavior: Clip.antiAlias,
              child: InkWell(
                  onTap: () {
                    print('Card was tapped');
                    Navigator.push(context, MaterialPageRoute(builder: (context) {
                      return PlaceDetailsPage();
                    }));
                  },
                  splashColor: Theme.of(context)
                      .colorScheme
                      .onSurface
                      .withOpacity(0.12),
                  highlightColor: Colors.transparent,
                  child: Column(
                    children: [
                      TitleSection(),
                      Padding(
                        padding: const EdgeInsets.all(8),
                        child: CardSection(),)
                    ],
                  )
              ),
            ),
          ],
        ),
      ),
    );
  }
}

class TitleSection extends StatelessWidget {
  @override
  Widget build(BuildContext context) {
    return Container(
        decoration:   const BoxDecoration(
            gradient: LinearGradient(
                begin: Alignment.topCenter,
                end: Alignment.bottomCenter,
                colors: [
                  Colors.deepPurple,
                  Colors.white,
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
  }
}

class CardSection extends StatelessWidget {
  @override
  Widget build(BuildContext context) {
    return Container(
          child: Row(
            crossAxisAlignment: CrossAxisAlignment.center,
            mainAxisAlignment: MainAxisAlignment.spaceEvenly,
            children: [
              Column(
                  children: [
                    Row(
                      children: [
                        const Padding(
                          padding: const EdgeInsets.fromLTRB(5, 5, 5, 5),
                          child: Icon(Icons.thermostat_outlined),
                        ),
                        Text('20')
                      ],
                    )
                  ],
                ),
              Column(
                children: [
                  Row(
                    children: [
                      const Padding(
                        padding: const EdgeInsets.fromLTRB(5, 5, 5, 5),
                        child: Icon(Icons.wb_cloudy_outlined),
                      ),

                      Text('20')
                    ],
                  )
                ],
              ),

            ],
          ),
        );
  }
}

class CardBody extends StatefulWidget {
  @override
  _CardBodyState createState() => _CardBodyState();
}

class _CardBodyState extends State<CardBody> {

  @override
  Widget build(BuildContext context) {

    return Container(
      child: Column(
          crossAxisAlignment: CrossAxisAlignment.stretch,
          children: <Widget>[
            CardBodySection()
          ]),
    );
  }
}

class CardBodySection extends StatelessWidget {
  @override
  Widget build(BuildContext context) {
    return Container(
      child: const Center(child: Text("Body")),
    );
  }
}