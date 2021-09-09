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
              pmToEmoji(data.getPm2_5Value()),
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
                  data.site.getName(),
                  maxLines: 4,
                  softWrap: true,
                  style: TextStyle(
                      fontWeight: FontWeight.bold,
                      fontSize: 17,
                      color: ColorConstants.appColor),
                ),
                Text(
                  '${data.getPm2_5Value().toStringAsFixed(2)}',
                  maxLines: 4,
                  softWrap: true,
                  style:
                      TextStyle(fontSize: 15, color: ColorConstants.appColor),
                ),
                Text(
                  pmToString(data.getPm2_5Value()).replaceAll('\n', ' '),
                  maxLines: 4,
                  softWrap: true,
                  style:
                      TextStyle(fontSize: 15, color: ColorConstants.appColor),
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
    return Card(
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
                Text('${dateToString(widget.data.time, true)}',
                    style: TextStyle(
                      fontSize: 13,
                      color: ColorConstants.appColor,
                    )),
              ],
            ),
          ),
        ));
  }
}
