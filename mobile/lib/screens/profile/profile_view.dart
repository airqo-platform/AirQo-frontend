import 'package:app/blocs/blocs.dart';
import 'package:app/utils/utils.dart';
import 'package:app/widgets/widgets.dart';
import 'package:flutter/material.dart';

import 'package:flutter_bloc/flutter_bloc.dart';

import 'profile_widgets.dart';

class ProfileView extends StatelessWidget {
  const ProfileView({super.key});

  @override
  Widget build(BuildContext context) {
    return BlocBuilder<ProfileBloc, ProfileState>(
      builder: (context, state) {
        final profile = state.profile;
        if (profile == null || profile.isAQuest()) {
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
