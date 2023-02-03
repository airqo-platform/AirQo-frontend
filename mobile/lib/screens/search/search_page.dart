import 'package:app/blocs/blocs.dart';
import 'package:app/utils/utils.dart';
import 'package:app/widgets/widgets.dart';
import 'package:flutter/material.dart';
import 'package:flutter_bloc/flutter_bloc.dart';

import 'search_widgets.dart';

enum SearchPageState {
  searching,
  filtering;
}

class SearchPageCubit extends Cubit<SearchPageState> {
  SearchPageCubit() : super(SearchPageState.filtering);

  void showFiltering() => emit(SearchPageState.filtering);
  void showSearching() => emit(SearchPageState.searching);
}

class SearchPage extends StatelessWidget {
  const SearchPage({super.key});

  @override
  Widget build(BuildContext context) {
    Future.delayed(Duration.zero, () {
      context.read<SearchBloc>().add(const InitializeSearchView());
      context.read<SearchFilterBloc>().add(const InitializeSearchFilter());
    });

    return BlocProvider(
      create: (_) => SearchPageCubit(),
      child: Scaffold(
        appBar: const SearchBar(),
        body: AppSafeArea(
          widget: BlocBuilder<SearchPageCubit, SearchPageState>(
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
                  maximumElements: 3,
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
                  title: 'Recent Searches',
                  airQualityReadings: state.recentSearches,
                ),
                const ExploreAfricanCitiesSection(),
              ],
            );
          case SearchFilterStatus.filterFailed:
            return NoAirQualityDataWidget(
              callBack: () {
                context
                    .read<SearchFilterBloc>()
                    .add(const ReloadSearchFilter());
              },
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
        switch (state.status) {
          case SearchStatus.initial:
            return SearchSection(
              maximumElements: 3,
              title: 'Recent Searches',
              airQualityReadings: state.searchHistory,
            );
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
          case SearchStatus.searchComplete:
            return SearchSection(
              maximumElements: 3,
              title: 'Other related places',
              airQualityReadings: state.recommendations,
            );
        }
      },
    );
  }
}
