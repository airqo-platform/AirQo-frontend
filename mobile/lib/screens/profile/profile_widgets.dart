import 'dart:io';

import 'package:app/blocs/blocs.dart';
import 'package:app/constants/constants.dart';
import 'package:app/models/models.dart';
import 'package:app/screens/notification/notification_page.dart';
import 'package:app/services/services.dart';
import 'package:app/themes/theme.dart';
import 'package:app/utils/utils.dart';
import 'package:app/widgets/widgets.dart';
import 'package:auto_size_text/auto_size_text.dart';
import 'package:cached_network_image/cached_network_image.dart';
import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:flutter_bloc/flutter_bloc.dart';
import 'package:flutter_svg/svg.dart';
import 'package:image_picker/image_picker.dart';

import '../auth/phone_auth_widget.dart';
import '../favourite_places/favourite_places_page.dart';
import '../feedback/feedback_page.dart';
import '../for_you_page.dart';
import '../settings/settings_page.dart';
import 'profile_edit_page.dart';

class SignOutButton extends StatefulWidget {
  const SignOutButton({super.key});

  @override
  State<SignOutButton> createState() => _SignOutButtonState();
}

class _SignOutButtonState extends State<SignOutButton> {
  @override
  Widget build(BuildContext context) {
    return SizedBox(
      height: 48,
      width: double.infinity,
      child: OutlinedButton(
        onPressed: () async {
          await _signOut();
        },
        style: OutlinedButton.styleFrom(
          elevation: 0,
          side: const BorderSide(
            color: Colors.transparent,
          ),
          shape: const RoundedRectangleBorder(
            borderRadius: BorderRadius.all(
              Radius.circular(8),
            ),
          ),
          backgroundColor: CustomColors.appColorBlue.withOpacity(0.1),
          foregroundColor: CustomColors.appColorBlue.withOpacity(0.1),
        ),
        child: Text(
          'Log Out',
          style: Theme.of(context).textTheme.bodyLarge?.copyWith(
                color: CustomColors.appColorBlue,
              ),
        ),
      ),
    );
  }

  Future<void> _signOut() async {
    bool hasConnection = await checkNetworkConnection(
      context,
      notifyUser: true,
    );
    if (!hasConnection) {
      return;
    }

    if (!mounted) return;

    loadingScreen(context);
    final success = await CustomAuth.signOut();

    if (!mounted) return;

    if (success) {
      Navigator.pop(context);
      await AppService.postSignOutActions(context);
    } else {
      Navigator.pop(context);
      showSnackBar(context, Config.signOutFailed);
    }
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
            padding: const EdgeInsets.symmetric(horizontal: 25.0),
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
            padding: const EdgeInsets.symmetric(horizontal: 55.0),
            child: AutoSizeText(
              'Create your account today and enjoy air quality'
              ' updates and health tips.',
              maxLines: 6,
              overflow: TextOverflow.ellipsis,
              textAlign: TextAlign.center,
              style: Theme.of(context).textTheme.titleSmall?.copyWith(
                    color: CustomColors.appColorBlack.withOpacity(0.4),
                  ),
            ),
          ),
          const SizedBox(
            height: 24,
          ),
          const Padding(
            padding: EdgeInsets.symmetric(horizontal: 32),
            child: SignUpButton(),
          ),
          const SizedBox(
            height: 40,
          ),
        ],
      ),
    );
  }
}

class SignUpButton extends StatelessWidget {
  const SignUpButton({super.key});

  @override
  Widget build(BuildContext context) {
    return SizedBox(
      height: 48,
      width: double.infinity,
      child: OutlinedButton(
        onPressed: () async {
          await Navigator.pushAndRemoveUntil(
            context,
            MaterialPageRoute(builder: (context) {
              return const PhoneSignUpWidget();
            }),
            (r) => false,
          );
        },
        style: OutlinedButton.styleFrom(
          elevation: 0,
          side: const BorderSide(
            color: Colors.transparent,
          ),
          shape: const RoundedRectangleBorder(
            borderRadius: BorderRadius.all(
              Radius.circular(8),
            ),
          ),
          backgroundColor: CustomColors.appColorBlue,
          foregroundColor: CustomColors.appColorBlue,
        ),
        child: const Text(
          'Sign Up',
          style: TextStyle(
            color: Colors.white,
            fontSize: 14,
            height: 22 / 14,
            letterSpacing: 16 * -0.022,
          ),
        ),
      ),
    );
  }
}

class SettingsButton extends StatelessWidget {
  const SettingsButton({super.key});

