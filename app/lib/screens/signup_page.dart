import 'package:app/constants/app_constants.dart';
import 'package:app/models/userDetails.dart';
import 'package:app/services/local_storage.dart';
import 'package:app/utils/dialogs.dart';
import 'package:app/widgets/custom_widgets.dart';
import 'package:app/widgets/text_fields.dart';
import 'package:flutter/material.dart';
import 'package:shared_preferences/shared_preferences.dart';

import 'maps_view.dart';

class SignUpPage extends StatefulWidget {
  UserDetails userDetails;

  SignUpPage(this.userDetails, {Key? key}) : super(key: key);

  @override
  _SignUpPageState createState() => _SignUpPageState(this.userDetails);
}

class _SignUpPageState extends State<SignUpPage> {
  final _formKey = GlobalKey<FormState>();
  UserDetails userDetails;

  _SignUpPageState(this.userDetails);

  @override
  Widget build(BuildContext context) {
    return Scaffold(
        body: Container(
      padding: const EdgeInsets.only(left: 16.0, right: 16.0, top: 40),
      color: ColorConstants.appBodyColor,
      child: Column(
        mainAxisSize: MainAxisSize.min,
        crossAxisAlignment: CrossAxisAlignment.start,
        children: <Widget>[
          Expanded(
              child: Form(
            key: _formKey,
            child: ListView(
              shrinkWrap: true,
              children: <Widget>[
                Row(
                  children: [
                    backButton(context),
                    const Spacer(),
                    GestureDetector(
                      onTap: signUp,
                      child: Text(
                        'Save',
                        style: TextStyle(color: ColorConstants.inactiveColor),
                      ),
                    )
                  ],
                ),
                profilePicRow(),
                const SizedBox(
                  height: 40,
                ),

                Text(
                  'Email',
                  style: TextStyle(
                      fontSize: 12, color: ColorConstants.inactiveColor),
                ),
                const SizedBox(
                  height: 4,
                ),
                TextFormField(
                  initialValue: userDetails.emailAddress,
                  autofocus: true,
                  enableSuggestions: false,
                  cursorWidth: 1,
                  cursorColor: ColorConstants.appColorBlue,
                  keyboardType: TextInputType.emailAddress,
                  decoration: formFieldsDecoration(),
                  onChanged: (text) {
                    userDetails.emailAddress = text;
                    userDetails.id = text;
                  },
                  validator: (value) {
                    if (value == null || value.isEmpty) {
                      return 'Please enter your email address';
                    }
                    return value.isValidEmail()
                        ? null
                        : 'Please enter a'
                            ' valid email address';
                  },
                ),
                const SizedBox(
                  height: 16,
                ),

                Text(
                  'Phone Number',
                  style: TextStyle(
                      fontSize: 12, color: ColorConstants.inactiveColor),
                ),
                const SizedBox(
                  height: 4,
                ),
                TextFormField(
                  initialValue: userDetails.phoneNumber,
                  autofocus: true,
                  enableSuggestions: false,
                  cursorWidth: 1,
                  cursorColor: ColorConstants.appColorBlue,
                  keyboardType: TextInputType.phone,
                  decoration: formFieldsDecoration(),
                  onChanged: (text) {
                    userDetails.phoneNumber = text;
                  },
                  validator: (value) {
                    if (value == null || value.isEmpty) {
                      return 'Please enter your phone Number';
                    }
                    return null;
                  },
                ),
                const SizedBox(
                  height: 16,
                ),

                Text(
                  'First Name',
                  style: TextStyle(
                      fontSize: 12, color: ColorConstants.inactiveColor),
                ),
                const SizedBox(
                  height: 4,
                ),
                TextFormField(
                  initialValue: userDetails.firstName,
                  autofocus: true,
                  enableSuggestions: false,
                  cursorWidth: 1,
                  cursorColor: ColorConstants.appColorBlue,
                  keyboardType: TextInputType.name,
                  decoration: formFieldsDecoration(),
                  onChanged: (text) {
                    userDetails.firstName = text;
                  },
                  validator: (value) {
                    if (value == null || value.isEmpty) {
                      return 'Please enter your first name';
                    }
                    return null;
                  },
                ),
                const SizedBox(
                  height: 16,
                ),

                Text(
                  'Last Name',
                  style: TextStyle(
                      fontSize: 12, color: ColorConstants.inactiveColor),
                ),
                const SizedBox(
                  height: 4,
                ),
                TextFormField(
                  initialValue: userDetails.lastName,
                  autofocus: true,
                  enableSuggestions: false,
                  cursorWidth: 1,
                  cursorColor: ColorConstants.appColorBlue,
                  keyboardType: TextInputType.name,
                  decoration: formFieldsDecoration(),
                  onChanged: (text) {
                    userDetails.lastName = text;
                  },
                  validator: (value) {
                    if (value == null || value.isEmpty) {
                      return 'Please enter your last name';
                    }
                    return null;
                  },
                ),
                // SizedBox(height: 16,),
                // settingsSection(),
              ],
            ),
          )),
        ],
      ),
    ));
  }

  InputDecoration formFieldsDecoration() {
    return InputDecoration(
      filled: true,
      fillColor: Colors.white,
      hintText: '-',
      focusedBorder: OutlineInputBorder(
        borderSide: const BorderSide(color: Colors.transparent, width: 1.0),
        borderRadius: BorderRadius.circular(10.0),
      ),
      enabledBorder: OutlineInputBorder(
        borderSide: const BorderSide(color: Colors.transparent, width: 1.0),
        borderRadius: BorderRadius.circular(10.0),
      ),
      suffixIcon: Icon(
        Icons.edit,
        size: 20.0,
        color: ColorConstants.appColorBlue,
      ),
    );
  }

  Future<void> getProfile() async {
    await DBHelper().getUserData().then((value) => {
          if (value != null)
            {
              setState(() {
                userDetails = value;
              })
            }
        });
  }

  Future<void> initialize() async {
    await getProfile();
  }

  @override
  void initState() {
    initialize();
    super.initState();
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
    if (_formKey.currentState!.validate()) {
      await DBHelper().saveUserData(userDetails).then((value) => {
            if (value)
              {
                showSnackBar(context, 'Profile updated')
                    .then((value) => {Navigator.pop(context, true)})
              }
            else
              {
                showSnackBar(
                    context, 'Failed to save profile, Try again later...')
              }
          });
      // var prefs = await SharedPreferences.getInstance();
      // await prefs.setBool(PrefConstant.isSignedUp, false);
      // Navigator.pop(context);
    }
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

extension EmailValidator on String {
  bool isValidEmail() {
    return RegExp(
            r'^(([^<>()[\]\\.,;:\s@\"]+(\.[^<>()[\]\\.,;:\s@\"]+)*)|(\".+\"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$')
        .hasMatch(this);
  }
}
