import 'package:airqo/src/app/dashboard/models/forecast_response.dart';
import 'package:airqo/src/meta/utils/colors.dart';
import 'package:airqo/src/meta/utils/forecast_utils.dart';
import 'package:flutter/material.dart';
import 'package:flutter_svg/flutter_svg.dart';
import 'package:intl/intl.dart';

class ForecastDaySelector extends StatelessWidget {
  final List<Forecast> forecasts;
  final int selectedIndex;
  final String todayStr;
  final ValueChanged<int> onSelected;
  final bool isDark;

  const ForecastDaySelector({
    super.key,
    required this.forecasts,
    required this.selectedIndex,
    required this.todayStr,
    required this.onSelected,
    required this.isDark,
  });

  @override
  Widget build(BuildContext context) {
    return Row(
      children: List.generate(forecasts.length, (i) {
        final f = forecasts[i];
        final isActive = i == selectedIndex;
        final isToday = DateFormat('yyyy-MM-dd').format(f.time) == todayStr;

        Color bgColor;
        if (isActive) {
          bgColor = AppColors.primaryColor;
        } else if (isToday) {
          bgColor = AppColors.primaryColor.withValues(alpha: 0.08);
        } else {
          bgColor =
              isDark ? AppColors.darkHighlight : AppColors.highlightColor;
        }

        return Expanded(
          child: GestureDetector(
            onTap: () => onSelected(i),
            child: AnimatedContainer(
              duration: const Duration(milliseconds: 200),
              margin: const EdgeInsets.symmetric(horizontal: 3),
              padding:
                  const EdgeInsets.symmetric(vertical: 8, horizontal: 4),
              decoration: BoxDecoration(
                color: bgColor,
                borderRadius: BorderRadius.circular(12),
                border: isToday && !isActive
                    ? Border.all(
                        color:
                            AppColors.primaryColor.withValues(alpha: 0.6),
                        width: 1.5)
                    : null,
              ),
              child: Column(
                mainAxisSize: MainAxisSize.min,
                children: [
                  Text(
                    isToday ? 'T' : DateFormat.E().format(f.time)[0],
                    style: TextStyle(
                      fontSize: 12,
                      fontWeight: FontWeight.w700,
                      color: isActive
                          ? Colors.white
                          : isToday
                              ? AppColors.primaryColor
                              : Theme.of(context)
                                  .textTheme
                                  .bodyMedium
                                  ?.color,
                    ),
                  ),
                  const SizedBox(height: 5),
                  SizedBox(
                    width: 26,
                    height: 26,
                    child: SvgPicture.asset(
                        getForecastAirQualityIcon(f.aqiCategory)),
                  ),
                  const SizedBox(height: 4),
                  Text(
                    '${f.pm25.round()}',
                    style: TextStyle(
                      fontSize: 11,
                      fontWeight: FontWeight.w500,
                      color: isActive
                          ? Colors.white70
                          : isToday
                              ? AppColors.primaryColor
                              : AppColors.boldHeadlineColor,
                    ),
                  ),
                  const SizedBox(height: 2),
                  Container(
                    width: 4,
                    height: 4,
                    decoration: BoxDecoration(
                      shape: BoxShape.circle,
                      color: isToday
                          ? (isActive ? Colors.white : AppColors.primaryColor)
                          : Colors.transparent,
                    ),
                  ),
                ],
              ),
            ),
          ),
        );
      }),
    );
  }
}
