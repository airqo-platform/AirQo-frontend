import 'package:airqo/src/app/auth/bloc/auth_bloc.dart';
import 'package:airqo/src/app/dashboard/bloc/dashboard/dashboard_bloc.dart';
import 'package:airqo/src/app/dashboard/widgets/analytics_card.dart';
import 'package:airqo/src/app/dashboard/widgets/countries_chip.dart';
import 'package:airqo/src/app/dashboard/widgets/dashboard_loading.dart';
import 'package:airqo/src/app/other/theme/bloc/theme_bloc.dart';
import 'package:airqo/src/app/profile/bloc/user_bloc.dart';
import 'package:airqo/src/app/shared/pages/error_page.dart';
import 'package:airqo/src/app/shared/widgets/loading_widget.dart';
import 'package:airqo/src/app/shared/widgets/page_padding.dart';
import 'package:airqo/src/meta/utils/colors.dart';
import 'package:flutter/material.dart';
import 'package:flutter_bloc/flutter_bloc.dart';
import 'package:flutter_sticky_header/flutter_sticky_header.dart';
import 'package:flutter_svg/svg.dart';
import 'package:intl/intl.dart';

import '../../profile/pages/guest_profile page.dart';
import '../../profile/pages/profile_page.dart';
import '../models/airquality_response.dart';

class DashboardPage extends StatefulWidget {
  const DashboardPage({super.key});

  @override
  State<DashboardPage> createState() => _DashboardPageState();
}

class _DashboardPageState extends State<DashboardPage> {
  DashboardBloc? dashboardBloc;
  UserBloc? userBloc;
  ThemeBloc? themeBloc;
  AuthBloc? authBloc;

  List<Measurement> filteredMeasurements = [];
  String currentFilter = "All";

  @override
  void initState() {
    dashboardBloc = context.read<DashboardBloc>()..add(LoadDashboard());

    themeBloc = context.read<ThemeBloc>();

    userBloc = context.read<UserBloc>()..add(LoadUser());

    final authState = context.read<AuthBloc>().state;
    if (authState is AuthInitial || authState is GuestUser) {
      // Only set guest mode if no user is authenticated
      context.read<AuthBloc>().add(UseAsGuest());
    }
    super.initState();
  }

  void filterByCountry(String country, List<Measurement> measurements) {
    setState(() {
      filteredMeasurements = measurements.where((measurement) {
        if (measurement.siteDetails != null) {
          return measurement.siteDetails!.country == country;
        }
        return false;
      }).toList();

      currentFilter = country;
    });
  }

  void resetFilter() {
    setState(() {
      filteredMeasurements = [];
      currentFilter = "All";
    });
  }

