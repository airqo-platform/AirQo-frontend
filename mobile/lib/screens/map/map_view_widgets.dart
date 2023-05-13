import 'dart:async';

import 'package:app/blocs/blocs.dart';
import 'package:app/models/models.dart';
import 'package:app/screens/analytics/analytics_widgets.dart';
import 'package:app/services/services.dart';
import 'package:app/themes/theme.dart';
import 'package:app/utils/utils.dart';
import 'package:app/widgets/widgets.dart';
import 'package:auto_size_text/auto_size_text.dart';
import 'package:flutter/material.dart';
import 'package:flutter_bloc/flutter_bloc.dart';
import 'package:flutter_svg/svg.dart';

import '../insights/insights_page.dart';

class DraggingHandle extends StatelessWidget {
  const DraggingHandle({super.key});

  @override
  Widget build(BuildContext context) {
    return Container(
      height: 4,
      width: 32,
      decoration: BoxDecoration(
        color: Colors.grey[200],
        borderRadius: BorderRadius.circular(16),
      ),
    );
  }
}

class RegionAvatar extends StatelessWidget {
  const RegionAvatar({super.key});

  @override
  Widget build(BuildContext context) {
    return Container(
      height: 40,
      width: 40,
      decoration: BoxDecoration(
        color: CustomColors.appColorBlue.withOpacity(0.15),
        shape: BoxShape.circle,
      ),
      child: Center(
        child: Icon(
          Icons.location_on_rounded,
          color: CustomColors.appColorBlue,
          size: 27,
        ),
      ),
    );
  }
}

class MapCardWidget extends StatelessWidget {
  const MapCardWidget({
    super.key,
    required this.widget,
  });
  final Widget widget;

  @override
  Widget build(BuildContext context) {
    return Card(
      margin: EdgeInsets.zero,
      elevation: 12.0,
      shape: const RoundedRectangleBorder(
        borderRadius: BorderRadius.only(
          topLeft: Radius.circular(16),
          topRight: Radius.circular(16),
        ),
      ),
      child: widget,
    );
  }
}

class SiteTile extends StatelessWidget {
  const SiteTile({
    super.key,
    required this.airQualityReading,
  });
  final AirQualityReading airQualityReading;

  @override
  Widget build(BuildContext context) {
    return ListTile(
      contentPadding: const EdgeInsets.only(left: 0.0),
      onTap: () {
        context.read<MapBloc>().add(ShowSiteReading(airQualityReading));
      },
      title: AutoSizeText(
        airQualityReading.name,
        maxLines: 1,
        minFontSize: 16.0,
        overflow: TextOverflow.ellipsis,
        style: CustomTextStyle.headline8(context),
      ),
      subtitle: AutoSizeText(
        airQualityReading.location,
        maxLines: 1,
        minFontSize: 14.0,
        style: CustomTextStyle.bodyText4(context)?.copyWith(
          color: CustomColors.appColorBlack.withOpacity(0.4),
        ),
      ),
      trailing: const Icon(
        Icons.arrow_forward_ios_rounded,
        size: 10,
        semanticLabel: 'more',
        weight: 1000,
      ),
      leading: MiniAnalyticsAvatar(airQualityReading: airQualityReading),
    );
  }
}

class SearchTile extends StatelessWidget {
  const SearchTile({
    super.key,
    required this.searchResult,
  });
  final SearchResult searchResult;

  @override
  Widget build(BuildContext context) {
    return ListTile(
      contentPadding: const EdgeInsets.only(left: 0.0),
      leading: const RegionAvatar(),
      onTap: () async {
        await _showPlaceDetails(context);
      },
      title: AutoSizeText(
        searchResult.name,
        maxLines: 1,
        minFontSize: 16.0,
        overflow: TextOverflow.ellipsis,
        style: CustomTextStyle.headline8(context),
      ),
      subtitle: AutoSizeText(
        searchResult.location,
        maxLines: 1,
        minFontSize: 14.0,
        overflow: TextOverflow.ellipsis,
        style: CustomTextStyle.bodyText4(context)?.copyWith(
          color: CustomColors.appColorBlack.withOpacity(0.3),
        ),
      ),
      trailing: const Icon(
        Icons.arrow_forward_ios_rounded,
        size: 10,
        semanticLabel: 'more',
        weight: 1000,
      ),
    );
  }

