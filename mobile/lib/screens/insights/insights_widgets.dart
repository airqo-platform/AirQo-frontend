import 'package:app/blocs/blocs.dart';
import 'package:app/models/models.dart';
import 'package:app/services/services.dart';
import 'package:app/themes/theme.dart';
import 'package:app/utils/utils.dart';
import 'package:app/widgets/widgets.dart';
import 'package:auto_size_text/auto_size_text.dart';
import 'package:flutter/material.dart';
import 'package:flutter_bloc/flutter_bloc.dart';
import 'package:flutter_gen/gen_l10n/app_localizations.dart';
import 'package:flutter_svg/svg.dart';

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
        color: insight.hasAirQuality
            ? insight.airQuality?.color.withOpacity(0.2)
            : CustomColors.greyColor.withOpacity(0.2),
        borderRadius: const BorderRadius.all(
          Radius.circular(16.0),
        ),
      ),
      child: Row(
        crossAxisAlignment: CrossAxisAlignment.center,
        children: [
          Expanded(
            child: Column(
              mainAxisAlignment: MainAxisAlignment.spaceBetween,
              crossAxisAlignment: CrossAxisAlignment.start,
              mainAxisSize: MainAxisSize.min,
              children: [
                AutoSizeText(
                  name,
                  maxLines: 1,
                  minFontSize: 1,
                  overflow: TextOverflow.ellipsis,
                  style: CustomTextStyle.headline8(context)?.copyWith(
                    fontWeight: FontWeight.w400,
                  ),
                ),
                const SizedBox(
                  height: 7,
                ),
                AutoSizeText(
                  insight.hasAirQuality
                      ? '${insight.airQuality?.getTitle(context)}'
                      : AppLocalizations.of(context)!.noAirQualityDataAvailable,
                  maxLines: 2,
                  minFontSize: 1,
                  overflow: TextOverflow.ellipsis,
                  style: CustomTextStyle.headline8(context)?.copyWith(
                    fontWeight: FontWeight.w700,
                  ),
                ),
                const SizedBox(
                  height: 7,
                ),
                Row(
                  mainAxisSize: MainAxisSize.min,
                  crossAxisAlignment: CrossAxisAlignment.center,
                  children: [
                    Text(
                      "${insight.pm2_5 == null ? '--' : insight.pm2_5?.toInt()}",
                      style: CustomTextStyle.airQualityValue(
                        pollutant: Pollutant.pm2_5,
                        value: insight.pm2_5,
                      )?.copyWith(
                        fontSize: 30,
                        fontWeight: FontWeight.w700,
                        height: 37 / 30,
                        letterSpacing: 16 * -0.022,
                      ),
                    ),
                    const SizedBox(
                      width: 7,
                    ),
                    SvgPicture.asset(
                      'assets/icon/unit.svg',
                      semanticsLabel: 'Unit',
                      height: 15.14,
                      width: 32.45,
                      colorFilter: ColorFilter.mode(
                        Pollutant.pm2_5.textColor(
                          value: insight.pm2_5,
                        ),
                        BlendMode.srcIn,
                      ),
                    ),
                  ],
                ),
              ],
            ),
          ),
          SvgIcons.airQualityEmoji(
            insight.airQuality,
            height: 50,
            width: 80,
          ),
        ],
      ),
    );
  }
}

class InsightAirQualityMessageWidget extends StatelessWidget {
  InsightAirQualityMessageWidget(this.insight, this.name, {super.key});

  final Insight insight;
  final String name;
  final ScrollController _scrollController = ScrollController();

  List<Widget> aqiDialogWidgets(BuildContext context) {
    List<Widget> aqiDialogWidgets = [];
    aqiDialogWidgets.add(
      Padding(
        padding: const EdgeInsets.only(top: 10.0),
        child: AutoSizeText(
          AppLocalizations.of(context)!
              .theAirQualityIndexColorsCanbBeUsedToShowHowPollutedTheAirIs,
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
                        text: "${airQuality.getTitle(context)}. ",
                        style: TextStyle(
                          fontSize: 8,
                          fontWeight: FontWeight.w500,
                          height: 13 / 8,
                          color: CustomColors.appColorBlack,
                        ),
                      ),
                      TextSpan(
                        text: airQuality.getDescription(context),
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
    String message = insight.currentAirQuality != null
        ? insight.message(context, name)
        : insight.forecastMessage(context);
    return Container(
      padding: const EdgeInsets.all(8),
      height: 64,
      child: Row(
        mainAxisAlignment: MainAxisAlignment.center,
        crossAxisAlignment: CrossAxisAlignment.center,
        children: [
          Expanded(
            child: AutoSizeText(
              message,
              maxLines: 3,
              overflow: TextOverflow.ellipsis,
              style: CustomTextStyle.bodyText4(context)?.copyWith(
                color: CustomColors.appColorBlack.withOpacity(0.3),
              ),
            ),
          ),
          const SizedBox(
            width: 5,
          ),
          Visibility(
            visible: insight.hasAirQuality,
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
                                AppLocalizations.of(context)!.knowYourair,
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
                              children: aqiDialogWidgets(context),
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
    Color color = insight.hasAirQuality
        ? CustomColors.appColorBlack
        : CustomColors.greyColor;

    return InkWell(
      onTap: () => context.read<InsightsBloc>().add(SwitchInsight(insight)),
      child: SizedBox(
        height: 60,
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
                  insight.dateTime
                      .getWeekday(context)
                      .characters
                      .first
                      .toUpperCase(),
                  style: TextStyle(
                    color: isActive ? Colors.white : color,
                  ),
                ),
              ),
            ),
            const SizedBox(
              height: 13,
            ),
            SvgIcons.airQualityEmoji(
              insight.airQuality,
            ),
          ],
        ),
      ),
    );
  }
}

class InsightsCalendar extends StatelessWidget {
  const InsightsCalendar(this.airQualityReading, {super.key});

  final AirQualityReading airQualityReading;

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
          child: Column(
            mainAxisSize: MainAxisSize.min,
            children: [
              Container(
                decoration: const BoxDecoration(
                  color: Colors.white,
                  borderRadius: BorderRadius.only(
                    topLeft: Radius.circular(16),
                    topRight: Radius.circular(16),
                  ),
                ),
                child: Column(
                  mainAxisSize: MainAxisSize.min,
                  children: [
                    const SizedBox(
                      height: 24,
                    ),
                    Padding(
                      padding: const EdgeInsets.symmetric(
                        horizontal: 30,
                      ),
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
                    Padding(
                      padding: const EdgeInsets.symmetric(
                        horizontal: 16,
                      ),
                      child: InsightAirQualityWidget(
                        selectedInsight,
                        name: state.name,
                      ),
                    ),
                    Padding(
                      padding: const EdgeInsets.symmetric(
                        horizontal: 16,
                      ),
                      child: InsightAirQualityMessageWidget(
                        selectedInsight,
                        airQualityReading.name,
                      ),
                    ),
                  ],
                ),
              ),
              const Divider(
                color: Color(0xffC4C4C4),
                height: 1.0,
              ),
              SizedBox(
                height: 57,
                child: AirQualityActions(airQualityReading),
              ),
            ],
          ),
        );
      },
    );
  }
}

