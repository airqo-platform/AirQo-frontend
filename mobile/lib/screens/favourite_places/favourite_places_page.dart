import 'package:app/blocs/blocs.dart';
import 'package:app/constants/config.dart';
import 'package:app/models/models.dart';
import 'package:app/services/services.dart';
import 'package:app/widgets/widgets.dart';
import 'package:flutter/material.dart';
import 'package:flutter_bloc/flutter_bloc.dart';
import 'package:hive_flutter/hive_flutter.dart';

import 'favourite_places_widgets.dart';

class FavouritePlacesPage extends StatelessWidget {
  const FavouritePlacesPage({super.key});

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: const AppTopBar('Favorites'),
      body: AppSafeArea(
        horizontalPadding: 16,
        widget: BlocBuilder<FavouritePlaceBloc, List<FavouritePlace>>(
          builder: (context, state) {
            if (state.isEmpty) {
              context
                  .read<FavouritePlaceBloc>()
                  .add(const SyncFavouritePlaces());

              return const NoFavouritePlacesWidget();
            }
            final airQualityReadings =
                Hive.box<AirQualityReading>(HiveBox.airQualityReadings);

            return AppRefreshIndicator(
              sliverChildDelegate: SliverChildBuilderDelegate(
                (context, index) {
                  final siteReadings = airQualityReadings.values.where(
                    (element) =>
                        element.referenceSite == state[index].referenceSite,
                  );

                  final AirQualityReading airQualityReading =
                      AirQualityReading.fromFavouritePlace(
                    state[index],
                  );

                  if (siteReadings.isEmpty) {
                    return EmptyFavouritePlace(airQualityReading);
                  }

                  return Padding(
                    padding: EdgeInsets.only(
                      top: Config.refreshIndicatorPadding(index),
                    ),
                    child: FavouritePlaceCard(airQualityReading),
                  );
                },
                childCount: state.length,
              ),
              onRefresh: () {
                _refresh(context);

                return Future(() => null);
              },
            );
          },
        ),
      ),
    );
  }

  void _refresh(BuildContext context) {
    context.read<FavouritePlaceBloc>().add(const SyncFavouritePlaces());
  }
}
