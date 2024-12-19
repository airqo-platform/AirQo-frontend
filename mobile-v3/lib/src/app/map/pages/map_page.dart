import 'package:airqo/src/app/dashboard/bloc/dashboard/dashboard_bloc.dart';
import 'package:airqo/src/app/dashboard/models/airquality_response.dart';
import 'package:airqo/src/app/dashboard/widgets/analytics_card.dart';
import 'package:airqo/src/app/dashboard/widgets/countries_chip.dart';
import 'package:airqo/src/app/other/places/bloc/google_places_bloc.dart';
import 'package:airqo/src/app/other/places/models/auto_complete_response.dart';
import 'package:airqo/src/app/shared/pages/error_page.dart';
import 'package:airqo/src/app/shared/widgets/analytics_card_loader.dart';
import 'package:airqo/src/app/shared/widgets/loading_widget.dart';
import 'package:airqo/src/app/shared/widgets/modal_wrapper.dart';
import 'package:airqo/src/meta/utils/colors.dart';
import 'package:airqo/src/meta/utils/utils.dart';
import 'package:airqo/src/meta/utils/widget_to_map_icon.dart';
import 'package:flutter/material.dart';
import 'package:flutter_bloc/flutter_bloc.dart';
import 'package:flutter_svg/svg.dart';
import 'package:google_maps_flutter/google_maps_flutter.dart';
import '../../dashboard/pages/dashboard_page.dart';

class MapScreen extends StatefulWidget {
  const MapScreen({super.key});

  @override
  State<MapScreen> createState() => _MapScreenState();
}

