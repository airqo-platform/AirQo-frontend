import 'dart:io';

import 'package:app/constants/app_constants.dart';
import 'package:app/models/userDetails.dart';
import 'package:app/services/fb_notifications.dart';
import 'package:app/utils/dialogs.dart';
import 'package:app/widgets/custom_widgets.dart';
import 'package:camera/camera.dart';
import 'package:firebase_auth/firebase_auth.dart';
import 'package:flutter/material.dart';
import 'package:image_picker/image_picker.dart';

class ViewProfilePage extends StatefulWidget {
  UserDetails userDetails;

  ViewProfilePage(this.userDetails, {Key? key}) : super(key: key);

  @override
  _ViewProfilePageState createState() => _ViewProfilePageState(userDetails);
}

class _ViewProfilePageState extends State<ViewProfilePage> {
  final _formKey = GlobalKey<FormState>();
  UserDetails userDetails;
  bool updating = false;
  final CustomAuth _customAuth = CustomAuth(FirebaseAuth.instance);

  _ViewProfilePageState(this.userDetails);

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
                      onTap: updateProfile,
                      child: Text(
                        'Save',
                        style: TextStyle(color: ColorConstants.inactiveColor),
                      ),
                    )
                  ],
                ),
                profilePicSection(),
                const SizedBox(
                  height: 40,
                ),

                // Text(
                //   'Email',
                //   style: TextStyle(
                //       fontSize: 12, color: ColorConstants.inactiveColor),
                // ),
                // const SizedBox(
                //   height: 4,
                // ),
                // TextFormField(
                //   initialValue: userDetails.emailAddress,
                //   autofocus: true,
                //   enableSuggestions: false,
                //   cursorWidth: 1,
                //   cursorColor: ColorConstants.appColorBlue,
                //   keyboardType: TextInputType.emailAddress,
                //   decoration: formFieldsDecoration(),
                //   onChanged: (text) {
                //     userDetails.emailAddress = text;
                //     userDetails.userId = text;
                //   },
                //   validator: (value) {
                //     if (value == null || value.isEmpty) {
                //       return 'Please enter your email address';
                //     }
                //     return value.isValidEmail()
                //         ? null
                //         : 'Please enter a'
                //             ' valid email address';
                //   },
                // ),
                // const SizedBox(
                //   height: 16,
                // ),

                // Text(
                //   'Phone Number',
                //   style: TextStyle(
                //       fontSize: 12, color: ColorConstants.inactiveColor),
                // ),
                // const SizedBox(
                //   height: 4,
                // ),
                // TextFormField(
                //   initialValue: userDetails.phoneNumber,
                //   autofocus: true,
                //   enableSuggestions: false,
                //   cursorWidth: 1,
                //   cursorColor: ColorConstants.appColorBlue,
                //   keyboardType: TextInputType.phone,
                //   decoration: formFieldsDecoration(),
                //   onChanged: (text) {
                //     userDetails.phoneNumber = text;
                //   },
                //   validator: (value) {
                //     if (value == null || value.isEmpty) {
                //       return 'Please enter your phone Number';
                //     }
                //     return null;
                //   },
                // ),
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

  Widget profilePicSection() {
    return Row(
      crossAxisAlignment: CrossAxisAlignment.center,
      mainAxisAlignment: MainAxisAlignment.center,
      children: [
        Stack(
          alignment: AlignmentDirectional.center,
          children: [
            userDetails.photoUrl == ''
                ? RotationTransition(
                    turns: const AlwaysStoppedAnimation(-5 / 360),
                    child: Container(
                      padding: const EdgeInsets.all(2.0),
                      decoration: BoxDecoration(
                          color: ColorConstants.appPicColor,
                          shape: BoxShape.rectangle,
                          borderRadius:
                              const BorderRadius.all(Radius.circular(35.0))),
                      child: Container(
                        height: 88,
                        width: 88,
                        color: Colors.transparent,
                      ),
                    ),
                  )
                : CircleAvatar(
                    radius: 44,
                    backgroundColor: ColorConstants.appPicColor,
                    foregroundColor: ColorConstants.appPicColor,
                    backgroundImage: FileImage(File(userDetails.photoUrl)),
                  ),
            if (userDetails.photoUrl == '')
              const Text(
                'A',
                style: TextStyle(
                    fontWeight: FontWeight.bold,
                    color: Colors.white,
                    fontSize: 30),
              ),
            Positioned(
                bottom: 0,
                right: 0,
                child: GestureDetector(
                  onTap: _getFromGallery,
                  child: Container(
                    padding: const EdgeInsets.all(2.0),
                    decoration: BoxDecoration(
                      border: Border.all(color: Colors.white),
                      color: ColorConstants.appColorBlue,
                      shape: BoxShape.circle,
                    ),
                    child: const Icon(
                      Icons.add,
                      size: 22,
                      color: Colors.white,
                    ),
                    // child: const FaIcon(
                    //   FontAwesomeIcons.plus,
                    //   size: 18,
                    //   color: Colors.white,
                    // ),
                  ),
                )),
          ],
        ),
      ],
    );
  }

  Future<void> takePhoto() async {
    // Obtain a list of the available cameras on the phone.
    final cameras = await availableCameras();

    // Get a specific camera from the list of available cameras.
    if (cameras.isEmpty) {
      await showSnackBar(context, 'Could not open camera');
      return;
    }

    var camera = cameras.first;
    var _controller = CameraController(
      camera,
      ResolutionPreset.high,
    );

    try {
      await _controller.initialize();

      final image = await _controller.takePicture();

      setState(() {
        userDetails.photoUrl = image.path;
      });
      print(image.path);
    } catch (e) {
      print(e);
    }
  }

  Future<void> updateProfile() async {
    if (_formKey.currentState!.validate() && !updating) {
      await showSnackBar(context, 'Updating profile');
      await _customAuth.updateProfile(userDetails).then((value) => {
            showSnackBar(context, 'Profile updated'),
            Navigator.pop(context, true)
          });
    }
  }

  void _getFromCamera() async {
    var pickedFile = await ImagePicker().getImage(
      source: ImageSource.camera,
      maxWidth: 1800,
      maxHeight: 1800,
    );
    if (pickedFile != null) {
      setState(() {
        userDetails.photoUrl = pickedFile.path;
      });
    }
  }

  void _getFromGallery() async {
    var pickedFile = await ImagePicker().getImage(
      source: ImageSource.gallery,
      maxWidth: 1800,
      maxHeight: 1800,
    );
    if (pickedFile != null) {
      setState(() {
        userDetails.photoUrl = pickedFile.path;
      });
    }
  }
}

extension EmailValidator on String {
  bool isValidEmail() {
    return RegExp(
            r'^(([^<>()[\]\\.,;:\s@\"]+(\.[^<>()[\]\\.,;:\s@\"]+)*)|(\".+\"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$')
        .hasMatch(this);
  }
}
