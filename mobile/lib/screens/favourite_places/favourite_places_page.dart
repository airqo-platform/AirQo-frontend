import 'package:app/constants/config.dart';
import 'package:app/models/models.dart';
import 'package:app/screens/analytics/analytics_widgets.dart';
import 'package:app/services/services.dart';
import 'package:app/themes/theme.dart';
import 'package:app/widgets/widgets.dart';
import 'package:flutter/material.dart';
import 'package:flutter_svg/svg.dart';
import 'package:hive_flutter/hive_flutter.dart';

import 'favourite_places_widgets.dart';

class FavouritePlaces extends StatefulWidget {
  const FavouritePlaces({super.key});

  @override
  State<FavouritePlaces> createState() => _FavouritePlacesState();
}

class _FavouritePlacesState extends State<FavouritePlaces> {
  final AppService _appService = AppService();

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: const AppTopBar('Favorites'),
      body: Container(
        color: CustomColors.appBodyColor,
        child: ValueListenableBuilder<Box<FavouritePlace>>(
          valueListenable:
              Hive.box<FavouritePlace>(HiveBox.favouritePlaces).listenable(),
          builder: (context, box, widget) {
            final favouritePlaces = box.values.cast<FavouritePlace>().toList();

            if (favouritePlaces.isEmpty) {
              return const EmptyFavouritePlaces();
            }

            return AppRefreshIndicator(
              sliverChildDelegate: SliverChildBuilderDelegate(
                (context, index) {
                  final airQualityReading =
                      Hive.box<AirQualityReading>(HiveBox.airQualityReadings)
                          .get(favouritePlaces[index].referenceSite);
                  final favouritePlace = favouritePlaces[index];

                  if (airQualityReading == null) {
                    return EmptyFavouritePlace(
                      airQualityReading:
                          AirQualityReading.fromFavouritePlace(favouritePlace),
                    );
                  }

                  return Padding(
                    padding: EdgeInsets.fromLTRB(
                      16,
                      Config.refreshIndicatorPadding(index),
                      16,
                      0,
                    ),
                    child: MiniAnalyticsCard(
                      airQualityReading.populateFavouritePlace(favouritePlace),
                      animateOnClick: false,
                    ),
                  );
                },
                childCount: favouritePlaces.length,
              ),
              onRefresh: _refreshPage,
            );
          },
        ),
      ),
    );
  }

  Future<void> _refreshPage() async {
    await _appService.refreshFavouritePlaces(context);
  }
}
