import 'dart:math';

import 'package:app/constants/app_constants.dart';
import 'package:app/models/historicalMeasurement.dart';
import 'package:app/models/measurement.dart';
import 'package:app/models/predict.dart';
import 'package:app/models/site.dart';
import 'package:app/models/story.dart';
import 'package:app/screens/search_page.dart';
import 'package:app/services/fb_notifications.dart';
import 'package:app/services/local_storage.dart';
import 'package:app/services/native_api.dart';
import 'package:app/services/rest_api.dart';
import 'package:app/utils/date.dart';
import 'package:app/utils/pm.dart';
import 'package:app/utils/settings.dart';
import 'package:app/widgets/analytics_card.dart';
import 'package:app/widgets/custom_shimmer.dart';
import 'package:app/widgets/readings_card.dart';
import 'package:cached_network_image/cached_network_image.dart';
import 'package:firebase_auth/firebase_auth.dart';
import 'package:flutter/material.dart';
import 'package:shared_preferences/shared_preferences.dart';
import 'package:url_launcher/url_launcher.dart';

import 'insights_view.dart';

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
  var favouritePlaces = <Measurement>[];
  var forecastData = <Predict>[];
  var stories = <Story>[];
  var featuredStory;
  var storyIsSet = false;
  var greetings = '';

  final CustomAuth _customAuth = CustomAuth(FirebaseAuth.instance);

  @override
  Widget build(BuildContext context) {
    return Container(
        color: ColorConstants.appBodyColor,
        child: RefreshIndicator(
            onRefresh: initialize,
            color: ColorConstants.appColor,
            child: Padding(
              padding: const EdgeInsets.only(left: 16.0, right: 16.0, top: 46),
              child: Column(
                // mainAxisSize: MainAxisSize.min,
                crossAxisAlignment: CrossAxisAlignment.start,
                children: <Widget>[
                  topBar(),
                  Expanded(
                    child: _dashboardItems(),
                  ),
                ],
              ),
            )));
  }

  void getFavouritePlaces() {
    DBHelper().getFavouritePlaces().then((value) => {
          if (mounted)
            {
              setState(() {
                favouritePlaces = value;
              })
            }
        });
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
    setGreetings();
    getStories();
    _getLatestMeasurements();
    await getLocationMeasurements();
    getFavouritePlaces();
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

  void setGreetings() {
    setState(() {
      greetings = getGreetings(_customAuth.getDisplayName());
    });
  }

  List<Widget> showFavourites() {
    var widgets = <Widget>[];
    for (var index = 2; index >= 0; index--) {
      var padding = 0.0;
      if (index == 1) {
        padding = 7;
      }
      if (index == 2) {
        padding = 14;
      }
      try {
        widgets.add(Positioned(
            left: padding,
            child: Container(
              height: 32.0,
              width: 32.0,
              padding: const EdgeInsets.all(2.0),
              decoration: BoxDecoration(
                border: Border.all(color: Colors.white, width: 2),
                color: pm2_5ToColor(favouritePlaces[index].getPm2_5Value()),
                shape: BoxShape.circle,
              ),
            )));
      } catch (e) {}
    }
    return widgets;
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
                  onTap: () {
                    _launchURL(story.link);
                  },
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
        children: [
          Image.asset(
            'assets/icon/transparent_logo.png',
            height: 40,
            width: 58,
          ),
          const Spacer(),
          Container(
            height: 40,
            width: 40,
            decoration: const BoxDecoration(
                color: Colors.white,
                shape: BoxShape.rectangle,
                borderRadius: BorderRadius.all(Radius.circular(10.0))),
            child: IconButton(
              iconSize: 24,
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
            child: Tooltip(
          margin: const EdgeInsets.only(top: 10),
          padding: const EdgeInsets.all(5.0),
          decoration: BoxDecoration(
              color: ColorConstants.appColorBlue,
              borderRadius: BorderRadius.circular(4.0)),
          message: 'You will find all locations added to\nfavorite here.'
              ' Click to add favorite!',
          textStyle: const TextStyle(fontSize: 6, color: Colors.white),
          triggerMode: TooltipTriggerMode.tap,
          child: Container(
            padding: const EdgeInsets.all(15.0),
            decoration: const BoxDecoration(
                color: Colors.white,
                borderRadius: BorderRadius.all(Radius.circular(5.0))),
            child: Row(
              mainAxisAlignment: MainAxisAlignment.center,
              children: [
                if (favouritePlaces.isEmpty)
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
                if (favouritePlaces.isNotEmpty)
                  Container(
                    height: 32,
                    width: 44,
                    child: Stack(
                      children: showFavourites(),
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
            child: Tooltip(
          margin: const EdgeInsets.only(top: 10),
          padding: const EdgeInsets.all(5.0),
          decoration: BoxDecoration(
              color: ColorConstants.appColorBlue,
              borderRadius: BorderRadius.circular(4.0)),
          message: 'You will find all location suggestions\n'
              'and information here. ',
          textStyle: const TextStyle(
            fontSize: 6,
            color: Colors.white,
          ),
          triggerMode: TooltipTriggerMode.tap,
          child: Container(
            padding: const EdgeInsets.all(15.0),
            decoration: const BoxDecoration(
                color: Colors.white,
                borderRadius: BorderRadius.all(Radius.circular(5.0))),
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
                  'For You',
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
        await LocationService().getCurrentLocationReadings().then((value) => {
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

  Widget _dashboardItems() {
    return MediaQuery.removePadding(
        context: context,
        removeTop: true,
        child: ListView(
          controller: ScrollController(),
          shrinkWrap: true,
          children: <Widget>[
            const SizedBox(
              height: 20,
            ),
            Text(
              greetings,
              style: const TextStyle(fontSize: 24, fontWeight: FontWeight.bold),
            ),
            const SizedBox(
              height: 16,
            ),
            topTabs(),
            const SizedBox(
              height: 25,
            ),
            Text(
              getDateTime(),
              style: TextStyle(
                color: Colors.black.withOpacity(0.6),
                fontSize: 12,
              ),
            ),
            const Text(
              'Current air quality',
              style: TextStyle(
                color: Colors.black,
                fontWeight: FontWeight.bold,
                fontSize: 24,
              ),
            ),
            const SizedBox(
              height: 12,
            ),
            if (measurementData != null)
              GestureDetector(
                onTap: () {
                  Navigator.push(context, MaterialPageRoute(builder: (context) {
                    return InsightsView(measurementData.site);
                  }));
                },
                child: AnalyticsCard(measurementData),
              ),
            if (measurementData == null) loadingAnimation(200.0),
            const SizedBox(
              height: 16,
            ),
            if (stories.isNotEmpty)
              tipsSection(stories[pickStory(stories.length)]),
            if (stories.isEmpty) loadingAnimation(100.0),
            const SizedBox(
              height: 12,
            ),
          ],
        ));
  }

  void _getLatestMeasurements() async {
    await AirqoApiClient(context).fetchLatestMeasurements().then((value) => {
          if (value.isNotEmpty) {DBHelper().insertLatestMeasurements(value)}
        });
  }

  Future<void> _launchURL(String url) async {
    try {
      await canLaunch(url)
          ? await launch(url)
          : throw Exception('Could not launch $url, try opening $url');
    } catch (e) {
      print(e);
    }
  }
}
