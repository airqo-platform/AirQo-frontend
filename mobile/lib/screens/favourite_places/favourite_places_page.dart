import 'package:app/blocs/blocs.dart';
import 'package:app/constants/config.dart';
import 'package:app/models/models.dart';
import 'package:app/utils/utils.dart';
import 'package:app/widgets/widgets.dart';
import 'package:flutter/material.dart';
import 'package:flutter_bloc/flutter_bloc.dart';
import 'package:flutter_gen/gen_l10n/app_localizations.dart';

import 'favourite_places_widgets.dart';

class FavouritePlacesPage extends StatefulWidget {
  const FavouritePlacesPage({super.key});

  @override
  State<FavouritePlacesPage> createState() => _FavouritePlacesPageState();
}

class _FavouritePlacesPageState extends State<FavouritePlacesPage> {
  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppTopBar(AppLocalizations.of(context)!.favorites),
      body: AppSafeArea(
        horizontalPadding: 16,
        child: BlocBuilder<FavouritePlaceBloc, List<FavouritePlace>>(
          builder: (context, state) {
            if (state.isEmpty) return const NoFavouritePlacesWidget();

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
    );
  }

  @override
  void initState() {
    super.initState();
    WidgetsBinding.instance.addPostFrameCallback((_) async {
      List<FavouritePlace> favouritePlaces =
          context.read<FavouritePlaceBloc>().state;
      Profile profile = context.read<ProfileBloc>().state;
      bool rateApp = profile.requiresRating();
      if (favouritePlaces.length > 5 && rateApp) {
        await Future.delayed(const Duration(milliseconds: 1000))
            .then((_) async {
          if (mounted) {
            await showRatingDialog(context);
          }
        });
      }
    });
  }

  void _refresh(BuildContext context) {
    context.read<FavouritePlaceBloc>().add(const SyncFavouritePlaces());
  }
}
