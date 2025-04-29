import 'package:airqo/src/app/dashboard/bloc/forecast/forecast_bloc.dart';
import 'package:airqo/src/app/shared/widgets/loading_widget.dart';
import 'package:airqo/src/meta/utils/colors.dart';
import 'package:airqo/src/meta/utils/forecast_utils.dart';
import 'package:flutter/material.dart';
import 'package:flutter_bloc/flutter_bloc.dart';
import 'package:flutter_svg/flutter_svg.dart';
import 'package:intl/intl.dart';
import 'package:loggy/loggy.dart';

class AnalyticsForecastWidget extends StatefulWidget {
  final String siteId;
  const AnalyticsForecastWidget({super.key, required this.siteId});

  @override
  State<AnalyticsForecastWidget> createState() => _AnalyticsForecastWidgetState();
}

class _AnalyticsForecastWidgetState extends State<AnalyticsForecastWidget> with UiLoggy {
  ForecastBloc? forecastBloc;
  bool _isRefreshing = false;

  @override
  void initState() {
    forecastBloc = context.read<ForecastBloc>()
      ..add(LoadForecast(widget.siteId));
    super.initState();
  }

  @override
  void didUpdateWidget(AnalyticsForecastWidget oldWidget) {
    super.didUpdateWidget(oldWidget);
    // If siteId changed, load new forecasts
    if (oldWidget.siteId != widget.siteId) {
      forecastBloc?.add(LoadForecast(widget.siteId));
    }
  }

  double _getResponsiveHeight(BuildContext context) {
    final screenHeight = MediaQuery.of(context).size.height;
    final height = screenHeight * 0.1;
    return height.clamp(60.0, 100.0);
  }

  double _getResponsiveIconSize(BuildContext context) {
    final screenWidth = MediaQuery.of(context).size.width;
    final iconSize = screenWidth * 0.04;
    return iconSize.clamp(20.0, 30.0);
  }

  double _getResponsiveMargin(BuildContext context) {
    final screenWidth = MediaQuery.of(context).size.width;
    // Calculate margin based on screen width
    return (screenWidth * 0.01).clamp(2.0, 8.0); // Min 2, max 8
  }

  // Method to refresh forecasts
  Future<void> _refreshForecasts() async {
    if (_isRefreshing) return;
    
    setState(() {
      _isRefreshing = true;
    });
    
    try {
      // Dispatch a refresh event to the bloc
      forecastBloc?.add(RefreshForecast(widget.siteId));
      
      // Reset refreshing state after a delay to show loading indicator briefly
      await Future.delayed(const Duration(seconds: 1));
    } finally {
      if (mounted) {
        setState(() {
          _isRefreshing = false;
        });
      }
    }
  }

