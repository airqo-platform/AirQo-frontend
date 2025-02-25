import 'package:flutter/material.dart';
import 'package:flutter_bloc/flutter_bloc.dart';
import 'package:airqo/src/app/dashboard/models/airquality_response.dart';
import 'package:airqo/src/app/other/places/bloc/google_places_bloc.dart';
import 'package:airqo/src/meta/utils/colors.dart';
import 'package:airqo/src/app/dashboard/widgets/countries_chip.dart';
import 'package:airqo/src/app/shared/widgets/loading_widget.dart';
import 'package:flutter_svg/svg.dart';
import 'package:airqo/src/app/dashboard/models/country_model.dart';

class LocationSelectionScreen extends StatefulWidget {
  const LocationSelectionScreen({super.key});

  @override
  State<LocationSelectionScreen> createState() =>
      _LocationSelectionScreenState();
}

class _LocationSelectionScreenState extends State<LocationSelectionScreen> {
  Set<String> selectedLocations = {};
  TextEditingController searchController = TextEditingController();
  bool isModalFull = true;
  GooglePlacesBloc? googlePlacesBloc;
  List<Measurement> localSearchResults = [];
  List<Measurement> allMeasurements = [];
  List<Measurement> filteredMeasurements = [];
  String currentFilter = "All";

  // Add the countries list
  final List<CountryModel> countries = [
    CountryModel("🇺🇬", "Uganda"),
    CountryModel("🇰🇪", "Kenya"),
    CountryModel("🇧🇮", "Burundi"),
    CountryModel("🇬🇭", "Ghana"),
    CountryModel("🇳🇬", "Nigeria"),
    CountryModel("🇨🇲", "Cameroon"),
    CountryModel("🇿🇦", "South Africa"),
    CountryModel("🇲🇿", "Mozambique"),
  ];

  // Add these methods
  @override
  void initState() {
    googlePlacesBloc = context.read<GooglePlacesBloc>()
      ..add(ResetGooglePlaces());
    super.initState();
  }

