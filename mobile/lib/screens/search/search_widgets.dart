import 'package:app/blocs/blocs.dart';
import 'package:app/constants/constants.dart';
import 'package:app/models/models.dart';
import 'package:app/screens/analytics/analytics_widgets.dart';
import 'package:app/services/services.dart';
import 'package:app/themes/theme.dart';
import 'package:app/utils/extensions.dart';
import 'package:app/widgets/widgets.dart';
import 'package:app_repository/app_repository.dart';
import 'package:auto_size_text/auto_size_text.dart';
import 'package:flutter/material.dart';
import 'package:flutter_bloc/flutter_bloc.dart';
import 'package:flutter_svg/svg.dart';
import 'package:hive_flutter/hive_flutter.dart';

import '../insights/insights_page.dart';

class SearchAvatar extends StatelessWidget {
  const SearchAvatar(this.airQualityReading, {super.key});
  final AirQualityReading airQualityReading;

  @override
  Widget build(BuildContext context) {
    return Container(
      height: 54,
      width: 54,
      decoration: BoxDecoration(
        shape: BoxShape.circle,
        color: Pollutant.pm2_5.color(
          airQualityReading.pm2_5,
        ),
        border: const Border.fromBorderSide(
          BorderSide(color: Colors.transparent),
        ),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.center,
        mainAxisAlignment: MainAxisAlignment.center,
        children: [
          SvgPicture.asset(
            Pollutant.pm2_5.svg,
            semanticsLabel: 'Pm2.5',
            height: 7,
            width: 16,
            color: Pollutant.pm2_5.textColor(
              value: airQualityReading.pm2_5,
            ),
          ),
          Text(
            airQualityReading.pm2_5.toStringAsFixed(0),
            maxLines: 1,
            overflow: TextOverflow.ellipsis,
            style: CustomTextStyle.insightsAvatar(
              pollutant: Pollutant.pm2_5,
              value: airQualityReading.pm2_5,
            )?.copyWith(
              fontSize: 22,
              height: 25 / 22,
              letterSpacing: 16 * -0.022,
            ),
          ),
          SvgPicture.asset(
            'assets/icon/unit.svg',
            semanticsLabel: 'Unit',
            height: 7,
            width: 16,
            color: Pollutant.pm2_5.textColor(
              value: airQualityReading.pm2_5,
            ),
          ),
        ],
      ),
    );
  }
}

class SearchPageAirQualityTile extends StatelessWidget {
  const SearchPageAirQualityTile(this.airQualityReading, {super.key});
  final AirQualityReading airQualityReading;

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: const EdgeInsets.all(10),
      decoration: const BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.all(
          Radius.circular(16.0),
        ),
        border: Border.fromBorderSide(
          BorderSide(
            color: Colors.white,
          ),
        ),
      ),
      child: Row(
        children: [
          SearchAvatar(airQualityReading),
          const SizedBox(width: 18),
          Expanded(
            child: Column(
              mainAxisSize: MainAxisSize.min,
              crossAxisAlignment: CrossAxisAlignment.start,
              mainAxisAlignment: MainAxisAlignment.start,
              children: [
                Text(
                  airQualityReading.name,
                  maxLines: 1,
                  overflow: TextOverflow.ellipsis,
                  style: CustomTextStyle.headline8(context),
                ),
                Text(
                  airQualityReading.location,
                  maxLines: 1,
                  overflow: TextOverflow.ellipsis,
                  style: CustomTextStyle.bodyText4(context)?.copyWith(
                    color: CustomColors.appColorBlack.withOpacity(0.3),
                  ),
                ),
              ],
            ),
          ),
          const SizedBox(width: 18),
          Container(
              height: 24,
              width: 24,
              decoration: BoxDecoration(
                color: CustomColors.appBodyColor,
                borderRadius: const BorderRadius.all(
                  Radius.circular(4.0),
                ),
              ),
              child: const Icon(
                Icons.arrow_forward_ios,
                size: 10,
              )),
        ],
      ),
    );
  }
}

class SearchAirQualityAvatar extends StatelessWidget {
  const SearchAirQualityAvatar(this.airQuality, {super.key});
  final AirQuality airQuality;

