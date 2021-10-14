import 'dart:math';

import 'package:app/constants/app_constants.dart';
import 'package:app/models/historicalMeasurement.dart';
import 'package:app/models/measurement.dart';
import 'package:app/models/predict.dart';
import 'package:app/models/site.dart';
import 'package:app/models/story.dart';
import 'package:app/screens/place_view.dart';
import 'package:app/screens/search_page.dart';
import 'package:app/services/local_storage.dart';
import 'package:app/services/native_api.dart';
import 'package:app/services/rest_api.dart';
import 'package:app/utils/date.dart';
import 'package:app/utils/settings.dart';
import 'package:app/widgets/readings_card.dart';
import 'package:cached_network_image/cached_network_image.dart';
import 'package:flutter/material.dart';
import 'package:shared_preferences/shared_preferences.dart';

class CircularBorder extends StatelessWidget {
  final Color color = ColorConstants.inactiveColor;
  final double size = 25;
  final double width = 1.0;

  // final Widget icon;

  CircularBorder({Key? key}) : super(key: key);

  @override
  Widget build(BuildContext context) {
    return Container(
      height: size,
      width: size,
      alignment: Alignment.center,
      child: Stack(
        alignment: Alignment.center,
        children: <Widget>[
          Icon(
            Icons.add,
            size: 20,
            color: ColorConstants.inactiveColor,
          ),
          CustomPaint(
            size: Size(size, size),
            foregroundPainter: MyPainter(completeColor: color, width: width),
          ),
        ],
      ),
    );
  }
}

class DashboardView extends StatefulWidget {
  @override
  _DashboardViewState createState() => _DashboardViewState();
}

class MyPainter extends CustomPainter {
  Color lineColor = Colors.transparent;
  Color completeColor;
  double width;

  MyPainter({required this.completeColor, required this.width});

  @override
  void paint(Canvas canvas, Size size) {
    var complete = Paint()
      ..color = completeColor
      ..strokeCap = StrokeCap.round
      ..style = PaintingStyle.stroke
      ..strokeWidth = width;

    var center = Offset(size.width / 2, size.height / 2);
    var radius = min(size.width / 2, size.height / 2);
    var percent = (size.width * 0.001) / 2;

    var arcAngle = 2 * pi * percent;

    for (var i = 0; i < 8; i++) {
      var init = (-pi / 2) * (i / 2);

      canvas.drawArc(Rect.fromCircle(center: center, radius: radius), init,
          arcAngle, false, complete);
    }
  }

  @override
  bool shouldRepaint(CustomPainter oldDelegate) {
    return true;
  }
}

class _DashboardViewState extends State<DashboardView> {
  var measurementData;
  var historicalData = <HistoricalMeasurement>[];
  var forecastData = <Predict>[];
  var stories = <Story>[];
  var featuredStory;
  var storyIsSet = false;

  @override
  Widget build(BuildContext context) {
    if (measurementData == null) {
      return Container(
          color: ColorConstants.appBodyColor,
          child: Center(
            child: CircularProgressIndicator(
              color: ColorConstants.appColor,
            ),
          ));
    } else {
      return Container(
          color: ColorConstants.appBodyColor,
          child: RefreshIndicator(
              onRefresh: initialize,
              color: ColorConstants.appColor,
              child: Padding(
                padding: const EdgeInsets.fromLTRB(16.0, 16.0, 16.0, 0.0),
                child: Column(
                  mainAxisSize: MainAxisSize.min,
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: <Widget>[
                    const SizedBox(
                      height: 10,
                    ),
                    topBar(),
                    Expanded(
                      child: ListView(
                        shrinkWrap: true,
                        children: <Widget>[
                          const SizedBox(
                            height: 10,
                          ),
                          Text(
                            getGreetings(),
                            style: const TextStyle(
                                fontSize: 24, fontWeight: FontWeight.bold),
                          ),
                          const SizedBox(
                            height: 16,
                          ),
                          topTabs(),
                          const SizedBox(
                            height: 24,
                          ),
                          Text(
                            getDateTime(),
                            style: TextStyle(
                              color: Colors.black.withOpacity(0.6),
                              fontSize: 14,
                            ),
                          ),
                          const Text(
                            'Daily Forecast',
                            style: TextStyle(
                              color: Colors.black,
                              fontWeight: FontWeight.bold,
                              fontSize: 32,
                            ),
                          ),
                          const SizedBox(
                            height: 12,
                          ),
                          GestureDetector(
                            onTap: () {
                              Navigator.push(context,
                                  MaterialPageRoute(builder: (context) {
                                return PlaceView(measurementData.site);
                              }));
                            },
                            child: ReadingsCard(measurementData),
                          ),
                          const SizedBox(
                            height: 16,
                          ),
                          if (stories.isNotEmpty)
                            tipsSection(stories[pickStory(stories.length)]),
                        ],
                      ),
                    ),
                  ],
                ),
              )));
    }
  }

