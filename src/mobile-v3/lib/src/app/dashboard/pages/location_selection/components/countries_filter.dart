import 'package:flutter/material.dart';
import 'package:airqo/src/app/dashboard/models/country_model.dart';
import 'package:airqo/src/app/dashboard/repository/country_repository.dart';
import 'package:airqo/src/app/dashboard/widgets/countries_chip.dart';
import 'package:airqo/src/meta/utils/colors.dart';

class CountriesFilter extends StatelessWidget {
  final String currentFilter;
  final Function(String) onFilterSelected;
  final VoidCallback onResetFilter;
  final String? userCountry;

  const CountriesFilter({
    super.key,
    required this.currentFilter,
    required this.onFilterSelected,
    required this.onResetFilter,
    this.userCountry,
  });

  @override
  Widget build(BuildContext context) {
    List<CountryModel> countries = List.from(CountryRepository.countries);

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