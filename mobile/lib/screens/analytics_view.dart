import 'package:app/constants/config.dart';
import 'package:app/models/measurement.dart';
import 'package:app/models/place_details.dart';
import 'package:app/widgets/custom_shimmer.dart';
import 'package:app/widgets/favourite_place_card.dart';
import 'package:flutter/cupertino.dart';

import '../services/app_service.dart';

class AnalyticsView extends StatefulWidget {
  const AnalyticsView({Key? key}) : super(key: key);

  @override
  _AnalyticsViewState createState() => _AnalyticsViewState();
}

class _AnalyticsViewState extends State<AnalyticsView> {
  late AppService _appService;
  List<Measurement> _places = [];

  @override
  Widget build(BuildContext context) {
    return Container(
        color: Config.appBodyColor,
        child: _places.isEmpty
            ? ListView.builder(
                itemBuilder: (BuildContext context, int index) {
                  return Padding(
                    padding: const EdgeInsets.symmetric(vertical: 15),
                    child:
                        containerLoadingAnimation(height: 120.0, radius: 16.0),
                  );
                },
                itemCount: 5,
              )
            : refreshIndicator(
                sliverChildDelegate:
                    SliverChildBuilderDelegate((context, index) {
                  return MiniAnalyticsCard(
                      PlaceDetails.measurementToPLace(_places[index]));
                }, childCount: _places.length),
                onRefresh: _initialize));
  }

  @override
  void initState() {
    super.initState();
    _appService = AppService(context);
    _initialize();
  }

  Future<void> _initialize() async {
    var places = await _appService.dbHelper.getLatestMeasurements();
    setState(() {
      _places = places;
    });
  }
}