  void getLocationForecastMeasurements(Measurement measurement) async {
    try {
      await DBHelper()
          .getForecastMeasurements(measurement.site.id)
          .then((value) => {
                if (value.isNotEmpty)
                  {
                    if (mounted)
                      {
                        setState(() {
                          forecastData = value;
                        })
                      }
                  }
              });
    } on Error catch (e) {
      print('Getting forecast data locally error: $e');
    } finally {
      try {
        await AirqoApiClient(context)
            .fetchForecast(measurement.deviceNumber)
            .then((value) => {
                  if (value.isNotEmpty)
                    {
                      if (mounted)
                        {
                          setState(() {
                            forecastData = value;
                          }),
                        },
                      DBHelper().insertForecastMeasurements(
                          value, measurement.site.id)
                    },
                });
      } catch (e) {
        print('Getting forecast data from api error: $e');
      }
    }
  }

  void getLocationHistoricalMeasurements(Site site) async {
    try {
      await DBHelper().getHistoricalMeasurements(site.id).then((value) => {
            if (value.isNotEmpty)
              {
                if (mounted)
                  {
                    setState(() {
                      historicalData = value;
                    })
                  }
              }
          });
    } catch (e) {
      print('Historical data is currently not available.');
    } finally {
      try {
        await AirqoApiClient(context)
            .fetchSiteHistoricalMeasurements(site)
            .then((value) => {
                  if (value.isNotEmpty)
                    {
                      if (mounted)
                        {
                          setState(() {
                            historicalData = value;
                          }),
                        },
                      DBHelper()
                          .insertSiteHistoricalMeasurements(value, site.id)
                    }
                });
      } catch (e) {
        print('Historical data is currently not available.');
      }
    }

    try {
      await AirqoApiClient(context)
          .fetchSiteHistoricalMeasurements(site)
          .then((value) => {
                if (value.isNotEmpty)
                  {
                    if (mounted)
                      {
                        setState(() {
                          historicalData = value;
                        }),
                      },
                  }
              });
    } catch (e) {
      print('Historical data is currently not available.');
    }
  }

  Future<void> getLocationMeasurements() async {
    try {
      await Settings().dashboardMeasurement().then((value) => {
            if (value != null)
              {
                if (mounted)
                  {
                    setState(() {
                      measurementData = value;
                    }),
                    getLocationHistoricalMeasurements(value.site),
                    // getLocationForecastMeasurements(value.site),
                    updateCurrentLocation()
                  },
              }
            else
              {}
          });
    } catch (e) {
      print('error getting data : $e');
    }
  }

  void getStories() {
    DBHelper().getStories().then((value) => {
          if (mounted)
            {
              setState(() {
                stories = value;
              })
            },
        });

    AirqoApiClient(context).fetchLatestStories().then((value) => {
          if (mounted && stories.isEmpty)
            {
              setState(() {
                stories = value;
              })
            },
          DBHelper().insertLatestStories(value)
        });
  }

  Future<void> initialize() async {
    getStories();
    await getLocationMeasurements();
  }

  @override
  void initState() {
    super.initState();
    initialize();
  }

  int pickStory(int size) {
    var random = Random();
    var index = 0 + random.nextInt(size - 0);
    if (featuredStory == null) {
      setState(() {
        featuredStory = index;
      });
    } else {
      return featuredStory;
    }
    return index;
  }

