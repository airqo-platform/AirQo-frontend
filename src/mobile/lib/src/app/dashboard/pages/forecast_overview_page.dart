import 'package:airqo/src/app/dashboard/bloc/forecast/forecast_bloc.dart';
import 'package:airqo/src/app/dashboard/models/airquality_response.dart';
import 'package:airqo/src/app/dashboard/models/forecast_guidance.dart';
import 'package:airqo/src/app/dashboard/models/forecast_response.dart';
import 'package:airqo/src/app/dashboard/utils/measurement_location_utils.dart';
import 'package:airqo/src/app/dashboard/widgets/forecast_day_detail_card.dart';
import 'package:airqo/src/app/dashboard/widgets/forecast_day_selector.dart';
import 'package:airqo/src/app/dashboard/widgets/forecast_guidance_section.dart';
import 'package:airqo/src/app/dashboard/widgets/forecast_hourly_section.dart';
import 'package:airqo/src/app/dashboard/widgets/forecast_time_scope_selector.dart';
import 'package:airqo/src/app/shared/widgets/loading_widget.dart';
import 'package:airqo/src/meta/utils/colors.dart';
import 'package:flutter/material.dart';
import 'package:flutter_bloc/flutter_bloc.dart';
import 'package:flutter_svg/flutter_svg.dart';
import 'package:intl/intl.dart';

class ForecastOverviewPage extends StatefulWidget {
  final String siteId;
  final String siteName;
  final String locationDescription;
  final Measurement? measurement;

  const ForecastOverviewPage({
    super.key,
    required this.siteId,
    required this.siteName,
    required this.locationDescription,
    this.measurement,
  });

  static Future<void> showForMeasurement(
    BuildContext context, {
    required Measurement measurement,
    String? fallbackLocationName,
  }) {
    final siteId = measurement.siteDetails?.id;
    if (siteId == null) return Future.value();

    return show(
      context,
      siteId: siteId,
      siteName: measurementDisplayName(
        measurement,
        fallbackLocationName: fallbackLocationName,
      ),
      locationDescription: measurementLocationDescription(measurement),
      measurement: measurement,
    );
  }

  static Future<void> show(
    BuildContext context, {
    required String siteId,
    required String siteName,
    required String locationDescription,
    Measurement? measurement,
  }) {
    return showModalBottomSheet<void>(
      context: context,
      isScrollControlled: true,
      useRootNavigator: true,
      useSafeArea: false,
      backgroundColor: Colors.transparent,
      builder: (sheetContext) {
        return SizedBox(
          height: MediaQuery.sizeOf(sheetContext).height,
          child: ForecastOverviewPage(
            siteId: siteId,
            siteName: siteName,
            locationDescription: locationDescription,
            measurement: measurement,
          ),
        );
      },
    );
  }

  @override
  State<ForecastOverviewPage> createState() => _ForecastOverviewPageState();
}

class _ForecastOverviewPageState extends State<ForecastOverviewPage> {
  int _selectedDayIndex = 0;
  int _selectedHourIndex = 0;
  ForecastTimeScope _timeScope = ForecastTimeScope.daily;
  ScrollController? _scrollController;
  final _todayStr = DateFormat('yyyy-MM-dd').format(DateTime.now());

  @override
  void initState() {
    super.initState();
    context.read<ForecastBloc>().add(LoadForecast(widget.siteId));
  }

  void _selectDay(int index) {
    setState(() {
      _selectedDayIndex = index;
      _selectedHourIndex = 0;
    });
    _scrollToTop();
  }

  void _selectHour(int index) {
    setState(() => _selectedHourIndex = index);
    _scrollToTop();
  }

  void _setTimeScope(ForecastTimeScope scope) {
    if (_timeScope == scope) return;
    setState(() {
      _timeScope = scope;
      _selectedHourIndex = 0;
    });
    _scrollToTop();
  }

  void _scrollToTop() {
    final controller = _scrollController;
    if (controller != null && controller.hasClients) {
      controller.animateTo(
        0,
        duration: const Duration(milliseconds: 300),
        curve: Curves.easeOut,
      );
    }
  }