  Future<void> _showPlaceDetails(BuildContext context) async {
    loadingScreen(context);
    await SearchApiClient()
        .getPlaceDetails(
      searchResult,
    )
        .then((place) async {
      if (place != null) {
        await LocationService.getNearestSite(
          place.latitude,
          place.longitude,
        ).then((nearestSite) async {
          Navigator.pop(context);
          if (nearestSite == null) {
            showSnackBar(
              context,
              'Oops!!.. We don’t have air quality readings for'
              ' ${searchResult.name}',
              durationInSeconds: 3,
            );
          } else {
            await navigateToInsights(
              context,
              nearestSite.copyWith(
                name: searchResult.name,
                location: searchResult.location,
                placeId: searchResult.id,
                latitude: place.latitude,
                longitude: place.longitude,
              ),
            );
          }
        });
      } else {
        showSnackBar(
          context,
          'Try again later',
        );
      }
    });
  }
}

class CountryTile extends StatelessWidget {
  const CountryTile(this.country, {super.key});
  final String country;

  @override
  Widget build(BuildContext context) {
    return ListTile(
      contentPadding: const EdgeInsets.only(left: 0.0),
      leading: const RegionAvatar(),
      onTap: () {
        context.read<MapBloc>().add(ShowCountryRegions(country));
      },
      title: AutoSizeText(
        country.toTitleCase(),
        maxLines: 2,
        overflow: TextOverflow.ellipsis,
        style: CustomTextStyle.headline8(context),
      ),
      trailing: const Icon(
        Icons.arrow_forward_ios_rounded,
        size: 10,
        semanticLabel: 'more',
        weight: 1000,
      ),
    );
  }
}

class AllCountries extends StatelessWidget {
  const AllCountries({super.key});

  @override
  Widget build(BuildContext context) {
    return MediaQuery.removePadding(
      removeTop: true,
      context: context,
      child: BlocBuilder<MapBloc, MapState>(
        builder: (context, state) {
          return ListView.builder(
            shrinkWrap: true,
            physics: const BouncingScrollPhysics(),
            itemBuilder: (BuildContext context, int index) {
              return Padding(
                padding: index == 0
                    ? const EdgeInsets.only(top: 5)
                    : EdgeInsets.zero,
                child: CountryTile(state.countries[index]),
              );
            },
            itemCount: state.countries.length,
          );
        },
      ),
    );
  }
}

class CountryRegions extends StatelessWidget {
  const CountryRegions({super.key});

  @override
  Widget build(BuildContext context) {
    return MediaQuery.removePadding(
      removeTop: true,
      context: context,
      child: BlocBuilder<MapBloc, MapState>(
        builder: (context, state) {
          return ListView.builder(
            shrinkWrap: true,
            physics: const BouncingScrollPhysics(),
            itemBuilder: (BuildContext context, int index) {
              return Padding(
                padding: index == 0
                    ? const EdgeInsets.only(top: 5)
                    : EdgeInsets.zero,
                child: RegionTile(
                  region: state.regions[index],
                  country: state.featuredCountry,
                ),
              );
            },
            itemCount: state.regions.length,
          );
        },
      ),
    );
  }
}

class RegionSites extends StatelessWidget {
  const RegionSites({super.key});

  @override
  Widget build(BuildContext context) {
    return MediaQuery.removePadding(
      removeTop: true,
      context: context,
      child: BlocBuilder<MapBloc, MapState>(
        builder: (context, state) {
          return MediaQuery.removePadding(
            removeTop: true,
            context: context,
            child: ListView(
              shrinkWrap: true,
              physics: const BouncingScrollPhysics(),
              children: [
                const SizedBox(
                  height: 10,
                ),
                Visibility(
                  visible: state.featuredAirQualityReadings.isNotEmpty,
                  child: Text(
                    state.featuredRegion.toTitleCase(),
                    style: CustomTextStyle.overline1(context)?.copyWith(
                      color: CustomColors.appColorBlack.withOpacity(0.32),
                    ),
                  ),
                ),
                Visibility(
                  visible: state.featuredAirQualityReadings.isNotEmpty,
                  child: MediaQuery.removePadding(
                    context: context,
                    removeTop: true,
                    child: ListView.builder(
                      shrinkWrap: true,
                      controller: ScrollController(),
                      itemBuilder: (context, index) => SiteTile(
                        airQualityReading:
                            state.featuredAirQualityReadings[index],
                      ),
                      itemCount: state.featuredAirQualityReadings.length,
                    ),
                  ),
                ),
                // TODO added empty widget
              ],
            ),
          );
        },
      ),
    );
  }
}

