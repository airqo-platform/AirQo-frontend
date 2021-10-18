import 'dart:async';
import 'dart:convert';
import 'dart:io';

import 'package:app/constants/app_constants.dart';
import 'package:app/models/userDetails.dart';
import 'package:app/services/local_storage.dart';
import 'package:app/services/rest_api.dart';
import 'package:app/utils/dialogs.dart';
import 'package:app/widgets/custom_widgets.dart';
import 'package:camera/camera.dart';
import 'package:flutter/material.dart';
import 'package:image_picker/image_picker.dart';
import 'package:mime/mime.dart';

import 'maps_view.dart';

class SignUpPage extends StatefulWidget {
  SignUpPage({Key? key}) : super(key: key);

  @override
  _SignUpPageState createState() => _SignUpPageState();
}

class _SignUpPageState extends State<SignUpPage> {
  final _formKey = GlobalKey<FormState>();
  UserDetails userDetails = UserDetails.initialize();
  bool isUploading = false;

  _SignUpPageState();

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
    super.initState();
    initialize();
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
          Padding(
            padding: const EdgeInsets.only(left: 24, right: 24, bottom: 38),
            child: Container(
              constraints: const BoxConstraints(minWidth: double.infinity),
              decoration: BoxDecoration(
                  color: ColorConstants.appColorBlue,
                  borderRadius: const BorderRadius.all(Radius.circular(10.0))),
              child: const Tab(
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

  Future<void> uploadCompeteHandler() async {
    setState(() {
      isUploading = false;
    });
    await showSnackBar(context, 'Upload complete, thank you for sharing');

    Navigator.pop(context);
  }

  FutureOr<String> uploadFailureHandler(var error) async {
    setState(() {
      isUploading = false;
    });
    await showSnackBar(context, 'Upload failed, try again');
    return '';
  }

  Future<void> uploadPicture() async {
    setState(() {
      isUploading = true;
    });

    if (userDetails.photoUrl == '') {
      return;
    }
    var mimeType = lookupMimeType(userDetails.photoUrl);

    mimeType ??= 'jpeg';

    await File(userDetails.photoUrl).readAsBytes().then((value) => {
          AirqoApiClient(context)
              .imageUpload(base64Encode(value), mimeType, '')
              .whenComplete(() => {uploadCompeteHandler()})
              .catchError(uploadFailureHandler)
              .then((value) => uploadSuccessHandler)
        });
  }

  Future<void> uploadSuccessHandler(var value) async {
    setState(() {
      isUploading = false;
    });
    await showSnackBar(context, 'Upload complete, thank you for sharing');

    Navigator.pop(context);
  }

  /// Get from Camera
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
