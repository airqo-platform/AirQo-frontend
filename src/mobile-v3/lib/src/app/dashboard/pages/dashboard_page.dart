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
  DashboardView currentView = DashboardView.myPlaces;
  String? selectedCountry;

  @override
  void initState() {
    super.initState();
    loggy.info('Initializing DashboardPage');
    
    // Load dashboard data which will also load preferences
    context.read<DashboardBloc>().add(LoadDashboard());
    context.read<UserBloc>().add(LoadUser());

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
      body: CustomScrollView(
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
    );
  }

  Widget _buildContentForCurrentView() {
    switch (currentView) {
      case DashboardView.myPlaces:
        return BlocBuilder<DashboardBloc, DashboardState>(
          builder: (context, state) {
            if (state is DashboardLoaded) {
              loggy.info('Dashboard loaded with preferences: ${state.userPreferences != null}');
              if (state.userPreferences != null) {
                loggy.info('User has ${state.selectedLocationIds.length} selected locations');
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
      case DashboardView.nearby:
        return NearbyView();
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