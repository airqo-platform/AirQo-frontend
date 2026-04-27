import 'package:flutter/material.dart';
import 'package:flutter_bloc/flutter_bloc.dart';
import 'package:loggy/loggy.dart';
import 'package:airqo/src/app/auth/bloc/auth_bloc.dart';
import 'package:airqo/src/app/auth/services/auth_helper.dart';
import 'package:airqo/src/app/auth/pages/login_page.dart';

class AuthValidationHelper with UiLoggy {
  static Future<bool> validateAuthentication(BuildContext context) async {
    final logger = Loggy('AuthValidationHelper');

    final authState = context.read<AuthBloc>().state;
    final isLoggedIn = authState is AuthLoaded;

    if (!isLoggedIn) {
      logger.warning('User not logged in');
      _showAuthError(
        context,
        message: 'Please log in to continue',
        showLoginAction: true,
      );
      return false;
    }

    // Try a silent refresh before checking expiry. If it succeeds the user
    // proceeds without any interruption; only fall back to the re-login prompt
    // when refresh itself fails (token > 7 days old or no network).
    final token = await AuthHelper.refreshTokenIfNeeded();
    if (token != null) {
      logger.info('Authentication validation passed (token valid or refreshed)');
      return true;
    }

    // Refresh failed — check whether the token is actually expired before
    // blocking the user (it may still be valid if refresh failed due to network).
    final isExpired = await AuthHelper.isTokenExpired();
    if (isExpired) {
      logger.warning('Token is expired and refresh failed');
      if (!context.mounted) return false;
      showAuthErrorSafe(
        context,
        message: 'Your session has expired. Please log in again.',
        showLoginAction: true,
      );
      return false;
    }

    logger.info('Authentication validation passed (refresh failed but token still valid)');
    return true;
  }

  static void _showAuthError(
    BuildContext context, {
    required String message,
    bool showLoginAction = true,
  }) {
    ScaffoldMessenger.of(context).showSnackBar(
      SnackBar(
        content: Text(message),
        duration: const Duration(seconds: 8),
        action: showLoginAction
            ? SnackBarAction(
                label: 'Log In',
                onPressed: () {
                  Navigator.of(context).pushAndRemoveUntil(
                    MaterialPageRoute(
                      builder: (context) => const LoginPage(),
                    ),
                    (route) => false,
                  );
                },
              )
            : null,
      ),
    );
  }

  static void showAuthErrorSafe(
    BuildContext context, {
    required String message,
    bool showLoginAction = true,
  }) {
    if (!context.mounted) {
      Loggy('AuthValidationHelper').warning('Context not mounted, cannot show error');
      return;
    }

    _showAuthError(context, message: message, showLoginAction: showLoginAction);
  }
}