  @override
  Widget build(BuildContext context) {
    return OutlinedButton(
      onPressed: () async {
        await Navigator.push(
          context,
          MaterialPageRoute(
            builder: (context) {
              return const SettingsPage();
            },
          ),
        );
      },
      style: OutlinedButton.styleFrom(
        elevation: 0,
        side: const BorderSide(
          color: Colors.transparent,
        ),
        shape: const RoundedRectangleBorder(
          borderRadius: BorderRadius.all(
            Radius.circular(8),
          ),
        ),
        backgroundColor: Colors.white,
        foregroundColor: CustomColors.appColorBlue,
        padding: const EdgeInsets.symmetric(vertical: 4, horizontal: 16),
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
            child: Icon(
              Icons.settings_rounded,
              color: CustomColors.appColorBlue,
            ),
          ),
        ),
        title: AutoSizeText(
          'Settings',
          overflow: TextOverflow.ellipsis,
          style: Theme.of(context).textTheme.bodyLarge,
        ),
      ),
    );
  }
}

class ProfilePicPlaceHolder extends StatelessWidget {
  const ProfilePicPlaceHolder(
    this.text, {
    super.key,
    this.size = 40,
  });
  final String text;
  final double size;
  @override
  Widget build(BuildContext context) {
    return RotationTransition(
      turns: const AlwaysStoppedAnimation(-5 / 360),
      child: Container(
        height: size,
        width: size,
        padding: const EdgeInsets.all(2.0),
        decoration: BoxDecoration(
          color: CustomColors.appPicColor,
          shape: BoxShape.rectangle,
          borderRadius: BorderRadius.all(
            Radius.circular(size > 40 ? 35 : 15.0),
          ),
        ),
        child: Center(
          child: RotationTransition(
            turns: const AlwaysStoppedAnimation(5 / 360),
            child: Container(
              height: size,
              width: size,
              padding: const EdgeInsets.all(2.0),
              decoration: BoxDecoration(
                color: CustomColors.appPicColor,
                shape: BoxShape.rectangle,
                borderRadius: BorderRadius.all(
                  Radius.circular(size > 40 ? 35 : 15.0),
                ),
              ),
              child: Center(
                child: Container(
                  height: 40,
                  width: 40,
                  padding: const EdgeInsets.all(2.0),
                  color: Colors.transparent,
                  child: Center(
                    child: Text(
                      text,
                      style: TextStyle(
                        fontWeight: FontWeight.bold,
                        color: Colors.white,
                        fontSize: size > 40 ? 22 : 12,
                      ),
                    ),
                  ),
                ),
              ),
            ),
          ),
        ),
      ),
    );
  }
}

class ViewProfilePicture extends StatelessWidget {
  const ViewProfilePicture({super.key});