  Widget tipsSection(Story story) {
    return Container(
      padding: const EdgeInsets.fromLTRB(10.0, 8.0, 8.0, 8.0),
      decoration: const BoxDecoration(
          color: Colors.white,
          borderRadius: BorderRadius.all(Radius.circular(5.0))),
      child: Row(
        crossAxisAlignment: CrossAxisAlignment.center,
        children: [
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text('${story.title}',
                    maxLines: 2,
                    overflow: TextOverflow.ellipsis,
                    style: const TextStyle(
                      fontSize: 18,
                      fontWeight: FontWeight.bold,
                    )),
                const SizedBox(
                  height: 20,
                ),
                GestureDetector(
                  onTap: () {},
                  child: Container(
                    height: 24,
                    width: 60,
                    decoration: BoxDecoration(
                      color: ColorConstants.appColorBlue.withOpacity(0.2),
                      borderRadius:
                          const BorderRadius.all(Radius.circular(5.0)),
                    ),
                    child: Center(
                      child: Text('Read',
                          style: TextStyle(
                            color: ColorConstants.appColorBlue,
                            fontSize: 12,
                          )),
                    ),
                  ),
                ),
              ],
            ),
          ),
          const SizedBox(
            width: 16,
          ),
          ClipRRect(
            borderRadius: BorderRadius.circular(5.0),
            child: CachedNetworkImage(
              width: 104,
              height: 104,
              fit: BoxFit.cover,
              placeholder: (context, url) => const SizedBox(
                height: 20.0,
                width: 20.0,
                child: Center(
                  child: CircularProgressIndicator(
                    strokeWidth: 4,
                  ),
                ),
              ),
              imageUrl: '${story.thumbnail}',
              errorWidget: (context, url, error) => Icon(
                Icons.error_outline,
                color: ColorConstants.red,
              ),
            ),
          ),
        ],
      ),
    );
  }

  Widget topBar() {
    return Container(
      child: Row(
        crossAxisAlignment: CrossAxisAlignment.center,
        mainAxisAlignment: MainAxisAlignment.center,
        children: [
          Image.asset(
            'assets/icon/transparent_logo.png',
            height: 58,
            width: 58,
          ),
          const Spacer(),
          Container(
            decoration: const BoxDecoration(
                color: Colors.white,
                shape: BoxShape.rectangle,
                borderRadius: BorderRadius.all(Radius.circular(10.0))),
            child: IconButton(
              iconSize: 30,
              icon: Icon(
                Icons.search,
                color: ColorConstants.appBarTitleColor,
              ),
              onPressed: () async {
                await Navigator.push(context,
                    MaterialPageRoute(builder: (context) {
                  return const SearchPage();
                }));
              },
            ),
          )
        ],
      ),
    );
  }

  Widget topTabs() {
    return Row(
      mainAxisAlignment: MainAxisAlignment.spaceEvenly,
      children: [
        Expanded(
            child: Container(
          padding: const EdgeInsets.all(15.0),
          decoration: const BoxDecoration(
              color: Colors.white,
              borderRadius: BorderRadius.all(Radius.circular(5.0))),
          child: GestureDetector(
            onTap: () {},
            child: Row(
              mainAxisAlignment: MainAxisAlignment.center,
              children: [
                Container(
                  height: 32,
                  width: 32,
                  decoration: BoxDecoration(
                      color: ColorConstants.appColorBlue.withOpacity(0.2),
                      shape: BoxShape.circle),
                  child: Icon(
                    Icons.add,
                    color: ColorConstants.appColorBlue,
                    size: 17,
                  ),
                ),
                const SizedBox(
                  width: 8,
                ),
                Text(
                  'Favorite',
                  style: TextStyle(
                    color: ColorConstants.appColorBlue,
                  ),
                )
              ],
            ),
          ),
        )),
        const SizedBox(
          width: 16,
        ),
        Expanded(
            child: Container(
          padding: const EdgeInsets.all(15.0),
          decoration: const BoxDecoration(
              color: Colors.white,
              borderRadius: BorderRadius.all(Radius.circular(5.0))),
          child: GestureDetector(
            onTap: () {},
            child: Row(
              mainAxisAlignment: MainAxisAlignment.center,
              children: [
                Container(
                  height: 32,
                  width: 32,
                  decoration: BoxDecoration(
                      color: ColorConstants.appColorBlue.withOpacity(0.2),
                      shape: BoxShape.circle),
                  child: Icon(
                    Icons.add,
                    color: ColorConstants.appColorBlue,
                    size: 17,
                  ),
                ),
                const SizedBox(
                  width: 8,
                ),
                Text(
                  'For you',
                  style: TextStyle(
                    color: ColorConstants.appColorBlue,
                  ),
                )
              ],
            ),
          ),
        )),
      ],
    );
  }

  void updateCurrentLocation() async {
    try {
      var prefs = await SharedPreferences.getInstance();
      var dashboardSite = prefs.getString(PrefConstant.dashboardSite) ?? '';

      if (dashboardSite == '') {
        await LocationApi().getCurrentLocationReadings().then((value) => {
              if (value != null)
                {
                  prefs.setStringList(PrefConstant.lastKnownLocation,
                      ['${value.site.getUserLocation()}', '${value.site.id}']),
                  if (mounted)
                    {
                      setState(() {
                        measurementData = value;
                      }),
                      getLocationHistoricalMeasurements(value.site),
                      // getLocationForecastMeasurements(value.site),
                    }
                },
            });
      }
    } catch (e) {}
  }

  Future<void> updateLocationMeasurements() async {
    var prefs = await SharedPreferences.getInstance();
    var dashboardMeasurement =
        prefs.getString(PrefConstant.dashboardSite) ?? '';
    if (dashboardMeasurement != '') {}
    try {
      await Settings().dashboardMeasurement().then((value) => {
            if (value != null)
              {
                if (mounted)
                  {
                    setState(() {
                      measurementData = value;
                    }),
                    getLocationHistoricalMeasurements(value.site),
                    // getLocationForecastMeasurements(value.site),
                  },
              }
          });
    } catch (e) {
      print('error getting data');
    }
  }
}
