import 'package:app/screens/profile/profile_edit_page.dart';
import 'package:auto_size_text/auto_size_text.dart';
import 'package:cached_network_image/cached_network_image.dart';
import 'package:flutter/material.dart';
import 'package:flutter_svg/svg.dart';

import '../../auth/phone_auth_widget.dart';
import '../../constants/config.dart';
import '../../models/user_details.dart';
import '../../themes/light_theme.dart';
import '../../widgets/custom_shimmer.dart';
import '../favourite_places.dart';
import '../for_you_page.dart';
import '../settings_page.dart';

class LogoutButton extends StatelessWidget {
  const LogoutButton({Key? key}) : super(key: key);

  @override
  Widget build(BuildContext context) {
    return Container(
      height: 48,
      padding: const EdgeInsets.only(top: 12, bottom: 12),
      decoration: BoxDecoration(
          color: Config.appColorBlue.withOpacity(0.1),
          borderRadius: const BorderRadius.all(Radius.circular(8.0))),
      child: Center(
        child: Text(
          'Log Out',
          style: TextStyle(fontSize: 16, color: Config.appColorBlue),
        ),
      ),
    );
  }
}

class SignUpSection extends StatelessWidget {
  const SignUpSection({Key? key}) : super(key: key);

  @override
  Widget build(BuildContext context) {
    return Container(
      decoration: const BoxDecoration(
          color: Colors.white,
          borderRadius: BorderRadius.all(Radius.circular(16.0))),
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
                ' updates and recommendations.',
                maxLines: 6,
                overflow: TextOverflow.ellipsis,
                textAlign: TextAlign.center,
                style: Theme.of(context)
                    .textTheme
                    .subtitle2
                    ?.copyWith(color: Config.appColorBlack.withOpacity(0.4))),
          ),
          const SizedBox(
            height: 24,
          ),
          GestureDetector(
            onTap: () async {
              await Navigator.pushAndRemoveUntil(context,
                  MaterialPageRoute(builder: (context) {
                return const PhoneLoginWidget();
              }), (r) => false);
            },
            child: Padding(
              padding: const EdgeInsets.only(left: 32, right: 32),
              child: Container(
                  constraints: const BoxConstraints(minWidth: double.infinity),
                  decoration: BoxDecoration(
                      color: Config.appColorBlue,
                      borderRadius:
                          const BorderRadius.all(Radius.circular(8.0))),
                  child: const Center(
                    child: Padding(
                      padding: EdgeInsets.only(top: 12, bottom: 14),
                      child: Text(
                        'Sign Up',
                        style: TextStyle(
                            color: Colors.white,
                            fontSize: 14,
                            height: 22 / 14,
                            letterSpacing: 16 * -0.022),
                      ),
                    ),
                  )),
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
  const SettingsButton({Key? key}) : super(key: key);

  @override
  Widget build(BuildContext context) {
    return GestureDetector(
      onTap: () async {
        await Navigator.push(context, MaterialPageRoute(builder: (context) {
          return const SettingsPage();
        }));
      },
      child: Container(
        height: 56,
        decoration: const BoxDecoration(
            color: Colors.white,
            borderRadius: BorderRadius.all(Radius.circular(8.0))),
        child: ListTile(
          leading: Container(
              height: 40,
              width: 40,
              decoration: BoxDecoration(
                  color: Config.appColorBlue.withOpacity(0.15),
                  shape: BoxShape.circle),
              child: Center(
                child: SvgPicture.asset('assets/icon/cog.svg',
                    color: Config.appColorBlue),
              )),
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

class ProfilePicture extends StatelessWidget {
  final UserDetails userDetails;
  const ProfilePicture({Key? key, required this.userDetails}) : super(key: key);

  @override
  Widget build(BuildContext context) {
    return Stack(
      alignment: AlignmentDirectional.center,
      children: [
        if (userDetails.photoUrl == '')
          RotationTransition(
            turns: const AlwaysStoppedAnimation(-5 / 360),
            child: Container(
              padding: const EdgeInsets.all(2.0),
              decoration: BoxDecoration(
                  color: userDetails.photoUrl == ''
                      ? Config.appPicColor
                      : Colors.transparent,
                  shape: BoxShape.rectangle,
                  borderRadius: const BorderRadius.all(Radius.circular(27.0))),
              child: Container(
                height: 40,
                width: 40,
                color: Colors.transparent,
              ),
            ),
          ),
        if (userDetails.photoUrl == '')
          Text(
            userDetails.getInitials(),
            style: const TextStyle(
                fontWeight: FontWeight.bold,
                color: Colors.white,
                fontSize: 17.0),
          ),
        if (userDetails.photoUrl != '')
          Container(
            decoration: const BoxDecoration(
              shape: BoxShape.circle,
            ),
            child: circularLoadingAnimation(40),
          ),
        if (userDetails.photoUrl != '')
          CircleAvatar(
            radius: 27.0,
            backgroundColor: Colors.transparent,
            foregroundColor: Colors.transparent,
            backgroundImage: CachedNetworkImageProvider(
              userDetails.photoUrl,
            ),
          ),
      ],
    );
  }
}

class CardSection extends StatelessWidget {
  final String icon;
  final String text;
  final Color? iconColor;
  const CardSection(
      {Key? key,
      required this.icon,
      required this.iconColor,
      required this.text})
      : super(key: key);

  @override
  Widget build(BuildContext context) {
    return Container(
      height: 56,
      decoration: const BoxDecoration(
          color: Colors.white,
          borderRadius: BorderRadius.all(Radius.circular(8.0))),
      child: ListTile(
        leading: Container(
            height: 40,
            width: 40,
            decoration: BoxDecoration(
                color: Config.appColorBlue.withOpacity(0.15),
                shape: BoxShape.circle),
            child: Center(
              child: SvgPicture.asset(icon, color: iconColor),
            )),
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
  final UserDetails userDetails;
  const ProfileSection({Key? key, required this.userDetails}) : super(key: key);

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
          borderRadius: BorderRadius.all(Radius.circular(8.0))),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.center,
        children: [
          GestureDetector(
            onTap: () async {
              await Navigator.push(context,
                  MaterialPageRoute(builder: (context) {
                return ProfileEditPage(widget.userDetails);
              }));
            },
            child: CardSection(
                text: 'Profile',
                icon: 'assets/icon/profile.svg',
                iconColor: Config.appColorBlue),
          ),
          Divider(
            color: Config.appBodyColor,
          ),
          GestureDetector(
            onTap: () async {
              await Navigator.push(context,
                  MaterialPageRoute(builder: (context) {
                return const FavouritePlaces();
              }));
            },
            child: const CardSection(
                text: 'Favorites',
                icon: 'assets/icon/heart.svg',
                iconColor: null),
          ),
          Divider(
            color: Config.appBodyColor,
          ),
          GestureDetector(
            onTap: () async {
              await Navigator.push(context,
                  MaterialPageRoute(builder: (context) {
                return const ForYouPage();
              }));
            },
            child: CardSection(
                text: 'For you',
                icon: 'assets/icon/sparkles.svg',
                iconColor: Config.appColorBlue),
          ),
          Divider(
            color: Config.appBodyColor,
          ),
          GestureDetector(
            onTap: () async {
              await Navigator.push(context,
                  MaterialPageRoute(builder: (context) {
                return const SettingsPage();
              }));
            },
            child: CardSection(
                text: 'Settings',
                icon: 'assets/icon/cog.svg',
                iconColor: Config.appColorBlue),
          ),
        ],
      ),
    );
  }
}
