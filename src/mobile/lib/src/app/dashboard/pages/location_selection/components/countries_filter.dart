import 'package:airqo/src/app/shared/widgets/translated_text.dart';
import 'package:flutter/material.dart';
import 'package:airqo/src/app/dashboard/models/country_model.dart';
import 'package:airqo/src/app/dashboard/widgets/countries_chip.dart';
import 'package:airqo/src/meta/utils/colors.dart';

class CountriesFilter extends StatelessWidget {
  final String currentFilter;
  final Function(String) onFilterSelected;
  final VoidCallback onResetFilter;

  const CountriesFilter({
    super.key,
    required this.currentFilter,
    required this.onFilterSelected,
    required this.onResetFilter,
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
          FilterChip(
            selected: currentFilter == "All",
            onSelected: (_) => onResetFilter(),
            label: const TranslatedText("All"),
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