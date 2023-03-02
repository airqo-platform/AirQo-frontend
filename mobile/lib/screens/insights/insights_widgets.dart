import 'package:app/blocs/blocs.dart';
import 'package:app/models/models.dart';
import 'package:app/themes/theme.dart';
import 'package:app/utils/utils.dart';
import 'package:app/widgets/widgets.dart';
import 'package:flutter/material.dart';
import 'package:flutter_bloc/flutter_bloc.dart';

class InsightContainer extends StatelessWidget {
  const InsightContainer(this.insight, {super.key});
  final Insight insight;

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: const EdgeInsets.symmetric(
        horizontal: 14,
        vertical: 11,
      ),
      height: 70,
      decoration: BoxDecoration(
        color: insight.available
            ? insight.airQuality.color.withOpacity(0.2)
            : CustomColors.greyColor.withOpacity(0.2),
        borderRadius: const BorderRadius.all(
          Radius.circular(16.0),
        ),
      ),
      child: Row(
        mainAxisAlignment: MainAxisAlignment.spaceBetween,
        children: [
          Expanded(
            child: Column(
              mainAxisAlignment: MainAxisAlignment.center,
              crossAxisAlignment: CrossAxisAlignment.start,
              mainAxisSize: MainAxisSize.min,
              children: [
                Text(insight.name, style: CustomTextStyle.headline8(context)),
                const SizedBox(
                  height: 7,
                ),
                Visibility(
                  visible: insight.available,
                  child: Text(
                    insight.airQuality.string,
                    style: CustomTextStyle.headline8(context),
                  ),
                ),
                Visibility(
                  visible: !insight.available,
                  child: Text(
                    'No air quality data available',
                    style: CustomTextStyle.headline8(context),
                  ),
                ),
              ],
            ),
          ),
          SvgIcons.airQualityEmoji(insight.airQuality,
              height: 38, width: 48, isEmpty: !insight.available)
        ],
      ),
    );
  }
}

class InsightsDayReading extends StatelessWidget {
  const InsightsDayReading(this.insight, {super.key, required this.isActive});
  final Insight insight;
  final bool isActive;

  @override
  Widget build(BuildContext context) {
    Color color =
        insight.available ? CustomColors.appColorBlack : CustomColors.greyColor;

    return InkWell(
      onTap: () => context.read<InsightsBloc>().add(SwitchInsight(insight)),
      child: Column(
        mainAxisSize: MainAxisSize.min,
        children: [
          Container(
            padding: const EdgeInsets.symmetric(
              horizontal: 4,
              vertical: 4,
            ),
            height: 22,
            width: 17,
            decoration: BoxDecoration(
              color: isActive ? CustomColors.appColorBlue : Colors.transparent,
              borderRadius: const BorderRadius.all(
                Radius.circular(27.0),
              ),
            ),
            child: Center(
              child: Text(
                insight.dateTime.getWeekday().characters.first.toUpperCase(),
                style: TextStyle(
                  fontSize: 8,
                  color: isActive ? Colors.white : color,
                ),
              ),
            ),
          ),
          const SizedBox(
            height: 11,
          ),
          Text(
            '${insight.dateTime.day}',
            style: TextStyle(
              color: color,
            ),
          ),
          const SizedBox(
            height: 7,
          ),
          SvgIcons.airQualityEmoji(insight.airQuality,
              isEmpty: !insight.available),
        ],
      ),
    );
  }
}

class ForecastContainer extends StatelessWidget {
  const ForecastContainer(this.insight, {super.key});
  final Insight insight;

  @override
  Widget build(BuildContext context) {
    if (!insight.available) {
      return Container();
    }

    return Column(
      mainAxisSize: MainAxisSize.min,
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
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
            decoration: const BoxDecoration(
              color: Colors.white,
              borderRadius: BorderRadius.all(
                Radius.circular(16.0),
              ),
            ),
            child: const Center(
              child: Text(
                  'Expect conditions to range from good to moderate today.'),
            ),
          ),
        ),
      ],
    );
  }
}

class HealthTipsWidget extends StatelessWidget {
  const HealthTipsWidget(this.insight, {super.key});
  final Insight insight;

  @override
  Widget build(BuildContext context) {
    if (insight.healthTips.isEmpty) {
      return Container();
    }

    return ListView(
      physics: const NeverScrollableScrollPhysics(),
      shrinkWrap: true,
      children: [
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
            itemBuilder: (context, index) {
              return Padding(
                padding: EdgeInsets.only(
                  left: index == 0 ? 12.0 : 6.0,
                  right: index == (insight.healthTips.length - 1) ? 12.0 : 6.0,
                ),
                child: HealthTipContainer(insight.healthTips[index]),
              );
            },
            itemCount: insight.healthTips.length,
          ),
        ),
      ],
    );
  }
}

class InsightsLoadingWidget extends StatelessWidget {
  const InsightsLoadingWidget({super.key});

  @override
  Widget build(BuildContext context) {
    return ListView(
      children: [
        Padding(
          padding: const EdgeInsets.symmetric(horizontal: 16),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Row(
                children: const [
                  SizedContainerLoadingAnimation(
                    height: 32,
                    width: 70,
                    radius: 8.0,
                  ),
                  Spacer(),
                  SizedContainerLoadingAnimation(
                    height: 32,
                    width: 32,
                    radius: 8.0,
                  ),
                ],
              ),
              const SizedBox(
                height: 12,
              ),
              const ContainerLoadingAnimation(height: 290.0, radius: 8.0),
              const SizedBox(
                height: 16,
              ),
              const ContainerLoadingAnimation(
                height: 60,
                radius: 8.0,
              ),
              const SizedBox(
                height: 32,
              ),
              const SizedContainerLoadingAnimation(
                height: 32,
                width: 216,
                radius: 8.0,
              ),
              const SizedBox(
                height: 16,
              ),
            ],
          ),
        ),
        SizedBox(
          height: 128,
          child: ListView.builder(
            scrollDirection: Axis.horizontal,
            itemBuilder: (context, index) {
              return Padding(
                padding: EdgeInsets.only(
                  left: index == 0 ? 12.0 : 6.0,
                  right: index == (4 - 1) ? 12.0 : 6.0,
                ),
                child: const SizedContainerLoadingAnimation(
                  width: 304,
                  height: 128,
                  radius: 8.0,
                ),
              );
            },
            itemCount: 4,
          ),
        ),
      ],
    );
  }
}
