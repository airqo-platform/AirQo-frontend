import 'dart:io';

import 'package:app/blocs/blocs.dart';
import 'package:app/models/models.dart';
import 'package:app/screens/notification/notification_page.dart';
import 'package:app/services/services.dart';
import 'package:app/themes/theme.dart';
import 'package:app/utils/utils.dart';
import 'package:app/widgets/widgets.dart';
import 'package:auto_size_text/auto_size_text.dart';
import 'package:cached_network_image/cached_network_image.dart';
import 'package:flutter/material.dart';
import 'package:flutter_bloc/flutter_bloc.dart';
import 'package:flutter_svg/svg.dart';
import 'package:hive_flutter/hive_flutter.dart';

import '../auth/phone_auth_widget.dart';
import '../favourite_places/favourite_places_page.dart';
import '../for_you_page.dart';
import '../settings/settings_page.dart';
import 'profile_edit_page.dart';

class LogoutButton extends StatelessWidget {
  const LogoutButton({
    super.key,
  });

  @override
  Widget build(BuildContext context) {
    return Container(
      height: 48,
      padding: const EdgeInsets.only(top: 12, bottom: 12),
      decoration: BoxDecoration(
        color: CustomColors.appColorBlue.withOpacity(0.1),
        borderRadius: const BorderRadius.all(
          Radius.circular(8.0),
        ),
      ),
      child: Center(
        child: Text(
          'Log Out',
          style: TextStyle(
            fontSize: 16,
            color: CustomColors.appColorBlue,
          ),
        ),
      ),
    );
  }
}

class SignUpSection extends StatelessWidget {
  const SignUpSection({super.key});

  @override
  Widget build(BuildContext context) {
    return Container(
      decoration: const BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.all(
          Radius.circular(16.0),
        ),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.center,
        children: [
          const SizedBox(
            height: 48,
          ),
          Padding(
            padding: const EdgeInsets.only(left: 25.0, right: 25.0),
            child: AutoSizeText(
              'Personalise your\nexperience',
              maxLines: 3,
              overflow: TextOverflow.ellipsis,
              textAlign: TextAlign.center,
              style: CustomTextStyle.headline7(context)
                  ?.copyWith(letterSpacing: 16 * -0.01),
            ),
          ),
          const SizedBox(
            height: 8,
          ),
          Padding(
            padding: const EdgeInsets.only(left: 55.0, right: 55.0),
            child: AutoSizeText(
              'Create your account today and enjoy air quality'
              ' updates and healthtips.',
              maxLines: 6,
              overflow: TextOverflow.ellipsis,
              textAlign: TextAlign.center,
              style: Theme.of(context).textTheme.subtitle2?.copyWith(
                    color: CustomColors.appColorBlack.withOpacity(0.4),
                  ),
            ),
          ),
          const SizedBox(
            height: 24,
          ),
          GestureDetector(
            onTap: () async {
              await Navigator.pushAndRemoveUntil(
                context,
                MaterialPageRoute(builder: (context) {
                  return const PhoneSignUpWidget();
                }),
                (r) => false,
              );
            },
            child: Padding(
              padding: const EdgeInsets.only(left: 32, right: 32),
              child: Container(
                constraints: const BoxConstraints(minWidth: double.infinity),
                decoration: BoxDecoration(
                  color: CustomColors.appColorBlue,
                  borderRadius: const BorderRadius.all(
                    Radius.circular(8.0),
                  ),
                ),
                child: const Center(
                  child: Padding(
                    padding: EdgeInsets.only(top: 12, bottom: 14),
                    child: Text(
                      'Sign Up',
                      style: TextStyle(
                        color: Colors.white,
                        fontSize: 14,
                        height: 22 / 14,
                        letterSpacing: 16 * -0.022,
                      ),
                    ),
                  ),
                ),
              ),
            ),
          ),
          const SizedBox(
            height: 40,
          ),
        ],
      ),
    );
  }
}

class SettingsButton extends StatelessWidget {
  const SettingsButton({super.key});

