import 'package:flutter/material.dart';
import 'package:flutter_bloc/flutter_bloc.dart';
import 'package:intl/intl.dart';

import '../../auth/bloc/auth_bloc.dart';
import '../../profile/bloc/user_bloc.dart';
import '../../shared/widgets/page_padding.dart';

class DashboardHeader extends StatelessWidget {
  const DashboardHeader({super.key});

  @override
  Widget build(BuildContext context) {
    return PagePadding(
      padding: 16,
      child: Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
        SizedBox(height: 16),
        _buildGreeting(context),
        Text(
          "Today's Air Quality • ${DateFormat.MMMMd().format(DateTime.now())}",
          style: TextStyle(
            fontSize: 18,
            fontWeight: FontWeight.w500,
            color: Theme.of(context).textTheme.headlineMedium?.color,
          ),
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
    return Text(
      "Hi, 👋🏼",
      style: TextStyle(
        fontSize: 28,
        fontWeight: FontWeight.w700,
        color: Theme.of(context).textTheme.headlineLarge?.color,
      ),
    );
  }

  Widget _buildGuestGreeting(BuildContext context) {
    return Text(
      "Hi, Guest 👋🏼",
      style: TextStyle(
        fontSize: 28,
        fontWeight: FontWeight.w700,
        color: Theme.of(context).textTheme.headlineLarge?.color,
      ),
    );
  }

  Widget _buildUserGreeting(BuildContext context) {
    return BlocBuilder<UserBloc, UserState>(
      builder: (context, userState) {
        if (userState is UserLoaded) {
          return Text(
            "Hi ${userState.model.users[0].firstName} 👋🏼",
            style: TextStyle(
              fontSize: 28,
              fontWeight: FontWeight.w700,
              color: Theme.of(context).textTheme.headlineLarge?.color,
            ),
          );
        }
        return _buildDefaultGreeting(context);
      },
    );
  }
}
