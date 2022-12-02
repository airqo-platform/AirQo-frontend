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
import 'package:flutter/cupertino.dart';
import 'package:flutter/material.dart';
import 'package:flutter_bloc/flutter_bloc.dart';
import 'package:flutter_svg/svg.dart';

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
                const SizedBox(
                  height: 2,
                ),
                Text(
                  airQualityReading.location,
                  maxLines: 1,
                  overflow: TextOverflow.ellipsis,
                  style: CustomTextStyle.bodyText4(context)?.copyWith(
                    color: CustomColors.appColorBlack.withOpacity(0.3),
                    fontWeight: FontWeight.w400,
                  ),
                ),
                const SizedBox(
                  height: 2,
                ),
                AirQualityBadge(Pollutant.pm2_5.airQuality(
                  airQualityReading.pm2_5,
                )),
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
            child: Icon(
              Icons.arrow_forward_ios,
              size: 10,
              color: CustomColors.appColorBlack,
            ),
          ),
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

class AirQualityBadge extends StatelessWidget {
  const AirQualityBadge(this.airQuality, {super.key});
  final AirQuality airQuality;

  @override
  Widget build(BuildContext context) {
    return Container(
      height: 11,
      padding: const EdgeInsets.fromLTRB(1.5, 1.5, 2, 1.5),
      decoration: BoxDecoration(
        color: airQuality.color().withOpacity(0.4),
        borderRadius: const BorderRadius.all(
          Radius.circular(8.0),
        ),
      ),
      child: Row(
        mainAxisSize: MainAxisSize.min,
        mainAxisAlignment: MainAxisAlignment.center,
        crossAxisAlignment: CrossAxisAlignment.center,
        children: [
          Container(
            height: 8,
            width: 8,
            decoration: BoxDecoration(
              color: airQuality.color(),
              shape: BoxShape.circle,
            ),
          ),
          const SizedBox(
            width: 4,
          ),
          Center(
            child: Text(
              airQuality.string,
              style: CustomTextStyle.airQualityBadge(context),
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
                const SizedBox(
                  height: 2,
                ),
                AirQualityBadge(airQuality),
              ],
            ),
          ),
          const SizedBox(width: 2),
          BlocBuilder<SearchBloc, SearchState>(
            builder: (context, state) {
              return Container(
                height: 24,
                width: 24,
                padding: const EdgeInsets.all(2),
                decoration: BoxDecoration(
                  shape: BoxShape.circle,
                  border: Border.fromBorderSide(
                    BorderSide(
                      color: CustomColors.greyColor,
                      width: 3,
                    ),
                  ),
                ),
                child: Container(
                  height: 12,
                  width: 12,
                  decoration: BoxDecoration(
                    color: state.featuredAirQuality == airQuality
                        ? CustomColors.appColorBlue
                        : Colors.transparent,
                    shape: BoxShape.circle,
                  ),
                ),
              );
            },
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
            height: 5,
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
            height: 5,
          ),
          AnalyticsAvatar(airQualityReading: airQualityReading),
          const SizedBox(
            height: 4,
          ),
          AirQualityBadge(Pollutant.pm2_5.airQuality(airQualityReading.pm2_5)),
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
                  childAspectRatio: 1 / 1.2,
                ),
              ),
            ],
          ),
        );
      },
    );
  }
}

class SearchResultsWidget extends StatefulWidget {
  const SearchResultsWidget({super.key});

  @override
  State<SearchResultsWidget> createState() => _SearchResultsWidgetState();
}

class _SearchResultsWidgetState extends State<SearchResultsWidget> {
  final SearchRepository _searchRepository =
      SearchRepository(searchApiKey: Config.searchApiKey);

  @override
  Widget build(BuildContext context) {
    return BlocBuilder<SearchBloc, SearchState>(
      builder: (context, state) {
        if (state.searchResults.isEmpty) {
          // TODO replace is correct search widget
          return NoAirQualityDataWidget(callBack: () {});
        }

        return Padding(
          padding: const EdgeInsets.symmetric(horizontal: 16),
          child: ListView.builder(
            itemCount: state.searchResults.length,
            itemBuilder: (BuildContext context, int index) {
              return GestureDetector(
                onTap: () => _showPlaceDetails(state.searchResults[index]),
                child: Padding(
                  padding: const EdgeInsets.only(bottom: 10),
                  child: SearchResultItemTile(state.searchResults[index]),
                ),
              );
            },
          ),
        );
      },
    );
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
  const SearchResultItemTile(this.searchResultItem, {super.key});
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
  const SearchInputField({super.key});

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
      onChanged: (value) {
        context.read<SearchBloc>().add(SearchTermChanged(value));
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
        prefixIcon: Icon(
          Icons.search,
          color: CustomColors.appColorBlack,
        ),
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

class SearchLoadingWidget extends StatelessWidget {
  const SearchLoadingWidget({super.key});

  @override
  Widget build(BuildContext context) {
    return Center(
      child: Align(
        alignment: Alignment.center,
        child: CupertinoActivityIndicator(
          radius: 40,
          color: CustomColors.appColorBlue,
        ),
      ),
    );
  }
}
