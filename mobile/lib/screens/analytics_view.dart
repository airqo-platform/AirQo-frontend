import 'package:app/constants/config.dart';
import 'package:app/models/measurement.dart';
import 'package:app/models/place_details.dart';
import 'package:app/services/local_storage.dart';
import 'package:app/widgets/custom_shimmer.dart';
import 'package:app/widgets/favourite_place_card.dart';
import 'package:flutter/material.dart';

class AnalyticsView extends StatefulWidget {
  const AnalyticsView({Key? key}) : super(key: key);

  @override
  _AnalyticsViewState createState() => _AnalyticsViewState();
}

class _AnalyticsViewState extends State<AnalyticsView> {
  var _favouritePlaces = <Measurement>[];
  final DBHelper _dbHelper = DBHelper();

  @override
  Widget build(BuildContext context) {
    return Container(
        color: Config.appBodyColor,
        child: FutureBuilder(
            future: _dbHelper.getLatestMeasurements(),
            builder: (context, snapshot) {
              if (snapshot.hasData) {
                _favouritePlaces = snapshot.data as List<Measurement>;

                if (_favouritePlaces.isEmpty) {
                  return Center(
                    child: Container(
                      padding: const EdgeInsets.all(16.0),
                      child: OutlinedButton(
                        onPressed: () async {},
                        style: OutlinedButton.styleFrom(
                          shape: const CircleBorder(),
                          padding: const EdgeInsets.all(24),
                        ),
                        child: Text(
                          'No analytics at the moment',
                          style: TextStyle(color: Config.appColor),
                        ),
                      ),
                    ),
                  );
                }

                return RefreshIndicator(
                  color: Config.appColorBlue,
                  onRefresh: refreshData,
                  child: ListView.builder(
                    itemBuilder: (context, index) => MiniAnalyticsCard(
                        PlaceDetails.measurementToPLace(
                            _favouritePlaces[index])),
                    itemCount: _favouritePlaces.length,
                  ),
                );
              } else {
                return ListView(
                  children: [
                    const SizedBox(
                      height: 10,
                    ),
                    containerLoadingAnimation(120.0, 16.0),
                    const SizedBox(
                      height: 15,
                    ),
                    containerLoadingAnimation(120.0, 16.0),
                    const SizedBox(
                      height: 15,
                    ),
                    containerLoadingAnimation(120.0, 16.0),
                    const SizedBox(
                      height: 15,
                    ),
                    containerLoadingAnimation(120.0, 16.0),
                  ],
                );
              }
            }));
  }

  Future<void> refreshData() async {
    await _dbHelper.getLatestMeasurements().then((value) => {
          if (mounted)
            {
              setState(() {
                _favouritePlaces = value;
              })
            }
        });
  }
}