  @override
  Widget build(BuildContext context) {
    return GestureDetector(
      onTap: () async {
        await Navigator.push(
          context,
          MaterialPageRoute(
            builder: (context) {
              return const SettingsPage();
            },
          ),
        );
      },
      child: Container(
        height: 56,
        decoration: const BoxDecoration(
          color: Colors.white,
          borderRadius: BorderRadius.all(
            Radius.circular(8.0),
          ),
        ),
        child: ListTile(
          leading: Container(
            height: 40,
            width: 40,
            decoration: BoxDecoration(
              color: CustomColors.appColorBlue.withOpacity(0.15),
              shape: BoxShape.circle,
            ),
            child: Center(
              child: SvgPicture.asset(
                'assets/icon/cog.svg',
                color: CustomColors.appColorBlue,
              ),
            ),
          ),
          title: AutoSizeText(
            'Settings',
            overflow: TextOverflow.ellipsis,
            style: Theme.of(context).textTheme.bodyText1,
          ),
        ),
      ),
    );
  }
}

class DummyProfilePicture extends StatelessWidget {
  const DummyProfilePicture({super.key, required this.text});
  final String text;
  @override
  Widget build(BuildContext context) {
    return Stack(
      children: [
        RotationTransition(
          turns: const AlwaysStoppedAnimation(-5 / 360),
          child: Container(
            height: 40,
            width: 40,
            padding: const EdgeInsets.all(2.0),
            decoration: BoxDecoration(
              color: CustomColors.appPicColor,
              shape: BoxShape.rectangle,
              borderRadius: const BorderRadius.all(
                Radius.circular(15.0),
              ),
            ),
          ),
        ),
        Container(
          height: 40,
          width: 40,
          padding: const EdgeInsets.all(2.0),
          color: Colors.transparent,
          child: Center(
            child: Text(
              text,
              style: const TextStyle(
                fontWeight: FontWeight.bold,
                color: Colors.white,
                fontSize: 17.0,
              ),
            ),
          ),
        ),
      ],
    );
  }
}

class ViewProfilePicture extends StatelessWidget {
  const ViewProfilePicture({
    super.key,
  });

  @override
  Widget build(BuildContext context) {
    return BlocBuilder<AccountBloc, AccountState>(builder: (context, state) {
      final profile = state.profile;
      if (state.guestUser || profile == null) {
        return Stack(
          alignment: AlignmentDirectional.center,
          children: [
            RotationTransition(
              turns: const AlwaysStoppedAnimation(-5 / 360),
              child: Container(
                padding: const EdgeInsets.all(2.0),
                decoration: BoxDecoration(
                  color: CustomColors.appPicColor,
                  shape: BoxShape.rectangle,
                  borderRadius: const BorderRadius.all(
                    Radius.circular(27.0),
                  ),
                ),
                child: Container(
                  height: 40,
                  width: 40,
                  color: Colors.transparent,
                ),
              ),
            ),
            const Text(
              'A',
              style: TextStyle(
                fontWeight: FontWeight.bold,
                color: Colors.white,
                fontSize: 17.0,
              ),
            ),
          ],
        );
      }

      if (!profile.photoUrl.isValidUri()) {
        return Stack(
          alignment: AlignmentDirectional.center,
          children: [
            RotationTransition(
              turns: const AlwaysStoppedAnimation(-5 / 360),
              child: Container(
                padding: const EdgeInsets.all(2.0),
                decoration: BoxDecoration(
                  color: CustomColors.appPicColor,
                  shape: BoxShape.rectangle,
                  borderRadius: const BorderRadius.all(
                    Radius.circular(20.0),
                  ),
                ),
                child: Container(
                  height: 44,
                  width: 44,
                  color: Colors.transparent,
                ),
              ),
            ),
            Text(
              profile.getInitials(),
              style: const TextStyle(
                fontWeight: FontWeight.bold,
                color: Colors.white,
                fontSize: 17.0,
              ),
            ),
            Positioned(
              bottom: 0,
              right: 0,
              child: Container(
                padding: const EdgeInsets.all(2.0),
                decoration: BoxDecoration(
                  border: Border.all(color: Colors.white),
                  color: CustomColors.appColorBlue,
                  shape: BoxShape.circle,
                ),
                child: const Icon(
                  Icons.add,
                  size: 10,
                  color: Colors.white,
                ),
              ),
            ),
          ],
        );
      }

      return Stack(
        alignment: AlignmentDirectional.center,
        children: [
          Container(
            decoration: const BoxDecoration(
              shape: BoxShape.circle,
            ),
            child: const CircularLoadingAnimation(size: 40),
          ),
          CircleAvatar(
            radius: 27.0,
            backgroundColor: Colors.transparent,
            foregroundColor: Colors.transparent,
            backgroundImage: CachedNetworkImageProvider(
              profile.photoUrl,
            ),
          ),
        ],
      );
    });
  }
}

