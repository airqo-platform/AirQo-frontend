import 'package:app/constants/app_constants.dart';
import 'package:app/screens/signup_page.dart';
import 'package:app/widgets/text_fields.dart';
import 'package:flutter/material.dart';
import 'package:shared_preferences/shared_preferences.dart';

import 'maps_view.dart';

class ProfileView extends StatefulWidget {
  const ProfileView({Key? key}) : super(key: key);

  @override
  _ProfileViewState createState() => _ProfileViewState();
}

class _ProfileViewState extends State<ProfileView> {
  bool isSignup = true;

  @override
  Widget build(BuildContext context) {
    return Container(
        color: ColorConstants.appBodyColor,
        child: const Center(
          child: Text('Coming Soon!'),
        ));
  }


  Widget builds(BuildContext context) {
    return Container(
        color: ColorConstants.appBodyColor,
        child: RefreshIndicator(
            onRefresh: initialize,
            color: ColorConstants.appColor,
            child: Padding(
              padding: const EdgeInsets.fromLTRB(16.0, 37, 16.0, 16.0),
              child: Column(
                mainAxisSize: MainAxisSize.min,
                crossAxisAlignment: CrossAxisAlignment.start,
                children: <Widget>[
                  isSignup
                      ? Expanded(
                    child: ListView(
                      shrinkWrap: true,
                      children: <Widget>[
                        topBar(),
                        const SizedBox(
                          height: 10.0,
                        ),
                        const Text(
                          'Nagawa Greta',
                          style: TextStyle(
                              fontSize: 24, fontWeight: FontWeight.bold),
                        ),
                        GestureDetector(
                          onTap: () {
                            Navigator.push(context,
                                MaterialPageRoute(builder: (context) {
                                  return SignUpPage();
                                }));
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
                        settingsSection('Settings'),
                        const SizedBox(
                          height: 16,
                        ),
                        settingsSection('Logout'),
                      ],
                    ),
                  )
                      : Expanded(
                    child: ListView(
                      shrinkWrap: true,
                      children: <Widget>[
                        topBar(),
                        const SizedBox(
                          height: 10.0,
                        ),
                        const Text(
                          'Guest',
                          style: TextStyle(
                              fontSize: 24, fontWeight: FontWeight.bold),
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
                        settingsSection('Settings'),
                      ],
                    ),
                  ),
                ],
              ),
            )));
  }

  Future<void> initialize() async {
    var prefs = await SharedPreferences.getInstance();
    var isSignedUp = prefs.getBool(PrefConstant.isSignedUp) ?? false;

    if (isSignedUp) {
      setState(() {
        isSignup = true;
      });
    } else {
      setState(() {
        isSignup = false;
      });
    }
  }

  @override
  void initState() {
    initialize();
    super.initState();
  }

  Widget profileSection() {
    return Container(
      padding: EdgeInsets.only(top: 10, bottom: 10),
      decoration: const BoxDecoration(
          color: Colors.white,
          borderRadius: BorderRadius.all(Radius.circular(10.0))),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.center,
        children: [
          GestureDetector(
            onTap: () {
              Navigator.push(context, MaterialPageRoute(builder: (context) {
                return SignUpPage();
              }));
            },
            child: settingsSection('Profile'),
          ),
          Divider(
            color: ColorConstants.appBodyColor,
          ),
          settingsSection('Favorite'),
          Divider(
            color: ColorConstants.appBodyColor,
          ),
          settingsSection('For you'),
          Divider(
            color: ColorConstants.appBodyColor,
          ),
          settingsSection('App Tips & Tricks'),
        ],
      ),
    );
  }

  Widget settingsSection(text) {
    return Container(
      decoration: const BoxDecoration(
          color: Colors.white,
          borderRadius: BorderRadius.all(Radius.circular(10.0))),
      child: ListTile(
        leading: CustomUserAvatar(),
        title: Text(
          '$text',
          overflow: TextOverflow.ellipsis,
          style: TextStyle(fontSize: 16),
        ),
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
            onTap: () {
              Navigator.push(context, MaterialPageRoute(builder: (context) {
                return SignUpPage();
              })).then((value) => initialize);
            },
            child: Padding(
              padding: EdgeInsets.only(left: 24, right: 24, bottom: 38),
              child: Container(
                constraints: const BoxConstraints(minWidth: double.infinity),
                decoration: BoxDecoration(
                    color: ColorConstants.appColorBlue,
                    borderRadius: BorderRadius.all(Radius.circular(10.0))),
                child: Tab(
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

  Widget topBar() {
    return Container(
      child: Row(
        crossAxisAlignment: CrossAxisAlignment.center,
        mainAxisAlignment: MainAxisAlignment.center,
        children: [
          profilePic(40, 40, 10, 12, 17.0),
          Spacer(),
          Container(
            padding: const EdgeInsets.all(0.0),
            decoration: const BoxDecoration(
                color: Colors.white,
                shape: BoxShape.rectangle,
                borderRadius: BorderRadius.all(Radius.circular(10.0))),
            child: Stack(
              alignment: AlignmentDirectional.center,
              children: [
                IconButton(
                  iconSize: 30,
                  icon: Icon(
                    Icons.notifications_rounded,
                    color: ColorConstants.appBarTitleColor,
                  ),
                  onPressed: () async {},
                ),
                Positioned(
                    top: 10,
                    right: 14,
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
          )
        ],
      ),
    );
  }
}
