import 'package:flutter/material.dart';
import 'package:flutter_bloc/flutter_bloc.dart';
import 'package:intl/intl.dart';
import 'package:airqo/src/meta/utils/colors.dart';
import '../../auth/bloc/auth_bloc.dart';
import '../../profile/bloc/user_bloc.dart';
import '../../shared/widgets/page_padding.dart';
import 'package:airqo/src/app/shared/widgets/translated_text.dart';

class DashboardHeader extends StatelessWidget {
  const DashboardHeader({super.key});

  @override
  Widget build(BuildContext context) {
    return PagePadding(
      padding: 16,
      child: Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
        SizedBox(height: 16),
        _buildGreeting(context),
        Row(
          children: [
            TranslatedText(
              "Today's Air Quality",
              style: TextStyle(
                fontSize: 18,
                fontWeight: FontWeight.w500,
                color: Theme.of(context).brightness == Brightness.dark
                    ? AppColors.secondaryHeadlineColor2
                    : AppColors.secondaryHeadlineColor4,
              ),
            ),
            Text(
              " \u2022 ${DateFormat.MMMMd().format(DateTime.now())}",
              style: TextStyle(
                fontSize: 18,
                fontWeight: FontWeight.w500,
                color: Theme.of(context).brightness == Brightness.dark
                    ? AppColors.secondaryHeadlineColor2
                    : AppColors.secondaryHeadlineColor4,
              ),
            ),
          ],
        ),
        SizedBox(height: 16)
      ]),
    );
  }

  Widget _buildGreeting(BuildContext context) {
    return BlocBuilder<AuthBloc, AuthState>(
      builder: (context, authState) {
        if (authState is AuthLoading) {
          return _buildDefaultGreeting(context);
        }

        if (authState is GuestUser) {
          return _buildGuestGreeting(context);
        }

        if (authState is AuthLoaded) {
          return _buildUserGreeting(context);
        }

        // Handle error state
        if (authState is AuthLoadingError) {
          return _buildDefaultGreeting(context);
        }

        // Default fallback
        return _buildDefaultGreeting(context);
      },
    );
  }

  Widget _buildDefaultGreeting(BuildContext context) {
    return Row(
      mainAxisSize: MainAxisSize.min,
      children: [
        TranslatedText(
          "Hello,",
          style: TextStyle(
            fontSize: 28,
            fontWeight: FontWeight.w700,
            color: Theme.of(context).textTheme.headlineLarge?.color,
          ),
        ),
        Text(
          " \ud83d\udc4b",
          style: TextStyle(
            fontSize: 28,
            fontWeight: FontWeight.w700,
            color: Theme.of(context).textTheme.headlineLarge?.color,
          ),
        ),
      ],
    );
  }

  Widget _buildGuestGreeting(BuildContext context) {
    return Row(
      mainAxisSize: MainAxisSize.min,
      children: [
        TranslatedText(
          "Hello",
          style: TextStyle(
            fontSize: 28,
            fontWeight: FontWeight.w700,
            color: Theme.of(context).textTheme.headlineLarge?.color,
          ),
        ),
        Text(
          " \ud83d\udc4b\ud83c\udffb",
          style: TextStyle(
            fontSize: 28,
            fontWeight: FontWeight.w700,
            color: Theme.of(context).textTheme.headlineLarge?.color,
          ),
        ),
      ],
    );
  }

  Widget _buildUserGreeting(BuildContext context) {
    return BlocBuilder<UserBloc, UserState>(
      builder: (context, userState) {
        if (userState is UserLoaded) {
          final color = Theme.of(context).brightness == Brightness.dark
              ? AppColors.boldHeadlineColor2
              : AppColors.boldHeadlineColor5;
          return Row(
            mainAxisSize: MainAxisSize.min,
            children: [
              TranslatedText(
                "Hello",
                style: TextStyle(
                  fontSize: 28,
                  fontWeight: FontWeight.w700,
                  color: color,
                ),
              ),
              Text(
                " ${userState.model.users[0].firstName} 👋",
                style: TextStyle(
                  fontSize: 28,
                  fontWeight: FontWeight.w700,
                  color: color,
                ),
              ),
            ],
          );
        } else if (userState is UserLoadingError) {
          if (userState.retryCount == 0) {
            WidgetsBinding.instance.addPostFrameCallback((_) {
              context.read<UserBloc>().add(LoadUserWithRetry());
            });
          }

          return Row(
            mainAxisSize: MainAxisSize.min,
            children: [
              TranslatedText(
                "Hello",
                style: TextStyle(
                  fontSize: 28,
                  fontWeight: FontWeight.w700,
                  color: Theme.of(context).brightness == Brightness.dark
                      ? AppColors.boldHeadlineColor2
                      : AppColors.boldHeadlineColor5,
                ),
              ),
              Text(
                " \ud83d\udc4b",
                style: TextStyle(
                  fontSize: 28,
                  fontWeight: FontWeight.w700,
                  color: Theme.of(context).brightness == Brightness.dark
                      ? AppColors.boldHeadlineColor2
                      : AppColors.boldHeadlineColor5,
                ),
              ),
            ],
          );
        }
        return _buildDefaultGreeting(context);
      },
    );
  }
}