class RegionTile extends StatelessWidget {
  const RegionTile({
    super.key,
    required this.region,
    required this.country,
  });
  final String region;
  final String country;

  @override
  Widget build(BuildContext context) {
    return ListTile(
      contentPadding: const EdgeInsets.only(left: 0.0),
      leading: const RegionAvatar(),
      onTap: () {
        context.read<MapBloc>().add(ShowRegionSites(region));
      },
      title: AutoSizeText(
        region.toTitleCase(),
        maxLines: 2,
        overflow: TextOverflow.ellipsis,
        style: CustomTextStyle.headline8(context),
      ),
      subtitle: AutoSizeText(
        country.toTitleCase(),
        style: CustomTextStyle.bodyText4(context)?.copyWith(
          color: CustomColors.appColorBlack.withOpacity(0.3),
        ),
      ),
      trailing: const Icon(
        Icons.arrow_forward_ios_rounded,
        size: 10,
        semanticLabel: 'more',
        weight: 1000,
      ),
    );
  }
}

class FeaturedSiteReading extends StatelessWidget {
  const FeaturedSiteReading(this.airQualityReading, {super.key});

  final AirQualityReading airQualityReading;

  @override
  Widget build(BuildContext context) {
    return MediaQuery.removePadding(
      context: context,
      removeTop: true,
      removeLeft: true,
      removeRight: true,
      child: ListView(
        shrinkWrap: true,
        physics: const ScrollPhysics(),
        controller: ScrollController(),
        children: <Widget>[
          MapAnalyticsCard(airQualityReading),
        ],
      ),
    );
  }
}

class MapAnalyticsCard extends StatelessWidget {
  const MapAnalyticsCard(this.airQualityReading, {super.key});
  final AirQualityReading airQualityReading;