  List<Measurement> searchAirQualityLocations(
      String query, List<Measurement> measurements) {
    query = query.toLowerCase();
    return measurements.where((measurement) {
      if (measurement.siteDetails != null) {
        return (measurement.siteDetails!.city?.toLowerCase().contains(query) ??
                false) ||
            (measurement.siteDetails!.locationName
                    ?.toLowerCase()
                    .contains(query) ??
                false) ||
            (measurement.siteDetails!.name?.toLowerCase().contains(query) ??
                false) ||
            (measurement.siteDetails!.searchName
                    ?.toLowerCase()
                    .contains(query) ??
                false) ||
            (measurement.siteDetails!.formattedName
                    ?.toLowerCase()
                    .contains(query) ??
                false) ||
            (measurement.siteDetails!.town?.toLowerCase().contains(query) ??
                false) ||
            (measurement.siteDetails!.district?.toLowerCase().contains(query) ??
                false);
      }
      return false;
    }).toList();
  }

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

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: const Color(0xFF121212),
      appBar: AppBar(
        backgroundColor: Colors.transparent,
        elevation: 0,
        title: Text(
          'Add location',
          style: TextStyle(
            color: AppColors.boldHeadlineColor,
            fontSize: 24,
            fontWeight: FontWeight.w700
          ),
        ),
        actions: [
          IconButton(
            icon: const Icon(Icons.close, color: Colors.white),
            onPressed: () => Navigator.pop(context),
          ),
        ],
      ),
      body: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Padding(
            padding: const EdgeInsets.symmetric(horizontal: 16),
            child: TextField(
              controller: searchController,
              style: const TextStyle(color: Colors.white),
              onChanged: (value) {
                if (value.isEmpty) {
                  googlePlacesBloc!.add(ResetGooglePlaces());
                  setState(() {
                    localSearchResults = [];
                  });
                } else {
                  googlePlacesBloc!.add(SearchPlace(value));
                  setState(() {
                    localSearchResults =
                        searchAirQualityLocations(value, allMeasurements);
                  });
                }
              },
              decoration: InputDecoration(
                hintText: 'Search Villages, Cities or Countries',
                hintStyle: TextStyle(color: Colors.grey[400]),
                prefixIcon: Padding(
                  padding: const EdgeInsets.all(11.0),
                  child: SvgPicture.asset(
                    "assets/icons/search_icon.svg",
                    height: 15,
                    color: Theme.of(context).textTheme.headlineLarge!.color,
                  ),
                ),
                filled: true,
                fillColor: Colors.grey[900],
                border: OutlineInputBorder(
                  borderRadius: BorderRadius.circular(12),
                  borderSide: BorderSide.none,
                ),
              ),
            ),
          ),
          const SizedBox(height: 16),
          SizedBox(
            height: 40,
            child: ListView(
              scrollDirection: Axis.horizontal,
              padding: const EdgeInsets.symmetric(horizontal: 16),
              children: [
                FilterChip(
                  selected: currentFilter == "All",
                  onSelected: (_) => resetFilter(),
                  label: const Text("All"),
                  backgroundColor: Colors.grey[900],
                  selectedColor: AppColors.primaryColor,
                  labelStyle: TextStyle(
                    color: currentFilter == "All"
                        ? Colors.white
                        : Colors.grey[400],
                  ),
                ),
                ...countries.map((country) => Padding(
                      padding: const EdgeInsets.only(left: 8),
                      child: CountriesChip(
                        fontSize: 14.5,
                        current: currentFilter == country.countryName,
                        onTap: () => filterByCountry(
                            country.countryName, allMeasurements),
                        countryModel: country,
                      ),
                    )),
              ],
            ),
          ),
          Padding(
            padding: const EdgeInsets.all(16),
            child: Text(
              'All locations',
              style: TextStyle(
                color: Colors.grey[400],
                fontSize: 20,
                fontWeight: FontWeight.w500,
              ),
            ),
          ),
          Expanded(
            child: BlocBuilder<GooglePlacesBloc, GooglePlacesState>(
              builder: (context, state) {
                if (state is SearchLoading) {
                  return Column(
                    children: [
                      GooglePlacesLoader(),
                      SizedBox(height: 12),
                      GooglePlacesLoader(),
                      SizedBox(height: 12),
                      GooglePlacesLoader(),
                    ],
                  );
                }

                List<Measurement> measurements = currentFilter == "All"
                    ? allMeasurements
                    : filteredMeasurements;

                if (measurements.isEmpty) {
                  return Center(
                    child: Text(
                      "No locations available",
                      style: TextStyle(color: Colors.grey[400]),
                    ),
                  );
                }

                return ListView.separated(
                  itemCount: measurements.length,
                  separatorBuilder: (context, index) =>
                      const Divider(indent: 50),
                  itemBuilder: (context, index) {
                    final measurement = measurements[index];
                    final isSelected =
                        selectedLocations.contains(measurement.id);

                    return ListTile(
                      leading: CircleAvatar(
                        backgroundColor: Colors.grey[800],
                        child: SvgPicture.asset(
                          "assets/images/shared/location_pin.svg",
                        ),
                      ),
                      title: Text(
                        measurement.siteDetails?.city ?? "Unknown City",
                        style: const TextStyle(color: Colors.white),
                      ),
                      subtitle: Text(
                        measurement.siteDetails?.name ?? "Unknown Location",
                        style: TextStyle(color: Colors.grey[600]),
                      ),
                      trailing: Checkbox(
                        value: isSelected,
                        onChanged: (value) {
                          setState(() {
                            if (value!) {
                              selectedLocations.add(measurement.id!);
                            } else {
                              selectedLocations.remove(measurement.id!);
                            }
                          });
                        },
                        fillColor: MaterialStateProperty.resolveWith(
                          (states) => states.contains(MaterialState.selected)
                              ? AppColors.primaryColor
                              : Colors.transparent,
                        ),
                        side: BorderSide(color: Colors.grey[600]!),
                      ),
                    );
                  },
                );
              },
            ),
          ),
          Padding(
            padding: const EdgeInsets.all(16),
            child: SizedBox(
              width: double.infinity,
              child: ElevatedButton(
                onPressed: selectedLocations.isEmpty
                    ? null
                    : () {
                        Navigator.pop(context, selectedLocations.toList());
                      },
                style: ElevatedButton.styleFrom(
                  backgroundColor: AppColors.primaryColor,
                  padding: const EdgeInsets.symmetric(vertical: 16),
                  shape: RoundedRectangleBorder(
                    borderRadius: BorderRadius.circular(8),
                  ),
                ),
                child: Text(
                  'Save (${selectedLocations.length}) Locations',
                  style: const TextStyle(
                    fontSize: 16,
                    fontWeight: FontWeight.w500,
                  ),
                ),
              ),
            ),
          ),
        ],
      ),
    );
  }
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
