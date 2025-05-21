import 'package:airqo/src/app/auth/pages/login_page.dart';
import 'package:airqo/src/app/dashboard/pages/location_selection/location_selection_screen.dart';
import 'package:airqo/src/app/dashboard/repository/country_repository.dart';
import 'package:airqo/src/meta/utils/colors.dart';
import 'package:flutter/material.dart';
import 'package:flutter_bloc/flutter_bloc.dart';
import 'dart:async';
import 'package:geolocator/geolocator.dart';
import 'package:geocoding/geocoding.dart';

import '../../auth/bloc/auth_bloc.dart';
import '../../profile/bloc/user_bloc.dart';
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
  String? userCountry;
  // Background refresher that triggers silently
  Timer? _backgroundRefreshTimer;

  @override
  void initState() {
    super.initState();

    // Immediate load data (will use cache if available)
    context.read<DashboardBloc>().add(LoadDashboard());
    context.read<UserBloc>().add(LoadUser());

    _getUserCountry();

    final authState = context.read<AuthBloc>().state;
    final isGuest = authState is GuestUser;

    if (isGuest) {
      setState(() {
        currentView = DashboardView.all;
      });
    }

    _backgroundRefreshTimer = Timer.periodic(Duration(minutes: 30), (_) {
      _silentBackgroundRefresh();
    });
  }

  @override
  void dispose() {
    _backgroundRefreshTimer?.cancel();
    super.dispose();
  }

  void _silentBackgroundRefresh() {
    if (context.read<DashboardBloc>().state is DashboardLoaded &&
        !(context.read<DashboardBloc>().state as DashboardLoaded).isOffline) {
      context.read<DashboardBloc>().add(SilentRefreshDashboard());
    }
  }

  Future<void> _getUserCountry() async {
    if (!mounted) return;
    try {
      bool serviceEnabled = await Geolocator.isLocationServiceEnabled();
      if (!serviceEnabled) return;

      LocationPermission permission = await Geolocator.checkPermission();
      if (permission == LocationPermission.denied) {
        permission = await Geolocator.requestPermission();
        if (permission == LocationPermission.denied) return;
      }
      if (permission == LocationPermission.deniedForever) return;

      final position = await Geolocator.getCurrentPosition();

      final placemarks =
          await placemarkFromCoordinates(position.latitude, position.longitude);

      if (placemarks.isEmpty) {
        loggy.warning(
            'No placemarks found for coordinates: ${position.latitude}, ${position.longitude}');
        return;
      }

      if (placemarks.isNotEmpty) {
        final country = placemarks.first.country;
        if (country != null && country.isNotEmpty) {
          setState(() {
            userCountry = country;
          });

          final isCountrySupported = CountryRepository.countries
              .any((c) => c.countryName.toLowerCase() == country.toLowerCase());

          if (isCountrySupported) {
            setState(() {
              selectedCountry = country;
            });
          }

          return;
        }
      }
    } catch (e) {
      loggy.warning('Error getting user country: $e');
    }
  }

  void setView(DashboardView view, {String? country}) {
    final authState = context.read<AuthBloc>().state;
    final isGuest = authState is GuestUser;

    if (isGuest &&
        (view == DashboardView.favorites || view == DashboardView.nearYou)) {
      _showLoginPrompt();
      return;
    }

    setState(() {
      currentView = view;
      selectedCountry = country;
    });
  }

  void _showLoginPrompt() {
    showDialog(
      context: context,
      builder: (context) => AlertDialog(
        title: const Text('Login Required'),
        content: const Text('Please log in to access this feature.'),
        actions: [
          TextButton(
            onPressed: () => Navigator.of(context).pop(),
            child: const Text('Cancel'),
          ),
          TextButton(
            onPressed: () {
              Navigator.of(context).pop();
              Navigator.push(
                context,
                MaterialPageRoute(builder: (context) => LoginPage()),
              );
            },
            child: const Text('Login'),
          ),
        ],
      ),
    );
  }

  Future<void> _refreshDashboard() async {
    final completer = Completer<void>();

    final subscription = context.read<DashboardBloc>().stream.listen((state) {
      if (state is DashboardLoaded && state is! DashboardRefreshing) {
        completer.complete();
      } else if (state is DashboardLoadingError) {
        completer.completeError(state.message);
      }
    });

    context.read<DashboardBloc>().add(RefreshDashboard());

    try {
      await completer.future;
    } finally {
      await subscription.cancel();
    }
  }

  @override
  Widget build(BuildContext context) {
    final authState = context.watch<AuthBloc>().state;
    final isGuest = authState is GuestUser;

    return Scaffold(
      appBar: DashboardAppBar(),
      body: Stack(
        children: [
          RefreshIndicator(
            onRefresh: _refreshDashboard,
            color: AppColors.primaryColor,
            backgroundColor: Theme.of(context).scaffoldBackgroundColor,
            child: CustomScrollView(
              slivers: [
                SliverToBoxAdapter(
                  child: DashboardHeader(),
                ),
                SliverToBoxAdapter(
                  child: ViewSelector(
                    currentView: currentView,
                    selectedCountry: selectedCountry,
                    onViewChanged: setView,
                    isGuestUser: isGuest,
                    userCountry: userCountry,
                  ),
                ),
                SliverToBoxAdapter(
                  child: _buildContentForCurrentView(),
                ),
              ],
            ),
          ),
          if (currentView == DashboardView.favorites && !isGuest)
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
    return BlocBuilder<DashboardBloc, DashboardState>(
      builder: (context, state) {
        if (state is DashboardLoading && state.previousState == null) {
          return DashboardLoadingPage();
        }

        if (state is DashboardLoadingError && !state.hasCache) {
          return Center(
            child: Column(
              mainAxisAlignment: MainAxisAlignment.center,
              children: [
                Icon(
                  Icons.cloud_off,
                  size: 64,
                  color: Colors.grey,
                ),
                SizedBox(height: 16),
                Text(
                  "Couldn't connect to the internet",
                  style: TextStyle(
                    fontSize: 18,
                    fontWeight: FontWeight.bold,
                    color: Theme.of(context).textTheme.headlineMedium?.color,
                  ),
                ),
                SizedBox(height: 8),
                Text(
                  "Please check your connection and try again",
                  style: TextStyle(
                    fontSize: 16,
                    color: Theme.of(context).textTheme.bodyMedium?.color,
                  ),
                ),
                SizedBox(height: 24),
                ElevatedButton.icon(
                  onPressed: () {
                    context
                        .read<DashboardBloc>()
                        .add(LoadDashboard(forceRefresh: true));
                  },
                  icon: Icon(Icons.refresh),
                  label: Text('Try Again'),
                  style: ElevatedButton.styleFrom(
                    backgroundColor: AppColors.primaryColor,
                    foregroundColor: Colors.white,
                  ),
                ),
              ],
            ),
          );
        }

        if (state is DashboardLoaded) {
          switch (currentView) {
            case DashboardView.favorites:
              loggy.info(
                  'Dashboard loaded with preferences: ${state.userPreferences != null}');
              if (state.userPreferences != null) {
                loggy.info(
                    'User has ${state.selectedLocationIds.length} selected locations');
              }

              return MyPlacesView(
                userPreferences: state.userPreferences,
              );

            case DashboardView.nearYou:
              return NearbyView();

            case DashboardView.country:
              final countryMeasurements = state.response.measurements!
                  .where((m) => m.siteDetails?.country == selectedCountry)
                  .toList();

              return MeasurementsList(measurements: countryMeasurements);

            default:
              return MeasurementsList(
                measurements: state.response.measurements!.take(5).toList(),
              );
          }
        }

        return DashboardLoadingPage();
      },
    );
  }
}
