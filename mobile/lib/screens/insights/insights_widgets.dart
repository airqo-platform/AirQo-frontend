import 'package:app/blocs/blocs.dart';
import 'package:app/models/models.dart';
import 'package:app/themes/theme.dart';
import 'package:app/utils/utils.dart';
import 'package:app/widgets/widgets.dart';
import 'package:auto_size_text/auto_size_text.dart';
import 'package:flutter/material.dart';
import 'package:flutter_bloc/flutter_bloc.dart';

class InsightAirQualityWidget extends StatelessWidget {
  const InsightAirQualityWidget(this.insight, {super.key, required this.name});
  final Insight insight;
  final String name;

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: const EdgeInsets.symmetric(
        horizontal: 14,
        vertical: 11,
      ),
      decoration: BoxDecoration(
        color: insight.isEmpty
            ? CustomColors.greyColor.withOpacity(0.2)
            : insight.airQuality?.color.withOpacity(0.2),
        borderRadius: const BorderRadius.all(
          Radius.circular(16.0),
        ),
      ),
      child: Row(
        crossAxisAlignment: CrossAxisAlignment.end,
        children: [
          Expanded(
            child: Column(
              mainAxisAlignment: MainAxisAlignment.spaceBetween,
              crossAxisAlignment: CrossAxisAlignment.start,
              mainAxisSize: MainAxisSize.min,
              children: [
                AutoSizeText(
                  name,
                  maxLines: 2,
                  overflow: TextOverflow.ellipsis,
                  style: CustomTextStyle.headline8(context),
                ),
                const SizedBox(
                  height: 7,
                ),
                AutoSizeText(
                  insight.isEmpty
                      ? 'No air quality data available'
                      : '${insight.airQuality?.title}',
                  maxLines: 1,
                  overflow: TextOverflow.ellipsis,
                  style: CustomTextStyle.headline8(context)?.copyWith(
                    fontWeight: FontWeight.w700,
                  ),
                ),
              ],
            ),
          ),
          SvgIcons.airQualityEmoji(
            insight.airQuality,
            height: 38,
            width: 48,
          ),
        ],
      ),
    );
  }
}

class InsightAirQualityMessageWidget extends StatelessWidget {
  InsightAirQualityMessageWidget(this.insight, {super.key});
  final Insight insight;
  final ScrollController _scrollController = ScrollController();

  List<Widget> aqiDialogWidgets() {
    List<Widget> aqiDialogWidgets = [];
    aqiDialogWidgets.add(
      Padding(
        padding: const EdgeInsets.only(top: 10.0),
        child: Text(
          'The Air Quality Index (AQI) colors can be used to show how polluted the air is. ',
          style: TextStyle(
            fontSize: 8,
            fontWeight: FontWeight.w500,
            height: 13 / 8,
            color: CustomColors.appColorBlack,
          ),
        ),
      ),
    );
    aqiDialogWidgets.addAll(
      AirQuality.values.map(
        (airQuality) => Padding(
          padding: const EdgeInsets.only(top: 13.0),
          child: Row(
            mainAxisAlignment: MainAxisAlignment.start,
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              SvgIcons.airQualityEmoji(airQuality),
              const SizedBox(
                width: 5,
              ),
              Expanded(
                child: RichText(
                  text: TextSpan(
                    children: [
                      TextSpan(
                        text: "${airQuality.title}. ",
                        style: TextStyle(
                          fontSize: 8,
                          fontWeight: FontWeight.w500,
                          height: 13 / 8,
                          color: CustomColors.appColorBlack,
                        ),
                      ),
                      TextSpan(
                        text: airQuality.description,
                        style: TextStyle(
                          color: CustomColors.appColorBlack.withOpacity(0.7),
                          fontSize: 8,
                          height: 13 / 8,
                        ),
                      ),
                    ],
                  ),
                ),
              ),
            ],
          ),
        ),
      ),
    );