class InsightsPageAppBar extends StatelessWidget
    implements PreferredSizeWidget {
  const InsightsPageAppBar(this.airQualityReading, {super.key});
  final AirQualityReading airQualityReading;

  @override
  Widget build(BuildContext context) {
    return AppBar(
      automaticallyImplyLeading: false,
      elevation: 0,
      backgroundColor: CustomColors.appBodyColor,
      centerTitle: false,
      title: Row(
        mainAxisAlignment: MainAxisAlignment.spaceBetween,
        children: [
          InkWell(
            onTap: () async {
              await popNavigation(context);
            },
            child: SvgPicture.asset(
              'assets/icon/close.svg',
              height: 40,
              width: 40,
            ),
          ),
          Text(AppLocalizations.of(context)!.moreInsights,
              style: CustomTextStyle.headline8(context)),
          FutureBuilder<Uri>(
            future: ShareService.createShareLink(
              airQualityReading: airQualityReading,
            ),
            builder: (context, snapshot) {
              if (snapshot.hasError) {
                showSnackBar(context,
                    AppLocalizations.of(context)!.couldNotCreateAShareLink);
              }
              if (snapshot.hasData) {
                return InkWell(
                  onTap: () async {
                    Uri? link = snapshot.data;
                    if (link != null) {
                      await ShareService.shareLink(
                        link,
                        context,
                        airQualityReading: airQualityReading,
                      );
                    }
                  },
                  child: SvgPicture.asset(
                    'assets/icon/share_icon.svg',
                    theme: SvgTheme(currentColor: CustomColors.greyColor),
                    colorFilter: ColorFilter.mode(
                      CustomColors.greyColor,
                      BlendMode.srcIn,
                    ),
                    height: 26,
                    width: 26,
                  ),
                );
              }

              return GestureDetector(
                onTap: () {
                  showSnackBar(
                      context, AppLocalizations.of(context)!.creatingShareLink);
                },
                child: const Center(
                  child: LoadingIcon(radius: 20),
                ),
              );
            },
          ),
        ],
      ),
    );
  }

  @override
  Size get preferredSize => const Size.fromHeight(60);
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
              AppLocalizations.of(context)!.forecast,
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
                      insight.forecastMessage(context),
                      maxLines: 4,
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

class HealthTipsWidget extends StatefulWidget {
  const HealthTipsWidget(this.insight, {super.key});

  final Insight insight;

  @override
  State<HealthTipsWidget> createState() => _HealthTipsWidgetState();
}

class _HealthTipsWidgetState extends State<HealthTipsWidget> {
  final ScrollController _scrollController = ScrollController();

  @override
  void initState() {
    super.initState();
    WidgetsBinding.instance.addPostFrameCallback((_) {
      Future.delayed(const Duration(seconds: 1)).then((value) {
        _scrollController.animateTo(
          _scrollController.position.maxScrollExtent,
          duration: Duration(seconds: widget.insight.healthTips.length * 10),
          curve: Curves.linear,
        );
      });
    });
  }

  @override
  void dispose() {
    _scrollController.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    if (widget.insight.healthTips.isEmpty) {
      return AnimatedSwitcher(
        duration: const Duration(milliseconds: 500),
        child: Container(),
      );
    }

    return AnimatedSwitcher(
      duration: const Duration(milliseconds: 500),
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
              widget.insight.healthTipsTitle(context),
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
              controller: _scrollController,
              itemBuilder: (context, index) {
                return Padding(
                  padding: EdgeInsets.only(
                    left: index == 0 ? 12.0 : 6.0,
                    right: index == (widget.insight.healthTips.length - 1)
                        ? 12.0
                        : 6.0,
                  ),
                  child: HealthTipContainer(widget.insight.healthTips[index]),
                );
              },
              itemCount: widget.insight.healthTips.length,
            ),
          ),
        ],
      ),
    );
  }
}