  @override
  Widget build(BuildContext context) {
    return Container(
      height: 54,
      width: 54,
      decoration: BoxDecoration(
        shape: BoxShape.circle,
        color: airQuality.color(),
        border: const Border.fromBorderSide(
          BorderSide(color: Colors.transparent),
        ),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.center,
        mainAxisAlignment: MainAxisAlignment.center,
        children: [
          SvgPicture.asset(
            Pollutant.pm2_5.svg,
            semanticsLabel: 'Pm2.5',
            height: 8,
            width: 16,
            color: Pollutant.pm2_5.textColor(
              value: airQuality.value,
            ),
          ),
          AutoSizeText(
            '${airQuality.minimumValue.toInt()}-${airQuality.maximumValue.toInt()}',
            maxLines: 1,
            overflow: TextOverflow.ellipsis,
            style: CustomTextStyle.insightsAvatar(
              pollutant: Pollutant.pm2_5,
              value: airQuality.value,
            )?.copyWith(
              fontSize: 17,
              height: 21 / 17,
              letterSpacing: 16 * -0.022,
            ),
          ),
          SvgPicture.asset(
            'assets/icon/unit.svg',
            semanticsLabel: 'Unit',
            height: 10,
            width: 16,
            color: Pollutant.pm2_5.textColor(
              value: airQuality.value,
            ),
          ),
        ],
      ),
    );
  }
}

class SearchPageFilterTile extends StatelessWidget {
  const SearchPageFilterTile(this.airQuality, {super.key});
  final AirQuality airQuality;

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: const EdgeInsets.all(10),
      decoration: const BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.all(
          Radius.circular(16.0),
        ),
        border: Border.fromBorderSide(
          BorderSide(
            color: Colors.white,
          ),
        ),
      ),
      child: Row(
        children: [
          SearchAirQualityAvatar(airQuality),
          const SizedBox(width: 18),
          Expanded(
            child: Column(
              mainAxisSize: MainAxisSize.min,
              crossAxisAlignment: CrossAxisAlignment.start,
              mainAxisAlignment: MainAxisAlignment.start,
              children: [
                Text(
                  airQuality.string.toTitleCase(),
                  maxLines: 1,
                  overflow: TextOverflow.ellipsis,
                  style: CustomTextStyle.headline8(context),
                ),
              ],
            ),
          ),
          const SizedBox(width: 2),
          Container(
            height: 24,
            width: 24,
            decoration: BoxDecoration(
              color: CustomColors.appBodyColor,
              borderRadius: const BorderRadius.all(
                Radius.circular(4.0),
              ),
            ),
            child: const Icon(
              Icons.arrow_forward_ios,
              size: 10,
            ),
          ),
        ],
      ),
    );
  }
}

class SearchSection extends StatelessWidget {
  const SearchSection({
    super.key,
    required this.title,
    required this.airQualityReadings,
    this.maximumElements,
  });
  final String title;
  final int? maximumElements;
  final List<AirQualityReading> airQualityReadings;

  @override
  Widget build(BuildContext context) {
    List<AirQualityReading> data = airQualityReadings
        .take(maximumElements ?? airQualityReadings.length)
        .toList();
    if (data.isEmpty) {
      return Container();
    }
    return Padding(
      padding: const EdgeInsets.symmetric(horizontal: 16),
      child: Column(
        mainAxisSize: MainAxisSize.min,
        crossAxisAlignment: CrossAxisAlignment.start,
        mainAxisAlignment: MainAxisAlignment.start,
        children: [
          Text(
            title,
            maxLines: 1,
            overflow: TextOverflow.ellipsis,
            style: CustomTextStyle.headline8(context)?.copyWith(
              color: CustomColors.appColorBlack.withOpacity(0.3),
            ),
          ),
          const SizedBox(
            height: 8,
          ),
          ListView.builder(
            shrinkWrap: true,
            physics: const NeverScrollableScrollPhysics(),
            itemBuilder: (_, index) {
              return Padding(
                padding: const EdgeInsets.symmetric(vertical: 8),
                child: InkWell(
                  onTap: () {
                    Navigator.push(
                      context,
                      MaterialPageRoute(
                        builder: (context) {
                          return InsightsPage(data[index]);
                        },
                      ),
                    );
                  },
                  child: SearchPageAirQualityTile(data[index]),
                ),
              );
            },
            itemCount: data.length,
          ),
          const SizedBox(
            height: 8,
          ),
        ],
      ),
    );
  }
}

