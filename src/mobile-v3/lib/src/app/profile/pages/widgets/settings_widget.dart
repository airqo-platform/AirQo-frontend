import 'package:airqo/src/app/auth/pages/welcome_screen.dart';
import 'package:airqo/src/app/profile/pages/location_privacy_screen.dart';
import 'package:airqo/src/meta/utils/colors.dart';
import 'package:flutter_bloc/flutter_bloc.dart';
import 'package:airqo/src/app/auth/bloc/auth_bloc.dart';
import 'package:flutter/material.dart';
import 'package:airqo/src/app/profile/pages/widgets/settings_tile.dart';
import 'package:flutter_svg/svg.dart';
import 'package:package_info_plus/package_info_plus.dart';
import 'package:flutter/foundation.dart';

class SettingsWidget extends StatefulWidget {
  const SettingsWidget({super.key});

  @override
  State<SettingsWidget> createState() => _SettingsWidgetState();
}

class _SettingsWidgetState extends State<SettingsWidget> {
  String _appVersion = '';
  //bool _notificationsEnabled = true;

  @override
  void initState() {
    super.initState();
    _getAppVersion();
  }

  Future<void> _getAppVersion() async {
    final packageInfo = await PackageInfo.fromPlatform();
    setState(() {
      _appVersion = '${packageInfo.version}(${packageInfo.buildNumber})';
    });
  }

  void _showSnackBar(String message) {
    ScaffoldMessenger.of(context).showSnackBar(
      SnackBar(content: Text(message)),
    );
  }

  void _showLogoutConfirmation() {
    final isDarkMode = Theme.of(context).brightness == Brightness.dark;

    showDialog(
      context: context,
      builder: (dialogContext) => AlertDialog(
        backgroundColor:
            isDarkMode ? AppColors.darkThemeBackground : Colors.white,
        shape: RoundedRectangleBorder(
          borderRadius: BorderRadius.circular(12),
        ),
        title: Text(
          'Confirm Logout',
          style: TextStyle(
            fontSize: 20,
            fontWeight: FontWeight.w700,
            color: isDarkMode
                ? AppColors.boldHeadlineColor2
                : AppColors.boldHeadlineColor5,
          ),
        ),
        content: Text(
          'Are you sure you want to log out?',
          style: TextStyle(
            fontSize: 16,
            color: isDarkMode
                ? AppColors.secondaryHeadlineColor2
                : AppColors.secondaryHeadlineColor,
          ),
        ),
        actions: [
          TextButton(
            onPressed: () => Navigator.pop(dialogContext),
            style: TextButton.styleFrom(
              foregroundColor: isDarkMode ? Colors.grey[400] : Colors.grey[700],
              padding: EdgeInsets.symmetric(horizontal: 16, vertical: 12),
            ),
            child: Text(
              'Cancel',
              style: TextStyle(
                fontSize: 16,
                fontWeight: FontWeight.w500,
              ),
            ),
          ),
          ElevatedButton(
            style: ElevatedButton.styleFrom(
              backgroundColor: Colors.red.shade600,
              foregroundColor: Colors.white,
              padding: EdgeInsets.symmetric(horizontal: 24, vertical: 12),
              shape: RoundedRectangleBorder(
                borderRadius: BorderRadius.circular(4),
              ),
              elevation: 0,
            ),
            onPressed: () => _handleLogout(dialogContext),
            child: Text(
              'Log Out',
              style: TextStyle(
                fontSize: 16,
                fontWeight: FontWeight.w500,
                color: Colors.white,
              ),
            ),
          ),
        ],
        actionsAlignment: MainAxisAlignment.spaceBetween,
        actionsPadding: EdgeInsets.symmetric(horizontal: 16, vertical: 12),
        titlePadding: EdgeInsets.fromLTRB(24, 24, 24, 12),
        contentPadding: EdgeInsets.fromLTRB(24, 0, 24, 24),
      ),
    );
  }

