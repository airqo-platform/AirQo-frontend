import 'package:app/constants/app_constants.dart';
import 'package:app/models/insights_chart_data.dart';
import 'package:app/models/place_details.dart';
import 'package:app/services/local_storage.dart';
import 'package:app/utils/pm.dart';
import 'package:app/utils/share.dart';
import 'package:app/widgets/recomendation.dart';
import 'package:flutter/material.dart';
import 'package:flutter_svg/svg.dart';
import 'package:lottie/lottie.dart';
import 'package:provider/provider.dart';

import 'custom_widgets.dart';
import 'insights_card.dart';

class DailyView extends StatefulWidget {
  final PlaceDetails placeDetails;
  final bool daily;

  const DailyView(this.placeDetails, this.daily, {Key? key}) : super(key: key);

  @override
  _DailyViewState createState() => _DailyViewState();
}

class _DailyViewState extends State<DailyView> {
  String viewDay = 'today';
  String pollutant = '';
  bool pm10 = false;
  bool pm2_5 = true;
  bool showHeartAnimation = false;
  final DBHelper _dbHelper = DBHelper();
  List<Recommendation> _recommendations = [];
  final GlobalKey _globalKey = GlobalKey();

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
            Padding(
              padding: const EdgeInsets.only(right: 16, left: 16),
              child: Row(
                mainAxisAlignment: MainAxisAlignment.spaceBetween,
                children: [
                  Text(
                    'AIR QUALITY'.toUpperCase(),
                    style: TextStyle(
                        fontSize: 12, color: Colors.black.withOpacity(0.3)),
                  ),
                  Visibility(
                    visible: false,
                    child: GestureDetector(
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
                    ),
                  )
                ],
              ),
            ),
            const SizedBox(
              height: 20,
            ),
            Padding(
              padding: const EdgeInsets.only(right: 16, left: 16),
              child: RepaintBoundary(
                key: _globalKey,
                child: getCard(),
              ),
            ),
            const SizedBox(
              height: 16,
            ),
            Padding(
              padding: const EdgeInsets.only(right: 16, left: 16),
              child: Container(
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
                        shareGraph(context, _globalKey, widget.placeDetails);
                      },
                      child: iconTextButton(
                          SvgPicture.asset(
                            'assets/icon/share_icon.svg',
                            semanticsLabel: 'Share',
                            color: ColorConstants.greyColor,
                          ),
                          'Share'),
                    ),
                    const SizedBox(
                      width: 60,
                    ),
                    Consumer<PlaceDetailsModel>(
                      builder: (context, placeDetailsModel, child) {
                        return GestureDetector(
                          onTap: () async {
                            updateFavPlace();
                          },
                          child: iconTextButton(getHeartIcon(), 'Favorite'),
                        );
                      },
                    ),
                  ],
                ),
              ),
            ),
            const SizedBox(
              height: 36,
            ),
            if (viewDay == 'today' || viewDay == 'tomorrow')
              Padding(
                padding: const EdgeInsets.only(right: 16, left: 16),
                child: Visibility(
                  visible: _recommendations.isNotEmpty,
                  child: Text(
                    viewDay == 'today'
                        ? 'Today’s health tips'
                        : 'Tomorrow’s health tips',
                    textAlign: TextAlign.left,
                    style: const TextStyle(
                        fontSize: 20, fontWeight: FontWeight.bold),
                  ),
                ),
              ),
            const SizedBox(
              height: 11,
            ),
            Visibility(
              visible: viewDay == 'today' || viewDay == 'tomorrow',
              child: SizedBox(
                height: 128,
                child: ListView.builder(
                  scrollDirection: Axis.horizontal,
                  itemBuilder: (context, index) {
                    if (index == 0) {
                      return Padding(
                        padding: const EdgeInsets.only(left: 16.0, right: 8.0),
                        child: recommendationContainer(
                            _recommendations[index], context),
                      );
                    } else if (index == (_recommendations.length - 1)) {
                      return Padding(
                        padding: const EdgeInsets.only(left: 8.0, right: 16.0),
                        child: recommendationContainer(
                            _recommendations[index], context),
                      );
                    } else {
                      return Padding(
                        padding: const EdgeInsets.only(left: 8.0, right: 8.0),
                        child: recommendationContainer(
                            _recommendations[index], context),
                      );
                    }
                  },
                  itemCount: _recommendations.length,
                ),
              ),
            ),
            const SizedBox(
              height: 11,
            ),
          ],
        ));
  }

  void callBackFn(InsightsChartData insightsChartData) {
    var time = insightsChartData.time;
    var tomorrow = DateTime.now().add(const Duration(days: 1));
    if (insightsChartData.available) {
      setState(() {
        _recommendations = getHealthRecommendations(insightsChartData.value);
      });
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
    } else {
      setState(() {
        viewDay = '';
        _recommendations = [];
      });
    }
  }

  Widget getCard() {
    if (pm2_5) {
      return InsightsCard(
          widget.placeDetails, callBackFn, 'pm2.5', widget.daily);
    }
    return InsightsCard(widget.placeDetails, callBackFn, 'pm10', widget.daily);
  }

  Widget getHeartIcon() {
    if (showHeartAnimation) {
      return SizedBox(
        height: 16.67,
        width: 16.67,
        child: Lottie.asset('assets/lottie/animated_heart.json',
            repeat: false, reverse: false, animate: true, fit: BoxFit.cover),
      );
    }

    return Consumer<PlaceDetailsModel>(
      builder: (context, placeDetailsModel, child) {
        if (PlaceDetails.isFavouritePlace(
            placeDetailsModel.favouritePlaces, widget.placeDetails)) {
          return SvgPicture.asset(
            'assets/icon/heart.svg',
            semanticsLabel: 'Favorite',
            height: 16.67,
            width: 16.67,
          );
        }
        return SvgPicture.asset(
          'assets/icon/heart_dislike.svg',
          semanticsLabel: 'Favorite',
          height: 16.67,
          width: 16.67,
        );
      },
    );
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

  void updateFavPlace() async {
    setState(() {
      showHeartAnimation = true;
    });
    Future.delayed(const Duration(seconds: 2), () async {
      setState(() {
        showHeartAnimation = false;
      });
    });
    await _dbHelper.updateFavouritePlaces(widget.placeDetails, context);
  }
}
