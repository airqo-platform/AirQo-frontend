import 'package:airqo/src/app/auth/pages/login_page.dart';
import 'package:airqo/src/app/dashboard/pages/location_selection/location_selection_screen.dart';
import 'package:airqo/src/app/dashboard/repository/country_repository.dart';
import 'package:airqo/src/meta/utils/colors.dart';
import 'package:flutter/material.dart';
import 'package:flutter_bloc/flutter_bloc.dart';
import 'package:geolocator/geolocator.dart';
import 'package:geocoding/geocoding.dart';

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
  String? userCountry;

  @override
  void initState() {
    super.initState();

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

  @override
  Widget build(BuildContext context) {
    final authState = context.watch<AuthBloc>().state;
    final isGuest = authState is GuestUser;

    return Scaffold(
      appBar: DashboardAppBar(),
      body: Stack(
        children: [
          RefreshIndicator(
            onRefresh: () async {
              context.read<DashboardBloc>().add(LoadDashboard());
              return Future.delayed(Duration(
                  seconds: 1)); // Give time for the refresh to be visible
            },
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
              return NearbyView(
                onRefresh: () async {
                  context.read<DashboardBloc>().add(LoadDashboard());
                  return await Future.delayed(Duration(seconds: 1));
                },
              );
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
      default:
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
