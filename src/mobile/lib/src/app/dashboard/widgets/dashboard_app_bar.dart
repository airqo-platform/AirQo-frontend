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

  /// Same surface as the theme / profile chips: dark card highlight, or in
  /// light mode `#E1E7EC` to match the filled circle inside `Light_icon.svg`.
  Color _headerIconWellColor(BuildContext context) =>
      Theme.of(context).brightness == Brightness.dark
          ? AppColors.darkHighlight
          : AppColors.dividerColorlight;

  /// Matches theme-toggle glyphs: `#485972` in light, `#9EA3AA` in dark.
  Widget _headerUserGlyph(BuildContext context) {
    final isDark = Theme.of(context).brightness == Brightness.dark;
    final glyph =
        isDark ? AppColors.boldHeadlineColor2 : AppColors.navigationlight;
    return SvgPicture.asset(
      'assets/icons/user_icon.svg',
      height: 22,
      width: 22,
      colorFilter: ColorFilter.mode(glyph, BlendMode.srcIn),
    );
  }

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
        themeBloc.add(ToggleTheme(true));
      },
      child: CircleAvatar(
        radius: 24,
        backgroundColor: _headerIconWellColor(context),
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
    return Tooltip(
      message: "Sign in or create an account",
      preferBelow: true,
      verticalOffset: 20,
      showDuration: Duration(seconds: 2),
      triggerMode: TooltipTriggerMode.tap,
      decoration: BoxDecoration(
        color: Colors.black87,
        borderRadius: BorderRadius.circular(6),
      ),
      textStyle: TextStyle(
        color: Colors.white,
        fontSize: 12,
      ),
      child: GestureDetector(
        onTap: () {
          Navigator.of(context).push(
            MaterialPageRoute(
              builder: (context) => LoginPage(),
            ),
          );
        },
        child: CircleAvatar(
          backgroundColor: _headerIconWellColor(context),
          radius: 24,
          child: Center(child: _headerUserGlyph(context)),
        ),
      ),
    );
  }

  Widget _buildUserProfileAvatar(BuildContext context) {
    return BlocBuilder<UserBloc, UserState>(
      builder: (context, userState) {
        if (userState is UserLoaded) {
          final user = userState.model.users[0];
          String? profilePicture = user.profilePicture;

          String? firstName = user.firstName;
          String? lastName = user.lastName;

          return Tooltip(
            message: "View your profile",
            preferBelow: true,
            verticalOffset: 20,
            showDuration: Duration(seconds: 2),
            triggerMode: TooltipTriggerMode.longPress,
            decoration: BoxDecoration(
              color: Colors.black87,
              borderRadius: BorderRadius.circular(6),
            ),
            textStyle: TextStyle(
              color: Colors.white,
              fontSize: 12,
            ),
            child: GestureDetector(
              onTap: () {
                Navigator.of(context).push(
                  MaterialPageRoute(
                    builder: (context) => ProfilePage(),
                  ),
                );
              },
              child: CircleAvatar(
                radius: 24,
                backgroundColor: _headerIconWellColor(context),
                child: ClipOval(
                  child: _buildProfilePicture(
                    context,
                    profilePicture,
                    firstName,
                    lastName,
                  ),
                ),
              ),
            ),
          );
        } else if (userState is UserLoadingError) {
          return Tooltip(
            message: "Sign in to access your profile",
            preferBelow: true,
            verticalOffset: 20,
            showDuration: Duration(seconds: 2),
            triggerMode: TooltipTriggerMode.tap,
            decoration: BoxDecoration(
              color: Colors.black87,
              borderRadius: BorderRadius.circular(6),
            ),
            textStyle: TextStyle(
              color: Colors.white,
              fontSize: 12,
            ),
            child: GestureDetector(
              onTap: () {
                Navigator.of(context).push(
                  MaterialPageRoute(
                    builder: (context) => LoginPage(),
                  ),
                );
              },
              child: CircleAvatar(
                radius: 24,
                backgroundColor: _headerIconWellColor(context),
                child: Center(child: _headerUserGlyph(context)),
              ),
            ),
          );
        } else {
          return ShimmerContainer(
            height: 48,
            borderRadius: 1000,
            width: 48,
          );
        }
      },
    );
  }

  Widget _buildProfilePicture(
    BuildContext context,
    String? profilePicture,
    String? firstName,
    String? lastName,
  ) {
    String firstNameSafe = firstName ?? "";
    String lastNameSafe = lastName ?? "";

    String initials = "";

    if (firstNameSafe.isNotEmpty) {
      initials += firstNameSafe[0].toUpperCase();
    }

    if (lastNameSafe.isNotEmpty) {
      initials += lastNameSafe[0].toUpperCase();
    }

    Widget fallbackWidget = Center(child: _headerUserGlyph(context));

    if (initials.isEmpty &&
        (profilePicture == null || profilePicture.isEmpty)) {
      return fallbackWidget;
    }

    if (profilePicture == null || profilePicture.isEmpty) {
      return Center(
        child: Text(
          initials,
          style: TextStyle(
            color: Colors.white,
            fontWeight: FontWeight.bold,
            fontSize: 16,
          ),
        ),
      );
    }

    if (profilePicture.startsWith('https')) {
      return Image.network(
        profilePicture,
        fit: BoxFit.cover,
        width: 48,
        height: 48,
        errorBuilder: (context, error, stackTrace) {
          return initials.isNotEmpty
              ? Center(
                  child: Text(
                    initials,
                    style: TextStyle(
                      color: Colors.white,
                      fontWeight: FontWeight.bold,
                      fontSize: 16,
                    ),
                  ),
                )
              : fallbackWidget;
        },
        loadingBuilder: (context, child, loadingProgress) {
          if (loadingProgress == null) {
            return child;
          }

          return initials.isNotEmpty
              ? Center(
                  child: Text(
                    initials,
                    style: TextStyle(
                      color: Colors.white,
                      fontWeight: FontWeight.bold,
                      fontSize: 16,
                    ),
                  ),
                )
              : fallbackWidget;
        },
      );
    }

    if (profilePicture.endsWith('.svg')) {
      return SvgPicture.asset(
        profilePicture,
        height: 48,
        width: 48,
        fit: BoxFit.cover,
        placeholderBuilder: (_) => initials.isNotEmpty
            ? Center(
                child: Text(
                  initials,
                  style: TextStyle(
                    color: Colors.white,
                    fontWeight: FontWeight.bold,
                    fontSize: 16,
                  ),
                ),
              )
            : fallbackWidget,
      );
    }

    return Image.asset(
      profilePicture,
      fit: BoxFit.cover,
      width: 48,
      height: 48,
      errorBuilder: (context, error, stackTrace) {
        return initials.isNotEmpty
            ? Center(
                child: Text(
                  initials,
                  style: TextStyle(
                    color: Colors.white,
                    fontWeight: FontWeight.bold,
                    fontSize: 16,
                  ),
                ),
              )
            : fallbackWidget;
      },
    );
  }
}
