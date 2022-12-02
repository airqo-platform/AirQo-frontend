import 'package:app/blocs/blocs.dart';
import 'package:app/models/enum_constants.dart';
import 'package:app/themes/theme.dart';
import 'package:app/widgets/widgets.dart';
import 'package:flutter/material.dart';
import 'package:flutter_bloc/flutter_bloc.dart';
import 'package:flutter_svg/svg.dart';

import 'search_widgets.dart';

class AirQualitySheetCubit extends Cubit<bool> {
  AirQualitySheetCubit() : super(false);

  void setShow(bool show) => emit(show);
}

class SearchPage extends StatefulWidget {
  const SearchPage({super.key});

  @override
  State<SearchPage> createState() => _SearchPageState();
}

class _SearchPageState extends State<SearchPage> {
  @override
  void initState() {
    super.initState();
    context.read<SearchBloc>().add(const InitializeSearchPage());
  }

  @override
  Widget build(BuildContext context) {
    return BlocProvider(
      create: (_) => AirQualitySheetCubit(),
      child: Scaffold(
        appBar: AppBar(
          toolbarHeight: 72,
          elevation: 0,
          backgroundColor: CustomColors.appBodyColor,
          automaticallyImplyLeading: false,
          centerTitle: false,
          title: Row(
            children: [
              const AppBackButton(),
              const SizedBox(
                width: 6,
              ),
              const Expanded(
                child: SizedBox(
                  height: 40,
                  child: SearchInputField(),
                ),
              ),
              BlocBuilder<SearchBloc, SearchState>(
                builder: (context, state) {
                  return Visibility(
                    visible: state.searchTerm.isEmpty,
                    child: BlocBuilder<AirQualitySheetCubit, bool>(
                      builder: (context, progress) => InkWell(
                        onTap: () {
                          final value =
                              context.read<AirQualitySheetCubit>().state;
                          context.read<AirQualitySheetCubit>().setShow(!value);
                        },
                        child: Padding(
                          padding: const EdgeInsets.only(left: 6),
                          child: Container(
                            height: 35,
                            width: 35,
                            decoration: BoxDecoration(
                              color: CustomColors.appColorBlue.withOpacity(0.1),
                              shape: BoxShape.circle,
                            ),
                            child: Center(
                              child: Icon(
                                Icons.filter_list,
                                color: CustomColors.appColorBlue,
                              ),
                            ),
                          ),
                        ),
                      ),
                    ),
                  );
                },
              ),
            ],
          ),
        ),
        body: AppSafeArea(
          widget: BlocBuilder<SearchBloc, SearchState>(
            builder: (context, state) {
              switch (state.blocStatus) {
                case SearchStatus.initial:
                  break;
                case SearchStatus.searchSuccess:
                  return const SearchResultsWidget();
                case SearchStatus.searching:
                  return const SearchLoadingWidget();
                case SearchStatus.error:
                  switch (state.searchError) {
                    case SearchError.noInternetConnection:
                      return NoInternetConnectionWidget(
                        callBack: () {},
                      );
                    // TODO implement callback
                    case SearchError.searchFailed:
                      // TODO: Handle this case.
                      return NoAirQualityDataWidget(
                        callBack: () {},
                      );
                    case SearchError.none:
                      break;
                  }
                  break;
              }

              if (state.featuredAirQuality != null) {
                return Stack(
                  children: [
                    Visibility(
                      visible: state.nearbyAirQualityLocations.isEmpty &&
                          state.otherAirQualityLocations.isEmpty,
                      child: BlocBuilder<AirQualitySheetCubit, bool>(
                        builder: (context, progress) =>
                            NoAirQualityDataWidget(callBack: () {
                          final value =
                              context.read<AirQualitySheetCubit>().state;
                          context.read<AirQualitySheetCubit>().setShow(!value);
                        }),
                      ),
                    ),
                    ListView(
                      children: [
                        SearchSection(
                          maximumElements: 3,
                          title: 'Good Quality Air around you',
                          airQualityReadings: state.nearbyAirQualityLocations,
                        ),
                        SearchSection(
                          title: state.nearbyAirQualityLocations.isEmpty
                              ? 'Locations with Good Quality Air'
                              : 'Other locations',
                          airQualityReadings: state.otherAirQualityLocations,
                        ),
                      ],
                    ),
                    const AirQualitySheet(),
                  ],
                );
              }

              return Stack(
                children: [
                  ListView(
                    children: [
                      SearchSection(
                        maximumElements: 3,
                        title: 'Recent Searches',
                        airQualityReadings: state.recentSearches,
                      ),
                      const ExploreAfricanCitiesSection(),
                    ],
                  ),
                  const AirQualitySheet(),
                ],
              );
            },
          ),
        ),
      ),
    );
  }
}

