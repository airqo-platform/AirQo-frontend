import 'package:app/blocs/blocs.dart';
import 'package:app/models/models.dart';
import 'package:app/themes/theme.dart';
import 'package:app/widgets/widgets.dart';
import 'package:flutter/material.dart';
import 'package:flutter_bloc/flutter_bloc.dart';

import '../settings/settings_page.dart';
import 'profile_widgets.dart';

class ProfileView extends StatelessWidget {
  const ProfileView({super.key});

  @override
  Widget build(BuildContext context) {
    return BlocBuilder<ProfileBloc, Profile>(
      builder: (context, profile) {
        if (profile.isAnonymous) {
          return const GuestProfileView();
        }

        return Scaffold(
          appBar: ProfileViewAppBar(profile),
          body: AppSafeArea(
            horizontalPadding: 16,
            widget: Column(
              children: <Widget>[
                const SizedBox(height: 10),
                ProfileSection(profile),
                const SizedBox(height: 16),
                CardSection(
                  text: 'Settings',
                  materialIcon: Icons.settings_rounded,
                  iconColor: CustomColors.appColorBlue,
                  nextPage: const SettingsPage(),
                  isBottomItem: true,
                  isTopItem: true,
                ),
                const Spacer(),
                const SignOutButton(),
                const SizedBox(height: 10),
              ],
            ),
          ),
        );
      },
    );
  }
}
