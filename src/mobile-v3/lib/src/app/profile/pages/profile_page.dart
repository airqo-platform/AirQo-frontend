import 'package:airqo/src/app/profile/bloc/user_bloc.dart';
import 'package:airqo/src/app/profile/pages/edit_profile.dart';
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
          String profilePicture =
              state.model.users[0].profilePicture?.isNotEmpty == true
                  ? state.model.users[0].profilePicture!
                  : "";
          return DefaultTabController(
            length: 1,
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
                      child: LayoutBuilder(
                        builder: (context, constraints) {
                          return Row(
                            children: [
                              Container(
                                margin:
                                    const EdgeInsets.symmetric(horizontal: 16),
                                child: CircleAvatar(
                                  backgroundColor:
                                      Theme.of(context).highlightColor,
                                  radius: 50,
                                  child: _buildProfilePicture(profilePicture),
                                ),
                              ),
                              Expanded(
                                child: Column(
                                  crossAxisAlignment: CrossAxisAlignment.start,
                                  children: [
                                    Text(
                                      "$firstName $lastName",
                                      style: TextStyle(
                                        color: Theme.of(context).brightness ==
                                                Brightness.dark
                                            ? Colors.white
                                            : AppColors.boldHeadlineColor,
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
                                          decoration: BoxDecoration(
                                              color: AppColors.primaryColor,
                                              borderRadius:
                                                  BorderRadius.circular(200)),
                                          child: Center(
                                              child: InkWell(
                                            onTap: () => Navigator.of(context)
                                                .push(MaterialPageRoute(
                                                    builder: (context) =>
                                                        EditProfile())),
                                            child: Row(
                                              mainAxisSize: MainAxisSize.min,
                                              children: [
                                                Icon(
                                                  Icons.edit,
                                                  color: Colors.white,
                                                  size: 18,
                                                ),
                                                SizedBox(width: 8),
                                                Text(
                                                  "Edit your profile",
                                                  style: TextStyle(
                                                    fontWeight: FontWeight.w500,
                                                    color: Colors.white,
                                                  ),
                                                ),
                                              ],
                                            ),
                                          )),
                                        ),
                                      ],
                                    )
                                  ],
                                ),
                              )
                            ],
                          );
                        },
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
                                  image: "assets/profile/settings.svg",
                                  label: "Settings")),
                        ]),
                    Expanded(
                      child: TabBarView(children: [SettingsWidget()]),
                    )
                  ],
                )),
          );
        }

        return Center(child: Text(state.toString()));
      },
    );
  }

  Widget _buildProfilePicture(String profilePicture) {
    // Extract initials from user data if available
    final userState = context.read<UserBloc>().state;
    String initials = "?";

    if (userState is UserLoaded) {
      final user = userState.model.users[0];
      String firstName = user.firstName;
      String lastName = user.lastName;

      if (firstName.isNotEmpty || lastName.isNotEmpty) {
        initials = "";
        if (firstName.isNotEmpty) {
          initials += firstName[0].toUpperCase();
        }
        if (lastName.isNotEmpty) {
          initials += lastName[0].toUpperCase();
        }
      }
    }

    // Create initials widget
    Widget initialsWidget = Center(
      child: Text(
        initials,
        style: TextStyle(
          color: Colors.white,
          fontWeight: FontWeight.bold,
          fontSize: 24,
        ),
      ),
    );

    // If no profile picture, show initials
    if (profilePicture.isEmpty) {
      return initialsWidget;
    }

    if (profilePicture.startsWith('http')) {
      // Network image (URL)
      return ClipOval(
        child: Image.network(
          profilePicture,
          fit: BoxFit.cover,
          width: 100,
          height: 100,
          errorBuilder: (context, error, stackTrace) {
            // Fallback to initials if network image fails
            return initialsWidget;
          },
        ),
      );
    } else {
      // Local asset (SVG or image)
      if (profilePicture.endsWith('.svg')) {
        return SvgPicture.asset(
          profilePicture,
          height: 50,
          width: 50,
          fit: BoxFit.cover,
        );
      } else {
        return ClipOval(
          child: Image.asset(
            profilePicture,
            fit: BoxFit.cover,
            width: 100,
            height: 100,
            errorBuilder: (context, error, stackTrace) {
              return initialsWidget;
            },
          ),
        );
      }
    }
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