  @override
  Widget build(BuildContext context) {
    final appColors = Theme.of(context).extension<AppColors>()!;

    return SizedBox(
      height: 257,
      width: double.infinity,
      child: Column(
        children: [
          Expanded(
            child: OutlinedButton(
              style: OutlinedButton.styleFrom(
                foregroundColor: CustomColors.appColorBlue,
                elevation: 0,
                side: const BorderSide(
                  color: Colors.transparent,
                  width: 0,
                ),
                backgroundColor: Colors.white,
                padding: EdgeInsets.zero,
              ),
              onPressed: () async {
                await navigateToInsights(context, airQualityReading);
              },
              child: Column(
                children: [
                  Padding(
                    padding: const EdgeInsets.symmetric(horizontal: 32),
                    child: Row(
                      mainAxisAlignment: MainAxisAlignment.end,
                      crossAxisAlignment: CrossAxisAlignment.end,
                      children: [
                        InkWell(
                          onTap: () {
                            final String region =
                                context.read<MapBloc>().state.featuredRegion;

                            context.read<MapBloc>().add(region.isEmpty
                                ? const InitializeMapState()
                                : ShowRegionSites(region));
                          },
                          child: Padding(
                            padding: const EdgeInsets.only(
                              right: 12,
                              top: 12,
                              left: 20,
                            ),
                            child: SizedBox(
                              height: 20,
                              width: 20,
                              child: SvgPicture.asset(
                                'assets/icon/close.svg',
                                height: 20,
                                width: 20,
                              ),
                            ),
                          ),
                        ),
                      ],
                    ),
                  ),
                  const SizedBox(
                    height: 10,
                  ),
                  Column(
                    children: [
                      SizedBox(
                        height: 104,
                        child: Padding(
                          padding: const EdgeInsets.symmetric(horizontal: 32),
                          child: Row(
                            children: [
                              AnalyticsAvatar(airQualityReading),
                              const SizedBox(
                                width: 16.0,
                              ),
                              Flexible(
                                child: Column(
                                  crossAxisAlignment: CrossAxisAlignment.start,
                                  children: [
                                    Text(
                                      airQualityReading.name,
                                      maxLines: 1,
                                      overflow: TextOverflow.ellipsis,
                                      style: CustomTextStyle.headline9(
                                        context,
                                      ),
                                    ),
                                    Text(
                                      airQualityReading.location,
                                      maxLines: 1,
                                      overflow: TextOverflow.ellipsis,
                                      style: CustomTextStyle.bodyText4(context)
                                          ?.copyWith(
                                        color: appColors.appColorBlack
                                            .withOpacity(0.3),
                                      ),
                                    ),
                                    const SizedBox(
                                      height: 12,
                                    ),
                                    AqiStringContainer(airQualityReading),
                                    const SizedBox(
                                      height: 8,
                                    ),
                                    Row(
                                      crossAxisAlignment:
                                          CrossAxisAlignment.start,
                                      children: [
                                        Container(
                                          constraints: BoxConstraints(
                                            maxWidth: MediaQuery.of(context)
                                                    .size
                                                    .width /
                                                3.2,
                                          ),
                                          child: Text(
                                            airQualityReading.dateTime
                                                .analyticsCardString(),
                                            maxLines: 1,
                                            overflow: TextOverflow.ellipsis,
                                            style: TextStyle(
                                              fontSize: 8,
                                              color:
                                                  Colors.black.withOpacity(0.3),
                                            ),
                                          ),
                                        ),
                                      ],
                                    ),
                                  ],
                                ),
                              ),
                            ],
                          ),
                        ),
                      ),
                      const SizedBox(
                        height: 30,
                      ),
                      const Padding(
                        padding: EdgeInsets.symmetric(horizontal: 32),
                        child: AnalyticsMoreInsights(),
                      ),
                    ],
                  ),
                ],
              ),
            ),
          ),
          const Divider(
            color: Color(0xffC4C4C4),
            height: 1.0,
          ),
          SizedBox(
            height: 58,
            child: AnalyticsCardFooter(
              airQualityReading,
              radius: 0,
            ),
          ),
        ],
      ),
    );
  }
}

class SearchMapDefaultView extends StatelessWidget {
  const SearchMapDefaultView({super.key});

  @override
  Widget build(BuildContext context) {
    return MediaQuery.removePadding(
      removeTop: true,
      context: context,
      child: BlocBuilder<MapSearchBloc, MapSearchState>(
        builder: (context, state) {
          return ListView.builder(
            shrinkWrap: true,
            physics: const BouncingScrollPhysics(),
            controller: ScrollController(),
            itemBuilder: (context, index) => SiteTile(
              airQualityReading: state.airQualityReadings[index],
            ),
            itemCount: state.airQualityReadings.length,
          );
        },
      ),
    );
  }
}

class MapSearchWidget extends StatelessWidget {
  const MapSearchWidget({super.key});

  @override
  Widget build(BuildContext context) {
    return MediaQuery.removePadding(
      removeTop: true,
      context: context,
      child: BlocBuilder<MapSearchBloc, MapSearchState>(
        builder: (context, state) {
          if (state.searchTerm.isEmpty) {
            return const SearchMapDefaultView();
          }

          if (state.mapStatus == MapSearchStatus.error) {
            return const NoSearchResultsWidget();
          }

          return const SearchResults();
        },
      ),
    );
  }
}

class SearchResults extends StatelessWidget {
  const SearchResults({super.key});