  @override
  Widget build(BuildContext context) {
    return LayoutBuilder(
      builder: (context, constraints) {
        return BlocBuilder<ForecastBloc, ForecastState>(
          builder: (context, state) {
            if (state is ForecastLoaded) {
              final today = DateTime.now();
              final currentDateFormatted = DateFormat('yyyy-MM-dd').format(today);
              
              // Check if data is stale and show a subtle indicator
              final isStale = state.isStale;
              
              return Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  // Optional header row with refresh button
                  if (isStale)
                    Padding(
                      padding: const EdgeInsets.only(bottom: 4.0),
                      child: Row(
                        mainAxisAlignment: MainAxisAlignment.end,
                        children: [
                          Icon(
                            Icons.info_outline,
                            size: 12,
                            color: Colors.amber,
                          ),
                          SizedBox(width: 4),
                          Text(
                            'Forecast data may be outdated',
                            style: TextStyle(
                              fontSize: 12,
                              color: Colors.amber.shade700,
                            ),
                          ),
                          Spacer(),
                          InkWell(
                            onTap: _refreshForecasts,
                            child: Padding(
                              padding: const EdgeInsets.all(4.0),
                              child: Row(
                                children: [
                                  Icon(
                                    Icons.refresh,
                                    size: 16,
                                    color: AppColors.primaryColor,
                                  ),
                                  SizedBox(width: 4),
                                  Text(
                                    'Refresh',
                                    style: TextStyle(
                                      fontSize: 12,
                                      color: AppColors.primaryColor,
                                    ),
                                  ),
                                ],
                              ),
                            ),
                          ),
                        ],
                      ),
                    ),
                
                  // Forecast chips row
                  Row(
                    children: state.response.forecasts
                        .map((e) {
                          // Check if this forecast is for the current date
                          final forecastDate = DateFormat('yyyy-MM-dd').format(e.time);
                          final isCurrentDay = forecastDate == currentDateFormatted;
                          
                          return ForeCastChip(
                            active: isCurrentDay, // Set active based on current date
                            day: DateFormat.E().format(e.time)[0],
                            imagePath: getForecastAirQualityIcon(
                                e.pm25, state.response.aqiRanges),
                            height: _getResponsiveHeight(context),
                            iconSize: _getResponsiveIconSize(context),
                            margin: _getResponsiveMargin(context),
                          );
                        })
                        .toList(),
                  ),
                ],
              );
            } else if (state is ForecastLoading || _isRefreshing) {
              return Row(
                mainAxisAlignment: MainAxisAlignment.spaceAround,
                children: List.generate(7, (index) {
                  return ShimmerContainer(
                    height: _getResponsiveHeight(context),
                    borderRadius: 22,
                    width: constraints.maxWidth / 8,
                  );
                }),
              );
            } else if (state is ForecastNetworkError) {
              // Specific error UI for network errors with retry button
              return _buildNetworkErrorUI(context, state.message);
            } else if (state is ForecastLoadingError) {
              // General error UI
              return _buildErrorUI(context, state.message);
            }

            return Container(
              height: _getResponsiveHeight(context),
              child: Center(
                child: Text(
                  "Weather forecast unavailable",
                  style: Theme.of(context).textTheme.bodyMedium?.copyWith(
                    fontSize: MediaQuery.of(context).size.width * 0.03,
                  ),
                ),
              ),
            );
          },
        );
      },
    );
  }
  
  // UI for network errors
  Widget _buildNetworkErrorUI(BuildContext context, String message) {
    return Container(
      height: _getResponsiveHeight(context),
      padding: EdgeInsets.symmetric(horizontal: 16),
      decoration: BoxDecoration(
        borderRadius: BorderRadius.circular(8),
        color: Colors.grey.withOpacity(0.1),
      ),
      child: Row(
        children: [
          Icon(
            Icons.wifi_off,
            color: Colors.grey,
            size: 24,
          ),
          SizedBox(width: 8),
          Expanded(
            child: Column(
              mainAxisAlignment: MainAxisAlignment.center,
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(
                  "Network issue",
                  style: TextStyle(
                    fontWeight: FontWeight.bold,
                    fontSize: 14,
                    color: Theme.of(context).textTheme.bodyLarge?.color,
                  ),
                ),
                SizedBox(height: 2),
                Text(
                  message,
                  style: TextStyle(
                    fontSize: 12,
                    color: Theme.of(context).textTheme.bodyMedium?.color,
                  ),
                  maxLines: 2,
                  overflow: TextOverflow.ellipsis,
                ),
              ],
            ),
          ),
          SizedBox(width: 8),
          ElevatedButton(
            onPressed: _refreshForecasts,
            style: ElevatedButton.styleFrom(
              backgroundColor: AppColors.primaryColor,
              padding: EdgeInsets.symmetric(horizontal: 12, vertical: 8),
              minimumSize: Size(60, 36),
            ),
            child: Text("Retry", style: TextStyle(color: Colors.white)),
          ),
        ],
      ),
    );
  }
  
  // UI for general errors
  Widget _buildErrorUI(BuildContext context, String message) {
    return Container(
      height: _getResponsiveHeight(context),
      padding: EdgeInsets.symmetric(horizontal: 16),
      decoration: BoxDecoration(
        borderRadius: BorderRadius.circular(8),
        color: Colors.grey.withOpacity(0.1),
      ),
      child: Row(
        children: [
          Icon(
            Icons.error_outline,
            color: Colors.grey,
            size: 24,
          ),
          SizedBox(width: 8),
          Expanded(
            child: Text(
              "Could not load forecast: $message",
              style: TextStyle(
                fontSize: 12,
                color: Theme.of(context).textTheme.bodyMedium?.color,
              ),
              maxLines: 2,
              overflow: TextOverflow.ellipsis,
            ),
          ),
          SizedBox(width: 8),
          TextButton(
            onPressed: _refreshForecasts,
            child: Text("Retry", style: TextStyle(color: AppColors.primaryColor)),
          ),
        ],
      ),
    );
  }
}

class ForeCastChip extends StatelessWidget {
  final bool active;
  final String day;
  final String imagePath;
  final double height;
  final double iconSize;
  final double margin;

  const ForeCastChip({
    super.key,
    required this.active,
    required this.imagePath,
    required this.day,
    required this.height,
    required this.iconSize,
    required this.margin,
  });

  @override
  Widget build(BuildContext context) {
    final textScaleFactor = MediaQuery.of(context).textScaleFactor;
    final fontSize = (height * 0.2).clamp(12.0, 16.0);

    return Expanded(
      child: Container(
        decoration: BoxDecoration(
          color: active
              ? AppColors.primaryColor
              : Theme.of(context).highlightColor,
          borderRadius: BorderRadius.circular(height * 0.25),
        ),
        padding: EdgeInsets.symmetric(
          vertical: height * 0.1,
        ),
        margin: EdgeInsets.symmetric(horizontal: margin),
        height: height,
        child: Column(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            Text(
              day,
              style: TextStyle(
                fontSize: fontSize * textScaleFactor,
                fontWeight: active ? FontWeight.bold : FontWeight.normal,
                color: active ? Colors.white : Theme.of(context).textTheme.bodyMedium?.color,
              ),
            ),
            SizedBox(height: height * 0.05),
            Container(
              height: iconSize,
              width: iconSize,
              decoration: active ? BoxDecoration(
                color: Colors.white,
                borderRadius: BorderRadius.circular(iconSize / 2),
              ) : null,
              padding: active ? EdgeInsets.all(2) : EdgeInsets.zero,
              child: SvgPicture.asset(
                imagePath,
                height: active ? iconSize - 4 : iconSize,
                width: active ? iconSize - 4 : iconSize,
              ),
            ),
          ],
        ),
      ),
    );
  }
}