class ExploreAfricanCityCard extends StatelessWidget {
  const ExploreAfricanCityCard(this.airQualityReading, {super.key});
  final AirQualityReading airQualityReading;

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: const EdgeInsets.all(10),
      decoration: const BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.all(
          Radius.circular(8.0),
        ),
        border: Border.fromBorderSide(
          BorderSide(color: Colors.white),
        ),
      ),
      child: Column(
        mainAxisAlignment: MainAxisAlignment.center,
        crossAxisAlignment: CrossAxisAlignment.center,
        children: [
          Text(
            airQualityReading.name.toTitleCase(),
            maxLines: 1,
            overflow: TextOverflow.ellipsis,
            textAlign: TextAlign.center,
            style: CustomTextStyle.headline8(context),
          ),
          const SizedBox(
            height: 4,
          ),
          Text(
            airQualityReading.country.toTitleCase(),
            maxLines: 1,
            overflow: TextOverflow.ellipsis,
            textAlign: TextAlign.center,
            style: CustomTextStyle.bodyText4(context)?.copyWith(
              color: CustomColors.appColorBlack.withOpacity(0.3),
            ),
          ),
          const SizedBox(
            height: 4,
          ),
          AnalyticsAvatar(airQualityReading: airQualityReading),
        ],
      ),
    );
  }

  Widget builds(BuildContext context) {
    return ListTile(
      leading: AnalyticsAvatar(airQualityReading: airQualityReading),
      title: Column(
        mainAxisSize: MainAxisSize.min,
        children: [
          Text(
            airQualityReading.name,
            maxLines: 1,
            overflow: TextOverflow.ellipsis,
            style: CustomTextStyle.headline8(context),
          ),
          Text(
            airQualityReading.location,
            maxLines: 1,
            overflow: TextOverflow.ellipsis,
            style: CustomTextStyle.bodyText4(context)?.copyWith(
              color: CustomColors.appColorBlack.withOpacity(0.3),
            ),
          ),
        ],
      ),
      trailing: Container(
        height: 16,
        width: 16,
        padding: const EdgeInsets.all(8),
        decoration: BoxDecoration(
          color: CustomColors.appColorBlue.withOpacity(0.24),
          borderRadius: const BorderRadius.all(
            Radius.circular(3.0),
          ),
          border: const Border.fromBorderSide(
            BorderSide(
              color: Colors.transparent,
            ),
          ),
        ),
        child: SvgPicture.asset(
          'assets/icon/more_arrow.svg',
          semanticsLabel: 'more',
          height: 6.99,
          width: 4,
        ),
      ),
    );
  }
}

class ExploreAfricanCitiesSection extends StatelessWidget {
  const ExploreAfricanCitiesSection({super.key});

  @override
  Widget build(BuildContext context) {
    return BlocBuilder<SearchBloc, SearchState>(
      builder: (context, state) {
        if (state.africanCities.isEmpty) {
          return Container();
        }

        return Padding(
          padding: const EdgeInsets.symmetric(horizontal: 16),
          child: Column(
            // mainAxisSize: MainAxisSize.min,
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Text(
                'Explore African Cities',
                maxLines: 1,
                overflow: TextOverflow.ellipsis,
                style: CustomTextStyle.headline8(context)?.copyWith(
                  color: CustomColors.appColorBlack.withOpacity(0.3),
                ),
              ),
              const SizedBox(
                height: 16,
              ),
              GridView.builder(
                shrinkWrap: true,
                itemCount: state.africanCities.length,
                physics: const NeverScrollableScrollPhysics(),
                padding: EdgeInsets.zero,
                itemBuilder: (_, index) {
                  return InkWell(
                    onTap: () {
                      Navigator.push(
                        context,
                        MaterialPageRoute(
                          builder: (context) {
                            return InsightsPage(state.africanCities[index]);
                          },
                        ),
                      );
                    },
                    child: ExploreAfricanCityCard(state.africanCities[index]),
                  );
                },
                gridDelegate: const SliverGridDelegateWithFixedCrossAxisCount(
                    crossAxisCount: 2,
                    crossAxisSpacing: 15,
                    mainAxisSpacing: 15,
                    childAspectRatio: 1 / 1.2),
              ),
            ],
          ),
        );
      },
    );
  }
}

