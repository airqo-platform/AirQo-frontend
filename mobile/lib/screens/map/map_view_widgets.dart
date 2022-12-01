import 'dart:async';

import 'package:app/blocs/blocs.dart';
import 'package:app/constants/constants.dart';
import 'package:app/models/models.dart';
import 'package:app/screens/analytics/analytics_widgets.dart';
import 'package:app/services/services.dart';
import 'package:app/themes/theme.dart';
import 'package:app/widgets/widgets.dart';
import 'package:app_repository/app_repository.dart';
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
        child: SvgPicture.asset(
          'assets/icon/location.svg',
          color: CustomColors.appColorBlue,
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
      child: Container(
        padding: const EdgeInsets.symmetric(horizontal: 32),
        child: widget,
      ),
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
        context
            .read<MapBloc>()
            .add(ShowSite(airQualityReading: airQualityReading));
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
      trailing: SvgPicture.asset(
        'assets/icon/more_arrow.svg',
        semanticsLabel: 'more',
        height: 6.99,
        width: 4,
      ),
      leading: MiniAnalyticsAvatar(airQualityReading: airQualityReading),
    );
  }
}

class SearchTile extends StatelessWidget {
  SearchTile({
    super.key,
    required this.searchResult,
  });
  final SearchResultItem searchResult;
  final SearchRepository _searchRepository =
      SearchRepository(searchApiKey: Config.searchApiKey);

  @override
  Widget build(BuildContext context) {
    return ListTile(
      contentPadding: const EdgeInsets.only(left: 0.0),
      leading: const RegionAvatar(),
      onTap: () {
        _showPlaceDetails(context);
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
      trailing: SvgPicture.asset(
        'assets/icon/more_arrow.svg',
        semanticsLabel: 'more',
        height: 6.99,
        width: 4,
      ),
    );
  }

  Future<void> _showPlaceDetails(BuildContext context) async {
    loadingScreen(context);

    final place = await _searchRepository.placeDetails(searchResult.id);

    if (place != null) {
      final nearestSite = await LocationService.getNearestSiteAirQualityReading(
        place.geometry.location.lat,
        place.geometry.location.lng,
      );

      Navigator.pop(context);

      // TODO: Substitute with widget
      if (nearestSite == null) {
        showSnackBar(
          context,
          'Oops!!.. We don’t have air quality readings for'
          ' ${searchResult.name}',
          durationInSeconds: 3,
        );

        return;
      }

      await Navigator.push(
        context,
        MaterialPageRoute(
          builder: (context) {
            return InsightsPage(
              nearestSite.copyWith(
                name: searchResult.name,
                location: searchResult.location,
                placeId: searchResult.id,
                latitude: place.geometry.location.lat,
                longitude: place.geometry.location.lng,
              ),
            );
          },
        ),
      );
    } else {
      showSnackBar(
        context,
        'Try again later',
      );
    }
  }
}

class EmptyView extends StatelessWidget {
  const EmptyView({
    super.key,
    required this.title,
    required this.bodyInnerText,
    required this.topBars,
    required this.showRegions,
  });
  final String title;
  final String bodyInnerText;
  final bool topBars;
  final VoidCallback showRegions;

  @override
  Widget build(BuildContext context) {
    return Column(
      children: [
        Visibility(
          visible: topBars,
          child: Row(
            mainAxisAlignment: MainAxisAlignment.end,
            children: [
              Container(
                height: 32,
                width: 32,
                decoration: BoxDecoration(
                  color: CustomColors.appBodyColor,
                  borderRadius: const BorderRadius.all(
                    Radius.circular(8.0),
                  ),
                ),
                child: Center(
                  child: IconButton(
                    iconSize: 10,
                    icon: Icon(
                      Icons.clear,
                      color: CustomColors.appColorBlack,
                    ),
                    onPressed: showRegions,
                  ),
                ),
              ),
            ],
          ),
        ),
        const SizedBox(
          height: 80,
        ),
        Image.asset(
          'assets/icon/coming_soon.png',
          height: 80,
          width: 80,
        ),
        const SizedBox(
          height: 16,
        ),
        Padding(
          padding: const EdgeInsets.only(left: 30, right: 30),
          child: Text(
            '$title\nComing soon on the network'.trim(),
            textAlign: TextAlign.center,
            style: CustomTextStyle.headline7(context)
                ?.copyWith(letterSpacing: 16 * -0.01),
          ),
        ),
        const SizedBox(
          height: 8,
        ),
        Padding(
          padding: const EdgeInsets.only(left: 20, right: 20),
          child: Text(
            'We currently do not support air quality '
            'monitoring in this $bodyInnerText, but we’re working on it.',
            textAlign: TextAlign.center,
            style: Theme.of(context).textTheme.bodyText2?.copyWith(
                  color: CustomColors.appColorBlack.withOpacity(0.4),
                ),
          ),
        ),
        const SizedBox(
          height: 158,
        ),
      ],
    );
  }
}

class RegionTile extends StatelessWidget {
  const RegionTile({
    super.key,
    required this.region,
  });
  final Region region;

