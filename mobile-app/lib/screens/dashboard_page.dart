import 'package:app/config/languages/CustomLocalizations.dart';
import 'package:app/config/providers/LocalProvider.dart';
import 'package:app/constants/app_constants.dart';
import 'package:app/models/measurement.dart';
import 'package:app/screens/place_details.dart';
import 'package:app/utils/services/local_storage.dart';
import 'package:app/utils/ui/dialogs.dart';
import 'package:app/widgets/air_quality_nav.dart';
import 'package:flutter/material.dart';

class DashboardPage extends StatefulWidget {
  const DashboardPage({Key? key}) : super(key: key);

  @override
  _DashboardPageState createState() => _DashboardPageState();
}

class _DashboardPageState extends State<DashboardPage> {
  var results;

  @override
  Widget build(BuildContext context) {
    return Container(
        child: Padding(
            padding: const EdgeInsets.fromLTRB(6, 6, 6, 6),
            child: FutureBuilder(
                future: DBHelper().getFavouritePlaces(),
                builder: (context, snapshot) {
                  if (snapshot.hasData) {
                    results = snapshot.data as List<Measurement>;

                    if (results.isEmpty) {
                      return Center(
                        child: Container(
                          padding: const EdgeInsets.all(16.0),
                          child: const Text(
                            'You haven\'t added any locations you care about '
                            'to MyPlaces yet, search here or use the map '
                            'to add them to your list',
                            softWrap: true,
                            textAlign: TextAlign.center,
                            style: TextStyle(
                              color: appColor,
                            ),
                          ),
                          // child: Column(
                          //   children: [
                          //     Text(
                          //       CustomLocalizations.of(context)!.title,
                          //     ),
                          //     ElevatedButton(
                          //       onPressed: (){
                          //         LocaleProvider().setLocale(const Locale('lg'));
                          //
                          //       },
                          //       child: const Text('Press Me!'),
                          //     )
                          //   ],
                          // )
                        ),
                      );
                    }

                    return RefreshIndicator(
                      onRefresh: refreshData,
                      child: ListView.builder(
                        itemBuilder: (context, index) =>
                            InkWell(
                              onTap: () async {
                                try {
                                  var device =
                                      await DBHelper().getDevice(results[index].locationDetails.channelID);

                                  await Navigator.push(context,
                                      MaterialPageRoute(builder: (context) {
                                        return PlaceDetailsPage(device: device);
                                      })).then((value) => setState(() {
                                      }));
                                } catch (e) {
                                  print(e);
                                  await showSnackBar(context,
                                      'Information not available. Try again later');
                                }
                              },
                              child: AirQualityCard(data: results[index]),
                            ),
                        itemCount: results.length,
                      ),
                    );
                  } else {
                    return const Center(
                      child: CircularProgressIndicator(),
                    );
                    // return Center( child: Container(
                    //   padding: const EdgeInsets.all(16.0),
                    //   child: const Text('Loading...'),
                    // ));
                  }
                })));
  }

  Future<void> refreshData() async {
    var data = DBHelper().getFavouritePlaces();

    setState(() {
      results = data;
    });
  }
}
