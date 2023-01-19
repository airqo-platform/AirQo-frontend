import 'dart:async';

import 'package:app/blocs/blocs.dart';
import 'package:app/models/models.dart';
import 'package:app/themes/theme.dart';
import 'package:app/utils/utils.dart';
import 'package:app/widgets/widgets.dart';
import 'package:auto_size_text/auto_size_text.dart';
import 'package:flutter/material.dart';

import 'package:flutter_bloc/flutter_bloc.dart';

import 'profile_edit_page.dart';
import 'profile_widgets.dart';

class ProfileView extends StatefulWidget {
  const ProfileView({super.key});

  @override
  State<ProfileView> createState() => _ProfileViewState();
}

class _ProfileViewState extends State<ProfileView> {
  @override
  void initState() {
    super.initState();
  }

  @override
  Widget build(BuildContext context) {
    return BlocBuilder<ProfileBloc, ProfileState>(
      builder: (context, state) {
        final profile = state.profile;
        if (profile == null || profile.isAQuest()) {
          return const GuestProfileView();
        }

        return Scaffold(
          appBar: AppBar(
            toolbarHeight: 135,
            centerTitle: true,
            elevation: 0,
            backgroundColor: CustomColors.appBodyColor,
            automaticallyImplyLeading: false,
            title: Column(
              mainAxisSize: MainAxisSize.min,
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                MultiBlocListener(
                  listeners: [
                    BlocListener<ProfileBloc, ProfileState>(
                      listener: (context, state) {
                        loadingScreen(context);
                      },
                      listenWhen: (previous, current) {
                        return current.blocStatus == BlocStatus.processing &&
                            mounted;
                      },
                    ),
                    BlocListener<ProfileBloc, ProfileState>(
                      listener: (context, state) {
                        Navigator.pop(context);
                      },
                      listenWhen: (previous, current) {
                        return previous.blocStatus == BlocStatus.processing &&
                            mounted;
                      },
                    ),
                    BlocListener<ProfileBloc, ProfileState>(
                      listener: (context, state) {
                        showSnackBar(context, state.blocError.message);
                      },
                      listenWhen: (previous, current) {
                        return current.blocStatus == BlocStatus.error &&
                            current.blocError != AuthenticationError.none &&
                            mounted;
                      },
                    ),
                  ],
                  child: Container(),
                ),
                Row(
                  children: const [
                    ViewProfilePicture(),
                    Spacer(),
                    ViewNotificationIcon(),
                  ],
                ),
                const SizedBox(
                  height: 8,
                ),
                AutoSizeText(
                  profile.displayName(),
                  maxLines: 2,
                  style: CustomTextStyle.headline9(context),
                ),
                const SizedBox(
                  height: 4,
                ),
                GestureDetector(
                  onTap: () async {
                    await _editProfile();
                  },
                  child: Text(
                    'Edit profile',
                    style: Theme.of(context).textTheme.bodyText2?.copyWith(
                          color: CustomColors.appColorBlue,
                        ),
                  ),
                ),
              ],
            ),
          ),
          body: AppSafeArea(
            horizontalPadding: 16,
            widget: Column(
              children: <Widget>[
                ProfileSection(
                  userDetails: profile,
                ),
                const Spacer(),
                const SignOutButton(),
                const SizedBox(
                  height: 10,
                ),
              ],
            ),
          ),
        );
      },
    );
  }

  Future<void> _editProfile() async {
    await Navigator.push(
      context,
      MaterialPageRoute(
        builder: (context) {
          return const ProfileEditPage();
        },
      ),
    );
  }
}
