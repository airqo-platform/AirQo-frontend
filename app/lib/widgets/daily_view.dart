import 'package:app/constants/app_constants.dart';
import 'package:app/models/site.dart';
import 'package:app/services/rest_api.dart';
import 'package:app/widgets/place_readings_card.dart';
import 'package:app/widgets/text_fields.dart';
import 'package:flutter/material.dart';
import 'package:flutter_svg/svg.dart';

import 'custom_widgets.dart';
import 'loading.dart';

class DailyView extends StatefulWidget {
  Site site;

  DailyView(this.site);

  @override
  _DailyViewState createState() => _DailyViewState(this.site);
}

class _DailyViewState extends State<DailyView> with TickerProviderStateMixin {
  late TabController _weeklyTabController;
  Site site;
  int currentIndex = 0;
  List<Widget> placeHolders = [
    const LoadingAnimation(),
    const LoadingAnimation(),
    const LoadingAnimation(),
    const LoadingAnimation(),
    const LoadingAnimation(),
    const LoadingAnimation(),
    const LoadingAnimation(),
  ];

  _DailyViewState(this.site);

  @override
  Widget build(BuildContext context) {
    // double screenHeight = MediaQuery.of(context).size.height;
    return Container(
        color: ColorConstants.appBodyColor,
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: <Widget>[
            const SizedBox(
              height: 36,
            ),
            Row(
              mainAxisAlignment: MainAxisAlignment.spaceBetween,
              children: [
                Text(
                  'AIR QUALITY',
                  style: TextStyle(
                      fontSize: 12, color: Colors.black.withOpacity(0.3)),
                ),
                Container(
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
                )
              ],
            ),
            const SizedBox(
              height: 20,
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
                      'Favorite'),
                ],
              ),
            ),
            const SizedBox(
              height: 36,
            ),
            const Text(
              'Today’s health tips',
              textAlign: TextAlign.left,
              style: TextStyle(fontSize: 20, fontWeight: FontWeight.bold),
            ),
            const SizedBox(
              height: 11,
            ),
            const SizedBox(
              height: 128,
            )
          ],
        ));
  }

  @override
  void dispose() {
    super.dispose();
    _weeklyTabController.dispose();
  }

  DateTime getDate(int day) {
    var sunday = DateTime.now();
    var offset = DateTime.now().weekday;
    if (offset != 0) {
      sunday = sunday.subtract(Duration(days: offset));
    }
    var nextDate = sunday.add(Duration(days: day));
    return nextDate;
  }

  void getMeasurements(int today) async {
    await AirqoApiClient(context)
        .fetchSiteDayMeasurements(site, getDate(today))
        .then((measurements) => {
              if (measurements.isEmpty && mounted)
                {
                  setState(() {
                    placeHolders[today] = const Center(
                      child: Text(
                        'Not Available',
                        style: TextStyle(
                          fontWeight: FontWeight.bold,
                          fontSize: 18,
                        ),
                      ),
                    );
                  }),
                }
            });
    for (var dateIndex = 0; dateIndex <= 6; dateIndex++) {
      var measurements = await AirqoApiClient(context)
          .fetchSiteDayMeasurements(site, getDate(dateIndex));
      if (measurements.isEmpty) {
        if (mounted) {
          setState(() {
            placeHolders[dateIndex] = const Center(
              child: Text(
                'Not Available',
                style: TextStyle(
                  fontWeight: FontWeight.bold,
                  fontSize: 18,
                ),
              ),
            );
          });
        }
      } else {
        if (mounted) {
          setState(() {
            placeHolders[dateIndex] = PlaceReadingsCard(site, measurements);
          });
        }
      }
    }
  }

  void initialize() {
    var today = DateTime.now().weekday;
    _weeklyTabController =
        TabController(length: 7, vsync: this, initialIndex: today);
    currentIndex = today;
    getMeasurements(currentIndex);
  }

  @override
  void initState() {
    super.initState();
    initialize();
  }
}
