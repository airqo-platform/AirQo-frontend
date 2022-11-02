part of 'search_page.dart';

class SearchResultsWidget extends StatefulWidget {
  const SearchResultsWidget({
    Key? key,
    required this.searchResultItems,
  }) : super(key: key);
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

class SearchPlaceTile extends StatelessWidget {
  const SearchPlaceTile({
    super.key,
    required this.searchSuggestion,
  });

  final Suggestion searchSuggestion;

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: const EdgeInsets.only(left: 16.0, right: 30.0),
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: const BorderRadius.all(
          Radius.circular(8.0),
        ),
        border: Border.fromBorderSide(
          BorderSide(color: Colors.transparent),
        ),
      ),
      child: ListTile(
        contentPadding: const EdgeInsets.only(left: 0.0),
        title: Text(
          searchSuggestion.suggestionDetails.getMainText(),
          maxLines: 1,
          overflow: TextOverflow.ellipsis,
          style: CustomTextStyle.headline8(context),
        ),
        subtitle: Text(
          searchSuggestion.suggestionDetails.getSecondaryText(),
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
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: const BorderRadius.all(
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
    required this.searchChanged,
  });

  final TextEditingController textEditingController;
  final Function(String) searchChanged;

  @override
  Widget build(BuildContext context) {
    return Container(
      height: 40,
      constraints: const BoxConstraints(minWidth: double.maxFinite),
      decoration: const BoxDecoration(
        color: Colors.white,
        shape: BoxShape.rectangle,
        borderRadius: BorderRadius.all(
          Radius.circular(10.0),
        ),
      ),
      child: TextFormField(
        controller: textEditingController,
        onChanged: searchChanged,
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
            padding:
                const EdgeInsets.only(right: 7, top: 7, bottom: 7, left: 7),
            child: SvgPicture.asset(
              'assets/icon/search.svg',
              height: 14.38,
              width: 14.38,
              semanticsLabel: 'Search',
            ),
          ),
          contentPadding: const EdgeInsets.fromLTRB(10, 10, 10, 10),
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
          hintText: 'Search locations',
          hintStyle: Theme.of(context).textTheme.caption?.copyWith(
                color: CustomColors.appColorBlack.withOpacity(0.32),
                fontSize: 14,
                fontWeight: FontWeight.w400,
              ),
        ),
      ),
    );
  }
}

class NoNearbyLocations extends StatelessWidget {
  const NoNearbyLocations({
    super.key,
  });

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
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: const BorderRadius.all(
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
  const AirQualityNotAvailable({Key? key}) : super(key: key);

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