class ViewNotificationIcon extends StatelessWidget {
  const ViewNotificationIcon({
    super.key,
  });

  @override
  Widget build(BuildContext context) {
    return BlocBuilder<AccountBloc, AccountState>(
      buildWhen: (previous, current) {
        final previousUnReadNotifications = previous.notifications
            .where((element) => !element.read)
            .toList()
            .length;
        final currentUnReadNotifications = current.notifications
            .where((element) => !element.read)
            .toList()
            .length;

        return previousUnReadNotifications != currentUnReadNotifications;
      },
      builder: (context, state) {
        final unReadNotifications =
            state.notifications.where((element) => !element.read).toList();

        return GestureDetector(
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
            child: SvgPicture.asset(
              unReadNotifications.isEmpty
                  ? 'assets/icon/empty_notifications_icon.svg'
                  : 'assets/icon/has_notifications.svg',
              height: 20,
              width: 16,
            ),
          ),
        );
      },
    );
  }
}

class CardSection extends StatelessWidget {
  const CardSection({
    super.key,
    required this.icon,
    required this.iconColor,
    required this.text,
  });
  final String icon;
  final String text;
  final Color? iconColor;

  @override
  Widget build(BuildContext context) {
    return Container(
      height: 56,
      decoration: const BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.all(
          Radius.circular(8.0),
        ),
      ),
      child: ListTile(
        leading: Container(
          height: 40,
          width: 40,
          decoration: BoxDecoration(
            color: CustomColors.appColorBlue.withOpacity(0.15),
            shape: BoxShape.circle,
          ),
          child: Center(
            child: SvgPicture.asset(icon, color: iconColor),
          ),
        ),
        title: AutoSizeText(
          text,
          overflow: TextOverflow.ellipsis,
          style: Theme.of(context).textTheme.bodyText1,
        ),
      ),
    );
  }
}

class ProfileSection extends StatefulWidget {
  const ProfileSection({super.key, required this.userDetails});
  final Profile userDetails;

  @override
  State<ProfileSection> createState() => _ProfileSectionState();
}

class _ProfileSectionState extends State<ProfileSection> {
  @override
  Widget build(BuildContext context) {
    return Container(
      padding: const EdgeInsets.only(top: 10, bottom: 10),
      decoration: const BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.all(
          Radius.circular(8.0),
        ),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.center,
        children: [
          GestureDetector(
            onTap: () async {
              await Navigator.push(
                context,
                MaterialPageRoute(
                  builder: (context) {
                    return const ProfileEditPage();
                  },
                ),
              );
            },
            child: CardSection(
              text: 'Profile',
              icon: 'assets/icon/profile.svg',
              iconColor: CustomColors.appColorBlue,
            ),
          ),
          Divider(
            color: CustomColors.appBodyColor,
          ),
          GestureDetector(
            onTap: () async {
              await Navigator.push(
                context,
                MaterialPageRoute(
                  builder: (context) {
                    return const FavouritePlacesPage();
                  },
                ),
              );
            },
            child: const CardSection(
              text: 'Favorites',
              icon: 'assets/icon/heart.svg',
              iconColor: null,
            ),
          ),
          Divider(
            color: CustomColors.appBodyColor,
          ),
          GestureDetector(
            onTap: () async {
              await Navigator.push(
                context,
                MaterialPageRoute(
                  builder: (context) {
                    return const ForYouPage();
                  },
                ),
              );
            },
            child: CardSection(
              text: 'For you',
              icon: 'assets/icon/sparkles.svg',
              iconColor: CustomColors.appColorBlue,
            ),
          ),
          Divider(
            color: CustomColors.appBodyColor,
          ),
          GestureDetector(
            onTap: () async {
              await Navigator.push(
                context,
                MaterialPageRoute(
                  builder: (context) {
                    return const SettingsPage();
                  },
                ),
              );
            },
            child: CardSection(
              text: 'Settings',
              icon: 'assets/icon/cog.svg',
              iconColor: CustomColors.appColorBlue,
            ),
          ),
        ],
      ),
    );
  }
}