    return aqiDialogWidgets;
  }

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: const EdgeInsets.all(8),
      height: 64,
      child: Row(
        mainAxisAlignment: MainAxisAlignment.center,
        crossAxisAlignment: CrossAxisAlignment.center,
        children: [
          Expanded(
            child: AutoSizeText(
              insight.isFutureData
                  ? insight.forecastMessage
                  : insight.airQualityMessage,
              maxLines: 3,
              overflow: TextOverflow.ellipsis,
              style: CustomTextStyle.bodyText4(context)?.copyWith(
                color: CustomColors.appColorBlack.withOpacity(0.3),
              ),
            ),
          ),
          Visibility(
            visible: insight.isNotEmpty,
            child: PopupMenuButton<bool>(
              padding: EdgeInsets.zero,
              tooltip: 'AQI info',
              position: PopupMenuPosition.over,
              color: Colors.white,
              shape: const RoundedRectangleBorder(
                borderRadius: BorderRadius.all(
                  Radius.circular(8.0),
                ),
              ),
              child: InkWell(
                child: SizedBox(
                  height: 60,
                  child: SvgIcons.information(),
                ),
              ),
              itemBuilder: (BuildContext context) => [
                PopupMenuItem(
                  enabled: false,
                  padding: const EdgeInsets.only(bottom: 16),
                  value: true,
                  child: SizedBox(
                    width: 280.0,
                    child: Column(
                      mainAxisSize: MainAxisSize.min,
                      children: [
                        Row(
                          mainAxisAlignment: MainAxisAlignment.spaceBetween,
                          children: [
                            Padding(
                              padding: const EdgeInsets.only(left: 16),
                              child: Text(
                                'Know Your Air',
                                style: CustomTextStyle.headline10(
                                  context,
                                )?.copyWith(
                                  color: CustomColors.appColorBlue,
                                ),
                              ),
                            ),
                            InkWell(
                              onTap: () => Navigator.pop(context),
                              child: Padding(
                                padding: const EdgeInsets.symmetric(
                                  horizontal: 16,
                                  vertical: 10,
                                ),
                                child: SvgIcons.close(size: 20),
                              ),
                            ),
                          ],
                        ),
                        const SizedBox(
                          height: 8,
                        ),
                        Divider(
                          height: 1,
                          color: CustomColors.appColorBlack.withOpacity(0.2),
                        ),
                        Container(
                          padding: const EdgeInsets.symmetric(
                            horizontal: 26,
                            vertical: 0,
                          ),
                          height: 150,
                          child: RawScrollbar(
                            thumbColor:
                                CustomColors.appColorBlue.withOpacity(0.1),
                            radius: const Radius.circular(4),
                            controller: _scrollController,
                            thickness: 4,
                            thumbVisibility: true,
                            child: ListView(
                              padding: EdgeInsets.zero,
                              controller: _scrollController,
                              children: aqiDialogWidgets(),
                            ),
                          ),
                        ),
                      ],
                    ),
                  ),
                ),
              ],
            ),
          ),
        ],
      ),
    );
  }
}

class InsightsDayReading extends StatelessWidget {
  const InsightsDayReading(
    this.insight, {
    super.key,
    required this.isActive,
  });
  final Insight insight;
  final bool isActive;

  @override
  Widget build(BuildContext context) {
    Color color = insight.isNotEmpty
        ? CustomColors.appColorBlack
        : CustomColors.greyColor;

    return InkWell(
      onTap: () => context.read<InsightsBloc>().add(SwitchInsight(insight)),
      child: SizedBox(
        height: 73,
        child: Column(
          children: [
            Container(
              padding: const EdgeInsets.all(4),
              decoration: BoxDecoration(
                color:
                    isActive ? CustomColors.appColorBlue : Colors.transparent,
                borderRadius: const BorderRadius.all(
                  Radius.circular(25.0),
                ),
              ),
              child: Center(
                child: Text(
                  insight.dateTime.getWeekday().characters.first.toUpperCase(),
                  style: TextStyle(
                    color: isActive ? Colors.white : color,
                  ),
                ),
              ),
            ),
            const SizedBox(
              height: 7,
            ),
            Text(
              '${insight.dateTime.day}',
              style: TextStyle(
                color: color,
              ),
            ),
            const Spacer(),
            SvgIcons.airQualityEmoji(insight.airQuality),
          ],
        ),
      ),
    );
  }
}

class InsightsCalendar extends StatelessWidget {
  const InsightsCalendar({super.key});

