import 'package:app/constants/app_constants.dart';
import 'package:app/models/measurement.dart';
import 'package:app/utils/date.dart';
import 'package:app/utils/pm.dart';
import 'package:flutter/foundation.dart';
import 'package:flutter/material.dart';

class AirQualityCard extends StatefulWidget {
  final Measurement data;

  AirQualityCard({Key? key, required this.data}) : super(key: key);

  @override
  _AirQualityCardState createState() => _AirQualityCardState();
}

class CardBody extends StatefulWidget {
  @override
  _CardBodyState createState() => _CardBodyState();
}

class CardBodySection extends StatelessWidget {
  @override
  Widget build(BuildContext context) {
    return Container(
      child: const Center(child: Text('Body')),
    );
  }
}

class TitleSection extends StatelessWidget {
  final Measurement data;

  TitleSection({Key? key, required this.data}) : super(key: key);

  @override
  Widget build(BuildContext context) {
    return Container(
        child: Padding(
          padding: const EdgeInsets.fromLTRB(4, 12, 4, 4),
          child: Row(
            crossAxisAlignment: CrossAxisAlignment.center,
            mainAxisAlignment: MainAxisAlignment.spaceEvenly,
            children: [
              Padding(
                padding: const EdgeInsets.fromLTRB(10, 10, 10, 10),
                child: Image.asset(
                  pmToEmoji(data.pm2_5.calibratedValue),
                  height: 50,
                  width: 50,
                ),
              ),
              Expanded(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  mainAxisAlignment: MainAxisAlignment.center,
                  children: [
                    Text(
                      data.device.siteName,
                      maxLines: 4,
                      softWrap: true,
                      style: TextStyle(
                        fontWeight: FontWeight.bold,
                          fontSize: 17,
                          color: ColorConstants().appColor),
                    ),
                    Text(
                      '${data.pm2_5.calibratedValue.toStringAsFixed(2)}',
                      maxLines: 4,
                      softWrap: true,
                      style: TextStyle(
                          fontSize: 15,
                          color: ColorConstants().appColor),
                    ),
                    Text(
                      pmToString(data.pm2_5.calibratedValue)
                          .replaceAll('\n', ' '),
                      maxLines: 4,
                      softWrap: true,
                      style: TextStyle(
                          fontSize: 15,
                          color: ColorConstants().appColor),
                    ),
                  ],
                ),
              )
            ],
          ),
        ));
  }
}

class _AirQualityCardState extends State<AirQualityCard> {
  @override
  Widget build(BuildContext context) {
    return
      Card(
        elevation: 5,
        shape: RoundedRectangleBorder(
          borderRadius: BorderRadius.circular(20),
        ),
        child: Container(
          child: Padding(
            padding: const EdgeInsets.all(8),
            child: Column(
              children: [
                TitleSection(
                  data: widget.data,
                ),
                Text('${dateToString(widget.data.time)}',
                    style: TextStyle(
                      fontSize: 13,
                      color: ColorConstants().appColor,
                      fontStyle: FontStyle.italic,
                    )),
              ],
            ),
          ),
        )
      );
  }
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