  @override
  Widget build(BuildContext context) {
    List<CountryModel> countries = [
      CountryModel("🇺🇬", "Uganda"),
      CountryModel("🇰🇪", "Kenya"),
      CountryModel("🇧🇮", "Burundi"),
      CountryModel("🇬🇭", "Ghana"),
      CountryModel("🇳🇬", "Nigeria"),
      CountryModel("🇨🇲", "Cameroon"),
      CountryModel("🇿🇦", "South Africa"),
      CountryModel("🇲🇿", "Mozambique"),
    ];
    return Scaffold(
      appBar: AppBar(
          automaticallyImplyLeading: false,
          leading: null,
          title: Row(
            children: [
              SvgPicture.asset(
                "assets/images/shared/logo.svg",
              ),
              Spacer(),
              GestureDetector(
                onTap: () => themeBloc!.add(ToggleTheme(true)),
                child: CircleAvatar(
                  radius: 24,
                  backgroundColor: Theme.of(context).highlightColor,
                  child: Center(
                    child: SvgPicture.asset(
                        "assets/images/dashboard/theme_toggle.svg"),
                  ),
                ),
              ),
              SizedBox(width: 8),
              GestureDetector(
                onTap: () {
                  final authState = context.read<AuthBloc>().state;
                  if (authState is GuestUser) {
                    
                    Navigator.of(context).push(
                      MaterialPageRoute(
                        builder: (context) => GuestProfilePage(),
                      ),
                    );
                  } else {
                    // Navigate to the regular profile page
                    Navigator.of(context).push(
                      MaterialPageRoute(
                        builder: (context) => ProfilePage(),
                      ),
                    );
                  }
                },
                  child: BlocBuilder<AuthBloc, AuthState>(
                    builder: (context, authState) {
                      if (authState is GuestUser) {
                        // Display default avatar for guest users
                        return Container(
                          //margin: const EdgeInsets.symmetric(horizontal: 20),
                          child: CircleAvatar(
                            backgroundColor: Theme.of(context).highlightColor,

                            child: Center(
                              child: SvgPicture.asset(
                                  "assets/icons/user_icon.svg",
                              height:22,
                                width: 22,
                              ),
                            ),
                            radius: 24,
                          ),
                        );
                      } else {
                        return BlocBuilder<UserBloc, UserState>(
                          builder: (context, userState) {
                            if (userState is UserLoaded) {
                              String firstName = userState.model.users[0].firstName[0].toUpperCase();
                              String lastName = userState.model.users[0].lastName[0].toUpperCase();
                              return CircleAvatar(
                                child: Center(child: Text("${firstName}${lastName}")),
                                radius: 24,
                                backgroundColor: Theme.of(context).highlightColor,
                              );
                            } else if (userState is UserLoadingError) {
                              return Container(); // Handle error state (optional)
                            } else {
                              return ShimmerContainer(
                                height: 44,
                                borderRadius: 1000,
                                width: 44,
                              );
                            }
                          },
                        );
                      }
                    },
                  )

              ),
              SizedBox(width: 8),
            ],
          )),
      body: PagePadding(
        padding: 0,
        child: CustomScrollView(
          slivers: [
            SliverToBoxAdapter(
              child: PagePadding(
                padding: 16,
                child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      SizedBox(height: 16),
                      BlocBuilder<AuthBloc, AuthState>(
                        builder: (context, authState) {
                          if (authState is GuestUser) {
                            return Text(
                              "Hi, Guest 👋🏼",
                              style: TextStyle(
                                fontSize: 28,
                                fontWeight: FontWeight.w700,
                                color: Theme.of(context).textTheme.headlineLarge?.color,
                              ),
                            );
                          } else {
                            return BlocBuilder<UserBloc, UserState>(
                              builder: (context, userState) {
                                if (userState is UserLoaded) {
                                  return Text(
                                    "Hi ${userState.model.users[0].firstName} 👋🏼",
                                    style: TextStyle(
                                      fontSize: 28,
                                      fontWeight: FontWeight.w700,
                                      color: Theme.of(context).textTheme.headlineLarge?.color,
                                    ),
                                  );
                                }
                                return Text(
                                  "Hi,👋🏼",
                                  style: TextStyle(
                                    fontSize: 28,
                                    fontWeight: FontWeight.w700,
                                    color: Theme.of(context).textTheme.headlineLarge?.color,
                                  ),
                                );
                              },
                            );
                          }
                        },
                      ),

                      Text(
                        "Today’s Air Quality • ${DateFormat.MMMMd().format(DateTime.now())}",
                        style: TextStyle(
                          fontSize: 18,
                          fontWeight: FontWeight.w500,
                          color: Theme.of(context).textTheme.headlineMedium?.color,
                        ),
                      ),
                      SizedBox(height: 4)
                    ]),
              ),
            ),
            SliverStickyHeader(
              header: PagePadding(
                padding: 0,
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    BlocBuilder<DashboardBloc, DashboardState>(
                      builder: (context, state) {
                        if (state is DashboardLoaded) {
                          return Container(
                            padding: const EdgeInsets.symmetric(horizontal: 16),
                            width: double.infinity,
                            color: Theme.of(context).scaffoldBackgroundColor,
                            height: 55,
                            child: Container(
                              margin: const EdgeInsets.only(bottom: 8, top: 4),
                              child: SingleChildScrollView(
                                scrollDirection: Axis.horizontal,
                                child: Row(
                                  children: [
                                    GestureDetector(
                                      onTap: () => resetFilter(),
                                      child: Container(
                                        height: 48,
                                        width: 51,
                                        decoration: BoxDecoration(
                                            borderRadius:
                                                BorderRadius.circular(40),
                                            color: currentFilter == "All"
                                                ? AppColors.primaryColor
                                                : Theme.of(context)
                                                    .highlightColor),
                                        child: Center(
                                          child: Text("All",
                                              style: TextStyle(
                                                  color: currentFilter ==
                                                              "All" ||
                                                          Theme.of(context)
                                                                  .brightness ==
                                                              Brightness.dark
                                                      ? Colors.white
                                                      : Colors.black)),
                                        ),
                                      ),
                                    ),
                                    ListView.builder(
                                        shrinkWrap: true,
                                        physics:
                                            const NeverScrollableScrollPhysics(),
                                        scrollDirection: Axis.horizontal,
                                        itemCount: countries.length,
                                        itemBuilder: (context, index) {
                                          return CountriesChip(
                                              current: currentFilter ==
                                                  countries[index].countryName,
                                              onTap: () => filterByCountry(
                                                  countries[index].countryName,
                                                  state.response.measurements!),
                                              countryModel: countries[index]);
                                        })
                                  ],
                                ),
                              ),
                            ),
                          );
                        } else if (state is DashboardLoading) {
                          return CountriesChipsLoading();
                        }

                        return Container();
                      },
                    ),
                    SizedBox(
                      height: 4,
                    )
                  ],
                ),
              ),
              sliver: SliverToBoxAdapter(
                  child: Column(
                children: [
                  BlocBuilder<DashboardBloc, DashboardState>(
                    builder: (context, state) {
                      if (state is DashboardLoaded) {
                        return Builder(builder: (context) {
                          if (filteredMeasurements.length != 0) {
                            return ListView.builder(
                                physics: const NeverScrollableScrollPhysics(),
                                itemCount: filteredMeasurements.length,
                                shrinkWrap: true,
                                itemBuilder: (context, index) {
                                  return Container(
                                    margin: const EdgeInsets.only(bottom: 16),
                                    child: AnalyticsCard(
                                        filteredMeasurements[index]),
                                  );
                                });
                          }
                          return ListView.builder(
                              physics: const NeverScrollableScrollPhysics(),
                              itemCount: 5,
                              shrinkWrap: true,
                              itemBuilder: (context, index) {
                                return Container(
                                  margin: const EdgeInsets.only(bottom: 16),
                                  child: AnalyticsCard(
                                      state.response.measurements![index]),
                                );
                              });
                        });
                      } else if (state is DashboardLoadingError) {
                        return SizedBox(
                          child: Column(
                              children: [SizedBox(height: 24), ErrorPage()]),
                        );
                      } else if (state is DashboardLoading) {
                        return DashboardLoadingPage();
                      }

                      return Text("");
                    },
                  ),
                ],
              )),
            ),
          ],
        ),
      ),
    );
  }
}

class CountryModel {
  final String flag;
  final String countryName;

  const CountryModel(this.flag, this.countryName);
}