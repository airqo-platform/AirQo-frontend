import 'package:app/blocs/blocs.dart';
import 'package:app/models/models.dart';
import 'package:app/themes/theme.dart';
import 'package:app/widgets/widgets.dart';
import 'package:flutter/material.dart';
import 'package:flutter_bloc/flutter_bloc.dart';
import 'package:flutter_svg/svg.dart';

class EmptyFavouritePlace extends StatelessWidget {
  const EmptyFavouritePlace(this.airQualityReading, {super.key});

  final AirQualityReading airQualityReading;

  @override
  Widget build(BuildContext context) {
    final appColors = Theme.of(context).extension<AppColors>()!;

    return InkWell(
      onTap: () => _navigateToInsights(context),
      child: Padding(
        padding: const EdgeInsets.symmetric(vertical: 8.0),
        child: Container(
          decoration: const BoxDecoration(
            color: Colors.white,
            borderRadius: BorderRadius.all(
              Radius.circular(8.0),
            ),
            border: Border.fromBorderSide(
              BorderSide(color: Colors.transparent),
            ),
          ),
          child: Column(
            children: [
              const SizedBox(
                height: 5,
              ),
              Container(
                padding: const EdgeInsets.only(left: 32),
                child: Row(
                  children: [
                    const CircularLoadingAnimation(size: 40),
                    const SizedBox(
                      width: 12,
                    ),
                    Expanded(
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        mainAxisAlignment: MainAxisAlignment.start,
                        children: [
                          Text(
                            airQualityReading.name,
                            maxLines: 1,
                            overflow: TextOverflow.ellipsis,
                            style: CustomTextStyle.headline8(context),
                          ),
                          Text(
                            airQualityReading.location,
                            maxLines: 1,
                            overflow: TextOverflow.ellipsis,
                            style: CustomTextStyle.bodyText4(context)?.copyWith(
                              color: appColors.appColorBlack.withOpacity(0.3),
                            ),
                          ),
                        ],
                      ),
                    ),
                    InkWell(
                      onTap: () async => _updateFavPlace(context),
                      child: Padding(
                        padding: const EdgeInsets.symmetric(
                          horizontal: 32,
                          vertical: 24,
                        ),
                        child: HeartIcon(
                          showAnimation: false,
                          airQualityReading: airQualityReading,
                        ),
                      ),
                    ),
                  ],
                ),
              ),
              const Divider(
                color: Color(0xffC4C4C4),
              ),
              const SizedBox(
                height: 11,
              ),
              Container(
                padding: const EdgeInsets.symmetric(horizontal: 32),
                child: Row(
                  children: [
                    Container(
                      height: 16,
                      width: 16,
                      decoration: BoxDecoration(
                        color: appColors.appColorBlue,
                        borderRadius: const BorderRadius.all(
                          Radius.circular(3.0),
                        ),
                        border: const Border.fromBorderSide(
                          BorderSide(color: Colors.transparent),
                        ),
                      ),
                      child: const Icon(
                        Icons.bar_chart,
                        size: 14,
                        color: Colors.white,
                      ),
                    ),
                    const SizedBox(width: 8.0),
                    Text(
                      'View More Insights',
                      style: CustomTextStyle.caption3(context)?.copyWith(
                        color: appColors.appColorBlue,
                      ),
                    ),
                    const Spacer(),
                    Container(
                      height: 16,
                      width: 16,
                      padding: const EdgeInsets.all(5),
                      decoration: BoxDecoration(
                        color: appColors.appColorBlue.withOpacity(0.24),
                        borderRadius: const BorderRadius.all(
                          Radius.circular(3.0),
                        ),
                        border: const Border.fromBorderSide(
                          BorderSide(color: Colors.transparent),
                        ),
                      ),
                      child: SvgPicture.asset(
                        'assets/icon/more_arrow.svg',
                        semanticsLabel: 'more',
                        height: 6.99,
                        width: 4,
                      ),
                    ),
                  ],
                ),
              ),
              const SizedBox(
                height: 20,
              ),
            ],
          ),
        ),
      ),
    );
  }

  void _updateFavPlace(BuildContext context) {
    context
        .read<FavouritePlaceBloc>()
        .add(UpdateFavouritePlace(airQualityReading));
  }

  void _navigateToInsights(BuildContext context) {
    showSnackBar(context, 'No air quality for this place');
  }
}
