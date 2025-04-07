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
    final isDarkMode = Theme.of(context).brightness == Brightness.dark;
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
          // Add debug logging to inspect model data
          print("UserLoaded state: ${userState.model.users.length} users");

          final user = userState.model.users[0];
          String? profilePicture = user.profilePicture;

          // Add null checks for firstName and lastName
          String? firstName = user.firstName;
          String? lastName = user.lastName;

          print(
              "User data - firstName: $firstName, lastName: $lastName, profilePicture: $profilePicture");

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
              backgroundColor: Theme.of(context).brightness == Brightness.dark
                  ? AppColors.darkHighlight
                  : AppColors.dividerColorlight,
              child: ClipOval(
                child:
                    _buildProfilePicture(profilePicture, firstName, lastName),
              ),
            ),
          );
        } else if (userState is UserLoadingError) {
          print("UserLoadingError state: ${userState.toString()}");
          return GestureDetector(
            onTap: () {
              Navigator.of(context).push(
                MaterialPageRoute(
                  builder: (context) => ProfilePage(),
                ),
              );
            },
            child: CircleAvatar(
              radius: 24,
              backgroundColor: Theme.of(context).brightness == Brightness.dark
                  ? AppColors.darkHighlight
                  : AppColors.dividerColorlight,
              child: Center(
                child: Text(
                  "?",
                  style: TextStyle(
                    color: Colors.white,
                    fontWeight: FontWeight.bold,
                    fontSize: 16,
                  ),
                ),
              ),
            ),
          );
        } else {
          print("Other UserState: ${userState.toString()}");
          return ShimmerContainer(
            height: 48,
            borderRadius: 1000,
            width: 48,
          );
        }
      },
    );
  }

  // Helper method to build the profile picture widget with null safety
  Widget _buildProfilePicture(
      String? profilePicture, String? firstName, String? lastName) {
    // Add debug prints to troubleshoot
    print("Building profile picture with data:");
    print("Profile picture: $profilePicture");
    print("First name: $firstName, Last name: $lastName");

    // Make firstName and lastName nullable safe by providing defaults
    String firstNameSafe = firstName ?? "";
    String lastNameSafe = lastName ?? "";

    // Generate initials from the user's name, with robust null/empty checks
    String firstInitial =
        (firstNameSafe.isNotEmpty) ? firstNameSafe[0].toUpperCase() : "";
    String lastInitial =
        (lastNameSafe.isNotEmpty) ? lastNameSafe[0].toUpperCase() : "";
    String initials = (firstInitial + lastInitial).isNotEmpty
        ? (firstInitial + lastInitial)
        : "?";

    print("Generated initials: $initials");

    // Create the fallback widget (with initials) once to reuse
    Widget initialsWidget = Center(
      child: Text(
        initials,
        style: TextStyle(
          color: Colors.white,
          fontWeight: FontWeight.bold,
          fontSize: 16,
        ),
      ),
    );

    // If profile picture is null or empty, show initials
    if (profilePicture == null || profilePicture.isEmpty) {
      print("No profile picture, showing initials");
      return initialsWidget;
    }

    // If profile picture is a network URL
    if (profilePicture.startsWith('http')) {
      print("Loading network image: $profilePicture");
      return Image.network(
        profilePicture,
        fit: BoxFit.cover,
        width: 48,
        height: 48,
        errorBuilder: (context, error, stackTrace) {
          print("Network image error: $error");
          // On network image error, show initials
          return initialsWidget;
        },
        loadingBuilder: (context, child, loadingProgress) {
          if (loadingProgress == null) {
            return child;
          }
          // Show loading indicator or initials while loading
          return initialsWidget;
        },
      );
    }

    // For local SVG assets
    if (profilePicture.endsWith('.svg')) {
      print("Loading SVG asset: $profilePicture");
      return SvgPicture.asset(
        profilePicture,
        height: 48,
        width: 48,
        fit: BoxFit.cover,
        placeholderBuilder: (_) => initialsWidget,
      );
    }

    // For other local assets
    print("Loading asset image: $profilePicture");
    return Image.asset(
      profilePicture,
      fit: BoxFit.cover,
      width: 48,
      height: 48,
      errorBuilder: (context, error, stackTrace) {
        print("Asset image error: $error");
        // On local image error, show initials
        return initialsWidget;
      },
    );
  }
}