class SearchResultsWidget extends StatefulWidget {
  const SearchResultsWidget({
    super.key,
    required this.searchResultItems,
  });
  final List<SearchResultItem> searchResultItems;

  @override
  State<SearchResultsWidget> createState() => _SearchResultsWidgetState();
}

class _SearchResultsWidgetState extends State<SearchResultsWidget> {
  late SearchBloc _searchBloc;
  final SearchRepository _searchRepository =
      SearchRepository(searchApiKey: Config.searchApiKey);

  @override
  Widget build(BuildContext context) {
    return ListView.builder(
      itemCount: widget.searchResultItems.length,
      itemBuilder: (BuildContext context, int index) {
        return GestureDetector(
          onTap: () => _showPlaceDetails(widget.searchResultItems[index]),
          child: Padding(
            padding: const EdgeInsets.only(bottom: 10),
            child: SearchResultItemTile(
              searchResultItem: widget.searchResultItems[index],
            ),
          ),
        );
      },
    );
  }

  @override
  void initState() {
    super.initState();
    _searchBloc = context.read<SearchBloc>();
  }

  @override
  void dispose() {
    _clearSearch();
    super.dispose();
  }

  void _clearSearch() {
    _searchBloc.add(const ResetSearch());
  }

  Future<void> _showPlaceDetails(SearchResultItem searchResultItem) async {
    if (!mounted) return;

    loadingScreen(context);

    final place = await _searchRepository.placeDetails(searchResultItem.id);

    if (place != null) {
      final nearestSite = await LocationService.getNearestSiteAirQualityReading(
        place.geometry.location.lat,
        place.geometry.location.lng,
      );

      if (!mounted) return;

      Navigator.pop(context);

      // TODO: Substitute with widget
      if (nearestSite == null) {
        showSnackBar(
          context,
          'Oops!!.. We don’t have air quality readings for'
          ' ${searchResultItem.name}',
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
                name: searchResultItem.name,
                location: searchResultItem.location,
                placeId: searchResultItem.id,
                latitude: place.geometry.location.lat,
                longitude: place.geometry.location.lng,
              ),
            );
          },
        ),
      );
    } else {
      if (!mounted) return;

      showSnackBar(
        context,
        'Try again later',
      );
    }
  }
}

class SearchResultItemTile extends StatelessWidget {
  const SearchResultItemTile({
    Key? key,
    required this.searchResultItem,
  }) : super(key: key);
  final SearchResultItem searchResultItem;

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: const EdgeInsets.only(left: 16.0, right: 30.0),
      decoration: const BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.all(
          Radius.circular(8.0),
        ),
        border: Border.fromBorderSide(
          BorderSide(color: Colors.transparent),
        ),
      ),
      child: ListTile(
        contentPadding: const EdgeInsets.only(left: 0.0),
        title: Text(
          searchResultItem.name,
          maxLines: 1,
          overflow: TextOverflow.ellipsis,
          style: CustomTextStyle.headline8(context),
        ),
        subtitle: Text(
          searchResultItem.location,
          maxLines: 1,
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
        leading: Container(
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
        ),
      ),
    );
  }
}

class SearchInputField extends StatelessWidget {
  const SearchInputField({
    super.key,
    required this.textEditingController,
  });

  final TextEditingController textEditingController;

  @override
  Widget build(BuildContext context) {
    const OutlineInputBorder border = OutlineInputBorder(
      borderSide: BorderSide(
        color: Colors.white,
        width: 1.0,
      ),
      borderRadius: BorderRadius.all(
        Radius.circular(10.0),
      ),
    );

    return TextFormField(
      controller: textEditingController,
      onChanged: (value) {
        context.read<SearchBloc>().add(SearchTermChanged(text: value));
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
        filled: true,
        prefixIcon: const Icon(Icons.search),
        contentPadding: const EdgeInsets.all(10),
        focusedBorder: border,
        enabledBorder: border,
        border: border,
        hintText: 'Search for Air Quality by location',
        hintStyle: Theme.of(context).textTheme.caption?.copyWith(
              color: CustomColors.appColorBlack.withOpacity(0.32),
              fontSize: 14,
              fontWeight: FontWeight.w400,
            ),
      ),
    );
  }
}

