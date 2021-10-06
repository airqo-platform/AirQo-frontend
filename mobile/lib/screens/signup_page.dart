import 'package:app/constants/app_constants.dart';
import 'package:app/widgets/custom_widgets.dart';
import 'package:flutter/material.dart';
import 'package:shared_preferences/shared_preferences.dart';

import 'maps_view.dart';

class SignUpPage extends StatefulWidget {
  const SignUpPage({Key? key}) : super(key: key);

  @override
  _SignUpPageState createState() => _SignUpPageState();
}

class _SignUpPageState extends State<SignUpPage> {
  @override
  Widget build(BuildContext context) {
    return Scaffold(
        body: Container(
      padding: EdgeInsets.only(left: 16.0, right: 16.0, top: 40),
      color: ColorConstants.appBodyColor,
      child: Column(
        mainAxisSize: MainAxisSize.min,
        crossAxisAlignment: CrossAxisAlignment.start,
        children: <Widget>[
          Expanded(
            child: ListView(
              shrinkWrap: true,
              children: <Widget>[
                Row(
                  children: [
                    backButton(context),
                    Spacer(),
                    GestureDetector(
                      onTap: signUp,
                      child: Text(
                        'Save',
                        style: TextStyle(color: ColorConstants.inactiveColor),
                      ),
                    )
                  ],
                ),
                profilePic(),
                SizedBox(
                  height: 40,
                ),
                Text(
                  'Email',
                  style: TextStyle(
                      fontSize: 12, color: ColorConstants.inactiveColor),
                ),
                SizedBox(
                  height: 4,
                ),
                customInputField(context, 'nagawa.greta@gmail.com'),

                SizedBox(
                  height: 16,
                ),
                Text(
                  'Phone Number',
                  style: TextStyle(
                      fontSize: 12, color: ColorConstants.inactiveColor),
                ),
                SizedBox(
                  height: 4,
                ),
                customInputField(context, '-'),

                SizedBox(
                  height: 16,
                ),
                Text(
                  'First Name',
                  style: TextStyle(
                      fontSize: 12, color: ColorConstants.inactiveColor),
                ),
                SizedBox(
                  height: 4,
                ),
                customInputField(context, 'Greta'),

                SizedBox(
                  height: 16,
                ),
                Text(
                  'Last Name',
                  style: TextStyle(
                      fontSize: 12, color: ColorConstants.inactiveColor),
                ),
                SizedBox(
                  height: 4,
                ),
                customInputField(context, 'Nagawa'),

                // SizedBox(height: 16,),
                // settingsSection(),
              ],
            ),
          ),
        ],
      ),
    ));
  }

  Future<void> initialize() async {}

  @override
  void initState() {
    // initialize();
    super.initState();
  }

  Widget profilePic() {
    return Row(
      crossAxisAlignment: CrossAxisAlignment.center,
      mainAxisAlignment: MainAxisAlignment.center,
      children: [
        Stack(
          alignment: AlignmentDirectional.center,
          children: [
            RotationTransition(
              turns: AlwaysStoppedAnimation(-5 / 360),
              child: Container(
                padding: EdgeInsets.all(2.0),
                decoration: BoxDecoration(
                    color: ColorConstants.appPicColor,
                    shape: BoxShape.rectangle,
                    borderRadius: BorderRadius.all(Radius.circular(20.0))),
                child: IconButton(
                  iconSize: 35,
                  icon: Icon(
                    Icons.search,
                    color: Colors.transparent,
                  ),
                  onPressed: () async {},
                ),
              ),
            ),
            Text(
              'NG',
              style: TextStyle(
                  fontWeight: FontWeight.bold,
                  color: Colors.white,
                  fontSize: 20),
            )
            // Positioned(
            //     child: Text('hi'))
          ],
        ),
      ],
    );
  }

  Widget settingsSection() {
    return Container(
      decoration: const BoxDecoration(
          color: Colors.white,
          borderRadius: BorderRadius.all(Radius.circular(10.0))),
      child: ListTile(
        leading: CustomUserAvatar(),
        title: const Text(
          'Settings',
          overflow: TextOverflow.ellipsis,
          style: TextStyle(fontSize: 16),
        ),
      ),
    );
  }

  Future<void> signUp() async {
    var prefs = await SharedPreferences.getInstance();
    await prefs.setBool(PrefConstant.isSignedUp, true);
    Navigator.pop(context);
  }

  Widget signupSection() {
    return Container(
      decoration: const BoxDecoration(
          color: Colors.white,
          borderRadius: BorderRadius.all(Radius.circular(10.0))),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.center,
        children: [
          Padding(
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
          Padding(
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
          SizedBox(
            height: 16,
          ),
          Padding(
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
        ],
      ),
    );
  }

  Widget tabs() {
    return Row(
      mainAxisAlignment: MainAxisAlignment.spaceEvenly,
      children: [
        Container(
          padding: EdgeInsets.all(8.0),
          decoration: BoxDecoration(
              color: Colors.white,
              borderRadius: BorderRadius.all(Radius.circular(5.0))),
          child: Row(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Text(
                  'Your Inflated tires could lead air pollution lead air pollution lead air pollution',
                  maxLines: 2,
                  overflow: TextOverflow.ellipsis,
                  style: TextStyle(
                    fontSize: 14,
                    fontWeight: FontWeight.bold,
                  ))
            ],
          ),
        ),
        SizedBox(
          width: 16,
        ),
        OutlinedButton(onPressed: () {}, child: Text('Favourite')),
      ],
    );
  }

  Widget topTabs() {
    return Row(
      mainAxisAlignment: MainAxisAlignment.spaceEvenly,
      children: [
        OutlinedButton(onPressed: () {}, child: Text('Favourite')),
        SizedBox(
          width: 16,
        ),
        OutlinedButton(onPressed: () {}, child: Text('Favourite')),
      ],
    );
  }
}
