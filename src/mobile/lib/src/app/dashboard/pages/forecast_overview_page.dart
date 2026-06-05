import 'package:airqo/src/app/dashboard/bloc/forecast/forecast_bloc.dart';
import 'package:airqo/src/app/dashboard/widgets/forecast_day_detail_card.dart';
import 'package:airqo/src/app/dashboard/widgets/forecast_day_selector.dart';
import 'package:airqo/src/app/dashboard/widgets/forecast_hourly_section.dart';
import 'package:airqo/src/app/dashboard/widgets/forecast_met_row.dart';
import 'package:airqo/src/app/shared/widgets/loading_widget.dart';
import 'package:airqo/src/meta/utils/colors.dart';
import 'package:flutter/material.dart';
import 'package:flutter_bloc/flutter_bloc.dart';
import 'package:intl/intl.dart';

class ForecastOverviewPage extends StatefulWidget {
  final String siteId;
  final String siteName;

  const ForecastOverviewPage({
    super.key,
    required this.siteId,
    required this.siteName,
  });

  @override
  State<ForecastOverviewPage> createState() => _ForecastOverviewPageState();
}

class _ForecastOverviewPageState extends State<ForecastOverviewPage> {
  int _selectedDayIndex = 0;
  final _scrollController = ScrollController();
  final _todayStr = DateFormat('yyyy-MM-dd').format(DateTime.now());

  @override
  void initState() {
    super.initState();
    context.read<ForecastBloc>().add(LoadForecast(widget.siteId));
  }

  @override
  void dispose() {
    _scrollController.dispose();
    super.dispose();
  }

  void _selectDay(int index) {
    setState(() => _selectedDayIndex = index);
    if (_scrollController.hasClients) {
      _scrollController.animateTo(
        0,
        duration: const Duration(milliseconds: 300),
        curve: Curves.easeOut,
      );
    }
  }

  @override
  Widget build(BuildContext context) {
    final isDark = Theme.of(context).brightness == Brightness.dark;
    return Scaffold(
      backgroundColor: Theme.of(context).scaffoldBackgroundColor,
      appBar: AppBar(
        title: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Text(
              '7-Day Forecast',
              style: Theme.of(context)
                  .textTheme
                  .titleMedium
                  ?.copyWith(fontWeight: FontWeight.w600),
            ),
            Text(
              widget.siteName,
              style: Theme.of(context)
                  .textTheme
                  .bodySmall
                  ?.copyWith(color: AppColors.boldHeadlineColor),
            ),
          ],
        ),
      ),
      body: BlocConsumer<ForecastBloc, ForecastState>(
        listenWhen: (_, curr) =>
            curr is ForecastLoaded && curr.siteId == widget.siteId,
        listener: (context, state) {
          if (state is ForecastLoaded && state.hourlyResponse == null) {
            context
                .read<ForecastBloc>()
                .add(LoadHourlyForecast(widget.siteId));
          }
        },
        builder: (context, state) {
          if (state is ForecastLoading) return _skeleton(context);
          if (state is ForecastNetworkError) {
            return _error(context, state.message, isNetwork: true);
          }
          if (state is ForecastLoadingError) {
            return _error(context, state.message);
          }
          if (state is ForecastLoaded && state.siteId == widget.siteId) {
            return _content(context, state, isDark);
          }
          if (state is HourlyForecastLoading &&
              state.siteId == widget.siteId) {
            return _content(
              context,
              ForecastLoaded(state.dailyResponse, siteId: widget.siteId),
              isDark,
              hourlyLoading: true,
            );
          }
          if (state is HourlyForecastError &&
              state.siteId == widget.siteId) {
            return _content(
              context,
              ForecastLoaded(state.dailyResponse, siteId: widget.siteId),
              isDark,
              hourlyError: state.message,
            );
          }
          return _skeleton(context);
        },
      ),
    );
  }

  Widget _content(
    BuildContext context,
    ForecastLoaded state,
    bool isDark, {
    bool hourlyLoading = false,
    String? hourlyError,
  }) {
    final forecasts = state.response.forecasts;
    if (forecasts.isEmpty) {
      return const Center(child: Text('No forecast data available.'));
    }

    if (_selectedDayIndex == 0) {
      final todayIdx =
          forecasts.indexWhere((f) => _fmtDate(f.time) == _todayStr);
      if (todayIdx > 0) {
        WidgetsBinding.instance
            .addPostFrameCallback((_) => setState(() => _selectedDayIndex = todayIdx));
      }
    }

    final idx = _selectedDayIndex.clamp(0, forecasts.length - 1);
    final day = forecasts[idx];

    return SingleChildScrollView(
      controller: _scrollController,
      padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 12),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          ForecastDaySelector(
            forecasts: forecasts,
            selectedIndex: idx,
            todayStr: _todayStr,
            onSelected: _selectDay,
            isDark: isDark,
          ),
          const SizedBox(height: 20),
          ForecastDayDetailCard(forecast: day, isDark: isDark),
          const SizedBox(height: 20),
          ForecastMetRow(met: day.met),
          const SizedBox(height: 20),
          ForecastHourlySection(
            siteId: widget.siteId,
            selectedDate: day.time,
            hourlyResponse: state.hourlyResponse,
            isLoading: hourlyLoading,
            errorMessage: hourlyError,
            isDark: isDark,
          ),
          const SizedBox(height: 32),
        ],
      ),
    );
  }

  Widget _skeleton(BuildContext context) {
    return SingleChildScrollView(
      padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 12),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            children: List.generate(
              7,
              (i) => Expanded(
                child: Padding(
                  padding: const EdgeInsets.symmetric(horizontal: 3),
                  child: ShimmerContainer(
                      height: 88, width: double.infinity, borderRadius: 12),
                ),
              ),
            ),
          ),
          const SizedBox(height: 20),
          ShimmerContainer(
              height: 200, width: double.infinity, borderRadius: 16),
          const SizedBox(height: 20),
          ShimmerContainer(
              height: 80, width: double.infinity, borderRadius: 16),
          const SizedBox(height: 20),
          ShimmerContainer(
              height: 130, width: double.infinity, borderRadius: 16),
        ],
      ),
    );
  }

  Widget _error(BuildContext context, String message,
      {bool isNetwork = false}) {
    return Center(
      child: Padding(
        padding: const EdgeInsets.all(32),
        child: Column(
          mainAxisSize: MainAxisSize.min,
          children: [
            Icon(
              isNetwork
                  ? Icons.wifi_off_rounded
                  : Icons.error_outline_rounded,
              size: 56,
              color: AppColors.boldHeadlineColor,
            ),
            const SizedBox(height: 16),
            Text(
              isNetwork ? 'No connection' : 'Could not load forecast',
              style: Theme.of(context)
                  .textTheme
                  .titleMedium
                  ?.copyWith(fontWeight: FontWeight.w600),
            ),
            const SizedBox(height: 8),
            Text(message,
                textAlign: TextAlign.center,
                style: Theme.of(context).textTheme.bodySmall),
            const SizedBox(height: 24),
            ElevatedButton.icon(
              onPressed: () => context
                  .read<ForecastBloc>()
                  .add(RefreshForecast(widget.siteId)),
              icon: const Icon(Icons.refresh),
              label: const Text('Retry'),
              style: ElevatedButton.styleFrom(
                backgroundColor: AppColors.primaryColor,
                foregroundColor: Colors.white,
              ),
            ),
          ],
        ),
      ),
    );
  }

  String _fmtDate(DateTime dt) => DateFormat('yyyy-MM-dd').format(dt);
}
