import 'package:app/constants/app_constants.dart';
import 'package:app/models/userDetails.dart';
import 'package:app/screens/signup_page.dart';
import 'package:app/screens/tips_page.dart';
import 'package:app/screens/view_profile_page.dart';
import 'package:app/services/fb_notifications.dart';
import 'package:app/widgets/text_fields.dart';
import 'package:firebase_auth/firebase_auth.dart';
import 'package:flutter/material.dart';

import 'favourite_places.dart';
import 'for_you_page.dart';
import 'maps_view.dart';
import 'notification_page.dart';

class ProfileView extends StatefulWidget {
  ProfileView({Key? key}) : super(key: key);

  @override
  _ProfileViewState createState() => _ProfileViewState();
}

class _ProfileViewState extends State<ProfileView> {
  var userProfile = UserDetails.initialize();
  final CustomAuth _customAuth = CustomAuth(FirebaseAuth.instance);
  bool isLoggedIn = false;

  @override
  Widget build(BuildContext context) {
    return Scaffold(
        appBar: AppBar(
          title: topBar(),
          elevation: 0,
          toolbarHeight: 50,
          backgroundColor: ColorConstants.appBodyColor,
        ),
        body: Container(
            color: ColorConstants.appBodyColor,
            child: RefreshIndicator(
                onRefresh: initialize,
                color: ColorConstants.appColor,
                child: Padding(
                  padding: const EdgeInsets.fromLTRB(16.0, 8.0, 16.0, 8.0),
                  child: Column(
                    mainAxisSize: MainAxisSize.min,
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: <Widget>[
                      isLoggedIn
                          ? Expanded(
                              child: ListView(
                                shrinkWrap: true,
                                children: <Widget>[
                                  Text(
                                    '${userProfile.getFullName()}',
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
                                          color: ColorConstants.appColorBlue),
                                    ),
                                  ),
                                  Padding(
                                    padding: const EdgeInsets.fromLTRB(
                                        0.0, 16.0, 0.0, 0.0),
                                    child: profileSection(),
                                  ),
                                  const SizedBox(
                                    height: 16,
                                  ),
                                  cardSection('Settings', dummyFn),
                                  const SizedBox(
                                    height: 16,
                                  ),
                                  cardSection('Logout', logOut),
                                ],
                              ),
                            )
                          : Expanded(
                              child: ListView(
                                shrinkWrap: true,
                                children: <Widget>[
                                  const Text(
                                    'Guest',
                                    style: TextStyle(
                                        fontSize: 24,
                                        fontWeight: FontWeight.bold),
                                  ),
                                  Text(
                                    'Edit profile',
                                    style: TextStyle(
                                        fontSize: 16,
                                        color: ColorConstants.inactiveColor),
                                  ),
                                  Padding(
                                    padding: const EdgeInsets.fromLTRB(
                                        0.0, 16.0, 0.0, 0.0),
                                    child: signupSection(),
                                  ),
                                  const SizedBox(
                                    height: 16,
                                  ),
                                  cardSection('Settings', dummyFn),
                                ],
                              ),
                            ),
                    ],
                  ),
                ))));
  }

  Widget cardSection(text, callBackFn) {
    return GestureDetector(
      onTap: callBackFn,
      child: Container(
        decoration: const BoxDecoration(
            color: Colors.white,
            borderRadius: BorderRadius.all(Radius.circular(10.0))),
        child: ListTile(
          leading: CustomUserAvatar(),
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
      return ForYouPage();
    }));
  }

  Future<void> initialize() async {
    setState(() {
      isLoggedIn = _customAuth.isLoggedIn();
    });
    await _customAuth.getProfile().then((value) => {
          setState(() {
            userProfile = value;
          }),
        });
  }

  @override
  void initState() {
    initialize();
    super.initState();
  }

  void logOut() {
    _customAuth.logOut().then((value) => {initialize()});
  }

  Future<void> notifications() async {
    await Navigator.push(context, MaterialPageRoute(builder: (context) {
      return const NotificationPage();
    }));
  }

  Widget profileSection() {
    return Container(
      padding: const EdgeInsets.only(top: 10, bottom: 10),
      decoration: const BoxDecoration(
          color: Colors.white,
          borderRadius: BorderRadius.all(Radius.circular(10.0))),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.center,
        children: [
          cardSection('Profile', viewProfile),
          Divider(
            color: ColorConstants.appBodyColor,
          ),
          cardSection('Favorite', favPlaces),
          Divider(
            color: ColorConstants.appBodyColor,
          ),
          cardSection('For you', forYou),
          Divider(
            color: ColorConstants.appBodyColor,
          ),
          cardSection('App Tips & Tricks', tips),
        ],
      ),
    );
  }

  Widget signupSection() {
    return Container(
      decoration: const BoxDecoration(
          color: Colors.white,
          borderRadius: BorderRadius.all(Radius.circular(10.0))),
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
                return SignUpPage();
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
                    color: ColorConstants.appColorBlue,
                    borderRadius:
                        const BorderRadius.all(Radius.circular(10.0))),
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

  Future<void> tips() async {
    await Navigator.push(context, MaterialPageRoute(builder: (context) {
      return const TipsPage();
    }));
  }

  Widget topBar() {
    return Container(
      child: Row(
        crossAxisAlignment: CrossAxisAlignment.center,
        mainAxisAlignment: MainAxisAlignment.center,
        children: [
          profilePicWidget(
              40, 40, 10, 12, 17.0, userProfile.photoUrl, 27.0, false),
          const Spacer(),
          GestureDetector(
            onTap: notifications,
            child: Stack(
              alignment: AlignmentDirectional.center,
              children: [
                Container(
                  height: 40,
                  width: 40,
                  decoration: const BoxDecoration(
                      color: Colors.white,
                      borderRadius: BorderRadius.all(Radius.circular(10.0))),
                ),
                Positioned(
                    child: Icon(Icons.notifications_rounded,
                        size: 30, color: ColorConstants.appBarTitleColor)),
                Positioned(
                    top: 5,
                    right: 9,
                    child: Container(
                      height: 10,
                      width: 10,
                      decoration: BoxDecoration(
                        border: Border.all(color: Colors.white),
                        color: ColorConstants.greyColor,
                        shape: BoxShape.circle,
                      ),
                    ))
              ],
            ),
          ),
        ],
      ),
    );
  }

  Future<void> viewProfile() async {
    var saved =
        await Navigator.push(context, MaterialPageRoute(builder: (context) {
      return ViewProfilePage(userProfile);
    }));
    if (saved != null && saved) {
      await initialize();
    }
  }
}
