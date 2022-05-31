import 'package:app/constants/config.dart';
import 'package:app/models/place_details.dart';
import 'package:app/services/app_service.dart';
import 'package:app/widgets/custom_widgets.dart';
import 'package:flutter/material.dart';
import 'package:provider/provider.dart';

import '../analytics/analytics_widgets.dart';
import 'favourite_places_widgets.dart';

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
      appBar: const AppTopBar('Favorites'),
      body: Container(
          color: Config.appBodyColor,
          child: Consumer<PlaceDetailsModel>(
            builder: (context, placeDetailsModel, child) {
              if (placeDetailsModel.favouritePlaces.isEmpty) {
                return const EmptyFavouritePlaces();
              }

              return AppRefreshIndicator(
                  sliverChildDelegate:
                      SliverChildBuilderDelegate((context, index) {
                    return Padding(
                        padding: EdgeInsets.fromLTRB(
                            16, Config.refreshIndicatorPadding(index), 16, 0),
                        child: MiniAnalyticsCard(
                            placeDetailsModel.favouritePlaces[index]));
                  }, childCount: placeDetailsModel.favouritePlaces.length),
                  onRefresh: _refreshPage);
            },
          )),
    );
  }

  Future<void> _refreshPage() async {
    await Provider.of<PlaceDetailsModel>(context, listen: false)
        .reloadFavouritePlaces();
    await _appService.refreshFavouritePlaces(context);
  }
}