  @override
  Widget build(BuildContext context) {
    return BlocBuilder<InsightsBloc, InsightsState>(
      builder: (context, state) {
        Insight? selectedInsight = state.selectedInsight;
        if (selectedInsight == null) {
          return Container();
        }

        return Padding(
          padding: const EdgeInsets.symmetric(horizontal: 15.0),
          child: Container(
            padding: const EdgeInsets.symmetric(
              horizontal: 16,
              vertical: 12,
            ),
            decoration: const BoxDecoration(
              color: Colors.white,
              borderRadius: BorderRadius.all(
                Radius.circular(16.0),
              ),
            ),
            child: Column(
              mainAxisSize: MainAxisSize.min,
              children: [
                Padding(
                  padding: const EdgeInsets.all(8.0),
                  child: Row(
                    mainAxisAlignment: MainAxisAlignment.spaceBetween,
                    children: state.insights
                        .map(
                          (e) => InsightsDayReading(
                            e,
                            isActive: e == selectedInsight,
                          ),
                        )
                        .toList(),
                  ),
                ),
                const SizedBox(
                  height: 21,
                ),
                InsightAirQualityWidget(
                  selectedInsight,
                  name: state.name,
                ),
                const SizedBox(
                  height: 21,
                ),
                InsightAirQualityMessageWidget(selectedInsight),
              ],
            ),
          ),
        );
      },
    );
  }
}

class ForecastContainer extends StatelessWidget {
  const ForecastContainer(this.insight, {super.key});
  final Insight insight;

  @override
  Widget build(BuildContext context) {
    return AnimatedSwitcher(
      duration: const Duration(milliseconds: 250),
      child: Column(
        mainAxisSize: MainAxisSize.min,
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          const SizedBox(
            height: 36,
          ),
          Padding(
            padding: const EdgeInsets.symmetric(horizontal: 15.0),
            child: Text(
              'Forecast',
              style: CustomTextStyle.headline8(context)?.copyWith(fontSize: 20),
            ),
          ),
          const SizedBox(
            height: 14,
          ),
          Padding(
            padding: const EdgeInsets.symmetric(horizontal: 15.0),
            child: Container(
              padding: const EdgeInsets.symmetric(
                horizontal: 16,
                vertical: 8,
              ),
              height: 64,
              width: double.infinity,
              decoration: const BoxDecoration(
                color: Colors.white,
                borderRadius: BorderRadius.all(
                  Radius.circular(16.0),
                ),
              ),
              child: Row(
                crossAxisAlignment: CrossAxisAlignment.center,
                children: [
                  Expanded(
                    child: AutoSizeText(
                      insight.forecastMessage,
                      maxLines: 2,
                      overflow: TextOverflow.ellipsis,
                      style: CustomTextStyle.bodyText4(context)?.copyWith(
                        color: CustomColors.appColorBlack.withOpacity(0.3),
                      ),
                    ),
                  ),
                ],
              ),
            ),
          ),
        ],
      ),
    );
  }
}

class HealthTipsWidget extends StatelessWidget {
  const HealthTipsWidget(this.insight, {super.key});
  final Insight insight;

  @override
  Widget build(BuildContext context) {
    if (insight.healthTips.isEmpty) {
      return AnimatedSwitcher(
        duration: const Duration(milliseconds: 250),
        child: Container(),
      );
    }

    return AnimatedSwitcher(
      duration: const Duration(milliseconds: 250),
      child: ListView(
        physics: const NeverScrollableScrollPhysics(),
        shrinkWrap: true,
        children: [
          const SizedBox(
            height: 32,
          ),
          Padding(
            padding: const EdgeInsets.symmetric(horizontal: 16),
            child: Text(
              insight.healthTipsTitle(),
              textAlign: TextAlign.left,
              style: CustomTextStyle.headline7(context),
            ),
          ),
          const SizedBox(
            height: 16,
          ),
          SizedBox(
            height: 128,
            child: ListView.builder(
              scrollDirection: Axis.horizontal,
              controller: ScrollController(),
              itemBuilder: (context, index) {
                return Padding(
                  padding: EdgeInsets.only(
                    left: index == 0 ? 12.0 : 6.0,
                    right:
                        index == (insight.healthTips.length - 1) ? 12.0 : 6.0,
                  ),
                  child: HealthTipContainer(insight.healthTips[index]),
                );
              },
              itemCount: insight.healthTips.length,
            ),
          ),
        ],
      ),
    );
  }
}
