import 'package:app/constants/app_constants.dart';
import 'package:app/models/measurement.dart';
import 'package:app/models/place_details.dart';
import 'package:app/models/suggestion.dart';
import 'package:app/services/local_storage.dart';
import 'package:app/services/native_api.dart';
import 'package:app/services/rest_api.dart';
import 'package:app/utils/dialogs.dart';
import 'package:app/widgets/custom_widgets.dart';
import 'package:flutter/material.dart';
import 'package:flutter_svg/svg.dart';
import 'package:uuid/uuid.dart';

import 'insights_page.dart';

class SearchPage extends StatefulWidget {
  const SearchPage({Key? key}) : super(key: key);

  @override
  _SearchPageState createState() => _SearchPageState();
}

class _SearchPageState extends State<SearchPage> {
  List<Measurement> _nearbySites = [];
  List<Measurement> _searchSites = [];
  List<Suggestion> _searchSuggestions = [];
  List<Measurement> _allSites = [];
  bool _isSearching = false;
  bool _hasNearbyLocations = true;
  final String _sessionToken = const Uuid().v4();
  SearchApi? _searchApiClient;
  final DBHelper _dbHelper = DBHelper();
  final LocationService _locationService = LocationService();
  final TextEditingController _textEditingController = TextEditingController();

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      body: Container(
        padding: const EdgeInsets.only(left: 16.0, right: 16.0, top: 40),
        color: ColorConstants.appBodyColor,
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            const SizedBox(
              height: 24,
            ),
            Row(
              children: <Widget>[
                Padding(
                  padding: const EdgeInsets.only(right: 16.0),
                  child: backButton(context),
                ),
                Expanded(
                  child: searchField(),
                )
              ],
            ),
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
                    color: ColorConstants.inactiveColor, fontSize: 12),
              ),
            ),
            Visibility(
              visible: _isSearching,
              child: Expanded(
                child: MediaQuery.removePadding(
                    context: context,
                    removeTop: true,
                    child: ListView(
                      shrinkWrap: true,
                      children: [
                        searchLocations(),
                      ],
                    )),
              ),
            ),
            Visibility(
              visible: !_isSearching && _hasNearbyLocations,
              child: Expanded(
                child: MediaQuery.removePadding(
                    context: context,
                    removeTop: true,
                    child: ListView(
                      shrinkWrap: true,
                      children: [
                        if (_nearbySites.isEmpty) requestLocationAccess(),
                        if (_nearbySites.isNotEmpty) nearByLocations(),
                      ],
                    )),
              ),
            ),
            Visibility(
              visible: !_isSearching && !_hasNearbyLocations,
              child: Expanded(
                child: ListView(
                  shrinkWrap: true,
                  children: [
                    noNearbyLocations(),
                  ],
                ),
              ),
            ),
          ],
        ),
      ),
    );
  }

  Future<void> getSites() async {
    await _dbHelper.getLatestMeasurements().then((value) => {
          if (mounted)
            {
              setState(() {
                _allSites = value;
              })
            }
        });
  }

  Future<void> getUserLocation() async {
    try {
      var location = await _locationService.getLocation();
      var latitude = location.latitude;
      var longitude = location.longitude;
      if (longitude != null && latitude != null) {
        await _locationService
            .getNearestSites(latitude, longitude)
            .then((value) => {
                  if (mounted)
                    {
                      if (value.isEmpty)
                        {
                          setState(() {
                            _nearbySites = [];
                            _hasNearbyLocations = false;
                          })
                        }
                      else
                        {
                          setState(() {
                            _nearbySites = value;
                            _hasNearbyLocations = true;
                          })
                        }
                    }
                });
      } else {
        throw Exception('Failed to get your location');
      }
    } catch (e) {
      var error = e.toString().replaceAll('Exception :', '');
      error = error.replaceAll('Exception', '');
      error = error.replaceAll(':', '');
      await showSnackBar(context, error);
    }
  }

  @override
  void initState() {
    _searchApiClient = SearchApi(_sessionToken, context);
    getSites();
    getUserLocation();
    super.initState();
  }

  Widget nearByLocations() {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        const SizedBox(
          height: 8.0,
        ),
        Container(
            padding: const EdgeInsets.only(bottom: 8),
            decoration: BoxDecoration(
                color: ColorConstants.appBodyColor,
                shape: BoxShape.rectangle,
                borderRadius: const BorderRadius.all(Radius.circular(10.0))),
            child: MediaQuery.removePadding(
                context: context,
                removeTop: true,
                child: ListView.builder(
                  controller: ScrollController(),
                  shrinkWrap: true,
                  itemBuilder: (context, index) => GestureDetector(
                      onTap: () {
                        Navigator.push(context,
                            MaterialPageRoute(builder: (context) {
                          return InsightsPage(PlaceDetails.siteToPLace(
                              _nearbySites[index].site));
                        }));
                      },
                      child: Padding(
                        padding: const EdgeInsets.only(bottom: 10),
                        child: searchLocationTile(_nearbySites[index]),
                      )),
                  itemCount: _nearbySites.length,
                  // separatorBuilder: (BuildContext context, int index) {
                  //   return Divider(
                  //     indent: 20,
                  //     endIndent: 20,
                  //     color: ColorConstants.appColor,
                  //   );
                  // }
                ))),
      ],
    );
  }

  Widget noNearbyLocations() {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Container(
          padding: const EdgeInsets.all(40.0),
          decoration: const BoxDecoration(
              color: Colors.white,
              shape: BoxShape.rectangle,
              borderRadius: BorderRadius.all(Radius.circular(10.0))),
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
                      color: ColorConstants.appColorBlue,
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
                'You don\'t have nearby air quality stations',
                textAlign: TextAlign.center,
                style: TextStyle(fontSize: 20, fontWeight: FontWeight.bold),
              ),
              const SizedBox(
                height: 40,
              ),
            ],
          ),
        )
      ],
    );
  }

  Widget requestLocationAccess() {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Container(
          padding: const EdgeInsets.all(40.0),
          decoration: const BoxDecoration(
              color: Colors.white,
              shape: BoxShape.rectangle,
              borderRadius: BorderRadius.all(Radius.circular(10.0))),
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
                      color: ColorConstants.appColorBlue,
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
                'Enable locations',
                textAlign: TextAlign.start,
                style: TextStyle(fontSize: 20, fontWeight: FontWeight.bold),
              ),
              const SizedBox(
                height: 8,
              ),
              const Text(
                'Allow AirQo to show you location air '
                'quality update near you.',
                textAlign: TextAlign.center,
                style: TextStyle(fontSize: 12),
              ),
              const SizedBox(
                height: 24,
              ),
              GestureDetector(
                onTap: () {
                  _locationService
                      .requestLocationAccess()
                      .then((value) => {getUserLocation()});
                },
                child: Container(
                    constraints:
                        const BoxConstraints(minWidth: double.infinity),
                    decoration: BoxDecoration(
                        color: ColorConstants.appColorBlue,
                        borderRadius:
                            const BorderRadius.all(Radius.circular(10.0))),
                    child: Padding(
                      padding: const EdgeInsets.only(top: 19, bottom: 19),
                      child: Row(
                        crossAxisAlignment: CrossAxisAlignment.center,
                        mainAxisAlignment: MainAxisAlignment.center,
                        children: const [
                          Text(
                            'Allow location',
                            textAlign: TextAlign.center,
                            style: TextStyle(
                              color: Colors.white,
                            ),
                          )
                        ],
                      ),
                    )),
              ),
              const SizedBox(
                height: 40,
              ),
            ],
          ),
        )
      ],
    );
  }

  void searchChanged(String text) {
    if (text.isEmpty) {
      setState(() {
        _isSearching = false;
      });
    } else {
      setState(() {
        _isSearching = true;
      });

      _searchApiClient!.fetchSuggestions(text).then((value) => {
            if (mounted)
              {
                setState(() {
                  _searchSuggestions = value;
                })
              }
          });

      if (!mounted) {
        return;
      }

      setState(() {
        _searchSites = _locationService.textSearchNearestSites(text, _allSites);
      });
    }
  }

  Widget searchField() {
    return Container(
      height: 40,
      constraints: const BoxConstraints(minWidth: double.maxFinite),
      decoration: const BoxDecoration(
          color: Colors.white,
          shape: BoxShape.rectangle,
          borderRadius: BorderRadius.all(Radius.circular(10.0))),
      child: Row(
        children: [
          const SizedBox(
            width: 10,
          ),
          SvgPicture.asset(
            'assets/icon/search.svg',
            height: 17,
            width: 17,
            semanticsLabel: 'Search',
          ),
          const SizedBox(
            width: 11,
          ),
          Expanded(
            child: TextFormField(
              controller: _textEditingController,
              onChanged: searchChanged,
              cursorWidth: 1,
              cursorColor: ColorConstants.appColorBlue,
              autofocus: true,
              decoration: InputDecoration(
                hintText: 'Search your village air quality',
                border: InputBorder.none,
                focusedBorder: InputBorder.none,
                enabledBorder: InputBorder.none,
                suffixIcon: _textEditingController.text != ''
                    ? MediaQuery.removePadding(
                        context: context,
                        removeRight: true,
                        removeLeft: true,
                        removeBottom: true,
                        removeTop: true,
                        child: GestureDetector(
                            onTap: () {
                              _textEditingController.text = '';
                              searchChanged('');
                            },
                            child: Container(
                              padding: const EdgeInsets.only(
                                  left: 10, top: 10, bottom: 10),
                              height: 15,
                              width: 15,
                              child: SvgPicture.asset(
                                'assets/icon/text_clear_btn.svg',
                                height: 15,
                                width: 15,
                              ),
                            )),
                      )
                    : null,
              ),
            ),
          ),
          const SizedBox(
            width: 10,
          ),
        ],
      ),
    );
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
                          color: ColorConstants.appColorBlue,
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
            )),
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
                          Navigator.push(context,
                              MaterialPageRoute(builder: (context) {
                            return InsightsPage(PlaceDetails.siteToPLace(
                                _searchSites[index].site));
                          }));
                        },
                        child: Padding(
                          padding: const EdgeInsets.only(bottom: 10),
                          child: searchLocationTile(_searchSites[index]),
                        )),
                    itemCount: _searchSites.length,
                  )),
            )),
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
                          child: searchPlaceTile(_searchSuggestions[index]),
                        )),
                    itemCount: _searchSuggestions.length,
                  )),
            )),
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
    setState(() {
      _textEditingController.text = suggestion.suggestionDetails.mainText;
    });
    var place = await _searchApiClient!.getPlaceDetails(suggestion.placeId);
    if (place != null) {
      var nearestSite = await _locationService.getNearestSite(
          place.geometry.location.lat, place.geometry.location.lng);

      if (nearestSite == null) {
        await showSnackBar(
            context,
            'Sorry, we currently don\'t have air quality for '
            '${suggestion.suggestionDetails.getMainText()}');
        return;
      }

      var placeDetails = PlaceDetails(
          suggestion.suggestionDetails.getMainText(),
          suggestion.suggestionDetails.getSecondaryText(),
          nearestSite.id,
          place.geometry.location.lat,
          place.geometry.location.lng);

      await Navigator.push(context, MaterialPageRoute(builder: (context) {
        return InsightsPage(placeDetails);
      }));
    } else {
      await showSnackBar(context, 'Try again later');
    }
  }
}
