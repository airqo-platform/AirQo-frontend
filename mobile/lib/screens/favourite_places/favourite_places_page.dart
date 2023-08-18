import 'package:app/blocs/blocs.dart';
import 'package:app/constants/config.dart';
import 'package:app/models/models.dart';
import 'package:app/widgets/widgets.dart';
import 'package:flutter/material.dart';
import 'package:flutter_bloc/flutter_bloc.dart';

import '../offline_banner.dart';
import 'favourite_places_widgets.dart';
import 'package:flutter_gen/gen_l10n/app_localizations.dart';

class FavouritePlacesPage extends StatelessWidget {
  const FavouritePlacesPage({super.key});

  @override
  Widget build(BuildContext context) {
    return OfflineBanner(
      child: Scaffold(
        appBar: AppTopBar(AppLocalizations.of(context)!.favorites),
        body: AppSafeArea(
          horizontalPadding: 16,
          child: BlocBuilder<FavouritePlaceBloc, List<FavouritePlace>>(
            builder: (context, state) {
              if (state.isEmpty) {
                context
                    .read<FavouritePlaceBloc>()
                    .add(const SyncFavouritePlaces());
    
                return const NoFavouritePlacesWidget();
              }
    
              return AppRefreshIndicator(
                sliverChildDelegate: SliverChildBuilderDelegate(
                  (context, index) {
                    return Padding(
                      padding: EdgeInsets.only(
                        top: Config.refreshIndicatorPadding(index),
                      ),
                      child: FavouritePlaceCard(state[index]),
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
      ),
    );
  }

  void _refresh(BuildContext context) {
    context.read<FavouritePlaceBloc>().add(const SyncFavouritePlaces());
  }
}
