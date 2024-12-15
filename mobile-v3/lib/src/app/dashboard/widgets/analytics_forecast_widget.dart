import 'package:airqo/src/app/dashboard/bloc/forecast/forecast_bloc.dart';
import 'package:airqo/src/app/dashboard/models/airquality_response.dart';
import 'package:airqo/src/app/shared/widgets/loading_widget.dart';
import 'package:airqo/src/meta/constants/aqi_ranges.dart';
import 'package:airqo/src/meta/utils/colors.dart';
import 'package:airqo/src/meta/utils/utils.dart';
import 'package:flutter/material.dart';
import 'package:flutter_bloc/flutter_bloc.dart';
import 'package:flutter_svg/flutter_svg.dart';
import 'package:intl/intl.dart';

class AnalyticsForecastWidget extends StatefulWidget {
  final String siteId;
  const AnalyticsForecastWidget({super.key, required this.siteId});

  @override
  State<AnalyticsForecastWidget> createState() =>
      _AnalyticsForecastWidgetState();
}

class _AnalyticsForecastWidgetState extends State<AnalyticsForecastWidget> {
  ForecastBloc? forecastBloc;

  @override
  void initState() {
    forecastBloc = context.read<ForecastBloc>()
      ..add(LoadForecast(widget.siteId));
    super.initState();
  }

  @override
  Widget build(BuildContext context) {
    return BlocBuilder<ForecastBloc, ForecastState>(
      builder: (context, state) {
        if (state is ForecastLoaded) {
          return Row(
              children: state.response.forecasts
                  .map((e) => ForeCastChip(
                        active: false,
                        date: DateFormat.d().format(e.time!),
                        day: DateFormat.E().format(e.time!)[0],
                        imagePath: getAirQualityIcon(
                            Measurement(aqiRanges: aqiRanges), e.pm25!),
                      ))
                  .toList());
        } else if (state is ForecastLoading) {
          return Row(
              mainAxisAlignment: MainAxisAlignment.spaceAround,
              children: List.generate(7, (index) {
                return ShimmerContainer(
                    height: 47 + 45, borderRadius: 22, width: 40);
              }));
        }

        return Container(
          child: Center(
            child: Text(state.toString()),
          ),
        );
      },
    );
  }
}

class ForeCastChip extends StatelessWidget {
  final bool active;
  final String day;
  final String imagePath;
  final String date;
  const ForeCastChip(
      {super.key,
      required this.active,
      required this.imagePath,
      required this.date,
      required this.day});

  @override
  Widget build(BuildContext context) {
    return Expanded(
      child: Container(
          decoration: BoxDecoration(
              color: active
                  ? AppColors.primaryColor
                  : Theme.of(context).highlightColor,
              borderRadius: BorderRadius.circular(22)),
          padding: const EdgeInsets.symmetric(vertical: 8),
          margin: const EdgeInsets.symmetric(horizontal: 5),
          height: 47 + 45,
          child: Column(
              mainAxisAlignment: MainAxisAlignment.spaceBetween,
              children: [
                Text(day),
                Text(date),
                SizedBox(
                  child: Center(
                    child: SvgPicture.asset(
                      imagePath,
                      height: 26,
                      width: 26,
                    ),
                  ),
                ),
              ])),
    );
  }
}
