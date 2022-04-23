import 'dart:io';

import 'package:app/constants/config.dart';
import 'package:app/models/place_details.dart';
import 'package:app/screens/search_page.dart';
import 'package:app/services/app_service.dart';
import 'package:app/widgets/custom_widgets.dart';
import 'package:app/widgets/favourite_place_card.dart';
import 'package:flutter/cupertino.dart';
import 'package:flutter/material.dart';
import 'package:flutter_svg/svg.dart';
import 'package:provider/provider.dart';

class FavouritePlaces extends StatefulWidget {
  const FavouritePlaces({Key? key}) : super(key: key);

  @override
  _FavouritePlacesState createState() => _FavouritePlacesState();
}

class _FavouritePlacesState extends State<FavouritePlaces> {
  final AppService _appService = AppService();

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

              return CustomScrollView(
                  physics:
                      Platform.isAndroid ? const BouncingScrollPhysics() : null,
                  slivers: [
                    CupertinoSliverRefreshControl(
                      refreshTriggerPullDistance: 70,
                      refreshIndicatorExtent: 60,
                      onRefresh: refreshData,
                    ),
                    SliverList(
                      delegate: SliverChildBuilderDelegate((context, index) {
                        return Padding(
                            padding: const EdgeInsets.symmetric(horizontal: 16),
                            child: MiniAnalyticsCard(
                                placeDetailsModel.favouritePlaces[index]));
                      }, childCount: placeDetailsModel.favouritePlaces.length),
                    )
                  ]);
            },
          )),
    );
  }

  Widget emptyPlaces() {
    return Container(
      color: Config.appBodyColor,
      padding: const EdgeInsets.all(40.0),
      child: Column(
        mainAxisAlignment: MainAxisAlignment.center,
        children: [
          RichText(
              textAlign: TextAlign.center,
              text: TextSpan(children: [
                TextSpan(
                    text: 'Tap the ',
                    style: Theme.of(context).textTheme.bodyText1),
                WidgetSpan(
                    child: SvgPicture.asset(
                  'assets/icon/heart.svg',
                  semanticsLabel: 'Favorite',
                  height: 15.33,
                  width: 15.12,
                )),
                TextSpan(
                    text: ' Favorite icon on any location air quality '
                        'to save them here for later.',
                    style: Theme.of(context).textTheme.bodyText1),
              ])),
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
    );
  }

  Future<void> initialize() async {
    await _appService.fetchFavPlacesInsights();
    await Future.delayed(const Duration(seconds: 1))
        .then((_) => _appService.updateFavouritePlacesSites(context));
  }

  @override
  void initState() {
    super.initState();
    initialize();
  }

  Future<void> refreshData() async {
    await Provider.of<PlaceDetailsModel>(context, listen: false)
        .reloadFavouritePlaces();
    await initialize();
  }
}
