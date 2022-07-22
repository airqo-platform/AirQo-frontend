import 'package:app/constants/config.dart';
import 'package:app/models/measurement.dart';
import 'package:app/models/place_details.dart';
import 'package:app/models/suggestion.dart';
import 'package:app/screens/search/search_widgets.dart';
import 'package:app/widgets/dialogs.dart';
import 'package:flutter/material.dart';

import '../../services/local_storage.dart';
import '../../services/location_service.dart';
import '../../services/rest_api.dart';
import '../../themes/colors.dart';
import '../../utils/exception.dart';
import '../../widgets/buttons.dart';
import '../insights/insights_page.dart';

class SearchPage extends StatefulWidget {
  const SearchPage({
    super.key,
  });

  @override
  State<SearchPage> createState() => _SearchPageState();
}

class _SearchPageState extends State<SearchPage> {
  List<Measurement> _nearbySites = [];
  List<Measurement> _searchSites = [];
  List<Suggestion> _searchSuggestions = [];
  List<Measurement> _allSites = [];
  bool _isSearching = false;
  bool _emptyView = false;
  bool _hasNearbyLocations = true;

  final TextEditingController _textEditingController = TextEditingController();

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        toolbarHeight: 72,
        elevation: 0,
        backgroundColor: CustomColors.appBodyColor,
        automaticallyImplyLeading: false,
        leading: const Padding(
          padding: EdgeInsets.only(
            top: 5,
            bottom: 6.5,
            left: 16,
          ),
          child: AppBackButton(),
        ),
        title: Padding(
          padding: const EdgeInsets.only(top: 0),
          child: SearchInputField(
            textEditingController: _textEditingController,
            searchChanged: _searchChanged,
          ),
        ),
      ),
      body: Container(
        padding: const EdgeInsets.only(left: 16.0, right: 16.0),
        color: CustomColors.appBodyColor,
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            const SizedBox(
              height: 20,
            ),
            Visibility(
              visible: !_isSearching &&
                  _hasNearbyLocations &&
                  _nearbySites.isNotEmpty,
              child: Text(
                'Locations near you',
                textAlign: TextAlign.start,
                style: TextStyle(
                  color: CustomColors.inactiveColor,
                  fontSize: 12,
                ),
              ),
            ),
            loadMainView(),
          ],
        ),
      ),
    );
  }

  Future<void> _getSites() async {
    await DBHelper().getLatestMeasurements().then(
          (value) => {
            if (mounted)
              {
                setState(() => _allSites = value),
              },
          },
        );
  }

  Future<void> _getUserLocation() async {
    try {
      final location = await LocationService.getLocation();
      if (location == null) {
        await showSnackBar(
          context,
          Config.allowLocationMessage,
        );

        return;
      }
      final latitude = location.latitude;
      final longitude = location.longitude;
      if (longitude != null && latitude != null) {
        await LocationService.getNearestSites(latitude, longitude).then(
          (value) => {
            if (mounted)
              {
                if (value.isEmpty)
                  {
                    setState(() {
                      _nearbySites = [];
                      _hasNearbyLocations = false;
                    }),
                  }
                else
                  {
                    setState(() {
                      _nearbySites = value;
                      _hasNearbyLocations = true;
                    }),
                  },
              },
          },
        );
      } else {
        throw Exception('Failed to get your location');
      }
    } catch (exception, stackTrace) {
      await logException(exception, stackTrace, remoteLogging: false);
      await showSnackBar(
        context,
        Config.locationErrorMessage,
      );
    }
  }

  @override
  void initState() {
    super.initState();
    _initialize();
  }

  void _initialize() async {
    await Future.wait([
      _getSites(),
      _getUserLocation(),
    ]);
  }

  Widget loadMainView() {
    if (_emptyView) {
      return ListView(
        shrinkWrap: true,
        children: [
          const SizedBox(
            height: 80,
          ),
          Visibility(
            visible: false,
            child: Image.asset(
              'assets/icon/coming_soon.png',
              height: 80,
              width: 80,
            ),
          ),
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
          const Padding(
            padding: EdgeInsets.only(left: 30, right: 30),
            child: Text(
              'Coming soon on the network',
              textAlign: TextAlign.center,
              style: TextStyle(
                fontSize: 24,
                fontWeight: FontWeight.bold,
              ),
            ),
          ),
          const SizedBox(
            height: 8,
          ),
          Padding(
            padding: const EdgeInsets.only(left: 20, right: 20),
            child: Text(
              'We currently do not support air quality '
              'monitoring in this area, but we’re working on it.',
              textAlign: TextAlign.center,
              style: TextStyle(
                fontSize: 14,
                color: Colors.black.withOpacity(0.4),
              ),
            ),
          ),
        ],
      );
    }

    if (_isSearching) {
      return Expanded(
        child: MediaQuery.removePadding(
          context: context,
          removeTop: true,
          child: ListView(
            shrinkWrap: true,
            children: [
              searchLocations(),
            ],
          ),
        ),
      );
    }

    if (_hasNearbyLocations) {
      return Expanded(
        child: MediaQuery.removePadding(
          context: context,
          removeTop: true,
          child: ListView(
            shrinkWrap: true,
            children: [
              if (_nearbySites.isEmpty)
                RequestLocationAccess(
                  getUserLocation: _getUserLocation,
                ),
              if (_nearbySites.isNotEmpty)
                NearbyLocations(
                  nearbyLocations: _nearbySites,
                ),
            ],
          ),
        ),
      );
    }

    return Expanded(
      child: ListView(
        shrinkWrap: true,
        children: const [
          NoNearbyLocations(),
        ],
      ),
    );
  }

  void _searchChanged(String text) {
    if (text.isEmpty) {
      setState(
        () {
          _isSearching = false;
          _emptyView = false;
        },
      );
    } else {
      setState(
        () {
          _isSearching = true;
          _emptyView = false;
        },
      );

      SearchApi().fetchSuggestions(text).then(
            (value) => {
              if (mounted)
                {
                  setState(() => _searchSuggestions = value),
                },
            },
          );

      if (!mounted) {
        return;
      }

      setState(
        () => _searchSites =
            LocationService.textSearchNearestSites(text, _allSites),
      );
    }
  }

  Widget searchLocations() {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Visibility(
          visible: _searchSites.isEmpty && _searchSuggestions.isEmpty,
          child: Center(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.center,
              mainAxisAlignment: MainAxisAlignment.center,
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
          visible: _searchSites.isNotEmpty && _searchSuggestions.isEmpty,
          child: Center(
            child: MediaQuery.removePadding(
              context: context,
              removeTop: true,
              child: ListView.builder(
                controller: ScrollController(),
                shrinkWrap: true,
                itemBuilder: (context, index) => GestureDetector(
                  onTap: () {
                    Navigator.push(
                      context,
                      MaterialPageRoute(
                        builder: (context) {
                          return InsightsPage(
                            PlaceDetails.siteToPLace(_searchSites[index].site),
                          );
                        },
                      ),
                    );
                  },
                  child: Padding(
                    padding: const EdgeInsets.only(bottom: 10),
                    child: SearchLocationTile(
                      measurement: _searchSites[index],
                    ),
                  ),
                ),
                itemCount: _searchSites.length,
              ),
            ),
          ),
        ),
        Visibility(
          visible: _searchSuggestions.isNotEmpty,
          child: Center(
            child: MediaQuery.removePadding(
              context: context,
              removeTop: true,
              child: ListView.builder(
                controller: ScrollController(),
                shrinkWrap: true,
                itemBuilder: (context, index) => GestureDetector(
                  onTap: () {
                    showPlaceDetails(_searchSuggestions[index]);
                  },
                  child: Padding(
                    padding: const EdgeInsets.only(bottom: 10),
                    child: SearchPlaceTile(
                      searchSuggestion: _searchSuggestions[index],
                    ),
                  ),
                ),
                itemCount: _searchSuggestions.length,
              ),
            ),
          ),
        ),
        const SizedBox(
          height: 8,
        ),
      ],
    );
  }

  Future<void> showPlaceDetails(Suggestion suggestion) async {
    if (!mounted) {
      return;
    }
    setState(() =>
        _textEditingController.text = suggestion.suggestionDetails.mainText);
    final place = await SearchApi().getPlaceDetails(suggestion.placeId);
    if (place != null) {
      final nearestSite = await LocationService.getNearestSite(
        place.geometry.location.lat,
        place.geometry.location.lng,
      );

      if (nearestSite == null) {
        setState(() => _emptyView = true);

        return;
      }

      final placeDetails = PlaceDetails(
        name: suggestion.suggestionDetails.getMainText(),
        location: suggestion.suggestionDetails.getSecondaryText(),
        siteId: nearestSite.id,
        placeId: suggestion.placeId,
        latitude: place.geometry.location.lat,
        longitude: place.geometry.location.lng,
      );

      await Navigator.push(
        context,
        MaterialPageRoute(
          builder: (context) {
            return InsightsPage(placeDetails);
          },
        ),
      );
    } else {
      await showSnackBar(
        context,
        'Try again later',
      );
    }
  }
}
