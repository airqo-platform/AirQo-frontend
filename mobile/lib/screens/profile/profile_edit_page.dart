import 'package:app/blocs/blocs.dart';
import 'package:app/models/models.dart';
import 'package:app/screens/email_authentication/email_auth_screen.dart';
import 'package:app/screens/email_authentication/email_verification_screen.dart';
import 'package:app/themes/theme.dart';
import 'package:app/widgets/widgets.dart';
import 'package:flutter/material.dart';
import 'package:flutter_bloc/flutter_bloc.dart';
import 'package:flutter_gen/gen_l10n/app_localizations.dart';

import '../offline_banner.dart';
import 'profile_widgets.dart';

class ProfileEditPage extends StatelessWidget {
  const ProfileEditPage({super.key});

  @override
  Widget build(BuildContext context) {
    return OfflineBanner(
      child: Scaffold(
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
                    visible: profile.phoneNumber.isNotEmpty &&
                        profile.emailAddress.isEmpty,
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        const SizedBox(height: 16),
                        EditCredentialsField(
                          profile: profile,
                          authMethod: AuthMethod.phone,
                        ),
                        const SizedBox(height: 16),
                        GestureDetector(
                          onTap: () {
                            // Navigate to EmailVerificationScreen
                            Navigator.push(
                              context,
                              MaterialPageRoute(
                                  builder: (context) =>
                                      const EmailSignUpScreen()),
                            );
                          },
                          child: Column(
                            crossAxisAlignment: CrossAxisAlignment.start,
                            children: [
                              Text(
                                'Email Address',
                                style: TextStyle(
                                  fontSize: 12,
                                  color: CustomColors.inactiveColor,
                                ),
                              ),
                              const SizedBox(height: 4),
                              TextFormField(
                                initialValue: '',
                                onTap: () {
                                  FocusScope.of(context).unfocus();
                                },
                                decoration: InputDecoration(
                                  filled: true,
                                  fillColor: Colors.white,
                                  hintText: 'Enter your email address',
                                  focusedBorder: OutlineInputBorder(
                                    borderSide: const BorderSide(
                                        color: Colors.transparent, width: 1.0),
                                    borderRadius: BorderRadius.circular(8.0),
                                  ),
                                  enabledBorder: OutlineInputBorder(
                                    borderSide: const BorderSide(
                                        color: Colors.transparent, width: 1.0),
                                    borderRadius: BorderRadius.circular(8.0),
                                  ),
                                ),
                              ),
                            ],
                          ),
                        ),
                        const SizedBox(height: 16),
                      ],
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
                    AppLocalizations.of(context)!.firstName,
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
                    AppLocalizations.of(context)!.lastName,
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
      ),
    );
  }
}
