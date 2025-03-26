import 'package:airqo/src/app/auth/pages/login_page.dart';
import 'package:airqo/src/app/profile/pages/profile_page.dart';
import 'package:flutter/material.dart';
import 'package:flutter_bloc/flutter_bloc.dart';
import 'package:flutter_svg/svg.dart';
import 'package:airqo/src/meta/utils/colors.dart';
import '../../auth/bloc/auth_bloc.dart';
import '../../other/theme/bloc/theme_bloc.dart';
import '../../profile/bloc/user_bloc.dart';
import '../../shared/widgets/loading_widget.dart';

class DashboardAppBar extends StatelessWidget implements PreferredSizeWidget {
  const DashboardAppBar({super.key}); 

  @override
  Size get preferredSize => const Size.fromHeight(kToolbarHeight);

  @override
  Widget build(BuildContext context) {
    return AppBar(
      automaticallyImplyLeading: false,
      leading: null,
      title: Row(
        children: [
          SvgPicture.asset(
            "assets/images/shared/logo.svg",
          ),
          Spacer(),
          _buildThemeToggle(context),
          SizedBox(width: 8),
          _buildUserAvatar(context),
          SizedBox(width: 8),
        ],
      ),
    );
  }

  Widget _buildThemeToggle(BuildContext context) {
    final themeBloc = context.read<ThemeBloc>();
   return GestureDetector(
    onTap: () {
      print("Toggling theme. Current isDarkMode: $isDarkMode");
      
      // Try without named parameter - it might be a positional parameter
      themeBloc.add(ToggleTheme(true));
    },
    child: CircleAvatar(
      radius: 24,
      backgroundColor: Theme.of(context).brightness == Brightness.dark
          ? AppColors.darkHighlight
          : AppColors.lightHighlight,
      child: Center(
        child: SvgPicture.asset(
          isDarkMode
              ? "assets/images/dashboard/Dark_icon.svg" 
              : "assets/images/dashboard/Light_icon.svg",
        ),
      ),
    ),
  );
  }

  Widget _buildUserAvatar(BuildContext context) {
    return BlocBuilder<AuthBloc, AuthState>(
      builder: (context, authState) {
        if (authState is GuestUser) {
          return _buildGuestAvatar(context);
        } else {
          return _buildUserProfileAvatar(context);
        }
      },
    );
  }

  Widget _buildGuestAvatar(BuildContext context) {
    return GestureDetector(
      onTap: () {
        // Navigate to login/signup screen for guest users
        Navigator.of(context).push(
          MaterialPageRoute(
            builder: (context) => LoginPage(),
          ),
        );
      },
      child: CircleAvatar(
        backgroundColor: Theme.of(context).highlightColor,
        radius: 24,
        child: Center(
          child: SvgPicture.asset(
            "assets/icons/user_icon.svg",
            height: 22,
            width: 22,
          ),
        ),
      ),
    );
  }

  Widget _buildUserProfileAvatar(BuildContext context) {
    return BlocBuilder<UserBloc, UserState>(
      builder: (context, userState) {
        if (userState is UserLoaded) {
          String firstName = userState.model.users[0].firstName.isNotEmpty
              ? userState.model.users[0].firstName[0].toUpperCase()
              : " ";
          String lastName = userState.model.users[0].lastName.isNotEmpty
            ? userState.model.users[0].lastName[0].toUpperCase()
            : " ";
          return GestureDetector(
            onTap: () {
              // Navigate to profile page
              Navigator.of(context).push(
                MaterialPageRoute(
                  builder: (context) => ProfilePage(),
                ),
              );
            },
            child: CircleAvatar(
              radius: 24,
              backgroundColor: Theme.of(context).highlightColor,
              child: Center(child: Text("$firstName$lastName")),
            ),
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
}
