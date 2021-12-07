import 'package:app/constants/config.dart';
import 'package:app/models/notification.dart';
import 'package:app/models/user_details.dart';
import 'package:app/on_boarding/signup_screen.dart';
import 'package:app/screens/settings_page.dart';
import 'package:app/screens/view_profile_page.dart';
import 'package:app/services/fb_notifications.dart';
import 'package:app/services/secure_storage.dart';
import 'package:app/widgets/text_fields.dart';
import 'package:flutter/material.dart';
import 'package:flutter_svg/svg.dart';
import 'package:provider/provider.dart';

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
  final CustomAuth _customAuth = CustomAuth();
  bool _isLoggedIn = false;
  final CloudAnalytics _cloudAnalytics = CloudAnalytics();
  final SecureStorage _secureStorage = SecureStorage();

  Widget appNavBar() {
    return Row(
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
    );
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
        appBar: AppBar(
          title: appNavBar(),
          elevation: 0,
          toolbarHeight: 68,
          backgroundColor: Config.appBodyColor,
        ),
        body: Container(
            color: Config.appBodyColor,
            child: RefreshIndicator(
                onRefresh: initialize,
                color: Config.appColorBlue,
                child: Padding(
                  padding: const EdgeInsets.fromLTRB(16.0, 8.0, 16.0, 8.0),
                  child: Column(
                    mainAxisSize: MainAxisSize.min,
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: <Widget>[
                      Visibility(
                          visible: _isLoggedIn,
                          child: Expanded(
                            child: ListView(
                              shrinkWrap: true,
                              children: <Widget>[
                                Text(
                                  _userProfile.getFullName(),
                                  style: const TextStyle(
                                      fontSize: 24,
                                      fontWeight: FontWeight.bold),
                                ),
                                GestureDetector(
                                  onTap: () async {
                                    await viewProfile();
                                  },
                                  child: Text(
                                    'Edit profile',
                                    style: TextStyle(
                                        fontSize: 16,
                                        color: Config.appColorBlue),
                                  ),
                                ),
                                Padding(
                                  padding: const EdgeInsets.fromLTRB(
                                      0.0, 16.0, 0.0, 0.0),
                                  child: profileSection(),
                                ),
                              ],
                            ),
                          )),
                      Visibility(
                        visible: _isLoggedIn,
                        child: logoutSection(
                            'Logout',
                            'assets/icon/location.svg',
                            Config.appColorBlue,
                            logOut),
                      ),
                      Visibility(
                          visible: !_isLoggedIn,
                          child: Expanded(
                            child: ListView(
                              shrinkWrap: true,
                              children: <Widget>[
                                const Text(
                                  'Guest',
                                  style: TextStyle(
                                      fontSize: 24,
                                      fontWeight: FontWeight.bold),
                                ),
                                Padding(
                                  padding: const EdgeInsets.fromLTRB(
                                      0.0, 16.0, 0.0, 0.0),
                                  child: signupSection(),
                                ),
                                const SizedBox(
                                  height: 16,
                                ),
                                cardSection('Settings', 'assets/icon/cog.svg',
                                    Config.appColorBlue, settings),
                              ],
                            ),
                          )),
                      const SizedBox(
                        height: 32,
                      ),
                    ],
                  ),
                ))));
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
          title: Text(
            '$text',
            overflow: TextOverflow.ellipsis,
            style: const TextStyle(fontSize: 16),
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
    _cloudAnalytics.logScreenTransition('Profile Page');
    setState(() {
      _isLoggedIn = _customAuth.isLoggedIn();
    });

    if (_isLoggedIn) {
      var userDetails = await _secureStorage.getUserDetails();
      if (mounted) {
        setState(() {
          _userProfile = userDetails;
        });
      }
    }
  }

  @override
  void initState() {
    initialize();
    super.initState();
  }

  void logOut() {
    setState(() {
      _userProfile = UserDetails.initialize();
    });
    _customAuth.logOut(context).then((value) => {initialize()});
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

  Future<void> notifications() async {
    Provider.of<NotificationModel>(context, listen: false).removeAll();
    await Navigator.push(context, MaterialPageRoute(builder: (context) {
      return const NotificationPage();
    }));
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
          borderRadius: BorderRadius.all(Radius.circular(8.0))),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.center,
        children: [
          const Padding(
            padding: EdgeInsets.fromLTRB(48.0, 38.0, 48.0, 0.0),
            child: Text('Personalise your \nexperience',
                maxLines: 3,
                overflow: TextOverflow.ellipsis,
                textAlign: TextAlign.center,
                style: TextStyle(
                  fontSize: 20,
                  fontWeight: FontWeight.bold,
                )),
          ),
          const Padding(
            padding: EdgeInsets.only(left: 48.0, right: 48.0),
            child: Text(
                'Create your account today and enjoy air quality'
                ' updates and recommendations.',
                maxLines: 6,
                overflow: TextOverflow.ellipsis,
                textAlign: TextAlign.center,
                style: TextStyle(
                  fontSize: 15,
                )),
          ),
          const SizedBox(
            height: 16,
          ),
          GestureDetector(
            onTap: () async {
              var saved = await Navigator.push(context,
                  MaterialPageRoute(builder: (context) {
                return const SignupScreen(true);
              }));
              if (saved != null && saved) {
                await initialize();
              }
            },
            child: Padding(
              padding: const EdgeInsets.only(left: 24, right: 24, bottom: 38),
              child: Container(
                constraints: const BoxConstraints(minWidth: double.infinity),
                decoration: BoxDecoration(
                    color: Config.appColorBlue,
                    borderRadius: const BorderRadius.all(Radius.circular(8.0))),
                child: const Tab(
                    child: Text(
                  'Sign up',
                  style: TextStyle(
                    color: Colors.white,
                  ),
                )),
              ),
            ),
          ),
        ],
      ),
    );
  }

  Future<void> viewProfile() async {
    await Navigator.push(context, MaterialPageRoute(builder: (context) {
      return ViewProfilePage(_userProfile);
    })).whenComplete(() => {initialize()});
  }
}