class _MapScreenState extends State<MapScreen>
    with AutomaticKeepAliveClientMixin {
  late GoogleMapController mapController;

  String? currentDetailsName;

  TextEditingController searchController = new TextEditingController();

  bool showDetails = false;
  bool showCustomDetails = false;
  Measurement? currentDetails;

  List<Measurement> filteredMeasurements = [];
  String currentFilter = "All";

  List<Measurement> allMeasurements = [];

  void filterByCountry(String country, List<Measurement> measurements) {
    setState(() {
      filteredMeasurements = measurements.where((measurement) {
        if (measurement.siteDetails != null) {
          return measurement.siteDetails!.country == country;
        }
        return false;
      }).toList();


      currentFilter = country;
    });
  }

  void resetFilter() {
    setState(() {
      filteredMeasurements = [];
      currentFilter = "All";
    });
  }

  List<Marker> markers = [];

  final LatLng _center = const LatLng(0.347596, 32.582520);

  void _onMapCreated(GoogleMapController controller) {
    mapController = controller;
  }

  Future<void> reduceZoom() async {
    var currentZoomLevel = await mapController.getZoomLevel();
    currentZoomLevel = currentZoomLevel - 2;
    mapController.animateCamera(CameraUpdate.zoomTo(currentZoomLevel));
  }

  void viewDetails({Measurement? measurement, String? placeName}) {
    if (measurement != null) {
      setState(() {
        showDetails = true;
        currentDetails = measurement;
      });

      mapController.animateCamera(
        CameraUpdate.newLatLngZoom(
          LatLng(measurement.siteDetails!.approximateLatitude!,
              measurement.siteDetails!.approximateLongitude!),
          16,
        ),
      );
    } else if (measurement == null && placeName != null) {
      googlePlacesBloc!.add(GetPlaceDetails(placeName));
      setState(() {
        showDetails = true;
        currentDetailsName = placeName;
      });
    }
  }

  void resetDetails() {
    mapController.animateCamera(
      CameraUpdate.newLatLngZoom(
        _center,
        6,
      ),
    );
    setState(() {
      showDetails = false;
      currentDetails = null;
      currentDetailsName = null;
    });
  }

  Future<void> increaseZoom() async {
    var currentZoomLevel = await mapController.getZoomLevel();
    currentZoomLevel = currentZoomLevel + 2;
    mapController.animateCamera(CameraUpdate.zoomTo(currentZoomLevel));
  }

  clearGooglePlaces() {
    googlePlacesBloc!.add(ResetGooglePlaces());
    searchController.clear();
  }

  GooglePlacesBloc? googlePlacesBloc;

  Future<void> addMarkers(AirQualityResponse response) async {
    for (var measurement in response.measurements!) {
      if (measurement.siteDetails != null) {
        markers.add(Marker(
          onTap: () => viewDetails(measurement: measurement),
          icon: await bitmapDescriptorFromSvgAsset(
              getAirQualityIcon(measurement, measurement.pm25!.value!)),
          position: LatLng(measurement.siteDetails!.approximateLatitude!,
              measurement.siteDetails!.approximateLongitude!),
          markerId: MarkerId(measurement.id!),
        ));
      }
    }

    setState(() {});
  }

  @override
  void initState() {
    googlePlacesBloc = context.read<GooglePlacesBloc>()
      ..add(ResetGooglePlaces());
    super.initState();
  }

  bool isModalFull = false;

  void toggleModal(bool value) {
    if (isModalFull != value) {
      setState(() {
        isModalFull = value;
      });
    }
  }

  void populateMeasurements(List<Measurement> measurements) {
    List<Measurement> finalMeasurements = [];

    for (var meas in measurements) {
      if (meas.siteDetails != null) {
        finalMeasurements.add(meas);
      }
    }
    setState(() {
      allMeasurements = finalMeasurements;
    });
  }

  @override
  Widget build(BuildContext context) {
    super.build(context);
    List<CountryModel> countries = [
      CountryModel("🇺🇬", "Uganda"),
      CountryModel("🇰🇪", "Kenya"),
      CountryModel("🇧🇮", "Burundi"),
      CountryModel("🇬🇭", "Ghana"),
      CountryModel("🇳🇬", "Nigeria"),
      CountryModel("🇨🇲", "Cameroon"),
      CountryModel("🇿🇦", "South Africa"),
      CountryModel("🇲🇿", "Mozambique"),
    ];

    List<Map<String, String>> airQualityData = [
      {
        "name": "Good",
        "airQualityRange": "0 - 12",
        "image": "assets/images/shared/airquality_indicators/good.svg"
      },
      {
        "name": "Moderate",
        "airQualityRange": "12.1 - 35.4",
        "image": "assets/images/shared/airquality_indicators/moderate.svg"
      },
      {
        "name": "Unhealthy for Sensitive Groups",
        "airQualityRange": "35.5 - 55.4",
        "image":
            "assets/images/shared/airquality_indicators/unhealthy-sensitive.svg"
      },
      {
        "name": "Unhealthy",
        "airQualityRange": "55.5 - 150.4",
        "image": "assets/images/shared/airquality_indicators/unhealthy.svg"
      },
      {
        "name": "Very Unhealthy",
        "airQualityRange": "150.5 - 250.4",
        "image": "assets/images/shared/airquality_indicators/very-unhealthy.svg"
      },
      {
        "name": "Hazardous",
        "airQualityRange": "250.5 and above",
        "image": "assets/images/shared/airquality_indicators/hazardous.svg"
      },
    ];
    return BlocListener<DashboardBloc, DashboardState>(
      listener: (context, state) async {
        if (state is DashboardLoaded) {
          await addMarkers(state.response);
          populateMeasurements(state.response.measurements!);
        }
      },
      child: BlocListener<GooglePlacesBloc, GooglePlacesState>(
        listener: (context, state) {
          if (state is PlaceDetailsLoaded) {
            mapController.animateCamera(
              CameraUpdate.newLatLngZoom(
                LatLng(
                    state.response.measurements[0].siteDetails!
                        .approximateLatitude!,
                    state.response.measurements[0].siteDetails!
                        .approximateLongitude!),
                16,
              ),
            );
          }
        },
        child: Scaffold(body: BlocBuilder<DashboardBloc, DashboardState>(
          builder: (context, state) {
            if (state is DashboardLoading) {
              return Center(
                child: CircularProgressIndicator(),
              );
            } else if (state is DashboardLoaded) {
              return Stack(
                children: [
                  Container(
                      height: double.infinity,
                      width: double.infinity,
                      color: Colors.white,
                      child: Center(child: Text("google map here"))),
                  GoogleMap(
                      zoomControlsEnabled: false,
                      myLocationEnabled: false,
                      zoomGesturesEnabled: true,
                      minMaxZoomPreference: MinMaxZoomPreference.unbounded,
                      onMapCreated: _onMapCreated,
                      initialCameraPosition: CameraPosition(
                        target: _center,
                        zoom: 6,
                      ),
                      markers: markers.toSet()),
                  Container(
                      height: MediaQuery.of(context).size.height,
                      width: MediaQuery.of(context).size.width,
                      child: Column(
                        mainAxisSize: MainAxisSize.min,
                        mainAxisAlignment: MainAxisAlignment.end,
                        children: [
                          if (!isModalFull || showDetails)
                            Expanded(
                              child: Padding(
                                padding: const EdgeInsets.all(16.0),
                                child: Row(
                                  crossAxisAlignment: CrossAxisAlignment.end,
                                  mainAxisAlignment: MainAxisAlignment.end,
                                  children: [
                                    Container(
                                      padding: const EdgeInsets.all(5),
                                      // width: 56,
                                      // height: 300,
                                      child: Column(
                                          mainAxisAlignment:
                                              MainAxisAlignment.spaceAround,
                                          mainAxisSize: MainAxisSize.min,
                                          children: airQualityData.map((e) {
                                            return Tooltip(
                                              preferBelow: false,
                                              textStyle: TextStyle(
                                                  color: Colors.white),
                                              decoration: BoxDecoration(
                                                  borderRadius:
                                                      BorderRadius.circular(4),
                                                  color: Color(0xff3E4147)),
                                              triggerMode:
                                                  TooltipTriggerMode.tap,
                                              message:
                                                  "Air Quality is ${e['name']}",
                                              verticalOffset: -18,
                                              margin: EdgeInsets.only(left: 65),
                                              child: Container(
                                                  margin: const EdgeInsets.only(
                                                      top: 4),
                                                  height: 40,
                                                  width: 40,
                                                  child: SvgPicture.asset(
                                                    e['image']!,
                                                    fit: BoxFit.cover,
                                                  )),
                                            );
                                          }).toList()),
                                      decoration: BoxDecoration(
                                        color: Theme.of(context).brightness ==
                                                Brightness.dark
                                            ? Color(0xff3E4147)
                                            : Colors.white,
                                        borderRadius: BorderRadius.circular(44),
                                      ),
                                    ),
                                    Spacer(),
                                    Container(
                                      padding: const EdgeInsets.symmetric(
                                          vertical: 10),
                                      height: 90,
                                      width: 44,
                                      decoration: BoxDecoration(
                                          color: Theme.of(context).brightness ==
                                                  Brightness.dark
                                              ? Color(0xff3E4147)
                                              : Colors.white,
                                          borderRadius:
                                              BorderRadius.circular(44)),
                                      child: Column(
                                        children: [
                                          Expanded(
                                              child: GestureDetector(
                                                  onTap: () async =>
                                                      await increaseZoom(),
                                                  child: Icon(Icons.add))),
                                          Divider(),
                                          Expanded(
                                              child: GestureDetector(
                                                  onTap: () async =>
                                                      await reduceZoom(),
                                                  child: Icon(Icons.remove)))
                                        ],
                                      ),
                                    )
                                  ],
                                ),
                              ),
                            ),
                          // Spacer(),
                          Expanded(
                            child: Builder(builder: (context) {
                              if (showDetails && currentDetailsName == null) {
                                return SizedBox(
                                    width: double.infinity,
                                    child: ModalWrapper(
                                      child: Padding(
                                          padding:
                                              const EdgeInsets.only(top: 16),
                                          child: Column(
                                            children: [
                                              Container(
                                                padding:
                                                    const EdgeInsets.symmetric(
                                                        horizontal: 16.0),
                                                margin: const EdgeInsets.only(
                                                    bottom: 8),
                                                child: Row(
                                                  mainAxisAlignment:
                                                      MainAxisAlignment
                                                          .spaceBetween,
                                                  children: [
                                                    SizedBox(),
                                                    Text(
                                                        currentDetails!
                                                            .siteDetails!.name!,
                                                        style: TextStyle(
                                                            color: Color(
                                                                0xff9EA3AA),
                                                            fontSize: 20,
                                                            fontWeight:
                                                                FontWeight
                                                                    .w700)),
                                                    GestureDetector(
                                                        onTap: () =>
                                                            resetDetails(),
                                                        child:
                                                            Icon(Icons.close))
                                                  ],
                                                ),
                                              ),
                                              Container(
                                                margin:
                                                    const EdgeInsets.symmetric(
                                                        vertical: 16),
                                                padding:
                                                    const EdgeInsets.symmetric(
                                                        horizontal: 16.0),
                                                child: Row(
                                                  mainAxisAlignment:
                                                      MainAxisAlignment
                                                          .spaceBetween,
                                                  crossAxisAlignment:
                                                      CrossAxisAlignment.center,
                                                  children: [
                                                    Text("Today",
                                                        style: TextStyle(
                                                            fontWeight:
                                                                FontWeight.w600,
                                                            fontSize: 20,
                                                            color: AppColors
                                                                .boldHeadlineColor)),
                                                    Row(children: [
                                                      // Container(
                                                      //   decoration: BoxDecoration(
                                                      //       color: AppColors
                                                      //           .highlightColor,
                                                      //       borderRadius:
                                                      //           BorderRadius
                                                      //               .circular(
                                                      //                   100)),
                                                      //   height: 40,
                                                      //   width: 52,
                                                      //   child: Center(
                                                      //     child: Padding(
                                                      //       padding:
                                                      //           const EdgeInsets
                                                      //               .only(
                                                      //               left: 8.0),
                                                      //       child: Icon(
                                                      //         size: 20,
                                                      //         Icons
                                                      //             .arrow_back_ios,
                                                      //         color: AppColors
                                                      //             .boldHeadlineColor,
                                                      //       ),
                                                      //     ),
                                                      //   ),
                                                      // ),
                                                      SizedBox(width: 8),
                                                      // Container(
                                                      //   decoration: BoxDecoration(
                                                      //       color: AppColors
                                                      //           .highlightColor,
                                                      //       borderRadius:
                                                      //           BorderRadius
                                                      //               .circular(
                                                      //                   100)),
                                                      //   height: 40,
                                                      //   width: 52,
                                                      //   child: Center(
                                                      //     child: Icon(
                                                      //       Icons
                                                      //           .arrow_forward_ios,
                                                      //       size: 20,
                                                      //       color: AppColors
                                                      //           .boldHeadlineColor,
                                                      //     ),
                                                      //   ),
                                                      // )
                                                    ])
                                                  ],
                                                ),
                                              ),
                                              Expanded(
                                                child: AnalyticsCard(
                                                    currentDetails!),
                                              ),
                                            ],
                                          )),
                                    ));
                              } else if (showDetails &&
                                  currentDetailsName != null) {
                                return BlocBuilder<GooglePlacesBloc,
                                    GooglePlacesState>(
                                  builder: (context, state) {
                                    if (state is PlaceDetailsLoaded) {
                                      Measurement measurement =
                                          state.response.measurements[0];
                                      return SizedBox(
                                        width: double.infinity,
                                        child: ModalWrapper(
                                          child: Padding(
                                              padding: const EdgeInsets.only(
                                                  top: 16),
                                              child: Column(
                                                children: [
                                                  Container(
                                                    padding: const EdgeInsets
                                                        .symmetric(
                                                        horizontal: 16.0),
                                                    margin:
                                                        const EdgeInsets.only(
                                                            bottom: 8),
                                                    child: Row(
                                                      mainAxisAlignment:
                                                          MainAxisAlignment
                                                              .spaceBetween,
                                                      children: [
                                                        SizedBox(),
                                                        Text(
                                                            measurement
                                                                .siteDetails!
                                                                .name!,
                                                            style: TextStyle(
                                                                color: Color(
                                                                    0xff9EA3AA),
                                                                fontSize: 20,
                                                                fontWeight:
                                                                    FontWeight
                                                                        .w700)),
                                                        GestureDetector(
                                                            onTap: () =>
                                                                resetDetails(),
                                                            child: Icon(
                                                                Icons.close))
                                                      ],
                                                    ),
                                                  ),
                                                  Container(
                                                    margin: const EdgeInsets
                                                        .symmetric(
                                                        vertical: 16),
                                                    padding: const EdgeInsets
                                                        .symmetric(
                                                        horizontal: 16.0),
                                                    child: Row(
                                                      mainAxisAlignment:
                                                          MainAxisAlignment
                                                              .spaceBetween,
                                                      crossAxisAlignment:
                                                          CrossAxisAlignment
                                                              .center,
                                                      children: [
                                                        Text("Today",
                                                            style: TextStyle(
                                                                fontWeight:
                                                                    FontWeight
                                                                        .w600,
                                                                fontSize: 20,
                                                                color: AppColors
                                                                    .boldHeadlineColor)),
                                                        Row(children: [
                                                          Container(
                                                            decoration: BoxDecoration(
                                                                color: AppColors
                                                                    .highlightColor,
                                                                borderRadius:
                                                                    BorderRadius
                                                                        .circular(
                                                                            100)),
                                                            height: 40,
                                                            width: 52,
                                                            child: Center(
                                                              child: Padding(
                                                                padding:
                                                                    const EdgeInsets
                                                                        .only(
                                                                        left:
                                                                            8.0),
                                                                child: Icon(
                                                                  size: 20,
                                                                  Icons
                                                                      .arrow_back_ios,
                                                                  color: AppColors
                                                                      .boldHeadlineColor,
                                                                ),
                                                              ),
                                                            ),
                                                          ),
                                                          SizedBox(width: 8),
                                                          Container(
                                                            decoration: BoxDecoration(
                                                                color: AppColors
                                                                    .highlightColor,
                                                                borderRadius:
                                                                    BorderRadius
                                                                        .circular(
                                                                            100)),
                                                            height: 40,
                                                            width: 52,
                                                            child: Center(
                                                              child: Icon(
                                                                Icons
                                                                    .arrow_forward_ios,
                                                                size: 20,
                                                                color: AppColors
                                                                    .boldHeadlineColor,
                                                              ),
                                                            ),
                                                          )
                                                        ])
                                                      ],
                                                    ),
                                                  ),
                                                  Expanded(
                                                    child: AnalyticsCard(
                                                        measurement),
                                                  ),
                                                ],
                                              )),
                                        ),
                                      );
                                    } else if (state is PlaceDetailsLoading) {
                                      return SizedBox(
                                        width: double.infinity,
                                        child: ModalWrapper(
                                          child: Padding(
                                              padding: const EdgeInsets.only(
                                                  top: 16),
                                              child: Column(
                                                children: [
                                                  Container(
                                                    padding: const EdgeInsets
                                                        .symmetric(
                                                        horizontal: 16.0),
                                                    margin:
                                                        const EdgeInsets.only(
                                                            bottom: 8),
                                                    child: Row(
                                                      mainAxisAlignment:
                                                          MainAxisAlignment
                                                              .spaceBetween,
                                                      children: [
                                                        SizedBox(),
                                                        ShimmerText(
                                                          height: 15,
                                                          width: 150,
                                                        ),
                                                        GestureDetector(
                                                            onTap: () =>
                                                                resetDetails(),
                                                            child: Icon(
                                                                Icons.close))
                                                      ],
                                                    ),
                                                  ),
                                                  Container(
                                                    margin: const EdgeInsets
                                                        .symmetric(
                                                        vertical: 16),
                                                    padding: const EdgeInsets
                                                        .symmetric(
                                                        horizontal: 16.0),
                                                    child: Row(
                                                      mainAxisAlignment:
                                                          MainAxisAlignment
                                                              .spaceBetween,
                                                      crossAxisAlignment:
                                                          CrossAxisAlignment
                                                              .center,
                                                      children: [
                                                        Text("Today",
                                                            style: TextStyle(
                                                                fontWeight:
                                                                    FontWeight
                                                                        .w600,
                                                                fontSize: 20,
                                                                color: AppColors
                                                                    .boldHeadlineColor)),
                                                        Row(children: [
                                                          Container(
                                                            decoration: BoxDecoration(
                                                                color: AppColors
                                                                    .highlightColor,
                                                                borderRadius:
                                                                    BorderRadius
                                                                        .circular(
                                                                            100)),
                                                            height: 40,
                                                            width: 52,
                                                            child: Center(
                                                              child: Padding(
                                                                padding:
                                                                    const EdgeInsets
                                                                        .only(
                                                                        left:
                                                                            8.0),
                                                                child: Icon(
                                                                  size: 20,
                                                                  Icons
                                                                      .arrow_back_ios,
                                                                  color: AppColors
                                                                      .boldHeadlineColor,
                                                                ),
                                                              ),
                                                            ),
                                                          ),
                                                          SizedBox(width: 8),
                                                          Container(
                                                            decoration: BoxDecoration(
                                                                color: AppColors
                                                                    .highlightColor,
                                                                borderRadius:
                                                                    BorderRadius
                                                                        .circular(
                                                                            100)),
                                                            height: 40,
                                                            width: 52,
                                                            child: Center(
                                                              child: Icon(
                                                                Icons
                                                                    .arrow_forward_ios,
                                                                size: 20,
                                                                color: AppColors
                                                                    .boldHeadlineColor,
                                                              ),
                                                            ),
                                                          )
                                                        ])
                                                      ],
                                                    ),
                                                  ),
                                                  Expanded(
                                                    child:
                                                        AnalyticsCardLoader(),
                                                  ),
                                                ],
                                              )),
                                        ),
                                      );
                                    }

                                    return SizedBox();
                                  },
                                );
                              } else {
                                return AnimatedContainer(
                                  duration: Duration(milliseconds: 300),
                                  height: isModalFull
                                      ? MediaQuery.of(context).size.height
                                      : 350,
                                  width: double.infinity,
                                  child: ModalWrapper(
                                      child: Padding(
                                    padding: const EdgeInsets.only(
                                        left: 16, right: 16, top: 28),
                                    child: Column(
                                      crossAxisAlignment:
                                          CrossAxisAlignment.start,
                                      children: [
                                        if (isModalFull) SizedBox(height: 16),
                                        Row(
                                          children: [
                                            Text("AirQo map",
                                                style: TextStyle(
                                                    fontSize: 24,
                                                    fontWeight: FontWeight.w700,
                                                    color: AppColors
                                                        .boldHeadlineColor)),
                                            Spacer(),
                                            if (isModalFull)
                                              IconButton(
                                                  onPressed: () =>
                                                      toggleModal(false),
                                                  icon: Icon(Icons.close))
                                          ],
                                        ),
                                        SizedBox(height: 16),
                                        Container(
                                          height: 45,
                                          child: Padding(
                                            padding:
                                                const EdgeInsets.only(top: 0),
                                            child: TextField(
                                              controller: searchController,
                                              onChanged: (value) {
                                                if (value == "") {
                                                  googlePlacesBloc!
                                                      .add(ResetGooglePlaces());
                                                }
                                                googlePlacesBloc!
                                                    .add(SearchPlace(value));
                                              },
                                              style: TextStyle(fontSize: 14),
                                              onTap: () => toggleModal(true),
                                              decoration: InputDecoration(
                                                contentPadding:
                                                    const EdgeInsets.only(
                                                        top: 24),
                                                hintText:
                                                    "Search Villages, Cities or Countries",
                                                prefixIcon: Padding(
                                                  padding: const EdgeInsets.all(
                                                      11.0),
                                                  child: SvgPicture.asset(
                                                    "assets/icons/search_icon.svg",
                                                    height: 15,
                                                    color: Theme.of(context)
                                                        .textTheme
                                                        .headlineLarge!
                                                        .color,
                                                  ),
                                                ),
                                                suffixIcon: BlocBuilder<
                                                    GooglePlacesBloc,
                                                    GooglePlacesState>(
                                                  builder: (context, state) {
                                                    if (state is SearchLoaded ||
                                                        state
                                                            is SearchLoading) {
                                                      return GestureDetector(
                                                          onTap: () =>
                                                              clearGooglePlaces(),
                                                          child: Icon(
                                                            Icons.close,
                                                            color: Theme.of(context).textTheme.headlineLarge!.color,
                                                          ));
                                                    }
                                                    return SizedBox();
                                                  },
                                                ),
                                                focusedBorder:
                                                    OutlineInputBorder(
                                                        borderSide: BorderSide(
                                                            color: AppColors
                                                                .primaryColor)),
                                                enabledBorder: OutlineInputBorder(
                                                    borderSide: BorderSide(
                                                        color: Theme.of(context)
                                                            .highlightColor)),
                                                border: OutlineInputBorder(
                                                  borderSide: BorderSide(
                                                    color: Colors.white,
                                                  ),
                                                ),
                                              ),
                                            ),
                                          ),
                                        ),
                                        SizedBox(height: 12),
                                        BlocBuilder<GooglePlacesBloc,
                                            GooglePlacesState>(
                                          builder: (context, placesState) {
                                            if (placesState is SearchLoading) {
                                              return Column(
                                                children: [
                                                  GooglePlacesLoader(),
                                                  SizedBox(height: 12),
                                                  GooglePlacesLoader(),
                                                  SizedBox(height: 12),
                                                  GooglePlacesLoader(),
                                                ],
                                              );
                                            } else if (placesState
                                                is SearchLoaded) {
                                              if (placesState.response
                                                  .predictions.isEmpty) {
                                                return Center(
                                                  child: Text(
                                                    "No results found",
                                                    style: TextStyle(
                                                        fontSize: 18,
                                                        fontWeight:
                                                            FontWeight.w500,
                                                        color: AppColors
                                                            .boldHeadlineColor),
                                                  ),
                                                );
                                              }
                                              return ListView.separated(
                                                  separatorBuilder:
                                                      (context, index) {
                                                    return Divider(
                                                      indent: 50,
                                                    );
                                                  },
                                                  padding:
                                                      const EdgeInsets.only(),
                                                  shrinkWrap: true,
                                                  itemCount: placesState
                                                      .response
                                                      .predictions
                                                      .length,
                                                  itemBuilder:
                                                      (context, index) {
                                                    Prediction prediction =
                                                        placesState.response
                                                            .predictions[index];

                                                    return GestureDetector(
                                                      onTap: () => viewDetails(
                                                          placeName: prediction
                                                              .description),
                                                      child: LocationDisplayWidget(
                                                          title: prediction
                                                              .description,
                                                          subTitle: prediction
                                                              .structuredFormatting
                                                              .mainText),
                                                    );
                                                  });
                                            }
                                            return Expanded(
                                              child: Column(
                                                crossAxisAlignment:
                                                    CrossAxisAlignment.start,
                                                children: [
                                                  Container(
                                                    width: double.infinity,
                                                    color: Theme.of(context)
                                                        .scaffoldBackgroundColor,
                                                    height: 55,
                                                    child: Container(
                                                      margin:
                                                          const EdgeInsets.only(
                                                              bottom: 8,
                                                              top: 4),
                                                      child:
                                                          SingleChildScrollView(
                                                        scrollDirection:
                                                            Axis.horizontal,
                                                        child: Row(
                                                          children: [
                                                            GestureDetector(
                                                              onTap: () =>
                                                                  resetFilter(),
                                                              child: Container(
                                                                height: 48,
                                                                width: 51,
                                                                decoration: BoxDecoration(
                                                                    borderRadius:
                                                                        BorderRadius.circular(
                                                                            40),
                                                                    color: currentFilter ==
                                                                            "All"
                                                                        ? AppColors
                                                                            .primaryColor
                                                                        : AppColors
                                                                            .highlightColor),
                                                                child: Center(
                                                                  child: Text(
                                                                    "All",
                                                                    style: TextStyle(
                                                                        color: currentFilter ==
                                                                                "All"
                                                                            ? Colors.white
                                                                            : Colors.black),
                                                                  ),
                                                                ),
                                                              ),
                                                            ),
                                                            ListView.builder(
                                                                shrinkWrap:
                                                                    true,
                                                                physics:
                                                                    const NeverScrollableScrollPhysics(),
                                                                scrollDirection:
                                                                    Axis
                                                                        .horizontal,
                                                                itemCount:
                                                                    countries
                                                                        .length,
                                                                itemBuilder:
                                                                    (context,
                                                                        index) {
                                                                  return CountriesChip(
                                                                      fontSize:
                                                                          14.5,
                                                                      current: currentFilter ==
                                                                          countries[index]
                                                                              .countryName,
                                                                      onTap: () => filterByCountry(
                                                                          countries[index]
                                                                              .countryName,
                                                                          state
                                                                              .response
                                                                              .measurements!),
                                                                      countryModel:
                                                                          countries[
                                                                              index]);
                                                                })
                                                          ],
                                                        ),
                                                      ),
                                                    ),
                                                  ),

                                                  // other things here.

                                                  SizedBox(height: 8),

                                                  Text(
                                                    "Suggestions",
                                                    style: TextStyle(
                                                        fontSize: 15,
                                                        color:
                                                            Color(0xff7A7F87),
                                                        fontWeight:
                                                            FontWeight.w500),
                                                  ),

                                                  SizedBox(height: 3),

                                                  Divider(),

                                                  Expanded(
                                                    child: Builder(
                                                        builder: (context) {
                                                      if (currentFilter ==
                                                          "All") {
                                                        return ListView
                                                            .separated(
                                                          separatorBuilder:
                                                              (context, index) {
                                                            return Divider(
                                                              indent: 50,
                                                            );
                                                          },
                                                          padding:
                                                              const EdgeInsets
                                                                  .only(),
                                                          shrinkWrap: true,
                                                          itemCount: 15,
                                                          itemBuilder:
                                                              (context, index) {
                                                            Measurement
                                                                measurement =
                                                                allMeasurements[
                                                                    index];

                                                            return GestureDetector(
                                                                onTap: () =>
                                                                    viewDetails(
                                                                        measurement:
                                                                            measurement),
                                                                child:
                                                                    LocationDisplayWidget(
                                                                  title: measurement
                                                                          .siteDetails!
                                                                          .city ??
                                                                      "",
                                                                  subTitle: measurement
                                                                          .siteDetails!
                                                                          .locationName ??
                                                                      "",
                                                                ));
                                                          },
                                                        );
                                                      } else {
                                                        return ListView
                                                            .separated(
                                                          separatorBuilder:
                                                              (context, index) {
                                                            return Divider(
                                                              indent: 50,
                                                            );
                                                          },
                                                          padding:
                                                              const EdgeInsets
                                                                  .only(),
                                                          shrinkWrap: true,
                                                          itemCount:
                                                              filteredMeasurements
                                                                  .length,
                                                          itemBuilder:
                                                              (context, index) {
                                                            Measurement
                                                                measurement =
                                                                filteredMeasurements[
                                                                    index];

                                                            return GestureDetector(
                                                                onTap: () =>
                                                                    viewDetails(
                                                                        measurement:
                                                                            measurement),
                                                                child:
                                                                    LocationDisplayWidget(
                                                                  title: measurement
                                                                          .siteDetails!
                                                                          .city ??
                                                                      "",
                                                                  subTitle: measurement
                                                                          .siteDetails!
                                                                          .locationName ??
                                                                      "",
                                                                ));
                                                          },
                                                        );
                                                      }
                                                    }),
                                                  )
                                                ],
                                              ),
                                            );
                                          },
                                        ),
                                      ],
                                    ),
                                  )),
                                );
                              }
                            }),
                          )
                        ],
                      ))
                ],
              );
            } else if (state is DashboardLoadingError) {
              return Container(
                width: double.infinity,
                child: Column(
                    crossAxisAlignment: CrossAxisAlignment.center,
                    mainAxisAlignment: MainAxisAlignment.center,
                    children: [ErrorPage()]),
              );
            }
            return Container();
          },
        )),
      ),
    );
  }

  @override
  bool get wantKeepAlive => true;
}

