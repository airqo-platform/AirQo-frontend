import 'package:app/blocs/blocs.dart';
import 'package:app/models/models.dart';
import 'package:app/services/firebase_service.dart';
import 'package:app/themes/theme.dart';
import 'package:app/widgets/widgets.dart';
import 'package:flutter/material.dart';
import 'package:flutter_bloc/flutter_bloc.dart';

import '../settings/settings_page.dart';
import 'profile_widgets.dart';
import 'package:flutter_gen/gen_l10n/app_localizations.dart';

class ProfileView extends StatelessWidget {
  const ProfileView({super.key});

  @override
  Widget build(BuildContext context) {
    final user = CustomAuth.getUser();
    bool showLinkAccountReminder = false;

    if (user != null && user.phoneNumber != null) {
      if (user.email != null) {
      } else if (user.isAnonymous) {
      } else {
        showLinkAccountReminder = true;
      }
    }
    return BlocBuilder<ProfileBloc, Profile>(
      builder: (context, profile) {
        if (profile.isAnonymous) {
          return const GuestProfileView();
        }

        return Scaffold(
          appBar: ProfileViewAppBar(profile),
          body: AppSafeArea(
            horizontalPadding: 16,
            child: ListView(
              children: <Widget>[
                const SizedBox(height: 10),
                Visibility(
                  visible: showLinkAccountReminder,
                  child: const LinkAccountReminder(),
                ),
                const SizedBox(height: 6),
                ProfileSection(profile),
                const SizedBox(height: 16),
                CardSection(
                  text: AppLocalizations.of(context)!.settings,
                  materialIcon: Icons.settings_rounded,
                  iconColor: CustomColors.appColorBlue,
                  nextPage: const SettingsPage(),
                  isBottomItem: true,
                  isTopItem: true,
                ),
                const SizedBox(height: 10),
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
