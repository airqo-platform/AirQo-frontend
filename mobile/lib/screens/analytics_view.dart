import 'package:app/constants/config.dart';
import 'package:app/models/measurement.dart';
import 'package:app/models/place_details.dart';
import 'package:app/widgets/custom_shimmer.dart';
import 'package:app/widgets/favourite_place_card.dart';
import 'package:flutter/cupertino.dart';

import '../services/app_service.dart';
import '../widgets/custom_widgets.dart';

class AnalyticsView extends StatefulWidget {
  const AnalyticsView({Key? key}) : super(key: key);

  @override
  _AnalyticsViewState createState() => _AnalyticsViewState();
}

class _AnalyticsViewState extends State<AnalyticsView> {
  final AppService _appService = AppService();
  List<Measurement> _places = [];

  @override
  Widget build(BuildContext context) {
    return Container(
        color: Config.appBodyColor,
        child: _places.isEmpty
            ? ListView.builder(
                itemBuilder: (BuildContext context, int index) {
                  return const Padding(
                    padding: EdgeInsets.symmetric(vertical: 15),
                    child:
                        ContainerLoadingAnimation(height: 120.0, radius: 16.0),
                  );
                },
                itemCount: 5,
              )
            : refreshIndicator(
                sliverChildDelegate:
                    SliverChildBuilderDelegate((context, index) {
                  return Padding(
                      padding: EdgeInsets.only(
                          top: Config.refreshIndicatorPadding(index)),
                      child: MiniAnalyticsCard(
                          PlaceDetails.measurementToPLace(_places[index])));
                }, childCount: _places.length),
                onRefresh: _refresh));
  }

  @override
  void initState() {
    super.initState();
    _initialize();
  }

  Future<void> _refresh() async {
    await _appService.refreshAnalytics(context).then((value) => _initialize());
  }

  Future<void> _initialize() async {
    var places = await _appService.dbHelper.getLatestMeasurements();
    setState(() {
      _places = places;
    });
  }
}
