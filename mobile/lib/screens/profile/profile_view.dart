import 'package:app/models/models.dart';
import 'package:app/screens/profile/profile_edit_page.dart';
import 'package:app/screens/profile/profile_widgets.dart';
import 'package:app/services/app_service.dart';
import 'package:app/widgets/custom_shimmer.dart';
import 'package:app/widgets/dialogs.dart';
import 'package:auto_size_text/auto_size_text.dart';
import 'package:flutter/material.dart';
import 'package:flutter_svg/svg.dart';
import 'package:hive_flutter/adapters.dart';

import '../../services/firebase_service.dart';
import '../../services/hive_service.dart';
import '../../themes/app_theme.dart';
import '../../themes/colors.dart';
import '../auth/phone_auth_widget.dart';
import '../notification/notification_page.dart';

class ProfileView extends StatefulWidget {
  const ProfileView({
    super.key,
  });

  @override
  State<ProfileView> createState() => _ProfileViewState();
}

class _ProfileViewState extends State<ProfileView> {
  @override
  Widget build(BuildContext context) {
    return ValueListenableBuilder<Box>(
      valueListenable: Hive.box<Profile>(HiveBox.profile)
          .listenable(keys: [HiveBox.profile]),
      builder: (context, box, widget) {
        if (box.values.isEmpty || !CustomAuth.isLoggedIn()) {
          return Scaffold(
            appBar: AppBar(
              toolbarHeight: 90,
              centerTitle: false,
              elevation: 0,
              backgroundColor: CustomColors.appBodyColor,
              automaticallyImplyLeading: false,
              title: Column(
                mainAxisSize: MainAxisSize.min,
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  const SizedBox(
                    height: 20,
                  ),
                  Row(
                    children: const [
                      DummyProfilePicture(
                        text: 'A',
                      ),
                      Spacer(),
                    ],
                  ),
                  const SizedBox(
                    height: 5,
                  ),
                  Text(
                    'Guest',
                    style: CustomTextStyle.headline9(context),
                  ),
                ],
              ),
            ),
            body: Container(
              color: CustomColors.appBodyColor,
              child: Padding(
                padding: const EdgeInsets.symmetric(horizontal: 16.0),
                child: Column(
                  children: const <Widget>[
                    SizedBox(
                      height: 24,
                    ),
                    SignUpSection(),
                    SizedBox(
                      height: 16,
                    ),
                    SettingsButton(),
                    Spacer(),
                  ],
                ),
              ),
            ),
          );
        }

        final profile = box.values.toList().cast<Profile>().first;

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
                Row(
                  children: [
                    ProfilePicture(
                      userDetails: profile,
                    ),
                    const Spacer(),
                    GestureDetector(
                      onTap: () async {
                        await Navigator.push(
                          context,
                          MaterialPageRoute(
                            builder: (context) {
                              return const NotificationPage();
                            },
                          ),
                        );
                      },
                      child: Container(
                        padding: const EdgeInsets.all(10),
                        height: 40,
                        width: 40,
                        decoration: const BoxDecoration(
                          color: Colors.white,
                          borderRadius: BorderRadius.all(
                            Radius.circular(8.0),
                          ),
                        ),
                        child: ValueListenableBuilder<Box>(
                          valueListenable: Hive.box<AppNotification>(
                            HiveBox.appNotifications,
                          ).listenable(),
                          builder: (context, box, widget) {
                            final unreadNotifications = box.values
                                .toList()
                                .cast<AppNotification>()
                                .where((element) => !element.read)
                                .toList()
                                .cast<AppNotification>();

                            if (unreadNotifications.isEmpty) {
                              return SvgPicture.asset(
                                'assets/icon/empty_notifications.svg',
                                height: 20,
                                width: 16,
                              );
                            }

                            return SvgPicture.asset(
                              'assets/icon/has_notifications.svg',
                              height: 20,
                              width: 16,
                            );
                          },
                        ),
                      ),
                    ),
                  ],
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
                    await _viewProfile();
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
          body: Container(
            color: CustomColors.appBodyColor,
            child: Padding(
              padding: const EdgeInsets.symmetric(horizontal: 16.0),
              child: Column(
                children: <Widget>[
                  ProfileSection(
                    userDetails: profile,
                  ),
                  const Spacer(),
                  GestureDetector(
                    onTap: _logOut,
                    child: const LogoutButton(),
                  ),
                  const SizedBox(
                    height: 32,
                  ),
                ],
              ),
            ),
          ),
        );
      },
    );
  }

  Future<void> _logOut() async {
    final action = await showDialog<ConfirmationAction>(
      context: context,
      barrierDismissible: false,
      builder: (BuildContext context) {
        return const AuthProcedureDialog(
          authProcedure: AuthProcedure.logout,
        );
      },
    );

    if (action == null || action == ConfirmationAction.cancel) {
      return;
    }

    final loadingContext = context;
    loadingScreen(loadingContext);
    final successful = await AppService().logOut(context);
    if (successful) {
      Navigator.pop(loadingContext);
      await Navigator.pushAndRemoveUntil(
        context,
        MaterialPageRoute(
          builder: (context) {
            return const PhoneLoginWidget();
          },
        ),
        (r) => false,
      );
    } else {
      Navigator.pop(loadingContext);
      await showSnackBar(
        context,
        'failed to logout. Try again later',
      );
    }
  }

  Future<void> _viewProfile() async {
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
