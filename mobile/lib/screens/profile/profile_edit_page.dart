import 'package:app/blocs/blocs.dart';
import 'package:app/models/models.dart';
import 'package:app/themes/theme.dart';
import 'package:app/widgets/widgets.dart';
import 'package:flutter/material.dart';
import 'package:flutter_bloc/flutter_bloc.dart';

import 'profile_widgets.dart';

class ProfileEditPage extends StatelessWidget {
  const ProfileEditPage({super.key});

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: const EditProfileAppBar(),
      body: AppSafeArea(
        horizontalPadding: 16,
        child: BlocBuilder<ProfileBloc, Profile>(
          builder: (context, profile) {
            return ListView(
              physics: const BouncingScrollPhysics(),
              children: <Widget>[
                const SizedBox(
                  height: 26,
                ),
                const EditProfilePicSection(),
                const SizedBox(
                  height: 40,
                ),
                Visibility(
                  visible: profile.phoneNumber.isNotEmpty,
                  child: EditCredentialsField(
                    profile: profile,
                    authMethod: AuthMethod.phone,
                  ),
                ),
                Visibility(
                  visible: profile.emailAddress.isNotEmpty,
                  child: EditCredentialsField(
                    profile: profile,
                    authMethod: AuthMethod.email,
                  ),
                ),
                const SizedBox(
                  height: 16,
                ),
                Text(
                  'First Name',
                  style: TextStyle(
                    fontSize: 12,
                    color: CustomColors.inactiveColor,
                  ),
                ),
                const SizedBox(height: 4),
                NameEditField(
                  value: profile.firstName,
                  valueChange: (firstName) {
                    context.read<ProfileBloc>().add(
                          UpdateProfile(
                            profile.copyWith(firstName: firstName),
                          ),
                        );
                  },
                ),
                const SizedBox(height: 16),
                Text(
                  'Last Name',
                  style: TextStyle(
                    fontSize: 12,
                    color: CustomColors.inactiveColor,
                  ),
                ),
                const SizedBox(height: 4),
                NameEditField(
                  value: profile.lastName,
                  valueChange: (lastName) {
                    context.read<ProfileBloc>().add(
                          UpdateProfile(
                            profile.copyWith(lastName: lastName),
                          ),
                        );
                  },
                ),
              ],
            );
          },
        ),
      ),
    );
  }
}
