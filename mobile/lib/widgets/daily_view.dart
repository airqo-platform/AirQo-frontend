import 'package:app/constants/app_constants.dart';
import 'package:app/models/historicalMeasurement.dart';
import 'package:app/models/site.dart';
import 'package:app/services/local_storage.dart';
import 'package:app/utils/share.dart';
import 'package:app/widgets/tips.dart';
import 'package:flutter/material.dart';
import 'package:flutter_svg/svg.dart';

import 'custom_widgets.dart';
import 'insights_card.dart';

class DailyView extends StatefulWidget {
  Site site;

  DailyView(this.site);

  @override
  _DailyViewState createState() => _DailyViewState(this.site);
}

class _DailyViewState extends State<DailyView> with TickerProviderStateMixin {
  Site site;
  String viewDay = 'today';
  String pollutant = '';
  bool pm10 = false;
  bool pm2_5 = true;

  _DailyViewState(this.site);

  @override
  Widget build(BuildContext context) {
    return Container(
        color: ColorConstants.appBodyColor,
        child: ListView(
          // crossAxisAlignment: CrossAxisAlignment.start,
          children: <Widget>[
            const SizedBox(
              height: 18,
            ),
            Row(
              mainAxisAlignment: MainAxisAlignment.spaceBetween,
              children: [
                Text(
                  'AIR QUALITY'.toUpperCase(),
                  style: TextStyle(
                      fontSize: 12, color: Colors.black.withOpacity(0.3)),
                ),
                GestureDetector(
                  onTap: togglePollutant,
                  child: Container(
                    height: 32,
                    width: 32,
                    padding: const EdgeInsets.all(6.0),
                    decoration: BoxDecoration(
                        color: Colors.white,
                        borderRadius:
                            const BorderRadius.all(Radius.circular(8.0)),
                        border: Border.all(color: Colors.transparent)),
                    child: SvgPicture.asset(
                      'assets/icon/toggle_icon.svg',
                      semanticsLabel: 'Toggle',
                      height: 16,
                      width: 20,
                    ),
                  ),
                )
              ],
            ),
            const SizedBox(
              height: 20,
            ),
            Visibility(
              visible: pm2_5,
              child: InsightsCard(site, callBackFn, 'pm2.5'),
            ),
            Visibility(
              visible: !pm2_5,
              child: InsightsCard(site, callBackFn, 'pm10'),
            ),
            const SizedBox(
              height: 16,
            ),
            Container(
              padding: const EdgeInsets.all(21.0),
              decoration: BoxDecoration(
                  color: Colors.white,
                  borderRadius: const BorderRadius.all(Radius.circular(8.0)),
                  border: Border.all(color: Colors.transparent)),
              child: Row(
                mainAxisAlignment: MainAxisAlignment.spaceEvenly,
                children: [
                  GestureDetector(
                    onTap: () {
                      shareLocation(site);
                    },
                    child: iconTextButton(
                        SvgPicture.asset(
                          'assets/icon/share_icon.svg',
                          semanticsLabel: 'Share',
                        ),
                        'Share'),
                  ),
                  GestureDetector(
                    onTap: () {
                      DBHelper().updateFavouritePlaces(site, context);
                    },
                    child: iconTextButton(
                        SvgPicture.asset(
                          'assets/icon/fav_icon.svg',
                          semanticsLabel: 'Favorite',
                        ),
                        'Favorite'),
                  ),
                ],
              ),
            ),
            const SizedBox(
              height: 36,
            ),
            if (viewDay == 'today' || viewDay == 'tomorrow')
              Text(
                viewDay == 'today'
                    ? 'Today’s health tips'
                    : 'Tomorrow’s health tips',
                textAlign: TextAlign.left,
                style:
                    const TextStyle(fontSize: 20, fontWeight: FontWeight.bold),
              ),
            const SizedBox(
              height: 11,
            ),
            SizedBox(
              height: 128,
              child: ListView.builder(
                scrollDirection: Axis.horizontal,
                itemBuilder: (context, index) => Padding(
                  padding: const EdgeInsets.all(5),
                  child: tipContainer(),
                ),
                itemCount: 4,
              ),
            ),
            const SizedBox(
              height: 11,
            ),
          ],
        ));
  }

  void callBackFn(HistoricalMeasurement measurement) {
    var offSet = DateTime.now().timeZoneOffset.inHours;
    var time = DateTime.parse(measurement.time).add(Duration(hours: offSet));
    var tomorrow = DateTime.now().add(const Duration(days: 1));
    if (time.day == DateTime.now().day) {
      setState(() {
        viewDay = 'today';
      });
    } else if (time.day == tomorrow.day) {
      setState(() {
        viewDay = 'tomorrow';
      });
    } else {
      setState(() {
        viewDay = '';
      });
    }
  }

  void initialize() {}

  @override
  void initState() {
    initialize();
    super.initState();
  }

  void togglePollutant() {
    setState(() {
      pm2_5 = !pm2_5;
    });
  }
}
