import 'package:flutter/material.dart';
import 'package:loggy/loggy.dart';
import 'package:airqo/src/app/dashboard/models/country_model.dart';
import 'package:airqo/src/app/dashboard/repository/country_repository.dart';
import 'package:airqo/src/app/dashboard/widgets/countries_chip.dart';
import 'package:airqo/src/meta/utils/colors.dart';

class CountriesFilter extends StatelessWidget with UiLoggy {
  final String currentFilter;
  final Function(String) onFilterSelected;
  final VoidCallback onResetFilter;
  final String? userCountry;
  final Set<String>? activeCountries;

  const CountriesFilter({
    super.key,
    required this.currentFilter,
    required this.onFilterSelected,
    required this.onResetFilter,
    this.userCountry,
    this.activeCountries,
  });

  @override
  Widget build(BuildContext context) {
    List<CountryModel> countries = CountryRepository.getActiveCountries(
        activeCountries ?? {});

    loggy.info(
        'CountriesFilter: Active=${activeCountries?.length ?? 0}, Filtered=${countries.length}');
    if (activeCountries != null && activeCountries!.isNotEmpty) {
      loggy.info('Active countries: $activeCountries');
      loggy.info('Countries to display in tabs: ${countries.map((c) => c.countryName).toList()}');
    }

    if (userCountry != null && userCountry!.isNotEmpty) {
      int userCountryIndex = countries.indexWhere(
        (country) => country.countryName.toLowerCase() == userCountry!.toLowerCase()
      );

      if (userCountryIndex != -1) {
        CountryModel userCountryModel = countries.removeAt(userCountryIndex);
        countries.insert(0, userCountryModel);
      }
    }

    return SizedBox(
      height: 40,
      child: ListView(
        scrollDirection: Axis.horizontal,
        padding: const EdgeInsets.symmetric(horizontal: 16),
        children: [
          FilterChip(
            selected: currentFilter == "All",
            onSelected: (_) => onResetFilter(),
            label: const Text("All"),
            backgroundColor: Theme.of(context).highlightColor,
            selectedColor: AppColors.primaryColor,
            labelStyle: TextStyle(
              color: currentFilter == "All"
                  ? Colors.white
                  : Theme.of(context).textTheme.bodyMedium?.color,
            ),
          ),
          ...countries.map((country) => Padding(
                padding: const EdgeInsets.only(left: 8),
                child: CountriesChip(
                  fontSize: 14.5,
                  current: currentFilter == country.countryName,
                  onTap: () => onFilterSelected(country.countryName),
                  countryModel: country,
                ),
              )),
        ],
      ),
    );
  }
}