  @override
  Widget build(BuildContext context) {
    return ListTile(
      contentPadding: const EdgeInsets.only(left: 0.0),
      leading: const RegionAvatar(),
      onTap: () {
        context.read<MapBloc>().add(ShowRegionSites(region: region));
      },
      title: AutoSizeText(
        region.toString(),
        maxLines: 2,
        overflow: TextOverflow.ellipsis,
        style: CustomTextStyle.headline8(context),
      ),
      subtitle: AutoSizeText(
        'Uganda',
        style: CustomTextStyle.bodyText4(context)?.copyWith(
          color: CustomColors.appColorBlack.withOpacity(0.3),
        ),
      ),
      trailing: SvgPicture.asset(
        'assets/icon/more_arrow.svg',
        semanticsLabel: 'more',
        height: 6.99,
        width: 4,
      ),
    );
  }
}

class AllSites extends StatelessWidget {
  const AllSites({super.key});

  @override
  Widget build(BuildContext context) {
    return MediaQuery.removePadding(
      removeTop: true,
      context: context,
      child: ListView(
        shrinkWrap: true,
        physics: const BouncingScrollPhysics(),
        children: const <Widget>[
          SizedBox(
            height: 5,
          ),
          RegionTile(
            region: Region.central,
          ),
          RegionTile(
            region: Region.western,
          ),
          RegionTile(
            region: Region.eastern,
          ),
          RegionTile(
            region: Region.northern,
          ),
        ],
      ),
    );
  }
}

class RegionSites extends StatelessWidget {
  const RegionSites({
    super.key,
    required this.airQualityReadings,
    required this.region,
  });

  final List<AirQualityReading> airQualityReadings;
  final Region region;

  @override
  Widget build(BuildContext context) {
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
            visible: airQualityReadings.isNotEmpty,
            child: Text(
              region.toString(),
              style: CustomTextStyle.overline1(context)?.copyWith(
                color: CustomColors.appColorBlack.withOpacity(0.32),
              ),
            ),
          ),
          Visibility(
            visible: airQualityReadings.isNotEmpty,
            child: MediaQuery.removePadding(
              context: context,
              removeTop: true,
              child: ListView.builder(
                shrinkWrap: true,
                controller: ScrollController(),
                itemBuilder: (context, index) => SiteTile(
                  airQualityReading: airQualityReadings[index],
                ),
                itemCount: airQualityReadings.length,
              ),
            ),
          ),
          Visibility(
            visible: airQualityReadings.isEmpty,
            child: EmptyView(
              title: region.toString(),
              topBars: false,
              bodyInnerText: 'region',
              showRegions: () {
                context.read<MapBloc>().add(const ShowAllSites());
              },
            ),
          ),
        ],
      ),
    );
  }
}

class SingleSite extends StatelessWidget {
  const SingleSite({super.key, required this.airQualityReading});

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
          MapAnalyticsCard(
            airQualityReading: airQualityReading,
          ),
        ],
      ),
    );
  }
}

class SearchSites extends StatelessWidget {
  const SearchSites({super.key, required this.airQualityReadings});

  final List<AirQualityReading> airQualityReadings;

  @override
  Widget build(BuildContext context) {
    final filteredAirQualityReadings =
        filterNearestLocations(airQualityReadings);

    return MediaQuery.removePadding(
      removeTop: true,
      context: context,
      child: ListView(
        shrinkWrap: true,
        physics: const BouncingScrollPhysics(),
        children: [
          Visibility(
            visible: airQualityReadings.isEmpty,
            child: Center(
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.center,
                mainAxisAlignment: MainAxisAlignment.center,
                children: [
                  const SizedBox(
                    height: 10,
                  ),
                  Stack(
                    children: [
                      Image.asset(
                        'assets/images/world-map.png',
                        height: 130,
                        width: 130,
                      ),
                      Container(
                        decoration: BoxDecoration(
                          color: CustomColors.appColorBlue,
                          shape: BoxShape.circle,
                        ),
                        child: const Padding(
                          padding: EdgeInsets.all(12.0),
                          child: Icon(
                            Icons.map_outlined,
                            size: 30,
                            color: Colors.white,
                          ),
                        ),
                      ),
                    ],
                  ),
                  const SizedBox(
                    height: 52,
                  ),
                  const Text(
                    'Not found',
                    textAlign: TextAlign.start,
                    style: TextStyle(fontSize: 20, fontWeight: FontWeight.bold),
                  ),
                  const SizedBox(
                    height: 52,
                  ),
                ],
              ),
            ),
          ),
          Visibility(
            visible: filteredAirQualityReadings.isNotEmpty,
            child: Center(
              child: MediaQuery.removePadding(
                context: context,
                removeTop: true,
                child: ListView.builder(
                  physics: const BouncingScrollPhysics(),
                  shrinkWrap: true,
                  itemBuilder: (context, index) => SiteTile(
                    airQualityReading: filteredAirQualityReadings[index],
                  ),
                  itemCount: filteredAirQualityReadings.length,
                ),
              ),
            ),
          ),
          const SizedBox(
            height: 8,
          ),
        ],
      ),
    );
  }
}

