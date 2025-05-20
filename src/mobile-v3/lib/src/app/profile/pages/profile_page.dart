import 'package:airqo/src/app/profile/bloc/user_bloc.dart';
import 'package:airqo/src/app/profile/pages/edit_profile.dart';
import 'package:airqo/src/app/profile/pages/widgets/settings_widget.dart';
import 'package:airqo/src/meta/utils/colors.dart';
import 'package:flutter/material.dart';
import 'package:flutter_bloc/flutter_bloc.dart';
import 'package:flutter_svg/svg.dart';
import 'package:airqo/src/app/shared/pages/error_page.dart';
import 'package:loggy/loggy.dart';

class ProfilePage extends StatefulWidget {
  const ProfilePage({super.key});

  @override
  State<ProfilePage> createState() => _ProfilePageState();
}

class _ProfilePageState extends State<ProfilePage> with UiLoggy {
  bool isRetrying = false;

  void _retryLoading() {
    setState(() {
      isRetrying = true;
    });
    context.read<UserBloc>().add(LoadUser());
    setState(() {
      isRetrying = false;
    });
  }

  bool _isHtmlError(String message) {
    return message.contains("<html>") ||
        message.contains("<!DOCTYPE") ||
        message.contains("Unexpected character");
  }

  @override
  Widget build(BuildContext context) {
    return BlocBuilder<UserBloc, UserState>(
      builder: (context, state) {
        loggy.info('Current UserBloc state: $state');

        if (state is UserLoading || isRetrying) {
          return Scaffold(
            appBar: AppBar(
              automaticallyImplyLeading: false,
              actions: [
                IconButton(
                    onPressed: () => Navigator.pop(context),
                    icon: Icon(Icons.close)),
                SizedBox(width: 16)
              ],
            ),
            body: const Center(
              child: CircularProgressIndicator(),
            ),
          );
        } else if (state is UserLoadingError) {
          loggy.error('Profile error: ${state.message}');

          final isHtmlError = _isHtmlError(state.message);
          if (isHtmlError) {
            loggy.warning('HTML error detected in profile response');
          }

          return Scaffold(
            appBar: AppBar(
              automaticallyImplyLeading: false,
              actions: [
                IconButton(
                    onPressed: () => Navigator.pop(context),
                    icon: Icon(Icons.close)),
                SizedBox(width: 16)
              ],
            ),
            body: Container(
              width: double.infinity,
              height: double.infinity,
              alignment: Alignment.center,
              padding: const EdgeInsets.symmetric(horizontal: 24.0),
              child: ErrorPage(),
            ),
          );
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

        // Default/Initial state
        return Scaffold(
          appBar: AppBar(
            automaticallyImplyLeading: false,
            actions: [
              IconButton(
                  onPressed: () => Navigator.pop(context),
                  icon: Icon(Icons.close)),
              SizedBox(width: 16)
            ],
          ),
          body: Center(
            child: Column(
              mainAxisAlignment: MainAxisAlignment.center,
              children: [
                CircularProgressIndicator(),
                SizedBox(height: 16),
                Text(
                  "Loading your profile...",
                  style: TextStyle(
                    color: Theme.of(context).brightness == Brightness.dark
                        ? Colors.white70
                        : Colors.black54,
                    fontSize: 16,
                  ),
                )
              ],
            ),
          ),
        );
      },
    );
  }

  Widget _buildProfilePicture(String profilePicture) {
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

    if (profilePicture.isEmpty) {
      return initialsWidget;
    }

    if (profilePicture.startsWith('http')) {
      return ClipOval(
        child: Image.network(
          profilePicture,
          fit: BoxFit.cover,
          width: 100,
          height: 100,
          errorBuilder: (context, error, stackTrace) {
            loggy.warning('Error loading profile image: $error');
            return initialsWidget;
          },
        ),
      );
    } else {
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
