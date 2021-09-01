import 'package:app/constants/app_constants.dart';
import 'package:app/models/measurement.dart';
import 'package:app/screens/place_details.dart';
import 'package:app/services/local_storage.dart';
import 'package:app/services/rest_api.dart';
import 'package:app/utils/dialogs.dart';
import 'package:app/widgets/air_quality_nav.dart';
import 'package:flutter/material.dart';
import 'package:shared_preferences/shared_preferences.dart';

class DashboardPage extends StatefulWidget {
  @override
  _DashboardPageState createState() => _DashboardPageState();
}

class _DashboardPageState extends State<DashboardPage> {
  List<Measurement> results = [];
  bool hasFavPlaces = true;
  String error = '';

  @override
  Widget build(BuildContext context) {
    return Container(
        child: Padding(
            padding: const EdgeInsets.fromLTRB(6, 6, 6, 6),
            child: hasFavPlaces
                ? results.isEmpty
                    ? error == ''
                        ? Align(
                            alignment: Alignment.center,
                            child: Padding(
                              padding: const EdgeInsets.all(8),
                              child: Column(
                                mainAxisAlignment: MainAxisAlignment.center,
                                crossAxisAlignment: CrossAxisAlignment.center,
                                children: [
                                  CircularProgressIndicator(
                                    valueColor: AlwaysStoppedAnimation<Color>(
                                        ColorConstants().appColor),
                                  ),
                                  Text(
                                    'Collecting information about your places'
                                    ' Please wait...',
                                    textAlign: TextAlign.center,
                                    style: TextStyle(
                                        color: ColorConstants().appColor),
                                  )
                                ],
                              ),
                            ),
                          )
                        : Align(
                            alignment: Alignment.center,
                            child: Padding(
                              padding: const EdgeInsets.all(8),
                              child: Column(
                                mainAxisAlignment: MainAxisAlignment.center,
                                crossAxisAlignment: CrossAxisAlignment.center,
                                children: [
                                  Text(
                                    '$error',
                                    textAlign: TextAlign.center,
                                    style: TextStyle(
                                        color: ColorConstants().appColor),
                                  ),
                                  reloadButton()
                                ],
                              ),
                            ),
                          )
                    : RefreshIndicator(
                        onRefresh: reload,
                        color: ColorConstants().appColor,
                        child: ListView.builder(
                          itemBuilder: (context, index) => InkWell(
                            onTap: () async {
                              try {
                                var site = results[index].site;

                                await Navigator.push(context,
                                    MaterialPageRoute(builder: (context) {
                                  return PlaceDetailsPage(site: site);
                                })).then((value) => setState(() {}));
                              } catch (e) {
                                print(e);
                                await showSnackBar(
                                    context,
                                    'Information not available.'
                                    ' Try again later');
                              }
                            },
                            child: AirQualityCard(data: results[index]),
                          ),
                          itemCount: results.length,
                        ),
                      )
                : Container(
                    padding: const EdgeInsets.all(16.0),
                    child: Column(
                      mainAxisAlignment: MainAxisAlignment.center,
                      crossAxisAlignment: CrossAxisAlignment.center,
                      children: [
                        Text(
                          'You haven\'t added any locations you care about '
                          'to MyPlaces yet, click the search icon '
                          'or use the map to add them to your list',
                          softWrap: true,
                          textAlign: TextAlign.center,
                          style: TextStyle(
                            color: ColorConstants().appColor,
                          ),
                        ),
                        reloadButton()
                      ],
                    ),
                  )));
  }

  Future<void> initialize() async {
    var prefs = await SharedPreferences.getInstance();
    var favouritePlaces =
        prefs.getStringList(PrefConstants().favouritePlaces) ?? [];

    if (favouritePlaces.isEmpty) {
      setState(() {
        hasFavPlaces = false;
      });
    } else {
      setState(() {
        hasFavPlaces = true;
      });

      await loadFromDb();
      await reload();
    }
  }

  Future<void> reload() async {
    setState(() {
      error = '';
    });
    await loadFromDb();
    await AirqoApiClient(context).fetchLatestMeasurements().then((value) => {
          if (value.isNotEmpty)
            {
              setState(() {
                results = value;
                error = '';
              }),
              DBHelper()
                  .insertLatestMeasurements(value)
                  .then((value) => loadFromDb()),
            }
          else
            {
              if (results.isEmpty && hasFavPlaces)
                setState(() {
                  error = 'Sorry, we are not able to gather information'
                      ' about your places. Try again later';
                }),
            }
        });
  }

  Future<void> loadFromDb() async {
    await DBHelper().getFavouritePlaces().then((value) => {
          if (value.isNotEmpty)
            {
              setState(() {
                error = '';
                results = value;
              })
            }
          else
            {
              if (results.isEmpty && hasFavPlaces)
                {
                  setState(() {
                    error = 'Sorry, we are not able to gather information'
                        ' about your places. Try again later';
                  }),
                }
            }
        });
  }

  @override
  void initState() {
    initialize();
    super.initState();
  }

  RawMaterialButton reloadButton() {
    return RawMaterialButton(
      shape: RoundedRectangleBorder(
          borderRadius: BorderRadius.circular(4.0),
          side: BorderSide(color: ColorConstants().appColor, width: 1)),
      fillColor: Colors.transparent,
      elevation: 0,
      highlightElevation: 0,
      splashColor: Colors.black12,
      highlightColor: ColorConstants().appColor.withOpacity(0.4),
      onPressed: reload,
      child: Padding(
        padding: const EdgeInsets.all(4),
        child: Text(
          'Refresh',
          style: TextStyle(color: ColorConstants().appColor),
        ),
      ),
    );
  }
}
