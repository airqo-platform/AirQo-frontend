import 'package:flutter/material.dart';
import 'package:airqo/src/app/dashboard/models/country_model.dart';
import 'package:airqo/src/app/dashboard/widgets/countries_chip.dart';
import 'package:airqo/src/meta/utils/colors.dart';

class PrivacyCountriesFilter extends StatelessWidget {
  final String currentFilter;
  final Function(String) onFilterSelected;
  final VoidCallback onResetFilter;
  final VoidCallback onNearYouSelected;

  const PrivacyCountriesFilter({
    super.key,
    required this.currentFilter,
    required this.onFilterSelected,
    required this.onResetFilter,
    required this.onNearYouSelected,
  });

  // Countries list
  static const List<CountryModel> countries = [
    CountryModel("🇺🇬", "Uganda"),
    CountryModel("🇰🇪", "Kenya"),
    CountryModel("🇧🇮", "Burundi"),
    CountryModel("🇬🇭", "Ghana"),
    CountryModel("🇳🇬", "Nigeria"),
    CountryModel("🇨🇲", "Cameroon"),
    CountryModel("🇿🇦", "South Africa"),
    CountryModel("🇲🇿", "Mozambique"),
  ];

  @override
  Widget build(BuildContext context) {
    return SizedBox(
      height: 40,
      child: ListView(
        scrollDirection: Axis.horizontal,
        padding: const EdgeInsets.symmetric(horizontal: 16),
        children: [
          InkWell(
            onTap: onResetFilter,
            child: Container(
              padding: const EdgeInsets.symmetric(horizontal: 24),
              height: 40,
              decoration: BoxDecoration(
                color: currentFilter == "All"
                    ? AppColors.primaryColor
                    : Theme.of(context).highlightColor,
                borderRadius: BorderRadius.circular(40),
              ),
              child: Center(
                child: Padding(
                  padding: const EdgeInsets.only(bottom: 4.0),
                  child: Text(
                    "All",
                    style: TextStyle(
                      color: currentFilter == "All" 
                          ? Colors.white
                          : Theme.of(context).textTheme.bodyLarge?.color,
                      fontSize: 14.5,
                      fontWeight: FontWeight.w500,
                    ),
                  ),
                ),
              ),
            ),
          ),
          Padding(
            padding: const EdgeInsets.only(left: 8),
            child: InkWell(
              onTap: onNearYouSelected,
              child: Container(
                padding: const EdgeInsets.symmetric(horizontal: 24),
                height: 40,
                decoration: BoxDecoration(
                  color: currentFilter == "Near you"
                      ? AppColors.primaryColor
                      : Theme.of(context).highlightColor,
                  borderRadius: BorderRadius.circular(40),
                ),
                child: Center(
                  child: Padding(
                    padding: const EdgeInsets.only(bottom: 4.0),
                    child: Text(
                      "Near you",
                      style: TextStyle(
                        color: currentFilter == "Near you" 
                            ? Colors.white
                            : Theme.of(context).textTheme.bodyLarge?.color,
                        fontSize: 14.5,
                        fontWeight: FontWeight.w500,
                      ),
                    ),
                  ),
                ),
              ),
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