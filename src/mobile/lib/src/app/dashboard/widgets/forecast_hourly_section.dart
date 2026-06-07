import 'package:airqo/src/app/dashboard/bloc/forecast/forecast_bloc.dart';
import 'package:airqo/src/app/dashboard/models/forecast_response.dart';
import 'package:airqo/src/app/shared/widgets/loading_widget.dart';
import 'package:airqo/src/meta/utils/colors.dart';
import 'package:airqo/src/meta/utils/forecast_utils.dart';
import 'package:flutter/material.dart';
import 'package:flutter_bloc/flutter_bloc.dart';
import 'package:flutter_svg/flutter_svg.dart';
import 'package:intl/intl.dart';

class ForecastHourlySection extends StatelessWidget {
  final String siteId;
  final DateTime selectedDate;
  final HourlyForecastResponse? hourlyResponse;
  final bool isLoading;
  final String? errorMessage;
  final bool isDark;

  const ForecastHourlySection({
    super.key,
    required this.siteId,
    required this.selectedDate,
    this.hourlyResponse,
    this.isLoading = false,
    this.errorMessage,
    required this.isDark,
  });

  @override
  Widget build(BuildContext context) {
    if (!isLoading && errorMessage == null && hourlyResponse == null) {
      return const SizedBox.shrink();
    }

    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Text(
          'Hourly Forecast',
          style: Theme.of(context)
              .textTheme
              .titleSmall
              ?.copyWith(fontWeight: FontWeight.w600),
        ),
        const SizedBox(height: 12),
        if (isLoading)
          SizedBox(
            height: 100,
            child: ListView.builder(
              scrollDirection: Axis.horizontal,
              itemCount: 8,
              itemBuilder: (_, i) => Padding(
                padding: const EdgeInsets.only(right: 8),
                child: ShimmerContainer(
                    width: 64, height: 100, borderRadius: 12),
              ),
            ),
          )
        else if (errorMessage != null)
          _ErrorRow(siteId: siteId, isDark: isDark)
        else
          _HourlyList(
              hourlyResponse: hourlyResponse!,
              selectedDate: selectedDate,
              isDark: isDark),
      ],
    );
  }
}

class _ErrorRow extends StatelessWidget {
  final String siteId;
  final bool isDark;

  const _ErrorRow({required this.siteId, required this.isDark});

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        borderRadius: BorderRadius.circular(12),
        color: isDark ? AppColors.darkHighlight : AppColors.highlightColor,
      ),
      child: Row(
        children: [
          const Icon(Icons.info_outline, size: 18, color: Colors.amber),
          const SizedBox(width: 8),
          Expanded(
            child: Text(
              'Hourly data unavailable',
              style: TextStyle(
                  fontSize: 13, color: AppColors.boldHeadlineColor),
            ),
          ),
          TextButton(
            onPressed: () => context
                .read<ForecastBloc>()
                .add(LoadHourlyForecast(siteId, forceRefresh: true)),
            child: const Text('Retry'),
          ),
        ],
      ),
    );
  }
}

class _HourlyList extends StatelessWidget {
  final HourlyForecastResponse hourlyResponse;
  final DateTime selectedDate;
  final bool isDark;

  const _HourlyList({
    required this.hourlyResponse,
    required this.selectedDate,
    required this.isDark,
  });

  @override
  Widget build(BuildContext context) {
    final selectedDateStr =
        DateFormat('yyyy-MM-dd').format(selectedDate.toLocal());
    final dayEntries = hourlyResponse.forecasts
        .where((e) =>
            DateFormat('yyyy-MM-dd').format(e.time.toLocal()) == selectedDateStr)
        .toList();

    if (dayEntries.isEmpty) {
      return Container(
        padding: const EdgeInsets.all(16),
        decoration: BoxDecoration(
          borderRadius: BorderRadius.circular(12),
          color: isDark ? AppColors.darkHighlight : AppColors.highlightColor,
        ),
        child: Row(
          children: [
            Icon(Icons.schedule_rounded,
                size: 16, color: AppColors.boldHeadlineColor),
            const SizedBox(width: 8),
            Text(
              'No hourly data available for this day.',
              style: TextStyle(
                  fontSize: 13, color: AppColors.boldHeadlineColor),
            ),
          ],
        ),
      );
    }

    final now = DateTime.now();
    final nowStr = DateFormat('yyyy-MM-dd').format(now);
    return SizedBox(
      height: 100,
      child: ListView.builder(
        scrollDirection: Axis.horizontal,
        itemCount: dayEntries.length,
        itemBuilder: (context, i) {
          final entry = dayEntries[i];
          final isNow = entry.time.toLocal().hour == now.hour &&
              selectedDateStr == nowStr;
          return _HourlyChip(entry: entry, isNow: isNow, isDark: isDark);
        },
      ),
    );
  }
}

class _HourlyChip extends StatelessWidget {
  final HourlyForecastEntry entry;
  final bool isNow;
  final bool isDark;

  const _HourlyChip(
      {required this.entry, required this.isNow, required this.isDark});

  @override
  Widget build(BuildContext context) {
    return Container(
      width: 64,
      margin: const EdgeInsets.only(right: 8),
      padding: const EdgeInsets.symmetric(vertical: 10, horizontal: 6),
      decoration: BoxDecoration(
        color: isNow
            ? AppColors.primaryColor
            : isDark
                ? AppColors.darkHighlight
                : Colors.white,
        borderRadius: BorderRadius.circular(12),
        border: Border.all(
          color: isNow
              ? AppColors.primaryColor
              : isDark
                  ? AppColors.dividerColordark
                  : AppColors.dividerColorlight,
        ),
      ),
      child: Column(
        mainAxisAlignment: MainAxisAlignment.center,
        children: [
          Text(
            DateFormat('ha').format(entry.time.toLocal()),
            style: TextStyle(
              fontSize: 11,
              fontWeight: FontWeight.w600,
              color: isNow ? Colors.white : AppColors.boldHeadlineColor,
            ),
          ),
          const SizedBox(height: 5),
          SvgPicture.asset(
            getForecastAirQualityIcon(entry.aqiCategory),
            width: 24,
            height: 24,
          ),
          const SizedBox(height: 4),
          Text(
            '${entry.pm25Mean.round()}',
            style: TextStyle(
              fontSize: 12,
              fontWeight: FontWeight.w600,
              color: isNow ? Colors.white : null,
            ),
          ),
        ],
      ),
    );
  }
}
