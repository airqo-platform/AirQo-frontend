import 'package:airqo/src/app/profile/bloc/user_bloc.dart';
import 'package:airqo/src/app/profile/pages/widgets/devices_widget.dart';
import 'package:airqo/src/app/profile/pages/widgets/exposure_widget.dart';
import 'package:airqo/src/app/profile/pages/widgets/settings_widget.dart';
import 'package:airqo/src/meta/utils/colors.dart';
import 'package:flutter/material.dart';
import 'package:flutter_bloc/flutter_bloc.dart';
import 'package:flutter_svg/svg.dart';

class ProfilePage extends StatefulWidget {
  const ProfilePage({super.key});

  @override
  State<ProfilePage> createState() => _ProfilePageState();
}

class _ProfilePageState extends State<ProfilePage> {
  @override
  Widget build(BuildContext context) {
    return BlocBuilder<UserBloc, UserState>(
      builder: (context, state) {
        if (state is UserLoading) {
          return Center(
            child: CircularProgressIndicator(),
          );
        } else if (state is UserLoadingError) {
          return Scaffold(body: Center(child: Text(state.message)));
        } else if (state is UserLoaded) {
          String firstName = state.model.users[0].firstName;
          String lastName = state.model.users[0].lastName;
          return DefaultTabController(
            length: 3,
            child: Scaffold(
                appBar: AppBar(
                  automaticallyImplyLeading: false,
                  actions: [
                    IconButton(
                        onPressed: () => Navigator.pop(context),
                        icon: Icon(Icons.close)),
                    SizedBox(width: 16)
                  ],
                ),
                body: Column(
                  children: [
                    SizedBox(
                      height: 100,
                      child: Row(
                        children: [
                          Container(
                            margin: const EdgeInsets.symmetric(horizontal: 16),
                            child: CircleAvatar(
                              backgroundColor: Theme.of(context).highlightColor,
                              child: Center(
                                child: SvgPicture.asset(
                                    "assets/icons/user_icon.svg"),
                              ),
                              radius: 50,
                            ),
                          ),
                          Column(
                            crossAxisAlignment: CrossAxisAlignment.start,
                            children: [
                              Text(
                                "${firstName} ${lastName}",
                                style: TextStyle(
                                  color: AppColors.boldHeadlineColor,
                                  fontSize: 24,
                                  fontWeight: FontWeight.w700,
                                ),
                              ),
                              Spacer(),
                              Row(
                                children: [
                                  Container(
                                    padding: const EdgeInsets.symmetric(
                                        horizontal: 32),
                                    height: 50,
                                    child: Center(
                                        child: Text("Edit your profile")),
                                    decoration: BoxDecoration(
                                        color: Theme.of(context).highlightColor,
                                        borderRadius:
                                            BorderRadius.circular(200)),
                                  ),
                                  SizedBox(width: 8),
                                  CircleAvatar(
                                      backgroundColor:
                                          Theme.of(context).highlightColor,
                                      radius: 26,
                                      child: SvgPicture.asset(
                                          "assets/icons/notification.svg"))
                                ],
                              )
                            ],
                          )
                        ],
                      ),
                    ),
                    SizedBox(height: 32),
                    TabBar(
                        indicatorSize: TabBarIndicatorSize.tab,
                        labelColor:
                            Theme.of(context).brightness == Brightness.dark
                                ? Colors.white
                                : AppColors.primaryColor,
                        overlayColor:
                            WidgetStatePropertyAll(Colors.transparent),
                        indicatorColor:
                            Theme.of(context).brightness == Brightness.dark
                                ? Colors.white
                                : AppColors.primaryColor,
                        tabs: [
                          Tab(
                              height: 60,
                              icon: TabIcon(
                                  image: "assets/profile/exposure.svg",
                                  label: "Exposure")),
                          // Tab(
                          //     height: 60,
                          //     icon: TabIcon(
                          //         image: "assets/profile/places.svg",
                          //         label: "Places")),
                          Tab(
                              height: 60,
                              icon: TabIcon(
                                  image: "assets/profile/devices.svg",
                                  label: "Devices")),
                          Tab(
                              height: 60,
                              icon: TabIcon(
                                  image: "assets/profile/settings.svg",
                                  label: "Settings")),
                        ]),
                    Expanded(
                      child: TabBarView(children: [
                        ExposureWidget(),
                        // Container(child: Text("devices")),
                        DevicesWidget(),
                        SettingsWidget()
                      ]),
                    )
                  ],
                )),
          );
        }

        return Center(child: Text(state.toString()));
      },
    );
  }
}

class TabIcon extends StatelessWidget {
  final String image;
  final String label;
  const TabIcon({super.key, required this.image, required this.label});

  @override
  Widget build(BuildContext context) {
    return Column(
      children: [
        SvgPicture.asset(
          image,
          color: Theme.of(context).brightness == Brightness.dark
              ? Theme.of(context).highlightColor
              : Colors.black,
        ),
        SizedBox(height: 8),
        Text(label)
      ],
    );
  }
}
