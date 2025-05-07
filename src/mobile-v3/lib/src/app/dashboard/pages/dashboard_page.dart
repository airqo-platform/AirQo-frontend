import 'package:airqo/src/app/dashboard/bloc/health_tips/health_tips_bloc.dart';
import 'package:airqo/src/app/dashboard/pages/location_selection/location_selection_screen.dart';
import 'package:airqo/src/meta/utils/colors.dart';
import 'package:flutter/material.dart';
import 'package:flutter_bloc/flutter_bloc.dart';

import '../../auth/bloc/auth_bloc.dart';
import '../../profile/bloc/user_bloc.dart';
import '../../shared/pages/error_page.dart';
import '../bloc/dashboard/dashboard_bloc.dart';
import '../widgets/dashboard_app_bar.dart';
import '../widgets/dashboard_header.dart';
import '../widgets/dashboard_loading.dart';
import '../widgets/measurements_list.dart';
import '../widgets/my_places_view.dart';
import '../widgets/nearby_view.dart';
import '../widgets/view_selector.dart';
import 'package:loggy/loggy.dart';

class DashboardPage extends StatefulWidget {
  const DashboardPage({super.key});

  @override
  State<DashboardPage> createState() => _DashboardPageState();
}

class _DashboardPageState extends State<DashboardPage> with UiLoggy {
  DashboardView currentView = DashboardView.favorites;
  String? selectedCountry;

  @override
  void initState() {
    super.initState();
    loggy.info('Initializing DashboardPage');

    context.read<DashboardBloc>().add(LoadDashboard());
    context.read<UserBloc>().add(LoadUser());

    context.read<HealthTipsBloc>().add(LoadHealthTips());

    final authState = context.read<AuthBloc>().state;
    if (authState is AuthInitial || authState is GuestUser) {
      loggy.info('Using guest account');
      context.read<AuthBloc>().add(UseAsGuest());
    } else {
      loggy.info('User is already authenticated');
    }
  }

  void setView(DashboardView view, {String? country}) {
    setState(() {
      currentView = view;
      selectedCountry = country;
    });
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: DashboardAppBar(),
      body: Stack(
        children: [
          CustomScrollView(
            slivers: [
              SliverToBoxAdapter(
                child: DashboardHeader(),
              ),
              SliverToBoxAdapter(
                child: ViewSelector(
                  currentView: currentView,
                  selectedCountry: selectedCountry,
                  onViewChanged: setView,
                ),
              ),
              SliverToBoxAdapter(
                child: _buildContentForCurrentView(),
              ),
            ],
          ),

          if (currentView == DashboardView.favorites)
            Positioned(
              right: 20,
              bottom: 20,
              child: FloatingActionButton(
                onPressed: () {
                  Navigator.push(
                    context,
                    MaterialPageRoute(
                      builder: (context) => const LocationSelectionScreen(),
                    ),
                  ).then((value) {
                    if (value != null) {
                      context.read<DashboardBloc>().add(LoadDashboard());
                    }
                  });
                },
                backgroundColor: AppColors.primaryColor,
                child: const Icon(Icons.add, color: Colors.white),
              ),
            ),
        ],
      ),
    );
  }

  Widget _buildContentForCurrentView() {
    switch (currentView) {
      case DashboardView.favorites:
        return BlocBuilder<DashboardBloc, DashboardState>(
          builder: (context, state) {
            if (state is DashboardLoaded) {
              loggy.info(
                  'Dashboard loaded with preferences: ${state.userPreferences != null}');
              if (state.userPreferences != null) {
                loggy.info(
                    'User has ${state.selectedLocationIds.length} selected locations');
              }

              return MyPlacesView(
                userPreferences: state.userPreferences,
              );
            } else if (state is DashboardLoading) {
              return DashboardLoadingPage();
            } else if (state is DashboardLoadingError) {
              return ErrorPage();
            }
            return Container();
          },
        );
      case DashboardView.nearYou:
        return BlocBuilder<DashboardBloc, DashboardState>(
          builder: (context, state) {
            if (state is DashboardLoaded) {
              return NearbyView();
            } else if (state is DashboardLoading) {
              return DashboardLoadingPage();
            } else if (state is DashboardLoadingError) {
              return ErrorPage();
            }
            return Container();
          },
        );
      case DashboardView.country:
        return BlocBuilder<DashboardBloc, DashboardState>(
            builder: (context, state) {
          if (state is DashboardLoaded) {
            final countryMeasurements = state.response.measurements!
                .where((m) => m.siteDetails?.country == selectedCountry)
                .toList();
            return MeasurementsList(measurements: countryMeasurements);
          } else if (state is DashboardLoading) {
            return DashboardLoadingPage();
          } else {
            return ErrorPage();
          }
        });
      default: // DashboardView.all
        return BlocBuilder<DashboardBloc, DashboardState>(
          builder: (context, state) {
            if (state is DashboardLoaded) {
              return MeasurementsList(
                measurements: state.response.measurements!.take(5).toList(),
              );
            } else if (state is DashboardLoading) {
              return DashboardLoadingPage();
            } else if (state is DashboardLoadingError) {
              return ErrorPage();
            }
            return Container();
          },
        );
    }
  }
}