  @override
  Widget build(BuildContext context) {
    return BlocBuilder<ProfileBloc, Profile>(builder: (context, profile) {
      if (profile.isAnonymous || !profile.photoUrl.isValidUri()) {
        return ProfilePicPlaceHolder(profile.initials());
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
    return BlocBuilder<NotificationBloc, List<AppNotification>>(
      builder: (context, state) {
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
              state.filterUnRead().isEmpty
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
    this.icon,
    this.materialIcon,
    required this.iconColor,
    required this.text,
    required this.nextPage,
    this.isTopItem = false,
    this.isBottomItem = false,
  });
  final String? icon;
  final IconData? materialIcon;
  final String text;
  final Color? iconColor;
  final Widget nextPage;
  final bool isTopItem;
  final bool isBottomItem;

  @override
  Widget build(BuildContext context) {
    return OutlinedButton(
      onPressed: () async {
        await Navigator.push(
          context,
          MaterialPageRoute(
            builder: (context) {
              return nextPage;
            },
          ),
        );
      },
      style: OutlinedButton.styleFrom(
        elevation: 0,
        padding: EdgeInsets.zero,
        side: const BorderSide(
          color: Colors.transparent,
        ),
        shape: RoundedRectangleBorder(
          borderRadius: BorderRadius.only(
            topRight:
                isTopItem ? const Radius.circular(8) : const Radius.circular(0),
            topLeft:
                isTopItem ? const Radius.circular(8) : const Radius.circular(0),
            bottomRight: isBottomItem
                ? const Radius.circular(8)
                : const Radius.circular(0),
            bottomLeft: isBottomItem
                ? const Radius.circular(8)
                : const Radius.circular(0),
          ),
        ),
        foregroundColor: CustomColors.appColorBlue.withOpacity(0.1),
        backgroundColor: Colors.white,
      ),
      child: ListTile(
        isThreeLine: false,
        contentPadding: const EdgeInsets.symmetric(horizontal: 12, vertical: 4),
        leading: Container(
          height: 56,
          width: 40,
          decoration: BoxDecoration(
            color: CustomColors.appBodyColor,
            shape: BoxShape.circle,
          ),
          child: Center(
            child: icon != null
                ? SvgPicture.asset(icon!, color: iconColor)
                : Icon(
                    materialIcon,
                    color: iconColor,
                  ),
          ),
        ),
        title: AutoSizeText(
          text,
          overflow: TextOverflow.ellipsis,
          style: Theme.of(context).textTheme.bodyLarge,
        ),
      ),
    );
  }
}

class ProfileSection extends StatelessWidget {
  const ProfileSection(this.profile, {super.key});
  final Profile profile;

  @override
  Widget build(BuildContext context) {
    return Container(
      decoration: const BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.all(Radius.circular(8.0)),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.center,
        children: [
          CardSection(
            text: 'Profile',
            materialIcon: Icons.person_rounded,
            iconColor: CustomColors.appColorBlue,
            nextPage: const ProfileEditPage(),
            isTopItem: true,
          ),
          Divider(
            color: CustomColors.appBodyColor,
            height: 0,
          ),
          const CardSection(
            text: 'Favorites',
            icon: 'assets/icon/heart.svg',
            iconColor: null,
            nextPage: FavouritePlacesPage(),
          ),
          Divider(
            color: CustomColors.appBodyColor,
            height: 0,
          ),
          CardSection(
            text: 'For you',
            icon: 'assets/icon/sparkles.svg',
            iconColor: CustomColors.appColorBlue,
            nextPage: const ForYouPage(analytics: false),
          ),
          Divider(
            color: CustomColors.appBodyColor,
            height: 0,
          ),
          CardSection(
            text: 'Send Feedback',
            iconColor: CustomColors.appColorBlue,
            nextPage: const FeedbackPage(),
            materialIcon: Icons.chat,
            isBottomItem: true,
          ),
        ],
      ),
    );
  }
}

class ProfileViewAppBar extends StatelessWidget implements PreferredSizeWidget {
  const ProfileViewAppBar(this.profile, {super.key});
  final Profile profile;
  final double toolbarHeight = 110;

  @override
  Widget build(BuildContext context) {
    return AppBar(
      toolbarHeight: toolbarHeight,
      centerTitle: true,
      elevation: 0,
      backgroundColor: CustomColors.appBodyColor,
      automaticallyImplyLeading: false,
      title: Row(
        mainAxisAlignment: MainAxisAlignment.spaceBetween,
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          GestureDetector(
            onTap: () async {
              await _editProfile(context);
            },
            child: Column(
              mainAxisSize: MainAxisSize.min,
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                const ViewProfilePicture(),
                const SizedBox(height: 4),
                AutoSizeText(
                  profile.displayName(),
                  maxLines: 2,
                  style: CustomTextStyle.headline9(context),
                ),
                const SizedBox(height: 4),
                Text(
                  'Edit profile',
                  style: Theme.of(context).textTheme.bodyMedium?.copyWith(
                        color: CustomColors.appColorBlue,
                      ),
                ),
              ],
            ),
          ),
          const ViewNotificationIcon(),
        ],
      ),
    );
  }

  Future<void> _editProfile(BuildContext context) async {
    await Navigator.push(
      context,
      MaterialPageRoute(
        builder: (context) {
          return const ProfileEditPage();
        },
      ),
    );
  }

  @override
  Size get preferredSize => Size.fromHeight(toolbarHeight);
}

class EditProfilePicSection extends StatefulWidget {
  const EditProfilePicSection({super.key});
  @override
  State<EditProfilePicSection> createState() => _EditProfilePicSectionState();
}

class _EditProfilePicSectionState extends State<EditProfilePicSection> {
  String _profilePic = "";
  bool _uploading = false;

  @override
  void initState() {
    super.initState();
    _profilePic = context.read<ProfileBloc>().state.photoUrl;
  }

