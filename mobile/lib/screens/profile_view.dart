import 'package:app/auth/phone_auth_widget.dart';
import 'package:app/constants/config.dart';
import 'package:app/models/notification.dart';
import 'package:app/models/user_details.dart';
import 'package:app/screens/profile_edit_page.dart';
import 'package:app/screens/settings_page.dart';
import 'package:app/services/app_service.dart';
import 'package:app/utils/dialogs.dart';
import 'package:app/widgets/custom_shimmer.dart';
import 'package:auto_size_text/auto_size_text.dart';
import 'package:cached_network_image/cached_network_image.dart';
import 'package:flutter/material.dart';
import 'package:flutter_svg/svg.dart';
import 'package:provider/provider.dart';

import '../themes/light_theme.dart';
import 'favourite_places.dart';
import 'for_you_page.dart';
import 'notification_page.dart';

class ProfileView extends StatefulWidget {
  const ProfileView({Key? key}) : super(key: key);

  @override
  _ProfileViewState createState() => _ProfileViewState();
}

class _ProfileViewState extends State<ProfileView> {
  UserDetails _userProfile = UserDetails.initialize();
  bool _isLoggedIn = false;
  late AppService _appService;

  Widget appNavBar() {
    return Padding(
      padding: const EdgeInsets.only(top: 23),
      child: Row(
        crossAxisAlignment: CrossAxisAlignment.center,
        mainAxisAlignment: MainAxisAlignment.center,
        children: [
          profilePicWidget(
              40, 40, 10, 12, 17.0, _userProfile.photoUrl, 27.0, false),
          const Spacer(),
          GestureDetector(
            onTap: notifications,
            child: Container(
              padding: const EdgeInsets.all(10),
              height: 40,
              width: 40,
              decoration: const BoxDecoration(
                  color: Colors.white,
                  borderRadius: BorderRadius.all(Radius.circular(8.0))),
              child: Consumer<NotificationModel>(
                builder: (context, notifications, child) {
                  if (notifications.hasNotifications()) {
                    return SvgPicture.asset(
                      'assets/icon/has_notifications.svg',
                      height: 20,
                      width: 16,
                    );
                  }
                  return SvgPicture.asset(
                    'assets/icon/empty_notifications.svg',
                    height: 20,
                    width: 16,
                  );
                },
              ),
            ),
          ),
        ],
      ),
    );
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
        appBar: navBar(),
        body: Container(
            color: Config.appBodyColor,
            child: Padding(
              padding: const EdgeInsets.only(left: 16.0, top: 8.0, right: 16.0),
              child: Column(
                mainAxisSize: MainAxisSize.min,
                crossAxisAlignment: CrossAxisAlignment.start,
                children: <Widget>[
                  Visibility(
                      visible: _isLoggedIn,
                      child: ListView(
                        physics: const BouncingScrollPhysics(),
                        shrinkWrap: true,
                        children: <Widget>[
                          const SizedBox(
                            height: 10,
                          ),
                          AutoSizeText(
                            _userProfile.getFullName(),
                            maxLines: 2,
                            style: CustomTextStyle.headline9(context),
                          ),
                          const SizedBox(
                            height: 4,
                          ),
                          GestureDetector(
                            onTap: () async {
                              await viewProfile();
                            },
                            child: Text('Edit profile',
                                style: Theme.of(context)
                                    .textTheme
                                    .bodyText2
                                    ?.copyWith(color: Config.appColorBlue)),
                          ),
                          const SizedBox(
                            height: 40,
                          ),
                          Padding(
                            padding:
                                const EdgeInsets.fromLTRB(0.0, 16.0, 0.0, 0.0),
                            child: profileSection(),
                          ),
                          // logoutSection('Logout', 'assets/icon/location.svg',
                          //     Config.appColorBlue, logOut),
                        ],
                      )),
                  Visibility(
                    visible: _isLoggedIn,
                    child: const Spacer(),
                  ),
                  Visibility(
                    visible: _isLoggedIn,
                    child: logoutSection('Logout', 'assets/icon/location.svg',
                        Config.appColorBlue, logOut),
                  ),
                  Visibility(
                      visible: !_isLoggedIn,
                      child: ListView(
                        shrinkWrap: true,
                        children: <Widget>[
                          Text(
                            'Guest',
                            style: CustomTextStyle.headline9(context),
                          ),
                          const SizedBox(
                            height: 24,
                          ),
                          signupSection(),
                          const SizedBox(
                            height: 16,
                          ),
                          cardSection('Settings', 'assets/icon/cog.svg',
                              Config.appColorBlue, settings),
                        ],
                      )),
                  Visibility(
                    visible: !_isLoggedIn,
                    child: const Spacer(),
                  ),
                  const SizedBox(
                    height: 32,
                  ),
                ],
              ),
            )));
  }

  Widget cardSection(text, icon, iconColor, callBackFn) {
    return GestureDetector(
      onTap: callBackFn,
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
                child: SvgPicture.asset(icon, color: iconColor),
              )),
          title: AutoSizeText(
            '$text',
            overflow: TextOverflow.ellipsis,
            style: Theme.of(context).textTheme.bodyText1,
          ),
        ),
      ),
    );
  }

  void dummyFn() {}

  Future<void> favPlaces() async {
    await Navigator.push(context, MaterialPageRoute(builder: (context) {
      return const FavouritePlaces();
    }));
  }

  Future<void> forYou() async {
    await Navigator.push(context, MaterialPageRoute(builder: (context) {
      return const ForYouPage();
    }));
  }

  Future<void> initialize() async {
    setState(() {
      _isLoggedIn = _appService.customAuth.isLoggedIn();
    });

    if (_isLoggedIn) {
      var userDetails = await _appService.secureStorage.getUserDetails();
      if (mounted) {
        setState(() {
          _userProfile = userDetails;
        });
        if (userDetails.photoUrl != '') {
          await precacheImage(
              CachedNetworkImageProvider(_userProfile.photoUrl), context);
        }
      }
    }
  }

  @override
  void initState() {
    super.initState();
    _appService = AppService(context);
    initialize();
  }

  Future<void> logOut() async {
    var loadingContext = context;
    loadingScreen(loadingContext);

    setState(() {
      _userProfile = UserDetails.initialize();
    });

    var successful = await _appService.logOut(context);
    if (successful) {
      Navigator.pop(loadingContext);
      await Navigator.pushAndRemoveUntil(context,
          MaterialPageRoute(builder: (context) {
        return const PhoneLoginWidget(phoneNumber: '', enableBackButton: false);
      }), (r) => false);
    } else {
      Navigator.pop(loadingContext);
      await showSnackBar(context, 'failed to logout. Try again later');
    }
  }

  Widget logoutSection(text, icon, iconColor, callBackFn) {
    return GestureDetector(
      onTap: callBackFn,
      child: Container(
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
      ),
    );
  }

  PreferredSizeWidget navBar() {
    return AppBar(
        toolbarHeight: 72,
        centerTitle: true,
        elevation: 0,
        backgroundColor: Config.appBodyColor,
        automaticallyImplyLeading: false,
        title: Row(
          children: [
            profilePicWidget(
                40, 40, 10, 12, 17.0, _userProfile.photoUrl, 27.0, false),
            const Spacer(),
            GestureDetector(
              onTap: notifications,
              child: Container(
                padding: const EdgeInsets.all(10),
                height: 40,
                width: 40,
                decoration: const BoxDecoration(
                    color: Colors.white,
                    borderRadius: BorderRadius.all(Radius.circular(8.0))),
                child: Consumer<NotificationModel>(
                  builder: (context, notifications, child) {
                    if (notifications.hasNotifications()) {
                      return SvgPicture.asset(
                        'assets/icon/has_notifications.svg',
                        height: 20,
                        width: 16,
                      );
                    }
                    return SvgPicture.asset(
                      'assets/icon/empty_notifications.svg',
                      height: 20,
                      width: 16,
                    );
                  },
                ),
              ),
            ),
          ],
        ));
  }

  Future<void> notifications() async {
    Provider.of<NotificationModel>(context, listen: false).removeAll();
    await Navigator.push(context, MaterialPageRoute(builder: (context) {
      return const NotificationPage();
    }));
  }

  Widget profilePicWidget(double height, double width, double iconSize,
      double textSize, radius, photoUrl, imageRadius, showIcon) {
    return Stack(
      alignment: AlignmentDirectional.center,
      children: [
        if (photoUrl == '')
          RotationTransition(
            turns: const AlwaysStoppedAnimation(-5 / 360),
            child: Container(
              padding: const EdgeInsets.all(2.0),
              decoration: BoxDecoration(
                  color:
                      photoUrl == '' ? Config.appPicColor : Colors.transparent,
                  shape: BoxShape.rectangle,
                  borderRadius: BorderRadius.all(Radius.circular(radius))),
              child: Container(
                height: height,
                width: width,
                color: Colors.transparent,
              ),
            ),
          ),
        if (photoUrl == '')
          Text(
            _userProfile.getInitials(),
            style: TextStyle(
                fontWeight: FontWeight.bold,
                color: Colors.white,
                fontSize: textSize),
          ),
        if (photoUrl != '')
          Container(
            decoration: const BoxDecoration(
              shape: BoxShape.circle,
            ),
            child: circularLoadingAnimation(40),
          ),
        if (photoUrl != '')
          CircleAvatar(
            radius: imageRadius,
            backgroundColor: Colors.transparent,
            foregroundColor: Colors.transparent,
            backgroundImage: CachedNetworkImageProvider(
              photoUrl,
            ),
          ),
        if (showIcon)
          Positioned(
              bottom: 0,
              right: 0,
              child: Container(
                padding: const EdgeInsets.all(2.0),
                decoration: BoxDecoration(
                  border: Border.all(color: Colors.white),
                  color: Config.appColorBlue,
                  shape: BoxShape.circle,
                ),
                child: Icon(
                  Icons.add,
                  size: iconSize,
                  color: Colors.white,
                ),
              ))
      ],
    );
  }

  Widget profileSection() {
    return Container(
      padding: const EdgeInsets.only(top: 10, bottom: 10),
      decoration: const BoxDecoration(
          color: Colors.white,
          borderRadius: BorderRadius.all(Radius.circular(8.0))),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.center,
        children: [
          cardSection('Profile', 'assets/icon/profile.svg', Config.appColorBlue,
              viewProfile),
          Divider(
            color: Config.appBodyColor,
          ),
          cardSection('Favorites', 'assets/icon/heart.svg', null, favPlaces),
          Divider(
            color: Config.appBodyColor,
          ),
          cardSection('For you', 'assets/icon/sparkles.svg',
              Config.appColorBlue, forYou),
          Divider(
            color: Config.appBodyColor,
          ),
          cardSection(
              'Settings', 'assets/icon/cog.svg', Config.appColorBlue, settings),
        ],
      ),
    );
  }

  Future<void> settings() async {
    await Navigator.push(context, MaterialPageRoute(builder: (context) {
      return const SettingsPage();
    }));
  }

  Widget signupSection() {
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
                return const PhoneLoginWidget(
                    phoneNumber: '', enableBackButton: false);
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

  Future<void> viewProfile() async {
    await Navigator.push(context, MaterialPageRoute(builder: (context) {
      return ProfileEditPage(_userProfile);
    })).whenComplete(() => {initialize()});
  }
}