class NoNearbyLocations extends StatelessWidget {
  const NoNearbyLocations({super.key});

  @override
  Widget build(BuildContext context) {
    return Center(
      child: Container(
        padding: const EdgeInsets.all(40.0),
        decoration: const BoxDecoration(
          color: Colors.white,
          shape: BoxShape.rectangle,
          borderRadius: BorderRadius.all(
            Radius.circular(10.0),
          ),
        ),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.center,
          children: [
            const SizedBox(
              height: 84,
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
              'You don’t have nearby air quality stations',
              textAlign: TextAlign.center,
              style: TextStyle(fontSize: 20, fontWeight: FontWeight.bold),
            ),
            const SizedBox(
              height: 40,
            ),
          ],
        ),
      ),
    );
  }
}

class SearchLocationTile extends StatelessWidget {
  const SearchLocationTile({
    super.key,
    required this.airQualityReading,
  });

  final AirQualityReading airQualityReading;

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: const EdgeInsets.only(left: 16.0, right: 30.0),
      decoration: const BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.all(
          Radius.circular(8.0),
        ),
        border: Border.fromBorderSide(
          BorderSide(color: Colors.transparent),
        ),
      ),
      child: ListTile(
        contentPadding: const EdgeInsets.only(left: 0.0),
        title: AutoSizeText(
          airQualityReading.name,
          maxLines: 1,
          overflow: TextOverflow.ellipsis,
          style: CustomTextStyle.headline8(context),
        ),
        subtitle: AutoSizeText(
          airQualityReading.location,
          maxLines: 1,
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
        leading: MiniAnalyticsAvatar(
          airQualityReading: airQualityReading,
        ),
      ),
    );
  }
}

class RequestLocationAccess extends StatelessWidget {
  const RequestLocationAccess({super.key});

  @override
  Widget build(BuildContext context) {
    return Center(
      child: Container(
        padding: const EdgeInsets.all(40.0),
        decoration: const BoxDecoration(
          color: Colors.white,
          borderRadius: BorderRadius.all(
            Radius.circular(16.0),
          ),
        ),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.center,
          mainAxisSize: MainAxisSize.min,
          children: [
            Stack(
              children: [
                Padding(
                  padding: const EdgeInsets.only(left: 23),
                  child: Image.asset(
                    'assets/images/world-map.png',
                    height: 119,
                    width: 119,
                  ),
                ),
                Positioned(
                  left: 0,
                  top: 22,
                  child: Container(
                    height: 56,
                    width: 56,
                    decoration: BoxDecoration(
                      color: CustomColors.appColorBlue,
                      shape: BoxShape.circle,
                    ),
                    child: Padding(
                      padding: const EdgeInsets.all(12.0),
                      child: SvgPicture.asset(
                        'assets/icon/location.svg',
                        color: Colors.white,
                        semanticsLabel: 'AirQo Map',
                        height: 29,
                        width: 25,
                      ),
                    ),
                  ),
                ),
              ],
            ),
            const SizedBox(
              height: 24,
            ),
            Text(
              'Enable locations',
              textAlign: TextAlign.start,
              style: CustomTextStyle.headline7(context),
            ),
            const SizedBox(
              height: 8,
            ),
            Text(
              'Allow AirQo to show you location air '
              'quality update near you.',
              textAlign: TextAlign.center,
              style: Theme.of(context).textTheme.subtitle2?.copyWith(
                    color: CustomColors.appColorBlack.withOpacity(0.4),
                  ),
            ),
            const SizedBox(
              height: 24,
            ),
            GestureDetector(
              onTap: () => _getUserLocation(context),
              child: Container(
                decoration: BoxDecoration(
                  color: CustomColors.appColorBlue,
                  borderRadius: const BorderRadius.all(
                    Radius.circular(8.0),
                  ),
                ),
                child: const Padding(
                  padding: EdgeInsets.only(top: 12, bottom: 14),
                  child: Center(
                    child: Text(
                      'Allow location',
                      textAlign: TextAlign.center,
                      style: TextStyle(
                        color: Colors.white,
                        fontWeight: FontWeight.normal,
                        fontSize: 14,
                        height: 22 / 14,
                        letterSpacing: 16 * -0.022,
                      ),
                    ),
                  ),
                ),
              ),
            ),
          ],
        ),
      ),
    );
  }

  void _getUserLocation(BuildContext context) {
    PermissionService.checkPermission(AppPermission.location, request: true)
        .then((value) => context
            .read<NearbyLocationBloc>()
            .add(const SearchNearbyLocations()));
  }
}

