import 'dart:math';

import 'package:app/constants/app_constants.dart';
import 'package:app/models/historicalMeasurement.dart';
import 'package:app/models/predict.dart';
import 'package:app/models/site.dart';
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
            foregroundPainter:
                new MyPainter(completeColor: color, width: width),
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
    Paint complete = new Paint()
      ..color = completeColor
      ..strokeCap = StrokeCap.round
      ..style = PaintingStyle.stroke
      ..strokeWidth = width;

    Offset center = new Offset(size.width / 2, size.height / 2);
    double radius = min(size.width / 2, size.height / 2);
    var percent = (size.width * 0.001) / 2;

    double arcAngle = 2 * pi * percent;
    print("$radius - radius");
    print("$arcAngle - arcAngle");
    print("${radius / arcAngle} - divider");

    for (var i = 0; i < 8; i++) {
      var init = (-pi / 2) * (i / 2);

      canvas.drawArc(new Rect.fromCircle(center: center, radius: radius), init,
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

  @override
  Widget build(BuildContext context) {
    return Container(
        color: ColorConstants.appBodyColor,
        child: RefreshIndicator(
            onRefresh: initialize,
            color: ColorConstants.appColor,
            child: Padding(
              padding: EdgeInsets.fromLTRB(16.0, 37, 16.0, 16.0),
              child: Column(
                mainAxisSize: MainAxisSize.min,
                crossAxisAlignment: CrossAxisAlignment.start,
                children: <Widget>[
                  Expanded(
                    child: ListView(
                      shrinkWrap: true,
                      children: <Widget>[
                        topBar(),
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
                            color: Colors.black.withOpacity(0.4),
                            fontSize: 10,
                          ),
                        ),
                        const Text(
                          'Daily Forecast',
                          style: TextStyle(
                            color: Colors.black,
                            fontWeight: FontWeight.bold,
                            fontSize: 20,
                          ),
                        ),
                        const SizedBox(
                          height: 12,
                        ),
                        GestureDetector(
                          onTap: () {
                            Navigator.push(context,
                                new MaterialPageRoute(builder: (context) {
                              return PlaceView();
                            }));
                          },
                          child: ReadingsCard(),
                        ),
                        const SizedBox(
                          height: 16,
                        ),
                        tipsSection(),
                        // CurrentLocationCard(
                        //     measurementData: measurementData,
                        //     historicalData: historicalData,
                        //     forecastData: forecastData),
                      ],
                    ),
                  ),
                ],
              ),
            )));
  }

  void getLocationForecastMeasurements(Site site) async {
    try {
      await DBHelper().getForecastMeasurements(site.id).then((value) => {
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
        await AirqoApiClient(context).fetchForecast(site).then((value) => {
              if (value.isNotEmpty)
                {
                  if (mounted)
                    {
                      setState(() {
                        forecastData = value;
                      }),
                    },
                  DBHelper().insertForecastMeasurements(value, site.id)
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
            .fetchSiteHistoricalMeasurementsById(site.id)
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
          .fetchSiteHistoricalMeasurementsById(site.id)
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
                    getLocationForecastMeasurements(value.site),
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

  Future<void> initialize() async {
    await getLocationMeasurements();
  }

  @override
  void initState() {
    // initialize();
    super.initState();
  }

  Widget tipsSection() {
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
                Text(
                    'Your Inflated tires could lead air pollution lead air pollution lead air pollution',
                    maxLines: 2,
                    overflow: TextOverflow.ellipsis,
                    style: TextStyle(
                      fontSize: 14,
                      fontWeight: FontWeight.bold,
                    )),
                GestureDetector(
                  onTap: () {},
                  child: Text('Read full story',
                      style: TextStyle(
                        color: ColorConstants.appColorBlue,
                        fontSize: 8,
                      )),
                ),
              ],
            ),
          ),
          SizedBox(
            width: 17,
          ),
          ClipRRect(
            borderRadius: BorderRadius.circular(5.0),
            child: CachedNetworkImage(
              width: 104,
              height: 56,
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
              imageUrl:
                  'https://miro.medium.com/max/1400/1*Q3eBVHmv1uW4397gjwa_Fg.jpeg',
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
            'assets/icon/airqo_logo.png',
            height: 58,
            width: 58,
          ),
          Spacer(),
          Container(
            padding: EdgeInsets.all(2.0),
            decoration: BoxDecoration(
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
                // await showSearch(
                //   context: context,
                //   delegate: LocationSearch(),
                // ).then((_) {
                //   setState(() {});
                // });
              },
            ),
          )
          // AspectRatio(
          //     aspectRatio: 1.0,
          //     child: Container(
          //       padding: EdgeInsets.all(2.0),
          //       decoration: BoxDecoration(
          //           color: Colors.white,
          //           shape: BoxShape.rectangle,
          //           borderRadius: BorderRadius.all(Radius.circular(10.0))
          //       ),
          //       child: IconButton(
          //         iconSize: 30,
          //         icon: Icon(
          //           Icons.search,
          //           color: ColorConstants.appBarTitleColor,
          //         ),
          //         onPressed: () async {
          //           await showSearch(
          //             context: context,
          //             delegate: LocationSearch(),
          //           ).then((_) {
          //             setState(() {});
          //           });
          //         },
          //       ),
          //     )
          // )
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
          padding: EdgeInsets.all(15.0),
          decoration: BoxDecoration(
              color: Colors.white,
              borderRadius: BorderRadius.all(Radius.circular(5.0))),
          child: GestureDetector(
            onTap: () {},
            child: Row(
              mainAxisAlignment: MainAxisAlignment.center,
              children: [
                Container(

                ),
                SizedBox(
                  width: 8,
                ),
                const Text('Favorite')
              ],
            ),
          ),
        )),
        SizedBox(
          width: 16,
        ),
        Expanded(
            child: Container(
          padding: EdgeInsets.all(15.0),
          decoration: BoxDecoration(
              color: Colors.white,
              borderRadius: BorderRadius.all(Radius.circular(5.0))),
          child: GestureDetector(
            onTap: () {},
            child: Row(
              mainAxisAlignment: MainAxisAlignment.center,
              children: [
                CircularBorder(),
                SizedBox(
                  width: 8,
                ),
                const Text('For you')
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
                      getLocationForecastMeasurements(value.site),
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
                    getLocationForecastMeasurements(value.site),
                  },
              }
          });
    } catch (e) {
      print('error getting data');
    }
  }
}
