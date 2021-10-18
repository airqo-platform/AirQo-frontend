import 'package:app/models/userDetails.dart';
import 'package:app/services/fb_notifications.dart';
import 'package:app/utils/dialogs.dart';
import 'package:app/widgets/buttons.dart';
import 'package:app/widgets/text_fields.dart';
import 'package:firebase_auth/firebase_auth.dart';
import 'package:flutter/material.dart';
import 'package:flutter/rendering.dart';

import 'notifications_setup_screen.dart';

class ProfileSetupScreen extends StatefulWidget {
  @override
  ProfileSetupScreenState createState() => ProfileSetupScreenState();
}

class ProfileSetupScreenState extends State<ProfileSetupScreen> {
  var fullName = '';
  final _formKey = GlobalKey<FormState>();
  final CustomAuth _customAuth = CustomAuth(FirebaseAuth.instance);
  TextEditingController controller = TextEditingController();

  @override
  Widget build(BuildContext context) {
    return Scaffold(
        resizeToAvoidBottomInset: false,
        body: Container(
          padding: const EdgeInsets.only(left: 24, right: 24),
          child: Center(
            child: Column(
                crossAxisAlignment: CrossAxisAlignment.center,
                children: [
                  const SizedBox(
                    height: 42,
                  ),
                  const Text(
                    'Great!\nWhat’s your name?',
                    textAlign: TextAlign.center,
                    style: TextStyle(
                        fontWeight: FontWeight.bold,
                        fontSize: 24,
                        color: Colors.black),
                  ),
                  const SizedBox(
                    height: 42,
                  ),
                  Container(
                    height: 48,
                    child: Row(
                      children: <Widget>[
                        // titleDropdown(),
                        // const SizedBox(
                        //   width: 16,
                        // ),
                        Form(
                          key: _formKey,
                          child: Flexible(
                            child: nameInputField('Enter your name', 15,
                                valueChange, clearNameCallBack, controller),
                          ),
                        ),
                      ],
                    ),
                  ),
                  const Spacer(),
                  GestureDetector(
                    onTap: () async {
                      if (_formKey.currentState!.validate()) {
                        await saveName();
                      }
                    },
                    child: nextButton('Let’s go'),
                  ),
                  const SizedBox(
                    height: 20,
                  ),
                  signUpOptions(context),
                  const SizedBox(
                    height: 36,
                  ),
                ]),
          ),
        ));
  }

  void clearNameCallBack() {
    setState(() {
      fullName = '';
      controller.text = '';
    });
  }

  Future<void> saveName() async {
    try {
      var userDetails = UserDetails.initialize()
        ..firstName = UserDetails.getNames(fullName).first
        ..lastName = UserDetails.getNames(fullName).last;

      await _customAuth.updateProfile(userDetails).then((value) => {
            Navigator.pushReplacement(context,
                MaterialPageRoute(builder: (context) {
              return NotificationsSetupScreen();
            }))
          });
    } on FirebaseAuthException catch (e) {
      await showSnackBar(context, 'Failed to update profile. Try again later');
      print(e);
    }
  }

  void valueChange(text) {
    setState(() {
      fullName = text;
    });
  }
}