class NearbyLocations extends StatelessWidget {
  const NearbyLocations({super.key});

  @override
  Widget build(BuildContext context) {
    final appColors = Theme.of(context).extension<AppColors>()!;

    return BlocBuilder<NearbyLocationBloc, NearbyLocationState>(
      builder: (context, state) {
        if (state is SearchingNearbyLocationsState) {
          return const LoadingWidget();
        }

        if (state is NearbyLocationStateError) {
          switch (state.error) {
            case NearbyAirQualityError.locationDenied:
              return const RequestLocationAccess();
            case NearbyAirQualityError.noNearbyAirQualityReadings:
              return const AirQualityNotAvailable();
            case NearbyAirQualityError.locationNotAllowed:
              WidgetsBinding.instance.addPostFrameCallback((_) {
                showSnackBar(context, state.error.message);
              });
              break;
            case NearbyAirQualityError.locationDisabled:
              WidgetsBinding.instance.addPostFrameCallback((_) {
                showSnackBar(context, state.error.message);
              });
              break;
          }
        }

        if (state is NearbyLocationStateSuccess) {
          return ValueListenableBuilder<Box<AirQualityReading>>(
            valueListenable:
                Hive.box<AirQualityReading>(HiveBox.nearByAirQualityReadings)
                    .listenable(),
            builder: (context, box, widget) {
              final airQualityReadings = filterNearestLocations(
                box.values.cast<AirQualityReading>().toList(),
              );

              return ListView(
                physics: const NeverScrollableScrollPhysics(),
                children: [
                  Text(
                    'Locations near me',
                    style: CustomTextStyle.overline1(context)?.copyWith(
                      color: appColors.appColorBlack.withOpacity(0.32),
                    ),
                  ),
                  const SizedBox(
                    height: 8,
                  ),
                  ListView.builder(
                    shrinkWrap: true,
                    itemBuilder: (context, index) => GestureDetector(
                      onTap: () {
                        Navigator.push(
                          context,
                          MaterialPageRoute(
                            builder: (context) {
                              return InsightsPage(airQualityReadings[index]);
                            },
                          ),
                        );
                      },
                      child: Padding(
                        padding: const EdgeInsets.only(bottom: 10),
                        child: SearchLocationTile(
                          airQualityReading: airQualityReadings[index],
                        ),
                      ),
                    ),
                    itemCount: airQualityReadings.length,
                  ),
                ],
              );
            },
          );
        }

        return const LoadingWidget();
      },
    );
  }
}

class SearchError extends StatelessWidget {
  const SearchError({super.key, this.error});

  final String? error;

  @override
  Widget build(BuildContext context) {
    return Center(
      child: Text(error ?? 'Search not available'),
    );
  }
}

class AirQualityNotAvailable extends StatelessWidget {
  const AirQualityNotAvailable({super.key});

  @override
  Widget build(BuildContext context) {
    final appColors = Theme.of(context).extension<AppColors>()!;

    return Center(
      child: Container(
        padding: const EdgeInsets.symmetric(horizontal: 24, vertical: 40),
        decoration: const BoxDecoration(
          color: Colors.white,
          borderRadius: BorderRadius.all(
            Radius.circular(16.0),
          ),
        ),
        child: Column(
          mainAxisSize: MainAxisSize.min,
          children: [
            Center(
              child: Stack(
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
            ),
            const SizedBox(
              height: 16,
            ),
            Text(
              'Coming soon on the network',
              textAlign: TextAlign.center,
              style: CustomTextStyle.headline7(context),
            ),
            const SizedBox(
              height: 8,
            ),
            Text(
              'We currently do not support air quality '
              'monitoring in this area, but we’re working on it.',
              textAlign: TextAlign.center,
              style: Theme.of(context)
                  .textTheme
                  .subtitle2
                  ?.copyWith(color: appColors.appColorBlack.withOpacity(0.4)),
            ),
          ],
        ),
      ),
    );
  }
}
