import 'package:airqo/src/app/dashboard/bloc/forecast/forecast_bloc.dart';
import 'package:airqo/src/app/shared/widgets/loading_widget.dart';
import 'package:airqo/src/meta/utils/colors.dart';
import 'package:airqo/src/meta/utils/forecast_utils.dart';
import 'package:flutter/material.dart';
import 'package:flutter_bloc/flutter_bloc.dart';
import 'package:flutter_svg/flutter_svg.dart';
import 'package:intl/intl.dart';

class AnalyticsForecastWidget extends StatefulWidget {
  final String siteId;
  const AnalyticsForecastWidget({super.key, required this.siteId});

  @override
  State<AnalyticsForecastWidget> createState() => _AnalyticsForecastWidgetState();
}

class _AnalyticsForecastWidgetState extends State<AnalyticsForecastWidget> {
  ForecastBloc? forecastBloc;

  @override
  void initState() {
    forecastBloc = context.read<ForecastBloc>()
      ..add(LoadForecast(widget.siteId));
    super.initState();
  }

  double _getResponsiveHeight(BuildContext context) {
    final screenHeight = MediaQuery.of(context).size.height;
    // Calculate height based on screen size, with minimum and maximum bounds
    final height = screenHeight * 0.1; // 10% of screen height
    return height.clamp(60.0, 100.0); // Min 60, max 100
  }

  double _getResponsiveIconSize(BuildContext context) {
    final screenWidth = MediaQuery.of(context).size.width;
    // Calculate icon size based on screen width
    final iconSize = screenWidth * 0.04; // 4% of screen width
    return iconSize.clamp(20.0, 30.0); // Min 20, max 30
  }

  double _getResponsiveMargin(BuildContext context) {
    final screenWidth = MediaQuery.of(context).size.width;
    // Calculate margin based on screen width
    return (screenWidth * 0.01).clamp(2.0, 8.0); // Min 2, max 8
  }

  @override
  Widget build(BuildContext context) {
    return LayoutBuilder(
      builder: (context, constraints) {
        return BlocBuilder<ForecastBloc, ForecastState>(
          builder: (context, state) {
            if (state is ForecastLoaded) {
              return Row(
                children: state.response.forecasts
                    .map((e) => ForeCastChip(
                          active: false,
                          day: DateFormat.E().format(e.time)[0],
                          imagePath: getForecastAirQualityIcon(
                              e.pm25, state.response.aqiRanges),
                          height: _getResponsiveHeight(context),
                          iconSize: _getResponsiveIconSize(context),
                          margin: _getResponsiveMargin(context),
                        ))
                    .toList(),
              );
            } else if (state is ForecastLoading) {
              return Row(
                mainAxisAlignment: MainAxisAlignment.spaceAround,
                children: List.generate(7, (index) {
                  return ShimmerContainer(
                    height: _getResponsiveHeight(context),
                    borderRadius: 22,
                    width: constraints.maxWidth / 8, // Divide by 8 to leave some spacing
                  );
                }),
              );
            }

            return Container(
              height: _getResponsiveHeight(context),
              child: Center(
                child: Text(
                  state.toString(),
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
              ),
            ),
            SizedBox(height: height * 0.05),
            SvgPicture.asset(
              imagePath,
              height: iconSize,
              width: iconSize,
            ),
          ],
        ),
      ),
    );
  }
}