  Future<void> _handleLogout(BuildContext dialogContext) async {
    Navigator.pop(dialogContext);

    showDialog(
      context: context,
      barrierDismissible: false,
      builder: (_) => const Center(child: CircularProgressIndicator()),
    );

    try {
      context.read<AuthBloc>().add(LogoutUser());

      await for (final state in context.read<AuthBloc>().stream) {
        if (state is GuestUser) {
          Navigator.pop(context);
          await Navigator.pushAndRemoveUntil(
            context,
            MaterialPageRoute(builder: (_) => const WelcomeScreen()),
            (route) => false,
          );
          break;
        } else if (state is AuthLoadingError) {
          Navigator.pop(context);
          _showSnackBar(state.message);
          break;
        }
      }
    } catch (e) {
      Navigator.pop(context);
      _showSnackBar('An unexpected error occurred during logout');
    }
  }

  @override
  Widget build(BuildContext context) {
    final isDarkMode = Theme.of(context).brightness == Brightness.dark;
    final screenHeight = MediaQuery.of(context).size.height;

    return SingleChildScrollView(
      child: Padding(
        padding: const EdgeInsets.all(8.0),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            SizedBox(height: screenHeight * 0.02),

            SettingsTile(
              iconPath: "assets/images/shared/location_icon.svg",
              title: "Location & Privacy",
              description:
                  "Manage location services, privacy zones, and data sharing preferences",
              onTap: () {
                Navigator.push(
                  context,
                  MaterialPageRoute(
                      builder: (context) => LocationPrivacyScreen()),
                );
              },
            ),

            SizedBox(height: screenHeight * 0.02),

            // SettingsTile(
            //   iconPath: "assets/images/shared/language_icon.svg",
            //   title: "Languages",
            //   onTap: () {
            //     Navigator.of(context).push(
            //       MaterialPageRoute(
            //         builder: (context) => SelectLanguagePage(),
            //       ),
            //     );
            //   },
            //   description:
            //       "Change the language of the app to your preferred language",
            // ),

            Padding(
              padding: EdgeInsets.symmetric(vertical: screenHeight * 0.05),
              child: Center(
                child: ElevatedButton(
                  style: ElevatedButton.styleFrom(
                    backgroundColor: Colors.red,
                    shape: RoundedRectangleBorder(
                      borderRadius: BorderRadius.circular(8),
                    ),
                    padding: EdgeInsets.symmetric(
                      horizontal: 32,
                      vertical: 16,
                    ),
                  ),
                  onPressed: _showLogoutConfirmation,
                  child: Row(
                    mainAxisSize: MainAxisSize.min,
                    children: [
                      Icon(Icons.logout, color: Colors.white, size: 20),
                      SizedBox(width: 10),
                      Text(
                        "Log out",
                        style: TextStyle(
                          color: Colors.white,
                          fontWeight: FontWeight.bold,
                        ),
                      ),
                    ],
                  ),
                ),
              ),
            ),

            SizedBox(height: screenHeight * 0.01),

            Center(
              child: Column(
                children: [
                  SvgPicture.asset(
                    "assets/images/shared/logo.svg",
                    height: screenHeight * 0.05,
                  ),
                  SizedBox(height: screenHeight * 0.01),
                  Text(
                    _appVersion,
                    style: TextStyle(
                      color: isDarkMode ? Colors.grey[400] : Colors.grey,
                      fontSize: 12,
                    ),
                  ),
                  SizedBox(height: screenHeight * 0.01),
                  Text(
                    "A PROJECT BY",
                    style: TextStyle(
                      color: isDarkMode ? Colors.grey[400] : Colors.grey,
                      fontSize: 12,
                    ),
                  ),
                  Text(
                    "Makerere University".toUpperCase(),
                    style: TextStyle(
                      fontWeight: FontWeight.bold,
                      fontSize: 20,
                      color: isDarkMode ? Colors.white : Colors.black,
                    ),
                  ),
                ],
              ),
            ),
          ],
        ),
      ),
    );
  }
}