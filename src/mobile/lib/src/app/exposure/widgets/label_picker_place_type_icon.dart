import 'package:flutter/material.dart';
import 'package:flutter_svg/flutter_svg.dart';

import 'package:airqo/src/app/exposure/models/declared_place.dart';
import 'package:airqo/src/meta/utils/colors.dart';

/// Icons for the tag picker grid — AirQo SVGs where available (design system).
class LabelPickerPlaceTypeIcon extends StatelessWidget {
  final PlaceType type;
  final bool selected;
  final double size;

  const LabelPickerPlaceTypeIcon({
    super.key,
    required this.type,
    required this.selected,
    this.size = 28,
  });

  static const _home = 'assets/icons/place_type_home_tab.svg';
  static const _work = 'assets/icons/place_type_work_tab.svg';
  static const _school = 'assets/icons/learn_icon.svg';
  static const _gym = 'assets/icons/place_type_gym.svg';
  static const _family = 'assets/icons/place_type_family.svg';
  static const _pin = 'assets/images/shared/location_pin.svg';

  /// Figma: selected #F5F9FF, idle #536A87 (light); dark uses white / muted on tiles.
  static Color _foreground(BuildContext context, bool selected) {
    final isDark = Theme.of(context).brightness == Brightness.dark;
    if (isDark) {
      return selected ? Colors.white : AppColors.boldHeadlineColor2;
    }
    return selected ? const Color(0xFFF5F9FF) : const Color(0xFF536A87);
  }

  @override
  Widget build(BuildContext context) {
    final fg = _foreground(context, selected);

    switch (type) {
      case PlaceType.home:
        return SvgPicture.asset(
          _home,
          width: size,
          height: size,
          colorFilter: ColorFilter.mode(fg, BlendMode.srcIn),
        );
      case PlaceType.work:
        return SvgPicture.asset(
          _work,
          width: size,
          height: size,
          colorFilter: ColorFilter.mode(fg, BlendMode.srcIn),
        );
      case PlaceType.school:
        return SvgPicture.asset(
          _school,
          width: size,
          height: size,
          colorFilter: ColorFilter.mode(fg, BlendMode.srcIn),
        );
      case PlaceType.gym:
        return SvgPicture.asset(
          _gym,
          width: size,
          height: size,
          colorFilter: ColorFilter.mode(fg, BlendMode.srcIn),
        );
      case PlaceType.family:
        return SvgPicture.asset(
          _family,
          width: size,
          height: size,
          colorFilter: ColorFilter.mode(fg, BlendMode.srcIn),
        );
      case PlaceType.other:
        return SvgPicture.asset(
          _pin,
          width: size,
          height: size,
          colorFilter: ColorFilter.mode(fg, BlendMode.srcIn),
        );
    }
  }
}
