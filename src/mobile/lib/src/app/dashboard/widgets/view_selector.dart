import 'package:airqo/src/app/dashboard/models/country_model.dart';
import 'package:airqo/src/app/shared/widgets/country_button';
import 'package:flutter/material.dart';
import '../../../meta/utils/colors.dart';
import 'package:airqo/src/app/dashboard/repository/country_repository.dart';

enum DashboardView { all, nearYou ,favorites, country }

class ViewSelector extends StatefulWidget {
  final DashboardView currentView;
  final String? selectedCountry;
  final Function(DashboardView view, {String? country}) onViewChanged;
  final bool isGuestUser;
  final String? userCountry;

  const ViewSelector({
    super.key,
    required this.currentView,
    this.selectedCountry,
    required this.onViewChanged,
    this.isGuestUser = false,
    this.userCountry,
  });

  @override
  State<ViewSelector> createState() => _ViewSelectorState();
}

class _ViewSelectorState extends State<ViewSelector> {
  final GlobalKey _myPlacesTooltipKey = GlobalKey<TooltipState>();
  final GlobalKey _nearbyTooltipKey = GlobalKey<TooltipState>();
  late List<CountryModel> sortedCountries;

  @override
  void initState() {
    super.initState();
    _sortCountries();
    _triggerTooltipOnViewChange();
  }

  @override
  void didUpdateWidget(ViewSelector oldWidget) {
    super.didUpdateWidget(oldWidget);
    if (oldWidget.userCountry != widget.userCountry) {
      _sortCountries();
    }
    if (oldWidget.currentView != widget.currentView) {
      _triggerTooltipOnViewChange();
    }
  }

  void _sortCountries() {
    sortedCountries = List.from(CountryRepository.countries);

    final userCountry = widget.userCountry;
    if (userCountry != null && userCountry.isNotEmpty) {
      int userCountryIndex = sortedCountries.indexWhere((country) =>
          country.countryName.toLowerCase() == userCountry.toLowerCase());

      if (userCountryIndex != -1) {
        CountryModel userCountryModel =
            sortedCountries.removeAt(userCountryIndex);
        sortedCountries.insert(0, userCountryModel);
      }
    }
  }

  void _triggerTooltipOnViewChange() {
    WidgetsBinding.instance.addPostFrameCallback((_) {
      if (widget.currentView == DashboardView.favorites) {
        final dynamic tooltipState = _myPlacesTooltipKey.currentState;
        tooltipState?.ensureTooltipVisible();

        Future.delayed(Duration(seconds: 2), () {
          tooltipState?.deactivate();
        });
      } else if (widget.currentView == DashboardView.nearYou) {
        final dynamic tooltipState = _nearbyTooltipKey.currentState;
        tooltipState?.ensureTooltipVisible();

        Future.delayed(Duration(seconds: 2), () {
          tooltipState?.deactivate();
        });
      }
    });
  }

  @override
  Widget build(BuildContext context) {
    return Container(
      height: 44,
      margin: const EdgeInsets.only(bottom: 16),
      child: ListView(
        scrollDirection: Axis.horizontal,
        padding: const EdgeInsets.symmetric(horizontal: 16),
        children: [
          if (!widget.isGuestUser) ...[
            Tooltip(
              key: _nearbyTooltipKey,
              message: "View air quality in locations closest to you",
              preferBelow: true,
              verticalOffset: 20,
              showDuration: Duration(seconds: 2),
              decoration: BoxDecoration(
                color: Colors.black87,
                borderRadius: BorderRadius.circular(6),
              ),
              textStyle: TextStyle(
                color: Colors.white,
                fontSize: 12,
              ),
              child: _buildViewButton(
                context,
                label: "Near You",
                isSelected: widget.currentView == DashboardView.nearYou,
                onTap: () => widget.onViewChanged(DashboardView.nearYou),
              ),
            ),
            SizedBox(width: 8),
            Tooltip(
              key: _myPlacesTooltipKey,
              message: "Save your most relevant locations in one place",
              preferBelow: true,
              verticalOffset: 20,
              showDuration: Duration(seconds: 2),
              decoration: BoxDecoration(
                color: Colors.black87,
                borderRadius: BorderRadius.circular(6),
              ),
              textStyle: TextStyle(
                color: Colors.white,
                fontSize: 12,
              ),
              child: _buildViewButton(
                context,
                label: "Favorites",
                isSelected: widget.currentView == DashboardView.favorites,
                onTap: () => widget.onViewChanged(DashboardView.favorites),
              ),
            ),
            SizedBox(width: 8),
          ],
          if (widget.isGuestUser) ...[
            Tooltip(
              message: "View air quality in locations closest to you",
              preferBelow: true,
              verticalOffset: 20,
              showDuration: Duration(seconds: 2),
              decoration: BoxDecoration(
                color: Colors.black87,
                borderRadius: BorderRadius.circular(6),
              ),
              textStyle: TextStyle(
                color: Colors.white,
                fontSize: 12,
              ),
              child: _buildViewButton(
                context,
                label: "Near You",
                isSelected: widget.currentView == DashboardView.nearYou,
                onTap: () => widget.onViewChanged(DashboardView.nearYou),
              ),
            ),
          ],
          SizedBox(width: 8),
          ...sortedCountries.map((country) => Padding(
                padding: const EdgeInsets.only(right: 8),
                child: _buildCountryButton(
                  context,
                  flag: country.flag,
                  name: country.countryName,
                  isSelected: widget.currentView == DashboardView.country &&
                      widget.selectedCountry == country.countryName,
                  onTap: () => widget.onViewChanged(DashboardView.country,
                      country: country.countryName),
                  isUserCountry: widget.userCountry?.toLowerCase() ==
                      country.countryName.toLowerCase(),
                ),
              )),
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
                  : AppColors.dividerColorlight,
          borderRadius: BorderRadius.circular(30),
        ),
        child: Text(
          label,
          style: TextStyle(
            color: isSelected
                ? Colors.white
                : Theme.of(context).brightness == Brightness.dark
                    ? Colors.white
                    : Colors.black87,
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
    bool isUserCountry = false,
  }) {
    return CountryButton(
      flag: flag,
      name: name,
      isSelected: isSelected,
      onTap: onTap,
      isUserCountry: isUserCountry,
    );
  }
}
