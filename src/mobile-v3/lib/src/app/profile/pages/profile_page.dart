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
    final isDarkMode = Theme.of(context).brightness == Brightness.dark;
    
    // Theme-based colors
    final textColor = isDarkMode ? Colors.white : AppColors.boldHeadlineColor4;
    final subtitleColor = isDarkMode 
        ? AppColors.secondaryHeadlineColor2
        : AppColors.secondaryHeadlineColor;
    final backgroundColor = isDarkMode 
        ? AppColors.darkThemeBackground
        : AppColors.backgroundColor;
    final cardColor = isDarkMode 
        ? AppColors.highlightColor 
        : Colors.white;
    
    return BlocBuilder<UserBloc, UserState>(
      builder: (context, state) {
        if (state is UserLoading) {
          return Center(
            child: CircularProgressIndicator(
              color: AppColors.primaryColor,
            ),
          );
        } else if (state is UserLoadingError) {
          return Scaffold(
            backgroundColor: backgroundColor,
            body: Center(
              child: Column(
                mainAxisAlignment: MainAxisAlignment.center,
                children: [
                  Icon(
                    Icons.error_outline,
                    color: Colors.red,
                    size: 60,
                  ),
                  SizedBox(height: 16),
                  Text(
                    'Error Loading Profile',
                    style: TextStyle(
                      color: textColor,
                      fontSize: 20,
                      fontWeight: FontWeight.bold,
                    ),
                  ),
                  SizedBox(height: 8),
                  Padding(
                    padding: const EdgeInsets.symmetric(horizontal: 32),
                    child: Text(
                      state.message,
                      textAlign: TextAlign.center,
                      style: TextStyle(
                        color: subtitleColor,
                        fontSize: 16,
                      ),
                    ),
                  ),
                  SizedBox(height: 24),
                  ElevatedButton(
                    onPressed: () {
                      context.read<UserBloc>().add(LoadUser());
                    },
                    style: ElevatedButton.styleFrom(
                      backgroundColor: AppColors.primaryColor,
                      foregroundColor: Colors.white,
                      padding: EdgeInsets.symmetric(horizontal: 24, vertical: 12),
                      shape: RoundedRectangleBorder(
                        borderRadius: BorderRadius.circular(8),
                      ),
                    ),
                    child: Text('Retry'),
                  ),
                ],
              ),
            ),
          );
        } else if (state is UserLoaded) {
          String firstName = state.model.users[0].firstName;
          String lastName = state.model.users[0].lastName;
          String email = state.model.users[0].email;
          
          return DefaultTabController(
            length: 1,
            child: Scaffold(
              backgroundColor: backgroundColor,
              appBar: AppBar(
                backgroundColor: isDarkMode ? AppColors.darkThemeBackground : Colors.white,
                elevation: 0,
                automaticallyImplyLeading: false,
                actions: [
                  IconButton(
                    onPressed: () => Navigator.pop(context),
                    icon: Icon(
                      Icons.close,
                      color: isDarkMode ? Colors.white : AppColors.boldHeadlineColor4,
                    ),
                  ),
                  SizedBox(width: 16)
                ],
              ),
              body: Column(
                children: [
                  Container(
                    color: isDarkMode ? AppColors.darkThemeBackground : Colors.white,
                    padding: const EdgeInsets.only(bottom: 24),
                    child: _buildProfileHeader(
                      firstName: firstName,
                      lastName: lastName,
                      email: email,
                      isDarkMode: isDarkMode,
                      textColor: isDarkMode ? Colors.white : AppColors.boldHeadlineColor4,
                      subtitleColor: isDarkMode ? Colors.grey.shade400 : AppColors.secondaryHeadlineColor,
                    ),
                  ),
                  SizedBox(height: 16),
                  _buildTabBar(isDarkMode: isDarkMode, cardColor: cardColor),
                  Expanded(
                    child: TabBarView(
                      children: [
                        Container(
                          margin: EdgeInsets.symmetric(horizontal: 16, vertical: 8),
                          decoration: BoxDecoration(
                            color: cardColor,
                            borderRadius: BorderRadius.circular(12),
                            boxShadow: isDarkMode ? [] : [
                              BoxShadow(
                                color: Colors.black.withOpacity(0.05),
                                blurRadius: 8,
                                offset: Offset(0, 2),
                              ),
                            ],
                          ),
                          child: SettingsWidget(),
                        ),
                      ],
                    ),
                  )
                ],
              ),
            ),
          );
        }

        return Center(child: Text(state.toString()));
      },
    );
  }

  Widget _buildProfileHeader({
    required String firstName,
    required String lastName,
    required String email,
    required bool isDarkMode,
    required Color textColor,
    required Color subtitleColor,
  }) {
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 20),
      child: Column(
        children: [
          Row(
            children: [
              Container(
                decoration: BoxDecoration(
                  shape: BoxShape.circle,
                  boxShadow: isDarkMode ? [] : [
                    BoxShadow(
                      color: Colors.black.withOpacity(0.05),
                      blurRadius: 8,
                      offset: Offset(0, 4),
                    ),
                  ],
                ),
                child: CircleAvatar(
                  backgroundColor: Theme.of(context).highlightColor,
                  radius: 45,
                  child: Center(
                    child: SvgPicture.asset(
                      "assets/icons/user_icon.svg",
                      color: isDarkMode ? null : AppColors.secondaryHeadlineColor,
                      width: 60,
                      height: 60,
                    ),
                  ),
                ),
              ),
              SizedBox(width: 16),
              Expanded(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text(
                      "$firstName $lastName",
                      style: TextStyle(
                        color: textColor,
                        fontSize: 24,
                        fontWeight: FontWeight.w700,
                      ),
                    ),
                    SizedBox(height: 4),
                    Text(
                      email,
                      style: TextStyle(
                        color: subtitleColor,
                        fontSize: 14,
                      ),
                    ),
                    SizedBox(height: 12),
                    _buildEditProfileButton(isDarkMode),
                  ],
                ),
              )
            ],
          ),
        ],
      ),
    );
  }

  Widget _buildEditProfileButton(bool isDarkMode) {
    return InkWell(
      onTap: () => Navigator.of(context).push(
        MaterialPageRoute(builder: (context) => EditProfile()),
      ),
      child: Container(
        padding: const EdgeInsets.symmetric(horizontal: 24, vertical: 10),
        decoration: BoxDecoration(
          color: AppColors.primaryColor,
          borderRadius: BorderRadius.circular(30),
          boxShadow: isDarkMode ? [] : [
            BoxShadow(
              color: AppColors.primaryColor.withOpacity(0.3),
              blurRadius: 8,
              offset: Offset(0, 3),
            ),
          ],
        ),
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
                fontSize: 14,
              ),
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildTabBar({required bool isDarkMode, required Color cardColor}) {
    return Container(
      margin: EdgeInsets.symmetric(horizontal: 16),
      decoration: BoxDecoration(
        color: cardColor,
        borderRadius: BorderRadius.circular(12),
        boxShadow: isDarkMode ? [] : [
          BoxShadow(
            color: Colors.black.withOpacity(0.05),
            blurRadius: 8,
            offset: Offset(0, 2),
          ),
        ],
      ),
      child: TabBar(
        indicatorSize: TabBarIndicatorSize.tab,
        labelColor: AppColors.primaryColor,
        unselectedLabelColor: isDarkMode 
            ? AppColors.secondaryHeadlineColor2
            : AppColors.secondaryHeadlineColor,
        overlayColor: WidgetStatePropertyAll(Colors.transparent),
        indicatorColor: AppColors.primaryColor,
        labelStyle: TextStyle(
          fontWeight: FontWeight.w600,
          fontSize: 14,
        ),
        tabs: [
          Tab(
            height: 70,
            icon: TabIcon(
              image: "assets/profile/settings.svg",
              label: "Settings",
            ),
          ),
        ],
      ),
    );
  }
}

class TabIcon extends StatelessWidget {
  final String image;
  final String label;
  const TabIcon({super.key, required this.image, required this.label});

  @override
  Widget build(BuildContext context) {
    final isDarkMode = Theme.of(context).brightness == Brightness.dark;
    
    return Column(
      mainAxisAlignment: MainAxisAlignment.center,
      children: [
        SvgPicture.asset(
          image,
          color: isDarkMode
              ? Theme.of(context).highlightColor
              : AppColors.boldHeadlineColor4,
          width: 24,
          height: 24,
        ),
        SizedBox(height: 8),
        Text(
          label,
          style: TextStyle(
            fontWeight: FontWeight.w500,
          ),
        )
      ],
    );
  }
}