import 'package:app/constants/app_constants.dart';
import 'package:app/models/measurement.dart';
import 'package:app/screens/search_location_page.dart';
import 'package:app/services/local_storage.dart';
import 'package:app/widgets/analytics_card.dart';
import 'package:flutter/material.dart';

class AnalyticsView extends StatefulWidget {
  const AnalyticsView({Key? key}) : super(key: key);

  @override
  _AnalyticsViewState createState() => _AnalyticsViewState();
}

class _AnalyticsViewState extends State<AnalyticsView> {
  var favouritePlaces = <Measurement>[];

  @override
  Widget build(BuildContext context) {
    return Container(
        color: ColorConstants.appBodyColor,
        child: Padding(
            padding: const EdgeInsets.fromLTRB(6, 6, 6, 6),
            child: FutureBuilder(
                future: DBHelper().getLatestMeasurements(),
                builder: (context, snapshot) {
                  if (snapshot.hasData) {
                    favouritePlaces = snapshot.data as List<Measurement>;

                    if (favouritePlaces.isEmpty) {
                      return Center(
                        child: Container(
                          padding: const EdgeInsets.all(16.0),
                          child: OutlinedButton(
                            onPressed: () async {
                              await showSearch(
                                context: context,
                                delegate: LocationSearch(),
                              ).then((_) {
                                setState(() {});
                              });
                            },
                            style: OutlinedButton.styleFrom(
                              shape: const CircleBorder(),
                              padding: const EdgeInsets.all(24),
                            ),
                            child: Text(
                              'Add',
                              style: TextStyle(color: ColorConstants.appColor),
                            ),
                          ),
                          // child: Text(
                          //   'You haven\'t added any locations you'
                          //   ' care about '
                          //   'to MyPlaces yet, use the add icon at '
                          //   'the top to add them to your list',
                          //   softWrap: true,
                          //   textAlign: TextAlign.center,
                          //   style: TextStyle(
                          //     color: ColorConstants.appColor,
                          //   ),
                          // ),
                        ),
                      );
                    }

                    return RefreshIndicator(
                      color: ColorConstants.appColor,
                      onRefresh: refreshData,
                      child: ListView.builder(
                        itemBuilder: (context, index) => Padding(
                          padding: const EdgeInsets.only(bottom: 10),
                          child: AnalyticsCard(favouritePlaces[index]),
                        ),
                        itemCount: favouritePlaces.length,
                      ),
                    );
                  } else {
                    return Center(
                      child: CircularProgressIndicator(
                        valueColor: AlwaysStoppedAnimation<Color>(
                            ColorConstants.appColor),
                      ),
                    );
                  }
                })));
  }

  Future<void> refreshData() async {
    await DBHelper().getLatestMeasurements().then((value) => {
          if (mounted)
            {
              setState(() {
                favouritePlaces = value;
              })
            }
        });
  }
}