class SearchResults extends StatelessWidget {
  const SearchResults({super.key, required this.searchResults});

  final List<SearchResultItem> searchResults;

  @override
  Widget build(BuildContext context) {
    return MediaQuery.removePadding(
      removeTop: true,
      context: context,
      child: ListView(
        shrinkWrap: true,
        physics: const BouncingScrollPhysics(),
        children: [
          Visibility(
            visible: searchResults.isEmpty,
            child: Center(
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.center,
                mainAxisAlignment: MainAxisAlignment.center,
                children: [
                  const SizedBox(
                    height: 10,
                  ),
                  Stack(
                    children: [
                      Image.asset(
                        'assets/images/world-map.png',
                        height: 130,
                        width: 130,
                      ),
                      Container(
                        decoration: BoxDecoration(
                          color: CustomColors.appColorBlue,
                          shape: BoxShape.circle,
                        ),
                        child: const Padding(
                          padding: EdgeInsets.all(12.0),
                          child: Icon(
                            Icons.map_outlined,
                            size: 30,
                            color: Colors.white,
                          ),
                        ),
                      ),
                    ],
                  ),
                  const SizedBox(
                    height: 52,
                  ),
                  const Text(
                    'Not found',
                    textAlign: TextAlign.start,
                    style: TextStyle(fontSize: 20, fontWeight: FontWeight.bold),
                  ),
                  const SizedBox(
                    height: 52,
                  ),
                ],
              ),
            ),
          ),
          Visibility(
            visible: searchResults.isNotEmpty,
            child: Center(
              child: MediaQuery.removePadding(
                context: context,
                removeTop: true,
                removeLeft: true,
                child: ListView.builder(
                  physics: const BouncingScrollPhysics(),
                  shrinkWrap: true,
                  itemBuilder: (context, index) => SearchTile(
                    searchResult: searchResults[index],
                  ),
                  itemCount: searchResults.length,
                ),
              ),
            ),
          ),
          const SizedBox(
            height: 8,
          ),
        ],
      ),
    );
  }
}

class SearchLoadingWidget extends StatelessWidget {
  const SearchLoadingWidget({super.key});

  @override
  Widget build(BuildContext context) {
    return const Padding(
      padding: EdgeInsets.symmetric(vertical: 20),
      child: Center(
        child: LoadingWidget(backgroundColor: Colors.transparent),
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
        if (state is SingleSiteState) {
          return const SizedBox();
        }

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
                    context
                        .read<MapBloc>()
                        .add(MapSearchTermChanged(searchTerm: value));
                  },
                  onTap: () {
                    context.read<MapBloc>().add(const MapSearchReset());
                  },
                  style: Theme.of(context).textTheme.caption?.copyWith(
                        fontSize: 16,
                      ),
                  enableSuggestions: true,
                  cursorWidth: 1,
                  autofocus: false,
                  cursorColor: CustomColors.appColorBlack,
                  decoration: InputDecoration(
                    fillColor: Colors.white,
                    prefixIcon: Padding(
                      padding: const EdgeInsets.only(
                        right: 0,
                        top: 7,
                        bottom: 7,
                        left: 0,
                      ),
                      child: SvgPicture.asset(
                        'assets/icon/search.svg',
                        semanticsLabel: 'Search',
                      ),
                    ),
                    contentPadding: const EdgeInsets.fromLTRB(0, 0, 0, 0),
                    focusedBorder: OutlineInputBorder(
                      borderSide: const BorderSide(
                        color: Colors.transparent,
                        width: 1.0,
                      ),
                      borderRadius: BorderRadius.circular(8.0),
                    ),
                    enabledBorder: OutlineInputBorder(
                      borderSide: const BorderSide(
                        color: Colors.transparent,
                        width: 1.0,
                      ),
                      borderRadius: BorderRadius.circular(8.0),
                    ),
                    border: OutlineInputBorder(
                      borderSide: const BorderSide(
                        color: Colors.transparent,
                        width: 1.0,
                      ),
                      borderRadius: BorderRadius.circular(8.0),
                    ),
                    hintStyle: Theme.of(context).textTheme.caption?.copyWith(
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
                if (state is! AllSitesState) {
                  return Row(
                    mainAxisSize: MainAxisSize.min,
                    children: [
                      const SizedBox(
                        width: 8.0,
                      ),
                      GestureDetector(
                        onTap: () {
                          _searchController.text = '';
                          context.read<MapBloc>().add(const ShowAllSites());
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
