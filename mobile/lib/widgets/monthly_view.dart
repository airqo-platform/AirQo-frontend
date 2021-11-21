import 'package:app/constants/app_constants.dart';
import 'package:app/models/place_details.dart';
import 'package:app/models/site.dart';
import 'package:app/services/rest_api.dart';
import 'package:app/widgets/text_fields.dart';
import 'package:flutter/material.dart';
import 'package:intl/intl.dart';

import 'analytics_card.dart';
import 'custom_shimmer.dart';

class MonthlyView extends StatefulWidget {
  final Site site;

  const MonthlyView(this.site, {Key? key}) : super(key: key);

  @override
  _MonthlyViewState createState() => _MonthlyViewState();
}

class _MonthlyViewState extends State<MonthlyView>
    with TickerProviderStateMixin {
  TabController? _weeklyTabController;
  int currentIndex = 0;
  List<Widget> placeHolders = [];

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
              tabs: List<Widget>.generate(placeHolders.length - 1, createTab),
            ),
            Expanded(
                child: Container(
              margin: const EdgeInsets.only(left: 16.0, right: 16.0),
              child: TabBarView(
                controller: _weeklyTabController,
                children:
                    List<Widget>.generate(placeHolders.length - 1, (int index) {
                  return placeHolders[index];
                }),
              ),
            )),
          ],
        ));
  }

  Tab createTab(int index) {
    var offset = DateTime.now().day;
    var firstDay = DateTime.now();
    if (offset != 1) {
      firstDay = firstDay.subtract(Duration(days: offset));
    }
    var nextDate = firstDay.add(Duration(days: index + 1));
    var day = '${index + 1}';
    if (index + 1 < 10) {
      day = '0${index + 1}';
    }
    return Tab(
        child: tabLayout(
            DateFormat('EEE').format(nextDate),
            day,
            currentIndex == index
                ? ColorConstants.appColorBlue
                : Colors.transparent,
            currentIndex == index
                ? Colors.white
                : ColorConstants.inactiveColor));
  }

  @override
  void dispose() {
    super.dispose();
    _weeklyTabController!.dispose();
  }

  DateTime getDate(int day) {
    var date = DateTime.now();
    var offset = DateTime.now().day;
    if (offset != 0) {
      date = date.subtract(Duration(days: offset));
    }
    var nextDate = date.add(Duration(days: day));
    return nextDate;
  }

  void getMeasurements() async {
    for (var dateIndex = 0; dateIndex < placeHolders.length; dateIndex++) {
      await AirqoApiClient(context)
          .fetchSiteDayMeasurements(widget.site.id, getDate(dateIndex))
          .then((measurements) => {
                if (measurements.isEmpty)
                  {
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
                    }),
                  }
                else
                  {
                    if (mounted)
                      {
                        setState(() {
                          placeHolders[dateIndex] = AnalyticsCard(
                              PlaceDetails.siteToPLace(widget.site), false);
                        }),
                      }
                  }
              });
    }
  }

  List<Widget> getTabsContentPlaceHolders() {
    var days = <Widget>[];
    var now = DateTime.now();
    var lastDayOfMonth = DateTime(now.year, now.month + 1, 0);
    for (var dateIndex = 0; dateIndex <= lastDayOfMonth.day; dateIndex++) {
      days.add(
        containerLoadingAnimation(253.0, 16.0),
      );
    }
    return days;
  }

  void initialize() {
    placeHolders = getTabsContentPlaceHolders();
    _weeklyTabController = TabController(
        length: placeHolders.length - 1, vsync: this, initialIndex: 0);
    currentIndex = 0;
    getMeasurements();
  }

  @override
  void initState() {
    super.initState();
    initialize();
  }
}