  @override
  Widget build(BuildContext context) {
    return MediaQuery.removePadding(
      removeTop: true,
      context: context,
      child: BlocBuilder<MapSearchBloc, MapSearchState>(
        builder: (context, state) {
          if (state.searchResults.isEmpty && state.searchTerm.isNotEmpty) {
            return const NoSearchResultsWidget();
          }

          return Center(
            child: MediaQuery.removePadding(
              context: context,
              removeTop: true,
              removeLeft: true,
              child: ListView.builder(
                physics: const BouncingScrollPhysics(),
                shrinkWrap: true,
                itemBuilder: (context, index) => SearchTile(
                  searchResult: state.searchResults[index],
                ),
                itemCount: state.searchResults.length,
              ),
            ),
          );
        },
      ),
    );
  }
}

class SearchWidget extends StatelessWidget {
  SearchWidget({super.key});
  final TextEditingController _searchController = TextEditingController();

  @override
  Widget build(BuildContext context) {
    return BlocBuilder<MapBloc, MapState>(
      builder: (context, state) {
        if (state.mapStatus == MapStatus.showingFeaturedSite) {
          return const SizedBox();
        }

        final OutlineInputBorder outlineInputBorder = OutlineInputBorder(
          borderSide: const BorderSide(
            color: Colors.transparent,
            width: 1.0,
          ),
          borderRadius: BorderRadius.circular(8.0),
        );

        return Row(
          children: [
            Expanded(
              child: Container(
                height: 32,
                constraints: const BoxConstraints(minWidth: double.maxFinite),
                decoration: BoxDecoration(
                  color: CustomColors.appBodyColor,
                  shape: BoxShape.rectangle,
                  borderRadius: const BorderRadius.all(
                    Radius.circular(8.0),
                  ),
                ),
                child: TextFormField(
                  controller: _searchController,
                  onChanged: (String value) {
                    if (state.mapStatus != MapStatus.searching) {
                      context.read<MapBloc>().add(const InitializeSearch());
                      context
                          .read<MapSearchBloc>()
                          .add(const InitializeSearch());
                    } else {
                      context
                          .read<MapSearchBloc>()
                          .add(MapSearchTermChanged(searchTerm: value));
                    }
                  },
                  onTap: () {
                    context.read<MapBloc>().add(const InitializeSearch());
                    context.read<MapSearchBloc>().add(const InitializeSearch());
                  },
                  style: Theme.of(context).textTheme.bodySmall?.copyWith(
                        fontSize: 16,
                      ),
                  enableSuggestions: true,
                  cursorWidth: 1,
                  autofocus: false,
                  cursorColor: CustomColors.appColorBlack,
                  decoration: InputDecoration(
                    fillColor: Colors.white,
                    prefixIcon: const Padding(
                      padding: EdgeInsets.symmetric(
                        horizontal: 0,
                        vertical: 7,
                      ),
                      child: Icon(
                        Icons.search_rounded,
                        semanticLabel: 'Search',
                      ),
                    ),
                    contentPadding: EdgeInsets.zero,
                    focusedBorder: outlineInputBorder,
                    enabledBorder: outlineInputBorder,
                    border: outlineInputBorder,
                    hintStyle: Theme.of(context).textTheme.bodySmall?.copyWith(
                          color: CustomColors.appColorBlack.withOpacity(0.32),
                          fontSize: 14,
                          fontWeight: FontWeight.w400,
                        ),
                  ),
                ),
              ),
            ),
            BlocBuilder<MapBloc, MapState>(
              builder: (context, state) {
                if (state.mapStatus != MapStatus.showingCountries) {
                  return Row(
                    mainAxisSize: MainAxisSize.min,
                    children: [
                      const SizedBox(
                        width: 8.0,
                      ),
                      GestureDetector(
                        onTap: () {
                          _searchController.text = '';

                          context
                              .read<MapBloc>()
                              .add(const InitializeMapState());
                        },
                        child: Container(
                          height: 32,
                          width: 32,
                          decoration: BoxDecoration(
                            color: CustomColors.appBodyColor,
                            borderRadius: const BorderRadius.all(
                              Radius.circular(8.0),
                            ),
                          ),
                          child: SvgPicture.asset(
                            'assets/icon/map_clear_text.svg',
                            height: 15,
                            width: 15,
                          ),
                        ),
                      ),
                    ],
                  );
                }

                return const SizedBox();
              },
            ),
          ],
        );
      },
    );
  }
}
