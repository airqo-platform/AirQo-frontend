import 'package:app/blocs/blocs.dart';
import 'package:app/themes/theme.dart';
import 'package:app/utils/utils.dart';
import 'package:app/widgets/widgets.dart';
import 'package:flutter/material.dart';
import 'package:flutter_bloc/flutter_bloc.dart';
import 'package:flutter_gen/gen_l10n/app_localizations.dart';

import 'search_widgets.dart';

class SearchPage extends StatelessWidget {
  const SearchPage({super.key});

  @override
  Widget build(BuildContext context) {
    Future.delayed(Duration.zero, () {
      context.read<SearchPageCubit>().showFiltering();
      context.read<SearchBloc>().add(const InitializeSearchView());
      context.read<SearchFilterBloc>().add(const InitializeSearchFilter());
    });

    return Scaffold(
      appBar: const CustomSearchBar(),
      body: AppSafeArea(
        horizontalPadding: 18,
        child: BlocBuilder<SearchPageCubit, SearchPageState>(
          builder: (context, state) {
            switch (state) {
              case SearchPageState.filtering:
                return const SearchFilterView();
              case SearchPageState.searching:
                return const SearchView();
            }
          },
        ),
      ),
    );
  }
}

class SearchFilterView extends StatelessWidget {
  const SearchFilterView({super.key});

  @override
  Widget build(BuildContext context) {
    return BlocBuilder<SearchFilterBloc, SearchFilterState>(
      builder: (context, state) {
        switch (state.status) {
          case SearchFilterStatus.loading:
            return const SearchPageLoadingWidget();
          case SearchFilterStatus.noInternetConnection:
            return NoInternetConnectionWidget(
              callBack: () {
                context
                    .read<SearchFilterBloc>()
                    .add(const ReloadSearchFilter());
              },
            );
          case SearchFilterStatus.noAirQualityData:
            return NoAirQualityDataWidget(
              callBack: () {
                context
                    .read<SearchFilterBloc>()
                    .add(const ReloadSearchFilter());
              },
            );
          case SearchFilterStatus.filterSuccessful:
            return ListView(
              children: [
                SearchSection(
                  title: state.filteredAirQuality?.searchNearbyLocationsText
                          .toTitleCase() ??
                      '',
                  airQualityReadings: state.nearbyLocations,
                ),
                SearchSection(
                  title: state.nearbyLocations.isEmpty
                      ? state.filteredAirQuality?.searchOtherLocationsText
                              .toTitleCase() ??
                          ''
                      : 'Other ${state.filteredAirQuality?.searchOtherLocationsText}'
                          .toTitleCase(),
                  airQualityReadings: state.otherLocations,
                ),
              ],
            );
          case SearchFilterStatus.initial:
            return ListView(
              children: [
                SearchSection(
                  maximumElements: 3,
                  title: AppLocalizations.of(context)!.recentSearches,
                  airQualityReadings: state.recentSearches,
                ),
                const ExploreAfricanCitiesSection(),
              ],
            );
          case SearchFilterStatus.filterFailed:
            return NoSearchResultsWidget(
              message: AppLocalizations.of(context)!
                  .tryAdjustingYourFiltersToFindWhatYoureLookingFor,
            );
        }
      },
    );
  }
}

class SearchView extends StatelessWidget {
  const SearchView({super.key});

  @override
  Widget build(BuildContext context) {
    return BlocBuilder<SearchBloc, SearchState>(
      builder: (context, state) {
        Widget widget;
        switch (state.status) {
          case SearchStatus.noAirQualityData:
            return NoAirQualityDataWidget(
              callBack: () {
                context.read<SearchBloc>().add(const InitializeSearchView());
              },
            );
          case SearchStatus.noInternetConnection:
            return NoInternetConnectionWidget(
              callBack: () {
                context.read<SearchBloc>().add(const InitializeSearchView());
              },
            );
          case SearchStatus.autoCompleting:
            return const AutoCompleteLoadingWidget();
          case SearchStatus.autoCompleteFinished:
            return const AutoCompleteResultsWidget();
          case SearchStatus.initial:
            widget = SearchSection(
              title: AppLocalizations.of(context)!.suggestions,
              airQualityReadings: state.searchHistory,
            );
            break;
          case SearchStatus.searchComplete:
            widget = state.recommendations.isEmpty
                ? const NoSearchResultsWidget()
                : SearchSection(
                    title:AppLocalizations.of(context)!.cantFindAirQualityOfExploreTheseLocationsRelateToYourSearch(state.searchTerm) ,
                    airQualityReadings: state.recommendations,
                  );
            break;
        }

        return Container(
          color: CustomColors.appBodyColor,
          height: double.infinity,
          child: widget,
        );
      },
    );
  }
}