class EditProfilePicSection extends StatelessWidget {
  const EditProfilePicSection({
    super.key,
    required this.profile,
    required this.getFromGallery,
  });
  final Profile profile;
  final VoidCallback getFromGallery;

  @override
  Widget build(BuildContext context) {
    return Row(
      crossAxisAlignment: CrossAxisAlignment.center,
      mainAxisAlignment: MainAxisAlignment.center,
      children: [
        Stack(
          alignment: AlignmentDirectional.center,
          children: [
            profile.photoUrl == ''
                ? RotationTransition(
                    turns: const AlwaysStoppedAnimation(-5 / 360),
                    child: Container(
                      padding: const EdgeInsets.all(2.0),
                      decoration: BoxDecoration(
                        color: CustomColors.appPicColor,
                        shape: BoxShape.rectangle,
                        borderRadius: const BorderRadius.all(
                          Radius.circular(35.0),
                        ),
                      ),
                      child: Container(
                        height: 88,
                        width: 88,
                        color: Colors.transparent,
                      ),
                    ),
                  )
                : profile.photoUrl.isValidUri()
                    ? CircleAvatar(
                        radius: 44,
                        backgroundColor: CustomColors.appPicColor,
                        foregroundColor: CustomColors.appPicColor,
                        backgroundImage: CachedNetworkImageProvider(
                          profile.photoUrl,
                        ),
                      )
                    : CircleAvatar(
                        radius: 44,
                        backgroundColor: CustomColors.appPicColor,
                        foregroundColor: CustomColors.appPicColor,
                        backgroundImage: FileImage(
                          File(profile.photoUrl),
                        ),
                      ),
            if (profile.photoUrl == '')
              const Text(
                'A',
                style: TextStyle(
                  fontWeight: FontWeight.bold,
                  color: Colors.white,
                  fontSize: 30,
                ),
              ),
            Positioned(
              bottom: 0,
              right: 0,
              child: GestureDetector(
                onTap: getFromGallery,
                child: Container(
                  padding: const EdgeInsets.all(2.0),
                  decoration: BoxDecoration(
                    border: Border.all(color: Colors.white),
                    color: CustomColors.appColorBlue,
                    shape: BoxShape.circle,
                  ),
                  child: const Icon(
                    Icons.add,
                    size: 22,
                    color: Colors.white,
                  ),
                ),
              ),
            ),
          ],
        ),
      ],
    );
  }
}

class EditCredentialsIcon extends StatelessWidget {
  const EditCredentialsIcon({super.key});

  @override
  Widget build(BuildContext context) {
    return Center(
      child: SvgPicture.asset(
        'assets/icon/profile_edit.svg',
        height: 27,
        width: 27,
      ),
    );
  }
}

class EditProfileAppBar extends StatelessWidget implements PreferredSizeWidget {
  const EditProfileAppBar({
    super.key,
  });

  @override
  Widget build(BuildContext context) {
    return AppBar(
      toolbarHeight: 72,
      centerTitle: true,
      elevation: 0,
      backgroundColor: CustomColors.appBodyColor,
      automaticallyImplyLeading: false,
      title: Row(
        children: [
          const AppBackButton(),
          const Spacer(),
          BlocBuilder<AccountBloc, AccountState>(
            builder: (context, state) {
              final profile = state.profile;
              final hiveProfile =
                  Hive.box<Profile>(HiveBox.profile).get(HiveBox.profile);

              if (profile == null || hiveProfile == null) {
                return const SizedBox();
              }

              return GestureDetector(
                onTap: () {
                  context.read<AccountBloc>().add(const UpdateProfile());
                },
                child: Text(
                  'Save',
                  style: Theme.of(context).textTheme.subtitle2?.copyWith(
                        color: profile != hiveProfile
                            ? CustomColors.appColorBlue
                            : CustomColors.appColorBlack.withOpacity(0.2),
                      ),
                ),
              );
            },
            buildWhen: (previous, current) {
              final hiveProfile =
                  Hive.box<Profile>(HiveBox.profile).get(HiveBox.profile);

              if (hiveProfile == null) {
                return true;
              }

              return previous.profile != hiveProfile ||
                  current.profile != hiveProfile;
            },
          ),
        ],
      ),
    );
  }

