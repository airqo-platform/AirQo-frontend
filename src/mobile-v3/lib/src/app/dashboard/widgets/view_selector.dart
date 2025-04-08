import 'package:flutter/material.dart';
import '../../../meta/utils/colors.dart';
import 'package:airqo/src/app/dashboard/repository/country_repository.dart';

enum DashboardView { all, myPlaces, nearby, country }

class ViewSelector extends StatefulWidget {
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
  State<ViewSelector> createState() => _ViewSelectorState();
}

class _ViewSelectorState extends State<ViewSelector> {
  // Keys to control the tooltips
  final GlobalKey _myPlacesTooltipKey = GlobalKey<TooltipState>();
  final GlobalKey _nearbyTooltipKey = GlobalKey<TooltipState>();
  
  @override
  void initState() {
    super.initState();
    _triggerTooltipOnViewChange();
  }

  @override
  void didUpdateWidget(ViewSelector oldWidget) {
    super.didUpdateWidget(oldWidget);
    if (oldWidget.currentView != widget.currentView) {
      _triggerTooltipOnViewChange();
    }
  }

  void _triggerTooltipOnViewChange() {
    // Wait for the widget to be fully built before showing tooltip
    WidgetsBinding.instance.addPostFrameCallback((_) {
      if (widget.currentView == DashboardView.myPlaces) {
        final dynamic tooltipState = _myPlacesTooltipKey.currentState;
        tooltipState?.ensureTooltipVisible();
        
        // Auto-hide after 2 seconds
        Future.delayed(Duration(seconds: 2), () {
          tooltipState?.deactivate();
        });
      } else if (widget.currentView == DashboardView.nearby) {
        final dynamic tooltipState = _nearbyTooltipKey.currentState;
        tooltipState?.ensureTooltipVisible();
        
        // Auto-hide after 2 seconds
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
          // My Places Button with Tooltip
          Tooltip(
            key: _myPlacesTooltipKey,
            message: "View air quality data for locations you've saved",
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
              label: "My Places",
              isSelected: widget.currentView == DashboardView.myPlaces,
              onTap: () => widget.onViewChanged(DashboardView.myPlaces),
            ),
          ),
          SizedBox(width: 8),

          // Nearby Button with Tooltip
          Tooltip(
            key: _nearbyTooltipKey,
            message: "Show air quality data for locations close to you",
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
              label: "Nearby",
              isSelected: widget.currentView == DashboardView.nearby,
              onTap: () => widget.onViewChanged(DashboardView.nearby),
            ),
          ),
          SizedBox(width: 8),

          // Country filters - only show when in All view
          ...CountryRepository.countries.map((country) => Padding(
                padding: const EdgeInsets.only(right: 8),
                child: _buildCountryButton(
                  context,
                  flag: country.flag,
                  name: country.countryName,
                  isSelected: widget.currentView == DashboardView.country &&
                      widget.selectedCountry == country.countryName,
                  onTap: () => widget.onViewChanged(DashboardView.country,
                      country: country.countryName),
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
                  : AppColors.dividerColorlight,
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
                    ? Colors.white
                    : Theme.of(context).brightness == Brightness.dark
                        ? Colors.white
                        : Colors.black87,
                fontWeight: FontWeight.w500,
              ),
            ),
          ],
        ),
      ),
    );
  }
}