class GooglePlacesLoader extends StatelessWidget {
  const GooglePlacesLoader({
    super.key,
  });

  @override
  Widget build(BuildContext context) {
    return Container(
        child: Row(
      children: [
        ShimmerContainer(height: 50, borderRadius: 100, width: 50),
        SizedBox(width: 8),
        Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            ShimmerText(
              width: 200,
            ),
            SizedBox(height: 8),
            ShimmerText()
          ],
        )
      ],
    ));
  }
}

class LocationDisplayWidget extends StatelessWidget {
  final String title;
  final String subTitle;
  const LocationDisplayWidget(
      {super.key, required this.title, required this.subTitle});

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: const EdgeInsets.symmetric(vertical: 4),
      child: Row(
        children: [
          CircleAvatar(
              backgroundColor: Theme.of(context).brightness == Brightness.dark
                  ? Color(0xff3E4147)
                  : Theme.of(context).highlightColor,
              child: Center(
                child:
                    SvgPicture.asset("assets/images/shared/location_pin.svg"),
              )),
          SizedBox(width: 8),
          Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Text(
                subTitle,
                style: TextStyle(
                    fontSize: 18,
                    color: Color(0xff7A7F87),
                    fontWeight: FontWeight.w500),
              ),
              SizedBox(width: 4),
              Text(
                title,
                maxLines: 1,
                softWrap: true,
                overflow: TextOverflow.ellipsis,
                style: TextStyle(
                    fontSize: 14,
                    color: Color(0xff7A7F87),
                    fontWeight: FontWeight.w500),
              )
            ],
          )
        ],
      ),
    );
  }
}
