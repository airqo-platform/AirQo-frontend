import 'package:app/blocs/blocs.dart';
import 'package:app/models/enum_constants.dart';
import 'package:app/themes/theme.dart';
import 'package:app/utils/utils.dart';
import 'package:app/widgets/widgets.dart';
import 'package:flutter/material.dart';
import 'package:flutter_bloc/flutter_bloc.dart';
import 'package:flutter_svg/svg.dart';

import 'search_widgets.dart';

class SearchPage extends StatelessWidget {
  const SearchPage({super.key});

  void _openAirQualityFilters(BuildContext context) {
    showModalBottomSheet(
      isScrollControlled: true,
      isDismissible: false,
      elevation: 0.0,
      backgroundColor: CustomColors.appBodyColor,
      shape: const RoundedRectangleBorder(
        borderRadius: BorderRadius.only(
          topLeft: Radius.circular(16),
          topRight: Radius.circular(16),
        ),
      ),
      context: context,
      builder: (BuildContext context) {
        return SingleChildScrollView(
          padding: const EdgeInsets.symmetric(horizontal: 18),
          physics: const NeverScrollableScrollPhysics(),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            mainAxisAlignment: MainAxisAlignment.start,
            children: [
              const SizedBox(
                height: 27,
              ),
              Row(
                // mainAxisAlignment: MainAxisAlignment.spaceBetween,
                children: [
                  Text(
                    'Filter By Air Quality Range',
                    maxLines: 1,
                    overflow: TextOverflow.ellipsis,
                    style: CustomTextStyle.headline8(context)?.copyWith(
                      color: CustomColors.appColorBlack.withOpacity(0.3),
                    ),
                  ),
                  const Spacer(),
                  InkWell(
                    onTap: () {
                      Navigator.pop(context);
                    },
                    child: SvgPicture.asset(
                      'assets/icon/close_search_filter.svg',
                    ),
                  ),
                  const SizedBox(
                    width: 10,
                  ),
                ],
              ),
              const SizedBox(
                height: 15,
              ),
              ListView.builder(
                shrinkWrap: true,
                itemBuilder: (_, index) {
                  return Padding(
                    padding: const EdgeInsets.symmetric(vertical: 8),
                    child: InkWell(
                      onTap: () {
                        context.read<SearchBloc>().add(
                              FilterByAirQuality(
                                AirQuality.values[index],
                              ),
                            );
                      },
                      child: SearchPageFilterTile(AirQuality.values[index]),
                    ),
                  );
                },
                itemCount: AirQuality.values.length,
              ),
              const SizedBox(
                height: 15,
              ),
            ],
          ),
        );
      },
    );
  }

  @override
  Widget build(BuildContext context) {
    Future.delayed(Duration.zero, () {
      context.read<SearchBloc>().add(const InitializeSearchPage());
    });

    return Scaffold(
      appBar: AppBar(
        toolbarHeight: 72,
        elevation: 0,
        backgroundColor: CustomColors.appBodyColor,
        automaticallyImplyLeading: false,
        centerTitle: false,
        title: Row(
          children: [
            const AppBackButton(),
            const SizedBox(
              width: 6,
            ),
            const Expanded(
              child: SizedBox(
                height: 40,
                child: SearchInputField(),
              ),
            ),
            BlocBuilder<SearchBloc, SearchState>(
              builder: (context, state) {
                return Visibility(
                  visible: state.searchTerm.isEmpty,
                  child: InkWell(
                    onTap: () {
                      _openAirQualityFilters(context);
                    },
                    child: Padding(
                      padding: const EdgeInsets.only(left: 6),
                      child: Container(
                        height: 35,
                        width: 35,
                        decoration: BoxDecoration(
                          color: CustomColors.appColorBlue.withOpacity(0.1),
                          shape: BoxShape.circle,
                        ),
                        child: Center(
                          child: Icon(
                            Icons.filter_list,
                            color: CustomColors.appColorBlue,
                          ),
                        ),
                      ),
                    ),
                  ),
                );
              },
            ),
          ],
        ),
      ),
      body: AppSafeArea(
        widget: BlocBuilder<SearchBloc, SearchState>(
          builder: (context, state) {
            switch (state.blocStatus) {
              case SearchStatus.initial:
                break;
              case SearchStatus.searchSuccess:
                return const SearchResultsWidget();
              case SearchStatus.searching:
                return const SearchLoadingWidget();
              case SearchStatus.error:
                switch (state.searchError) {
                  case SearchError.noInternetConnection:
                    return NoInternetConnectionWidget(
                      callBack: () {
                        context
                            .read<SearchBloc>()
                            .add(const InitializeSearchPage());
                      },
                    );
                  case SearchError.searchFailed:
                    return NoAirQualityDataWidget(
                      callBack: () {
                        context
                            .read<SearchBloc>()
                            .add(const InitializeSearchPage());
                      },
                    );
                  case SearchError.none:
                    break;
                }
                break;
            }

            if (state.featuredAirQuality != null) {
              if (state.nearbyAirQualityLocations.isEmpty &&
                  state.otherAirQualityLocations.isEmpty) {
                return const NoSearchResultsWidget();
              }

              return ListView(
                children: [
                  SearchSection(
                    maximumElements: 3,
                    title: state.featuredAirQuality?.searchNearbyLocationsText
                            .toTitleCase() ??
                        '',
                    airQualityReadings: state.nearbyAirQualityLocations,
                  ),
                  SearchSection(
                    title: state.nearbyAirQualityLocations.isEmpty
                        ? state.featuredAirQuality?.searchOtherLocationsText
                                .toTitleCase() ??
                            ''
                        : 'Other ${state.featuredAirQuality?.searchOtherLocationsText}'
                            .toTitleCase(),
                    airQualityReadings: state.otherAirQualityLocations,
                  ),
                ],
              );
            }

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
          },
        ),
      ),
    );
  }
}
