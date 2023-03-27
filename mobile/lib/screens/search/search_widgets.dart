import 'package:app/blocs/blocs.dart';
import 'package:app/models/models.dart';
import 'package:app/screens/analytics/analytics_widgets.dart';
import 'package:app/services/location_service.dart';
import 'package:app/themes/theme.dart';
import 'package:app/utils/utils.dart';
import 'package:app/widgets/widgets.dart';
import 'package:auto_size_text/auto_size_text.dart';
import 'package:flutter/material.dart';
import 'package:flutter_bloc/flutter_bloc.dart';

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
          SvgIcons.pm2_5(airQualityReading.pm2_5),
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
          SvgIcons.pmUnit(airQualityReading.pm2_5),
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
          Radius.circular(8.0),
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
          const SizedBox(width: 7),
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
                const SizedBox(height: 2),
                AirQualityChip(
                  Pollutant.pm2_5.airQuality(
                    airQualityReading.pm2_5,
                  ),
                ),
              ],
            ),
          ),
          const SizedBox(width: 18),
          MaterialIcons.forwardIcon(),
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
      padding: const EdgeInsets.symmetric(
        horizontal: 5,
        vertical: 2,
      ),
      decoration: BoxDecoration(
        shape: BoxShape.circle,
        color: airQuality.color,
        border: const Border.fromBorderSide(
          BorderSide(color: Colors.transparent),
        ),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.center,
        mainAxisAlignment: MainAxisAlignment.center,
        children: [
          SvgIcons.pm2_5(airQuality.value),
          AutoSizeText(
            '${airQuality.minimumValue.toInt()}-${airQuality.maximumValue.toInt()}',
            maxLines: 1,
            minFontSize: 8,
            maxFontSize: 17,
            overflow: TextOverflow.ellipsis,
            style: CustomTextStyle.insightsAvatar(
              pollutant: Pollutant.pm2_5,
              value: airQuality.value,
            )?.copyWith(
              height: 21 / 17,
              letterSpacing: 16 * -0.022,
            ),
          ),
          SvgIcons.pmUnit(airQuality.value),
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
          Radius.circular(8.0),
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
          const SizedBox(width: 7),
          Expanded(
            child: Column(
              mainAxisSize: MainAxisSize.min,
              crossAxisAlignment: CrossAxisAlignment.start,
              mainAxisAlignment: MainAxisAlignment.start,
              children: [
                Text(
                  airQuality.title.toTitleCase(),
                  maxLines: 1,
                  overflow: TextOverflow.ellipsis,
                  style: CustomTextStyle.headline8(context),
                ),
                const SizedBox(
                  height: 2,
                ),
                AirQualityChip(airQuality),
              ],
            ),
          ),
          const SizedBox(width: 2),
          BlocBuilder<SearchFilterBloc, SearchFilterState>(
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
                    color: state.filteredAirQuality == airQuality
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

class SearchPageLoadingWidget extends StatelessWidget {
  const SearchPageLoadingWidget({super.key});

  @override
  Widget build(BuildContext context) {
    return SingleChildScrollView(
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          const SizedBox(
            height: 46,
          ),
          const ContainerLoadingAnimation(
            height: 80,
            radius: 8.0,
          ),
          const SizedBox(
            height: 16,
          ),
          const ContainerLoadingAnimation(
            height: 80,
            radius: 8.0,
          ),
          const SizedBox(
            height: 50,
          ),
          GridView.builder(
            shrinkWrap: true,
            itemCount: 4,
            physics: const NeverScrollableScrollPhysics(),
            padding: EdgeInsets.zero,
            itemBuilder: (_, index) {
              return const ContainerLoadingAnimation(
                radius: 10.0,
                height: 100,
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

    return SingleChildScrollView(
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        mainAxisAlignment: MainAxisAlignment.start,
        children: [
          Text(
            title,
            maxLines: 4,
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
                  onTap: () async {
                    await navigateToInsights(context, data[index]);
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
          AnalyticsAvatar(airQualityReading),
          const SizedBox(
            height: 4,
          ),
          AirQualityChip(Pollutant.pm2_5.airQuality(airQualityReading.pm2_5)),
        ],
      ),
    );
  }
}

class ExploreAfricanCitiesSection extends StatelessWidget {
  const ExploreAfricanCitiesSection({super.key});

  @override
  Widget build(BuildContext context) {
    return BlocBuilder<SearchFilterBloc, SearchFilterState>(
      builder: (context, state) {
        if (state.africanCities.isEmpty) {
          return Container();
        }

        return SingleChildScrollView(
          child: Column(
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
                    onTap: () async {
                      await navigateToInsights(
                        context,
                        state.africanCities[index],
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
              const SizedBox(
                height: 8,
              ),
            ],
          ),
        );
      },
    );
  }
}

class AutoCompleteResultsWidget extends StatefulWidget {
  const AutoCompleteResultsWidget({super.key});

  @override
  State<AutoCompleteResultsWidget> createState() =>
      _AutoCompleteResultsWidgetState();
}

class _AutoCompleteResultsWidgetState extends State<AutoCompleteResultsWidget> {
  Future<void> getAirQuality(SearchResult searchResult) async {
    final hasConnection = await hasNetworkConnection();
    if (!hasConnection) {
      if (!mounted) return;
      context.read<SearchBloc>().add(const NoSearchInternetConnection());

      return;
    }

    if (!mounted) return;

    loadingScreen(context);

    AirQualityReading? airQualityReading =
        await LocationService.getSearchAirQuality(searchResult);

    if (!mounted) return;

    Navigator.pop(context);

    if (airQualityReading == null) {
      context.read<SearchBloc>().add(GetSearchRecommendations(searchResult));

      return;
    }

    await navigateToInsights(context, airQualityReading);
  }

  @override
  Widget build(BuildContext context) {
    return BlocBuilder<SearchBloc, SearchState>(
      builder: (context, state) {
        if (state.searchResults.isEmpty) {
          return const NoSearchResultsWidget();
        }

        return ListView.builder(
          itemCount: state.searchResults.length,
          itemBuilder: (BuildContext context, int index) {
            return GestureDetector(
              onTap: () async {
                await getAirQuality(state.searchResults[index]);
              },
              child: Padding(
                padding: const EdgeInsets.symmetric(vertical: 4),
                child: AutoCompleteResultTile(state.searchResults[index]),
              ),
            );
          },
        );
      },
    );
  }
}

class AutoCompleteResultTile extends StatelessWidget {
  const AutoCompleteResultTile(this.searchResult, {super.key});
  final SearchResult searchResult;

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
          BorderSide(
            color: Colors.white,
          ),
        ),
      ),
      child: Row(
        children: [
          Container(
            height: 40,
            width: 40,
            decoration: BoxDecoration(
              color: CustomColors.appColorBlue.withOpacity(0.15),
              shape: BoxShape.circle,
            ),
            child: Center(child: SvgIcons.location()),
          ),
          const SizedBox(width: 7),
          Expanded(
            child: Column(
              mainAxisSize: MainAxisSize.min,
              crossAxisAlignment: CrossAxisAlignment.start,
              mainAxisAlignment: MainAxisAlignment.start,
              children: [
                Text(
                  searchResult.name,
                  maxLines: 1,
                  overflow: TextOverflow.ellipsis,
                  style: CustomTextStyle.headline8(context),
                ),
                const SizedBox(
                  height: 2,
                ),
                Text(
                  searchResult.location,
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
          MaterialIcons.forwardIcon(),
        ],
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
        Radius.circular(8.0),
      ),
    );

    return BlocBuilder<SearchBloc, SearchState>(
      builder: (context, state) {
        Widget? prefixIcon = state.searchTerm.isEmpty
            ? Icon(
                Icons.search,
                color: CustomColors.appColorBlack,
              )
            : null;

        return TextFormField(
          onTap: () {
            context.read<SearchPageCubit>().showSearching();
          },
          onChanged: (value) {
            context.read<SearchBloc>().add(SearchTermChanged(value));
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
            filled: true,
            prefixIcon: prefixIcon,
            contentPadding: const EdgeInsets.symmetric(
              horizontal: 5,
              vertical: 10,
            ),
            focusedBorder: border,
            enabledBorder: border,
            border: border,
            hintText: 'Search for Air Quality by location',
            hintStyle: Theme.of(context).textTheme.bodySmall?.copyWith(
                  color: CustomColors.appColorBlack.withOpacity(0.32),
                  fontSize: 14,
                  fontWeight: FontWeight.w400,
                ),
          ),
        );
      },
    );
  }
}

class AutoCompleteLoadingWidget extends StatelessWidget {
  const AutoCompleteLoadingWidget({super.key});

  @override
  Widget build(BuildContext context) {
    return ListView.builder(
      itemCount: 12,
      itemBuilder: (_, index) {
        return const Padding(
          padding: EdgeInsets.symmetric(vertical: 4),
          child: ContainerLoadingAnimation(
            height: 60,
            radius: 8.0,
          ),
        );
      },
    );
  }
}

class SearchBar extends StatelessWidget implements PreferredSizeWidget {
  const SearchBar({super.key});

  @override
  Widget build(BuildContext context) {
    return AppBar(
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
          BlocBuilder<SearchFilterBloc, SearchFilterState>(
            builder: (context, state) {
              Color foregroundColor = Colors.white;
              Color backgroundColor = CustomColors.appColorBlue;
              if (state.filteredAirQuality == null) {
                foregroundColor = CustomColors.appColorBlue;
                backgroundColor = CustomColors.appColorBlue.withOpacity(0.1);
              }

              return InkWell(
                onTap: () {
                  FocusScope.of(context).requestFocus(
                    FocusNode(),
                  );
                  _openAirQualityFilters(context);
                },
                child: Padding(
                  padding: const EdgeInsets.only(left: 6),
                  child: MaterialIcons.searchFilter(
                    foregroundColor: foregroundColor,
                    backgroundColor: backgroundColor,
                  ),
                ),
              );
            },
          ),
        ],
      ),
    );
  }

  @override
  Size get preferredSize => const Size.fromHeight(60);

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
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            mainAxisAlignment: MainAxisAlignment.start,
            children: [
              const SizedBox(
                height: 27,
              ),
              Row(
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
                      context
                          .read<SearchFilterBloc>()
                          .add(const InitializeSearchFilter());
                      Navigator.pop(context);
                    },
                    child: MaterialIcons.closeSearchFilter(),
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
                    padding: const EdgeInsets.symmetric(vertical: 4),
                    child: InkWell(
                      onTap: () {
                        context.read<SearchPageCubit>().showFiltering();
                        context.read<SearchFilterBloc>().add(
                              FilterByAirQuality(AirQuality.values[index]),
                            );
                        Navigator.pop(context);
                      },
                      child: SearchPageFilterTile(AirQuality.values[index]),
                    ),
                  );
                },
                itemCount: AirQuality.values.length,
              ),
            ],
          ),
        );
      },
    );
  }
}
