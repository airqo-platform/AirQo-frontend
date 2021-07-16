import 'package:app/constants/app_constants.dart';
import 'package:app/models/measurement.dart';
import 'package:app/screens/place_details.dart';
import 'package:app/utils/services/local_storage.dart';
import 'package:app/utils/ui/date.dart';
import 'package:app/utils/ui/dialogs.dart';
import 'package:app/utils/ui/pm.dart';
import 'package:cached_network_image/cached_network_image.dart';
import 'package:flutter/material.dart';
import 'package:flutter/foundation.dart';

class AirQualityCard extends StatefulWidget {
  AirQualityCard({Key? key, required this.data}) : super(key: key);

  final Measurement data;

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
              child: Column(
                children: [
                  TitleSection(
                    data: widget.data,
                  ),
                  Padding(
                    padding: const EdgeInsets.all(8),
                    child: CardSection(
                      data: widget.data,
                    ),
                  )
                ],
              ),
            ),
          ],
        ),
      ),
    );
  }
}

class TitleSection extends StatelessWidget {
  TitleSection({Key? key, required this.data}) : super(key: key);

  final Measurement data;

  @override
  Widget build(BuildContext context) {
    return Container(
        decoration: BoxDecoration(
            gradient: LinearGradient(
                begin: Alignment.topCenter,
                end: Alignment.bottomCenter,
                colors: [
              pmToColor(data.pm2_5.value),
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
                  pmToEmoji(data.pm2_5.value),
                  height: 40,
                  width: 40,
                ),
              ),
              Expanded(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  mainAxisAlignment: MainAxisAlignment.center,
                  children: [
                    Text(
                      data.locationDetails.nickName == null
                          ? data.locationDetails.siteName
                          : data.locationDetails.nickName,
                      maxLines: 4,
                      softWrap: true,
                      style: TextStyle(
                        color: pmTextColor(data.pm2_5.value)
                      ),
                    ),
                    Text(
                      '${data.pm2_5.value} µg/m\u00B3',
                      maxLines: 4,
                      softWrap: true,
                      style: TextStyle(
                          color: pmTextColor(data.pm2_5.value)
                      ),
                    ),
                    Text(
                      pmToString(data.pm2_5.value).replaceAll('\n', ' '),
                      maxLines: 4,
                      softWrap: true,
                      style: TextStyle(
                          color: pmTextColor(data.pm2_5.value)
                      ),
                    ),
                  ],
                ),
              )
            ],
          ),
        ));
  }
}

class CardSection extends StatelessWidget {
  CardSection({Key? key, required this.data}) : super(key: key);

  final Measurement data;

  @override
  Widget build(BuildContext context) {
    return Container(
      child: Row(
        // crossAxisAlignment: CrossAxisAlignment.center,
        // mainAxisAlignment: MainAxisAlignment.spaceEvenly,
        children: [
          Expanded(
              child: Text('Last updated : ${dateToString(data.time)}',
                  style: const TextStyle(
                    fontSize: 11,
                    color: appColor,
                    fontWeight: FontWeight.w300,
                    fontStyle: FontStyle.italic,
                  ))),
          // const Padding(
          //   padding: EdgeInsets.fromLTRB(5, 5, 5, 5),
          //   child: Icon(
          //     Icons.arrow_forward_outlined,
          //     color: appColor,
          //   ),
          // ),
          // Column(
          //   children: [
          //     Row(
          //       children: [
          //         const Padding(
          //           padding: EdgeInsets.fromLTRB(5, 5, 5, 5),
          //           child: Icon(Icons.thermostat_outlined),
          //         ),
          //         Text('20')
          //       ],
          //     )
          //   ],
          // ),
          // Column(
          //   children: [
          //     Row(
          //       children: [
          //         const Padding(
          //           padding: EdgeInsets.fromLTRB(5, 5, 5, 5),
          //           child: Icon(Icons.wb_cloudy_outlined),
          //         ),
          //         Text('20')
          //       ],
          //     )
          //   ],
          // ),
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
          children: <Widget>[CardBodySection()]),
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
