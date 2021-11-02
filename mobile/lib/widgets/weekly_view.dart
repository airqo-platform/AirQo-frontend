import 'package:app/constants/app_constants.dart';
import 'package:app/models/site.dart';
import 'package:app/services/rest_api.dart';
import 'package:app/widgets/place_readings_card.dart';
import 'package:app/widgets/text_fields.dart';
import 'package:flutter/material.dart';

import 'custom_shimmer.dart';

class WeeklyView extends StatefulWidget {
  Site site;

  WeeklyView(this.site, {Key? key}) : super(key: key);

  @override
  _WeeklyViewState createState() => _WeeklyViewState(site);
}

class _WeeklyViewState extends State<WeeklyView> with TickerProviderStateMixin {
  late TabController _weeklyTabController;
  Site site;
  int currentIndex = 0;
  List<Widget> placeHolders = [
    loadingAnimation(253.0, 16.0),
    loadingAnimation(253.0, 16.0),
    loadingAnimation(253.0, 16.0),
    loadingAnimation(253.0, 16.0),
    loadingAnimation(253.0, 16.0),
    loadingAnimation(253.0, 16.0),
    loadingAnimation(253.0, 16.0),
  ];

  _WeeklyViewState(this.site);

  @override
  Widget build(BuildContext context) {
    // double screenHeight = MediaQuery.of(context).size.height;
    return Container(
        color: ColorConstants.appBodyColor,
        child: Column(
          children: <Widget>[
            TabBar(
              controller: _weeklyTabController,
              indicatorColor: Colors.transparent,
              labelColor: ColorConstants.appColorBlue,
              unselectedLabelColor: Colors.black54,
              labelPadding: const EdgeInsets.symmetric(horizontal: 8.0),
              onTap: (index) {
                setState(() {
                  currentIndex = index;
                });
              },
              isScrollable: true,
              tabs: <Widget>[
                SizedBox(
                  width: 50.0,
                  child: Tab(
                      child: tabLayout(
                          'SUN',
                          '${getDate(0).day}',
                          currentIndex == 0
                              ? ColorConstants.appColorBlue
                              : Colors.transparent,
                          currentIndex == 0
                              ? Colors.white
                              : ColorConstants.inactiveColor)),
                ),
                Tab(
                    child: tabLayout(
                        'MON',
                        '${getDate(1).day}',
                        currentIndex == 1
                            ? ColorConstants.appColorBlue
                            : Colors.transparent,
                        currentIndex == 1
                            ? Colors.white
                            : ColorConstants.inactiveColor)),
                Tab(
                    child: tabLayout(
                        'TUE',
                        '${getDate(2).day}',
                        currentIndex == 2
                            ? ColorConstants.appColorBlue
                            : Colors.transparent,
                        currentIndex == 2
                            ? Colors.white
                            : ColorConstants.inactiveColor)),
                Tab(
                    child: tabLayout(
                        'WED',
                        '${getDate(3).day}',
                        currentIndex == 3
                            ? ColorConstants.appColorBlue
                            : Colors.transparent,
                        currentIndex == 3
                            ? Colors.white
                            : ColorConstants.inactiveColor)),
                Tab(
                    child: tabLayout(
                        'THUR',
                        '${getDate(4).day}',
                        currentIndex == 4
                            ? ColorConstants.appColorBlue
                            : Colors.transparent,
                        currentIndex == 4
                            ? Colors.white
                            : ColorConstants.inactiveColor)),
                Tab(
                    child: tabLayout(
                        'FRI',
                        '${getDate(5).day}',
                        currentIndex == 5
                            ? ColorConstants.appColorBlue
                            : Colors.transparent,
                        currentIndex == 5
                            ? Colors.white
                            : ColorConstants.inactiveColor)),
                Tab(
                    child: tabLayout(
                        'SAT',
                        '${getDate(6).day}',
                        currentIndex == 6
                            ? ColorConstants.appColorBlue
                            : Colors.transparent,
                        currentIndex == 6
                            ? Colors.white
                            : ColorConstants.inactiveColor)),
              ],
            ),
            Expanded(
                child: Container(
              margin: const EdgeInsets.only(left: 16.0, right: 16.0),
              child: TabBarView(
                controller: _weeklyTabController,
                children:
                    List<Widget>.generate(placeHolders.length, (int index) {
                  return placeHolders[index];
                }),
              ),
            )),
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
