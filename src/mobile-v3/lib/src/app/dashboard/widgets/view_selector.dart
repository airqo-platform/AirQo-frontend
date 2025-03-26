import 'package:flutter/material.dart';
import '../../../meta/utils/colors.dart';
import 'package:airqo/src/app/dashboard/repository/country_repository.dart';

enum DashboardView { all, myPlaces, nearby, country }

class ViewSelector extends StatelessWidget {
  final DashboardView currentView;
  final String? selectedCountry;
  final Function(DashboardView view, {String? country}) onViewChanged;

  const ViewSelector({
    super.key,
    required this.currentView,
    this.selectedCountry,
    required this.onViewChanged,
  });

  @override
  Widget build(BuildContext context) {
    return Container(
      height: 44,
      margin: const EdgeInsets.only(bottom: 16),
      child: ListView(
        scrollDirection: Axis.horizontal,
        padding: const EdgeInsets.symmetric(horizontal: 16),
        children: [
          // My Places Button
          _buildViewButton(
            context,
            label: "My Places",
            isSelected: currentView == DashboardView.myPlaces,
            onTap: () => onViewChanged(DashboardView.myPlaces),
          ),
          SizedBox(width: 8),

          // Nearby Button
          _buildViewButton(
            context,
            label: "Nearby",
            isSelected: currentView == DashboardView.nearby,
            onTap: () => onViewChanged(DashboardView.nearby),
          ),
          SizedBox(width: 8),

          // Country filters - only show when in All view
          ...CountryRepository.countries
              .map((country) => Padding(
                    padding: const EdgeInsets.only(right: 8),
                    child: _buildCountryButton(
                      context,
                      flag: country.flag,
                      name: country.countryName,
                      isSelected: currentView == DashboardView.country &&
                          selectedCountry == country.countryName,
                      onTap: () => onViewChanged(DashboardView.country,
                          country: country.countryName),
                    ),
                  ))
              ,
        ],
      ),
    );
  }

  Widget _buildViewButton(
    BuildContext context, {
    required String label,
    required bool isSelected,
    required VoidCallback onTap,
  }) {
    return GestureDetector(
      onTap: onTap,
      child: Container(
        padding: EdgeInsets.symmetric(horizontal: 24, vertical: 12),
        decoration: BoxDecoration(
          color: isSelected
              ? AppColors.primaryColor
              : Theme.of(context).brightness == Brightness.dark
                  ? AppColors.darkHighlight
                  : AppColors.lightHighlight,
          borderRadius: BorderRadius.circular(30),
        ),
        child: Text(
          label,
          style: TextStyle(
            color: isSelected
                ? AppColors.darkTextPrimary
                : Theme.of(context).brightness == Brightness.dark
                    ? AppColors.darkTextPrimary
                    : AppColors.textDarkest,
            fontWeight: FontWeight.w500,
          ),
        ),
      ),
    );
  }

  Widget _buildCountryButton(
    BuildContext context, {
    required String flag,
    required String name,
    required bool isSelected,
    required VoidCallback onTap,
  }) {
    return GestureDetector(
      onTap: onTap,
      child: Container(
        padding: EdgeInsets.symmetric(horizontal: 16, vertical: 10),
        decoration: BoxDecoration(
          color: isSelected
              ? AppColors.primaryColor
              : Theme.of(context).brightness == Brightness.dark
                  ? AppColors.darkHighlight
                  : AppColors.lightHighlight,
          borderRadius: BorderRadius.circular(30),
        ),
        child: Row(
          children: [
            Text(flag, style: TextStyle(fontSize: 16)),
            SizedBox(width: 6),
            Text(
              name,
              style: TextStyle(
                color: isSelected
                    ? AppColors.darkTextPrimary
                    : Theme.of(context).brightness == Brightness.dark
                        ? AppColors.darkTextPrimary
                        : AppColors.textDarkest,
                fontWeight: FontWeight.w500,
              ),
            ),
          ],
        ),
      ),
    );
  }
}