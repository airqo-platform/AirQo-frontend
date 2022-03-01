import 'package:app/constants/config.dart';
import 'package:app/models/place_details.dart';
import 'package:app/screens/search_page.dart';
import 'package:app/services/app_service.dart';
import 'package:app/widgets/custom_widgets.dart';
import 'package:app/widgets/favourite_place_card.dart';
import 'package:flutter/material.dart';
import 'package:provider/provider.dart';

class FavouritePlaces extends StatefulWidget {
  const FavouritePlaces({Key? key}) : super(key: key);

  @override
  _FavouritePlacesState createState() => _FavouritePlacesState();
}

class _FavouritePlacesState extends State<FavouritePlaces> {
  late AppService _appService;

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: appTopBar(context, 'Favorites'),
      body: Container(
          color: Config.appBodyColor,
          child: Consumer<PlaceDetailsModel>(
            builder: (context, placeDetailsModel, child) {
              if (placeDetailsModel.favouritePlaces.isEmpty) {
                return emptyPlaces();
              }

              return RefreshIndicator(
                color: Config.appColorBlue,
                onRefresh: refreshData,
                child: ListView.builder(
                  itemBuilder: (context, index) => Padding(
                    padding: const EdgeInsets.only(left: 16, right: 16),
                    child: MiniAnalyticsCard(
                        placeDetailsModel.favouritePlaces[index]),
                  ),
                  itemCount: placeDetailsModel.favouritePlaces.length,
                ),
              );
            },
          )),
    );
  }

  Widget emptyPlaces() {
    return Container(
      color: Config.appBodyColor,
      child: Container(
        padding: const EdgeInsets.all(40.0),
        child: Column(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            const Text(
              'Empty in favourite places',
              softWrap: true,
              textAlign: TextAlign.center,
              style: TextStyle(fontSize: 20),
            ),
            const SizedBox(
              height: 10,
            ),
            const Text(
              'Add places of interest using the AirQo map '
              'or search',
              softWrap: true,
              textAlign: TextAlign.center,
            ),
            const SizedBox(
              height: 10,
            ),
            OutlinedButton(
              onPressed: () async {
                await Navigator.push(context,
                    MaterialPageRoute(builder: (context) {
                  return const SearchPage();
                }));
              },
              style: OutlinedButton.styleFrom(
                shape: const CircleBorder(),
                padding: const EdgeInsets.all(24),
              ),
              child: Text(
                'Add',
                style: TextStyle(color: Config.appColor),
              ),
            )
          ],
        ),
      ),
    );
  }

  Future<void> initialize() async {
    await _appService.fetchFavPlacesInsights();
  }

  @override
  void initState() {
    super.initState();
    _appService = AppService(context);
    initialize();
  }

  Future<void> refreshData() async {
    await Provider.of<PlaceDetailsModel>(context, listen: false)
        .reloadFavouritePlaces();
    await initialize();
  }
}
