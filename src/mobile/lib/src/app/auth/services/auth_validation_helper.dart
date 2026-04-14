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

    final isExpired = await AuthHelper.isTokenExpired();

    if (isExpired) {
      logger.warning('Token is expired');
      showAuthErrorSafe(
        context,
        message: 'Your session has expired. Please log in again.',
        showLoginAction: true,
      );
      return false;
    }

    logger.info('Authentication validation passed');
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
