import 'package:app/constants/app_constants.dart';
import 'package:app/models/measurement.dart';
import 'package:app/models/place_details.dart';
import 'package:app/screens/search_page.dart';
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
  var favouritePlaces = <Measurement>[];
  TextEditingController searchController = TextEditingController();

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        centerTitle: true,
        elevation: 0,
        backgroundColor: ColorConstants.appBodyColor,
        leading: Padding(
          padding: const EdgeInsets.only(top: 6.5, bottom: 6.5, left: 16),
          child: backButton(context),
        ),
        title: const Text(
          'Favorite',
          style: TextStyle(color: Colors.black),
        ),
      ),
      body: Container(
          color: ColorConstants.appBodyColor,
          child: Consumer<PlaceDetailsModel>(
            builder: (context, placeDetailsModel, child) {
              if (placeDetailsModel.favouritePlaces.isEmpty) {
                return emptyPlaces();
              }

              return RefreshIndicator(
                color: ColorConstants.appColorBlue,
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
      color: ColorConstants.appBodyColor,
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
                style: TextStyle(color: ColorConstants.appColor),
              ),
            )
          ],
        ),
      ),
    );
  }

  Future<void> refreshData() async {
    await Provider.of<PlaceDetailsModel>(context, listen: false)
        .reloadFavouritePlaces();
  }
}