  @override
  Widget build(BuildContext context) {
    return BlocBuilder<ProfileBloc, Profile>(
      builder: (context, profile) {
        Widget profilePicWidget = _profilePic.trim().isEmpty
            ? ProfilePicPlaceHolder(
                profile.initials(),
                size: 88,
              )
            : _profilePic.isValidUri()
                ? CircleAvatar(
                    radius: 44,
                    backgroundImage: CachedNetworkImageProvider(
                      _profilePic,
                    ),
                  )
                : CircleAvatar(
                    radius: 44,
                    backgroundImage: FileImage(
                      File(_profilePic),
                    ),
                  );

        return Row(
          crossAxisAlignment: CrossAxisAlignment.center,
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            InkWell(
              onTap: () async {
                await _getImageFromGallery();
              },
              child: Stack(
                alignment: AlignmentDirectional.center,
                children: [
                  profilePicWidget,
                  Visibility(
                    visible: !_uploading,
                    child: Positioned(
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
                          size: 22,
                          color: Colors.white,
                        ),
                      ),
                    ),
                  ),
                  Visibility(
                    visible: _uploading,
                    child: const LoadingIcon(
                      radius: 30,
                    ),
                  ),
                ],
              ),
            ),
          ],
        );
      },
    );
  }

  Future<void> _getImageFromGallery() async {
    if (_uploading) {
      return;
    }
    bool hasConnection = await checkNetworkConnection(
      context,
      notifyUser: true,
    );
    if (!hasConnection) {
      return;
    }
    if (!mounted) return;

    await ImagePicker()
        .pickImage(
      source: ImageSource.gallery,
      maxWidth: 1800,
      maxHeight: 1800,
    )
        .then((file) async {
      if (file != null) {
        setState(() {
          _profilePic = file.path;
          _uploading = true;
        });

        String uploadedPic = await CloudStore.uploadProfilePicture(file.path);

        if (!mounted) return;

        setState(() {
          _uploading = false;
        });

        if (uploadedPic.isEmpty) {
          showSnackBar(context, "Failed to update profile pic");

          return;
        }

        Profile profile = context.read<ProfileBloc>().state;
        context.read<ProfileBloc>().add(UpdateProfile(profile.copyWith(
              photoUrl: uploadedPic,
            )));
      }
    }).catchError((error) async {
      if (error is PlatformException) {
        await PermissionService.checkPermission(
          AppPermission.photosStorage,
          request: true,
        );
      }
    });
  }
}

class EditProfileAppBar extends StatelessWidget implements PreferredSizeWidget {
  const EditProfileAppBar({super.key});

  @override
  Widget build(BuildContext context) {
    Profile previousProfile = context.read<ProfileBloc>().state;

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
          BlocBuilder<ProfileBloc, Profile>(
            builder: (context, profile) {
              return SizedBox(
                height: 40,
                width: 70,
                child: OutlinedButton(
                  onPressed: () {
                    context.read<ProfileBloc>().add(UpdateProfile(profile));
                    Navigator.pop(context);
                  },
                  style: OutlinedButton.styleFrom(
                    elevation: 0,
                    side: const BorderSide(
                      color: Colors.transparent,
                    ),
                    shape: const RoundedRectangleBorder(
                      borderRadius: BorderRadius.all(
                        Radius.circular(8),
                      ),
                    ),
                    backgroundColor: previousProfile == profile
                        ? Colors.transparent
                        : CustomColors.appColorBlue.withOpacity(0.1),
                    foregroundColor: previousProfile == profile
                        ? Colors.transparent
                        : CustomColors.appColorBlue,
                  ),
                  child: Text(
                    'Save',
                    textAlign: TextAlign.center,
                    style: Theme.of(context).textTheme.titleSmall?.copyWith(
                          color: previousProfile == profile
                              ? CustomColors.greyColor
                              : CustomColors.appColorBlue,
                        ),
                  ),
                ),
              );
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
        TextFormField(
          initialValue: authMethod == AuthMethod.email
              ? profile.emailAddress
              : profile.phoneNumber,
          enableSuggestions: false,
          readOnly: true,
          style: TextStyle(color: CustomColors.inactiveColor),
          decoration: InputDecoration(
            filled: true,
            fillColor: Colors.white,
            hintText: '-',
            focusedBorder: OutlineInputBorder(
              borderSide:
                  const BorderSide(color: Colors.transparent, width: 1.0),
              borderRadius: BorderRadius.circular(8.0),
            ),
            enabledBorder: OutlineInputBorder(
              borderSide:
                  const BorderSide(color: Colors.transparent, width: 1.0),
              borderRadius: BorderRadius.circular(8.0),
            ),
          ),
        ),
      ],
    );
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
                ProfilePicPlaceHolder(
                  'A',
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
      body: AppSafeArea(
        horizontalPadding: 16.0,
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
    );
  }
}
