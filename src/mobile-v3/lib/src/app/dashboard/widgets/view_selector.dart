
import 'package:airqo/src/app/auth/pages/register_page.dart';
import 'package:flutter/material.dart';
import '../../../meta/utils/colors.dart';
import 'package:airqo/src/app/dashboard/repository/country_repository.dart';

enum DashboardView { all, favorites, nearYou, country }

class ViewSelector extends StatefulWidget {
  final DashboardView currentView;
  final String? selectedCountry;
  final Function(DashboardView view, {String? country}) onViewChanged;
  final bool isGuestUser;

  const ViewSelector({
    super.key,
    required this.currentView,
    this.selectedCountry,
    required this.onViewChanged,
    this.isGuestUser = false,
  });

  @override
  State<ViewSelector> createState() => _ViewSelectorState();
}

class _ViewSelectorState extends State<ViewSelector> {
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
          // For authenticated users, show both Favorites and Near You
          if (!widget.isGuestUser) ...[
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
          ],

          if (widget.isGuestUser)
            Tooltip(
              message: "Create an account to access all features",
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
                label: "Sign In for More",
                isSelected: false,
                onTap: () => _showLoginPrompt(),
              ),
            ),

          SizedBox(width: 8),

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

  void _showLoginPrompt() {
    final isDarkMode = Theme.of(context).brightness == Brightness.dark;

    showDialog(
      context: context,
      builder: (context) => AlertDialog(
        backgroundColor:
            isDarkMode ? AppColors.darkThemeBackground : Colors.white,
        shape: RoundedRectangleBorder(
          borderRadius: BorderRadius.circular(12),
        ),
        title: Text(
          'Feature Requires Account',
          style: TextStyle(
            fontSize: 20,
            fontWeight: FontWeight.w700,
            color: isDarkMode
                ? AppColors.boldHeadlineColor2
                : AppColors.boldHeadlineColor5,
          ),
        ),
        content: Text(
          'Create an account or sign in to access all features including personalized views.',
          style: TextStyle(
            fontSize: 16,
            color: isDarkMode
                ? AppColors.secondaryHeadlineColor2
                : AppColors.secondaryHeadlineColor,
          ),
        ),
        actions: [
          TextButton(
            onPressed: () => Navigator.pop(context),
            style: TextButton.styleFrom(
              foregroundColor: isDarkMode ? Colors.grey[400] : Colors.grey[700],
              padding: EdgeInsets.symmetric(horizontal: 16, vertical: 12),
            ),
            child: Text(
              'Cancel',
              style: TextStyle(
                fontSize: 16,
                fontWeight: FontWeight.w500,
              ),
            ),
          ),
          ElevatedButton(
            style: ElevatedButton.styleFrom(
              backgroundColor: AppColors.primaryColor,
              foregroundColor: Colors.white,
              padding: EdgeInsets.symmetric(horizontal: 24, vertical: 12),
              shape: RoundedRectangleBorder(
                borderRadius: BorderRadius.circular(4),
              ),
              elevation: 0,
            ),
            onPressed: () {
              Navigator.pop(context);
              Navigator.push(
                context,
                MaterialPageRoute(builder: (context) => CreateAccountScreen()),
              );
            },
            child: Text(
              'Create Account',
              style: TextStyle(
                fontSize: 16,
                fontWeight: FontWeight.w500,
                color: Colors.white,
              ),
            ),
          ),
        ],
        actionsAlignment: MainAxisAlignment.spaceBetween,
        actionsPadding: EdgeInsets.symmetric(horizontal: 16, vertical: 12),
        titlePadding: EdgeInsets.fromLTRB(24, 24, 24, 12),
        contentPadding: EdgeInsets.fromLTRB(24, 0, 24, 24),
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