  void _syncTodayIndex(List<Forecast> forecasts) {
    if (_selectedDayIndex == 0) {
      final todayIdx =
          forecasts.indexWhere((f) => _fmtDate(f.time) == _todayStr);
      if (todayIdx > 0) {
        WidgetsBinding.instance.addPostFrameCallback((_) {
          if (!mounted) return;
          setState(() => _selectedDayIndex = todayIdx);
        });
      }
    }
  }

  void _syncHourIndex(List<HourlyForecastEntry> entries, DateTime day) {
    if (_timeScope != ForecastTimeScope.hourly || entries.isEmpty) return;
    final defaultIdx = defaultHourlyIndex(entries, day);
    if (_selectedHourIndex == 0 && defaultIdx != 0) {
      WidgetsBinding.instance.addPostFrameCallback((_) {
        if (!mounted) return;
        setState(() => _selectedHourIndex = defaultIdx);
      });
    }
  }

  @override
  Widget build(BuildContext context) {
    final isDark = Theme.of(context).brightness == Brightness.dark;
    final bg = AppSurfaceColors.sheet(context);
    final nameColor = Theme.of(context).textTheme.headlineSmall?.color;
    final locationColor = AppTextColors.muted(context);

    return DraggableScrollableSheet(
      initialChildSize: 0.88,
      minChildSize: 0.5,
      maxChildSize: 0.95,
      expand: false,
      builder: (ctx, scrollController) {
        _scrollController = scrollController;
        return Container(
          decoration: BoxDecoration(
            color: bg,
            borderRadius: const BorderRadius.vertical(top: Radius.circular(20)),
          ),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              _dragHandle(context),
              Padding(
                padding: const EdgeInsets.fromLTRB(20, 0, 12, 0),
                child: Row(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Expanded(
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          Text(
                            widget.siteName,
                            style: TextStyle(
                              fontWeight: FontWeight.bold,
                              fontSize: 24,
                              color: nameColor,
                            ),
                            overflow: TextOverflow.ellipsis,
                          ),
                          const SizedBox(height: 4),
                          Row(
                            children: [
                              SvgPicture.asset(
                                'assets/images/shared/location_pin.svg',
                                width: 14,
                                height: 14,
                              ),
                              const SizedBox(width: 4),
                              Expanded(
                                child: Text(
                                  widget.locationDescription,
                                  style: TextStyle(
                                    fontSize: 14,
                                    color: locationColor,
                                  ),
                                  maxLines: 2,
                                  overflow: TextOverflow.ellipsis,
                                ),
                              ),
                            ],
                          ),
                        ],
                      ),
                    ),
                    IconButton(
                      onPressed: () => Navigator.of(context).pop(),
                      icon: Icon(
                        Icons.close,
                        color: AppTextColors.modalCloseIcon(context),
                      ),
                      visualDensity: VisualDensity.compact,
                    ),
                  ],
                ),
              ),
              const SizedBox(height: 12),
              Expanded(
                child: BlocConsumer<ForecastBloc, ForecastState>(
                  listenWhen: (_, curr) =>
                      curr is ForecastLoaded && curr.siteId == widget.siteId,
                  listener: (context, state) {
                    if (state is ForecastLoaded &&
                        state.hourlyResponse == null) {
                      context
                          .read<ForecastBloc>()
                          .add(LoadHourlyForecast(widget.siteId));
                    }
                  },
                  builder: (context, state) {
                    if (state is ForecastLoading) {
                      return _skeleton(context, scrollController);
                    }
                    if (state is ForecastNetworkError) {
                      return _error(context, state.message, isNetwork: true);
                    }
                    if (state is ForecastLoadingError) {
                      return _error(context, state.message);
                    }
                    if (state is ForecastLoaded &&
                        state.siteId == widget.siteId) {
                      return _content(context, state, isDark, scrollController);
                    }
                    if (state is HourlyForecastLoading &&
                        state.siteId == widget.siteId) {
                      return _content(
                        context,
                        ForecastLoaded(state.dailyResponse,
                            siteId: widget.siteId),
                        isDark,
                        scrollController,
                        hourlyLoading: true,
                      );
                    }
                    if (state is HourlyForecastError &&
                        state.siteId == widget.siteId) {
                      return _content(
                        context,
                        ForecastLoaded(state.dailyResponse,
                            siteId: widget.siteId),
                        isDark,
                        scrollController,
                        hourlyError: state.message,
                      );
                    }
                    return _skeleton(context, scrollController);
                  },
                ),
              ),
            ],
          ),
        );
      },
    );
  }

  Widget _dragHandle(BuildContext context) {
    final handleColor = AppTextColors.muted(context);
    return Padding(
      padding: const EdgeInsets.symmetric(vertical: 12),
      child: Center(
        child: Container(
          width: 36,
          height: 4,
          decoration: BoxDecoration(
            color: handleColor.withValues(alpha: 0.3),
            borderRadius: BorderRadius.circular(2),
          ),
        ),
      ),
    );
  }

  Widget _content(
    BuildContext context,
    ForecastLoaded state,
    bool isDark,
    ScrollController scrollController, {
    bool hourlyLoading = false,
    String? hourlyError,
  }) {
    final forecasts = state.response.forecasts;
    if (forecasts.isEmpty) {
      return const Center(child: Text('No forecast data available.'));
    }

    _syncTodayIndex(forecasts);

    final idx = _selectedDayIndex.clamp(0, forecasts.length - 1);
    final day = forecasts[idx];
    final selectedDateLabel = DateFormat('EEEE, MMMM d').format(day.time);
    final hourEntries =
        hourlyEntriesForDate(state.hourlyResponse, day.time);
    _syncHourIndex(hourEntries, day.time);

    final hourIdx = hourEntries.isEmpty
        ? 0
        : _selectedHourIndex.clamp(0, hourEntries.length - 1);
    final selectedHour =
        hourEntries.isNotEmpty ? hourEntries[hourIdx] : null;

    return SingleChildScrollView(
      controller: scrollController,
      padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 12),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Text(
            selectedDateLabel,
            style: TextStyle(
              fontWeight: FontWeight.w600,
              fontSize: 18,
              color: Theme.of(context).textTheme.headlineSmall?.color,
            ),
          ),
          const SizedBox(height: 12),
          ForecastTimeScopeSelector(
            selected: _timeScope,
            onSelected: _setTimeScope,
          ),
          const SizedBox(height: 16),
          Container(
            padding: const EdgeInsets.all(12),
            decoration: AppSurfaceColors.sheetPanelDecoration(context),
            child: ForecastDaySelector(
              forecasts: forecasts,
              selectedIndex: idx,
              todayStr: _todayStr,
              onSelected: _selectDay,
              isDark: isDark,
              onInsetPanel: true,
            ),
          ),
          const SizedBox(height: 20),
          if (_timeScope == ForecastTimeScope.daily) ...[
            ForecastDayDetailCard(
              reading: ForecastReadingSnapshot.fromDaily(day),
              isDark: isDark,
            ),
            const SizedBox(height: 20),
            ForecastGuidanceSection.fromForecast(day),
          ] else ...[
            Container(
              padding: const EdgeInsets.all(12),
              decoration: AppSurfaceColors.sheetPanelDecoration(context),
              child: ForecastHourlySection(
                siteId: widget.siteId,
                selectedDate: day.time,
                hourlyResponse: state.hourlyResponse,
                isLoading: hourlyLoading,
                errorMessage: hourlyError,
                isDark: isDark,
                onInsetPanel: true,
                selectedHourIndex: hourIdx,
                onHourSelected: _selectHour,
              ),
            ),
            if (selectedHour != null) ...[
              const SizedBox(height: 20),
              ForecastDayDetailCard(
                reading: ForecastReadingSnapshot.fromHourly(selectedHour),
                isDark: isDark,
              ),
              const SizedBox(height: 20),
              ForecastGuidanceSection.fromHourly(selectedHour),
            ],
          ],
          const SizedBox(height: 32),
        ],
      ),
    );
  }

  Widget _skeleton(BuildContext context, ScrollController scrollController) {
    return SingleChildScrollView(
      controller: scrollController,
      padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 12),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          ShimmerContainer(height: 22, width: 180, borderRadius: 8),
          const SizedBox(height: 12),
          ShimmerContainer(height: 44, width: 200, borderRadius: 22),
          const SizedBox(height: 16),
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
              height: 240, width: double.infinity, borderRadius: 16),
          const SizedBox(height: 20),
          ShimmerContainer(
              height: 120, width: double.infinity, borderRadius: 16),
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
              color: AppTextColors.muted(context),
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
