import 'package:app/blocs/blocs.dart';
import 'package:app/models/models.dart';
import 'package:app/screens/insights/insights_page.dart';
import 'package:app/themes/theme.dart';
import 'package:app/widgets/widgets.dart';
import 'package:flutter/cupertino.dart';
import 'package:flutter/material.dart';
import 'package:flutter_bloc/flutter_bloc.dart';

class FavouritePlaceCard extends StatelessWidget {
  const FavouritePlaceCard(this.favouritePlace, {super.key});
  final FavouritePlace favouritePlace;

  @override
  Widget build(BuildContext context) {
    final appColors = Theme.of(context).extension<AppColors>()!;
    AirQualityReading? airQualityReading = favouritePlace.airQualityReading;

    return Builder(
      builder: (BuildContext context) {
        return SwipeDismissible(
          key: UniqueKey(),
          onDismissed: (dir) {
            ScaffoldMessenger.of(context).removeCurrentSnackBar();
            if (dir == DismissDirection.endToStart ||
                dir == DismissDirection.startToEnd) {
              context.read<FavouritePlaceBloc>().add(
                    UpdateFavouritePlace(
                      favouritePlace.copyWith(
                        airQualityReading: airQualityReading,
                      ),
                    ),
                  );
            }
          },
          confirmDismiss: (DismissDirection direction) async {
            if (direction == DismissDirection.endToStart ||
                direction == DismissDirection.startToEnd) {
              return await showDialog(
                barrierDismissible: false,
                context: context,
                builder: (BuildContext context) {
                  return CupertinoAlertDialog(
                    title: Text(
                      "Confirm",
                      style: TextStyle(
                        color: CustomColors.appColorBlue,
                        fontSize: 16,
                        fontWeight: FontWeight.w600,
                      ),
                    ),
                    content: RichText(
                      textAlign: TextAlign.center,
                      text: TextSpan(
                        children: [
                          TextSpan(
                            text: "Are you sure you want to remove\n",
                            style: TextStyle(
                              color: CustomColors.appColorBlack,
                            ),
                          ),
                          TextSpan(
                            text: favouritePlace.name,
                            style: TextStyle(
                              color: CustomColors.appColorBlack,
                              fontWeight: FontWeight.bold,
                            ),
                          ),
                          TextSpan(
                            text: "\nfrom your favorites?",
                            style: TextStyle(
                              color: CustomColors.appColorBlack,
                            ),
                          ),
                        ],
                      ),
                    ),
                    actions: <Widget>[
                      CupertinoDialogAction(
                        onPressed: () {
                          Navigator.of(context).pop(true);
                        },
                        child: Text("Yes",
                            style: TextStyle(
                              color: CustomColors.appColorBlue,
                              fontSize: 16,
                              fontWeight: FontWeight.w600,
                            )),
                      ),
                      CupertinoDialogAction(
                        onPressed: () {
                          Navigator.of(context).pop(false);
                        },
                        child: Text("No",
                            style: TextStyle(
                              color: CustomColors.appColorBlue,
                              fontSize: 16,
                              fontWeight: FontWeight.w600,
                            )),
                      ),
                    ],
                  );
                },
              );
            }
            return null;
          },
          background: SwipeDismissible.defaultBackground(
            color: CustomColors.appColorRed,
            icon: Icons.delete,
            label: 'Remove from favorites',
          ),
          child: InkWell(
            onTap: () async {
              await _navigateToInsights(context, airQualityReading);
            },
            child: Padding(
              padding: const EdgeInsets.symmetric(vertical: 8.0),
              child: Container(
                decoration: const BoxDecoration(
                  color: Colors.white,
                  borderRadius: BorderRadius.all(
                    Radius.circular(8.0),
                  ),
                  border: Border.fromBorderSide(
                    BorderSide(
                      color: Colors.transparent,
                    ),
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
                          if (airQualityReading != null)
                            MiniAnalyticsAvatar(
                                airQualityReading: airQualityReading),
                          Visibility(
                            visible: airQualityReading == null,
                            child: const CircularLoadingAnimation(size: 40),
                          ),
                          const SizedBox(
                            width: 12,
                          ),
                          Expanded(
                            child: Column(
                              crossAxisAlignment: CrossAxisAlignment.start,
                              mainAxisAlignment: MainAxisAlignment.start,
                              children: [
                                Text(
                                  favouritePlace.name,
                                  maxLines: 1,
                                  overflow: TextOverflow.ellipsis,
                                  style: CustomTextStyle.headline8(context),
                                ),
                                Text(
                                  favouritePlace.location,
                                  maxLines: 1,
                                  overflow: TextOverflow.ellipsis,
                                  style: CustomTextStyle.bodyText4(context)
                                      ?.copyWith(
                                    color: appColors.appColorBlack
                                        .withOpacity(0.3),
                                  ),
                                ),
                              ],
                            ),
                          ),
                          InkWell(
                            onTap: () {
                              context
                                  .read<FavouritePlaceBloc>()
                                  .add(UpdateFavouritePlace(favouritePlace));
                            },
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
                                BorderSide(
                                  color: Colors.transparent,
                                ),
                              ),
                            ),
                            child: const Icon(
                              Icons.arrow_forward_ios_rounded,
                              size: 10,
                              semanticLabel: 'more',
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
          ),
        );
      },
    );
  }

  Future<void> _navigateToInsights(
    BuildContext context,
    AirQualityReading? airQualityReading,
  ) async {
    if (airQualityReading == null) {
      showSnackBar(context, 'No air quality for this place');

      return;
    }
    await navigateToInsights(context, airQualityReading);
  }
}
