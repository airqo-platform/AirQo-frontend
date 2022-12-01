import 'dart:async';

import 'package:app/blocs/blocs.dart';
import 'package:app/models/models.dart';
import 'package:app/themes/theme.dart';
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
  late BuildContext _loadingContext;

  @override
  void initState() {
    super.initState();
    _loadingContext = context;
  }

  @override
  Widget build(BuildContext context) {
    return BlocBuilder<AccountBloc, AccountState>(
      builder: (context, state) {
        final profile = state.profile;
        if (state.guestUser || profile == null) {
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
                    BlocListener<AccountBloc, AccountState>(
                      listener: (context, state) {
                        loadingScreen(_loadingContext);
                      },
                      listenWhen: (previous, current) {
                        return current.blocStatus == BlocStatus.processing &&
                            mounted;
                      },
                    ),
                    BlocListener<AccountBloc, AccountState>(
                      listener: (context, state) {
                        Navigator.pop(_loadingContext);
                      },
                      listenWhen: (previous, current) {
                        return previous.blocStatus == BlocStatus.processing &&
                            mounted;
                      },
                    ),
                    BlocListener<AccountBloc, AccountState>(
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
                  profile.getProfileViewName(),
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
                GestureDetector(
                  onTap: () => context
                      .read<AccountBloc>()
                      .add(LogOutAccount(context: context)),
                  child: const LogoutButton(),
                ),
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