class AirQualitySheet extends StatefulWidget {
  const AirQualitySheet({super.key});

  @override
  State<AirQualitySheet> createState() => _AirQualitySheetState();
}

class _AirQualitySheetState extends State<AirQualitySheet> {
  final DraggableScrollableController controller =
      DraggableScrollableController();

  @override
  void dispose() {
    controller.dispose();
    super.dispose();
  }

  void resizeScrollSheet(double value, {Curve? curve}) {
    controller.animateTo(
      value,
      duration: const Duration(milliseconds: 500),
      curve: curve ?? Curves.easeOutBack,
    );
  }

  @override
  Widget build(BuildContext context) {
    return BlocBuilder<AirQualitySheetCubit, bool>(
      buildWhen: (previous, current) {
        return true;
      },
      builder: (context, progress) {
        if (!progress) {
          return Container();
        }

        Future.delayed(const Duration(milliseconds: 100), () {
          resizeScrollSheet(0.95);
        });

        return DraggableScrollableSheet(
          controller: controller,
          initialChildSize: 0,
          minChildSize: 0,
          maxChildSize: 1,
          builder: (BuildContext context, ScrollController scrollController) {
            return Card(
              margin: EdgeInsets.zero,
              color: CustomColors.appBodyColor,
              elevation: 0.0,
              shape: const RoundedRectangleBorder(
                borderRadius: BorderRadius.only(
                  topLeft: Radius.circular(16),
                  topRight: Radius.circular(16),
                ),
              ),
              child: SingleChildScrollView(
                padding: const EdgeInsets.symmetric(horizontal: 18),
                controller: scrollController,
                physics: const NeverScrollableScrollPhysics(),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  mainAxisAlignment: MainAxisAlignment.start,
                  children: [
                    const SizedBox(
                      height: 27,
                    ),
                    Row(
                      mainAxisAlignment: MainAxisAlignment.spaceBetween,
                      children: [
                        Text(
                          'Filter By Air Quality Range',
                          maxLines: 1,
                          overflow: TextOverflow.ellipsis,
                          style: CustomTextStyle.headline8(context)?.copyWith(
                            color: CustomColors.appColorBlack.withOpacity(0.3),
                          ),
                        ),
                        InkWell(
                          onTap: () {
                            resizeScrollSheet(0, curve: Curves.easeInOut);
                            context.read<AirQualitySheetCubit>().setShow(false);
                          },
                          child: SvgPicture.asset(
                            'assets/icon/close_search_filter.svg',
                          ),
                        ),
                      ],
                    ),
                    const SizedBox(
                      height: 15,
                    ),
                    ListView.builder(
                      shrinkWrap: true,
                      itemBuilder: (_, index) {
                        return Padding(
                          padding: const EdgeInsets.symmetric(vertical: 8),
                          child: InkWell(
                            onTap: () {
                              context.read<SearchBloc>().add(
                                    FilterSearchAirQuality(
                                      AirQuality.values[index],
                                    ),
                                  );
                            },
                            child:
                                SearchPageFilterTile(AirQuality.values[index]),
                          ),
                        );
                      },
                      itemCount: AirQuality.values.length,
                    ),
                    const SizedBox(
                      height: 15,
                    ),
                  ],
                ),
              ),
            );
          },
        );
      },
    );
  }
}