  @override
  Size get preferredSize => const Size.fromHeight(60);
}

class EditCredentialsField extends StatelessWidget {
  const EditCredentialsField({
    super.key,
    required this.authMethod,
    required this.profile,
  });
  final AuthMethod authMethod;
  final Profile profile;

  @override
  Widget build(BuildContext context) {
    return Column(
      mainAxisSize: MainAxisSize.min,
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Text(
          authMethod == AuthMethod.email ? 'Email' : 'Phone Number',
          style: TextStyle(
            fontSize: 12,
            color: CustomColors.inactiveColor,
          ),
        ),
        const SizedBox(
          height: 4,
        ),
        SizedBox(
          width: MediaQuery.of(context).size.width,
          child: Row(
            children: <Widget>[
              Expanded(
                child: TextFormField(
                  initialValue: authMethod == AuthMethod.email
                      ? profile.emailAddress
                      : profile.phoneNumber,
                  enableSuggestions: false,
                  readOnly: true,
                  style: TextStyle(
                    color: CustomColors.inactiveColor,
                  ),
                  decoration: inactiveFormFieldDecoration(),
                ),
              ),
              // const SizedBox(
              //   width: 16,
              // ),
              GestureDetector(
                onTap: () {
                  //TODO: implement re authentication
                  // _updateCredentials(context);
                },
                child: Container(),
                // child: const EditCredentialsIcon(),
              ),
            ],
          ),
        ),
      ],
    );
  }

  void _updateCredentials(BuildContext context) async {
    final action = await showDialog<ConfirmationAction>(
      context: context,
      barrierDismissible: false,
      builder: (BuildContext context) {
        return ChangeAuthCredentialsDialog(
          authMethod: authMethod,
        );
      },
    );

    if (action == null || action == ConfirmationAction.cancel) {
      return;
    }
  }
}

class NameEditField extends StatelessWidget {
  const NameEditField({
    super.key,
    required this.value,
    required this.valueChange,
  });
  final String value;
  final Function(String) valueChange;

  @override
  Widget build(BuildContext context) {
    return TextFormField(
      initialValue: value,
      enableSuggestions: false,
      cursorWidth: 1,
      cursorColor: CustomColors.appColorBlue,
      keyboardType: TextInputType.name,
      decoration: InputDecoration(
        filled: true,
        fillColor: Colors.white,
        hintText: '-',
        focusedBorder: OutlineInputBorder(
          borderSide: const BorderSide(color: Colors.transparent, width: 1.0),
          borderRadius: BorderRadius.circular(8.0),
        ),
        enabledBorder: OutlineInputBorder(
          borderSide: const BorderSide(color: Colors.transparent, width: 1.0),
          borderRadius: BorderRadius.circular(8.0),
        ),
        suffixIcon: Container(
          padding: const EdgeInsets.all(10),
          height: 20,
          width: 20,
          child: SvgPicture.asset(
            'assets/icon/profile_edit.svg',
          ),
        ),
      ),
      onFieldSubmitted: valueChange,
      onChanged: valueChange,
    );
  }
}

InputDecoration inactiveFormFieldDecoration() {
  return InputDecoration(
    filled: true,
    fillColor: Colors.white,
    hintText: '-',
    focusedBorder: OutlineInputBorder(
      borderSide: const BorderSide(color: Colors.transparent, width: 1.0),
      borderRadius: BorderRadius.circular(8.0),
    ),
    enabledBorder: OutlineInputBorder(
      borderSide: const BorderSide(color: Colors.transparent, width: 1.0),
      borderRadius: BorderRadius.circular(8.0),
    ),
  );
}

class GuestProfileView extends StatelessWidget {
  const GuestProfileView({super.key});

  @override
  Widget build(BuildContext context) {
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
}
