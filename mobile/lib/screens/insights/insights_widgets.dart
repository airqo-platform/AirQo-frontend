import 'package:app/blocs/blocs.dart';
import 'package:app/models/models.dart';
import 'package:app/themes/theme.dart';
import 'package:app/utils/utils.dart';
import 'package:app/widgets/widgets.dart';
import 'package:flutter/material.dart';
import 'package:flutter_bloc/flutter_bloc.dart';

class InsightsDayReading extends StatelessWidget {
  const InsightsDayReading(this.airQualityReading, {super.key});
  final AirQualityReading airQualityReading;

  @override
  Widget build(BuildContext context) {
    return Column(
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
              color: CustomColors.appColorBlue,
              borderRadius: const BorderRadius.all(
                Radius.circular(27.0),
              ),
            ),
            child: const Center(
                child: Text(
              'M',
              style: TextStyle(fontSize: 8, color: Colors.white),
            ),),),
        const SizedBox(
          height: 11,
        ),
        Text('${airQualityReading.dateTime.day}'),
        const SizedBox(
          height: 7,
        ),
        const Text('emoji'), // TODO replace with an actual emoji
      ],
    );
  }
}

class HealthTipsWidget extends StatelessWidget {
  const HealthTipsWidget({super.key});

  @override
  Widget build(BuildContext context) {
    return BlocBuilder<InsightsBloc, InsightsState>(
      builder: (context, state) {
        AirQualityReading? airQualityReading = state.airQualityReading;
        if (state.healthTips.isEmpty || airQualityReading == null) {
          return Container();
        }

        return ListView(
          physics: const NeverScrollableScrollPhysics(),
          shrinkWrap: true,
          children: [
            Padding(
              padding: const EdgeInsets.symmetric(horizontal: 16),
              child: Text(
                airQualityReading.insightsHealthTipsTitle(),
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
                      right:
                          index == (state.healthTips.length - 1) ? 12.0 : 6.0,
                    ),
                    child: HealthTipContainer(state.healthTips[index]),
                  );
                },
                itemCount: state.healthTips.length,
              ),
            ),
          ],
        );
      },
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
