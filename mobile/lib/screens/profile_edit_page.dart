import 'dart:async';
import 'dart:io';

import 'package:app/constants/config.dart';
import 'package:app/models/user_details.dart';
import 'package:app/screens/email_reauthenticate_screen.dart';
import 'package:app/screens/phone_reauthenticate_screen.dart';
import 'package:app/services/firebase_service.dart';
import 'package:app/services/secure_storage.dart';
import 'package:app/widgets/custom_shimmer.dart';
import 'package:app/widgets/custom_widgets.dart';
import 'package:cached_network_image/cached_network_image.dart';
import 'package:flutter/material.dart';
import 'package:flutter_svg/svg.dart';
import 'package:image_picker/image_picker.dart';

import 'change_email_screen.dart';
import 'change_phone_screen.dart';
import 'home_page.dart';

class ProfileEditPage extends StatefulWidget {
  final UserDetails userDetails;

  const ProfileEditPage(this.userDetails, {Key? key}) : super(key: key);

  @override
  _ProfileEditPageState createState() => _ProfileEditPageState();
}

class _ProfileEditPageState extends State<ProfileEditPage> {
  final _formKey = GlobalKey<FormState>();
  bool updating = false;
  final CustomAuth _customAuth = CustomAuth();
  final CloudStore _cloudStore = CloudStore();
  final ImagePicker _imagePicker = ImagePicker();

  String _profilePic = '';
  final TextEditingController _phoneEditor = TextEditingController();
  final TextEditingController _emailEditor = TextEditingController();
  bool changeImage = false;
  final SecureStorage _secureStorage = SecureStorage();
  UserDetails? userDetails;

  @override
  Widget build(BuildContext context) {
    return Scaffold(
        body: Container(
      padding: const EdgeInsets.only(left: 16.0, right: 16.0, top: 40),
      color: Config.appBodyColor,
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
                      child: SizedBox(
                        height: 40,
                        width: 40,
                        child: Text(
                          'Save',
                          style: TextStyle(color: Config.inactiveColor),
                        ),
                      ),
                    )
                  ],
                ),
                profilePicSection(),
                const SizedBox(
                  height: 40,
                ),
                Text(
                  'First Name',
                  style: TextStyle(fontSize: 12, color: Config.inactiveColor),
                ),
                const SizedBox(
                  height: 4,
                ),
                TextFormField(
                  initialValue: widget.userDetails.firstName,
                  autofocus: true,
                  enableSuggestions: false,
                  cursorWidth: 1,
                  cursorColor: Config.appColorBlue,
                  keyboardType: TextInputType.name,
                  decoration: profileFormFieldDecoration(),
                  onChanged: (text) {
                    userDetails!.firstName = text;
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
                  style: TextStyle(fontSize: 12, color: Config.inactiveColor),
                ),
                const SizedBox(
                  height: 4,
                ),
                TextFormField(
                  initialValue: userDetails!.lastName,
                  autofocus: true,
                  enableSuggestions: false,
                  cursorWidth: 1,
                  cursorColor: Config.appColorBlue,
                  keyboardType: TextInputType.name,
                  decoration: profileFormFieldDecoration(),
                  onChanged: (text) {
                    userDetails!.lastName = text;
                  },
                  validator: (value) {
                    if (value == null || value.isEmpty) {
                      return 'Please enter your last name';
                    }
                    return null;
                  },
                ),
                // const SizedBox(
                //   height: 16,
                // ),
                // Text(
                //   'Phone Number',
                //   style: TextStyle(
                //       fontSize: 12, color: Config.inactiveColor),
                // ),
                // const SizedBox(
                //   height: 4,
                // ),

                Visibility(
                  visible: _phoneEditor.text.isNotEmpty,
                  child: const SizedBox(
                    height: 16,
                  ),
                ),
                Visibility(
                  visible: _phoneEditor.text.isNotEmpty,
                  child: Text(
                    'Phone Number',
                    style: TextStyle(fontSize: 12, color: Config.inactiveColor),
                  ),
                ),
                Visibility(
                  visible: _phoneEditor.text.isNotEmpty,
                  child: const SizedBox(
                    height: 4,
                  ),
                ),
                Visibility(
                  visible: _phoneEditor.text.isNotEmpty,
                  child: SizedBox(
                    width: MediaQuery.of(context).size.width,
                    child: Row(
                      children: <Widget>[
                        Expanded(
                          child: TextFormField(
                            controller: _phoneEditor,
                            enableSuggestions: false,
                            readOnly: true,
                            style: TextStyle(color: Config.inactiveColor),
                            decoration: profileFormInactiveFieldDecoration(),
                          ),
                        ),
                        const SizedBox(
                          width: 16,
                        ),
                        GestureDetector(
                          onTap: () async {
                            var authResponse = await Navigator.push(context,
                                MaterialPageRoute(builder: (context) {
                              return PhoneReAuthenticateScreen(userDetails!);
                            }));
                            if (!authResponse) {
                              return;
                            }
                            var changeResponse = await Navigator.push(context,
                                MaterialPageRoute(builder: (context) {
                              return const ChangePhoneScreen();
                            }));

                            if (changeResponse) {
                              await initialize();
                            }
                          },
                          child: editCredentialsButton(),
                        )
                      ],
                    ),
                  ),
                ),

                Visibility(
                  visible: _emailEditor.text.isNotEmpty,
                  child: const SizedBox(
                    height: 16,
                  ),
                ),
                Visibility(
                  visible: _emailEditor.text.isNotEmpty,
                  child: Text(
                    'Email',
                    style: TextStyle(fontSize: 12, color: Config.inactiveColor),
                  ),
                ),
                Visibility(
                  visible: _emailEditor.text.isNotEmpty,
                  child: const SizedBox(
                    height: 4,
                  ),
                ),
                Visibility(
                  visible: _emailEditor.text.isNotEmpty,
                  child: SizedBox(
                    width: MediaQuery.of(context).size.width,
                    child: Row(
                      children: <Widget>[
                        Expanded(
                          child: TextFormField(
                            controller: _emailEditor,
                            enableSuggestions: false,
                            readOnly: true,
                            style: TextStyle(color: Config.inactiveColor),
                            decoration: profileFormInactiveFieldDecoration(),
                          ),
                        ),
                        const SizedBox(
                          width: 16,
                        ),
                        GestureDetector(
                          onTap: () async {
                            var authResponse = await Navigator.push(context,
                                MaterialPageRoute(builder: (context) {
                              return EmailReAuthenticateScreen(userDetails!);
                            }));
                            if (!authResponse) {
                              return;
                            }
                            var changeResponse = await Navigator.push(context,
                                MaterialPageRoute(builder: (context) {
                              return const ChangeEmailScreen();
                            }));

                            if (changeResponse) {
                              await initialize();
                            }
                          },
                          child: editCredentialsButton(),
                        )
                      ],
                    ),
                  ),
                ),
                const SizedBox(
                  height: 16,
                ),
              ],
            ),
          )),
        ],
      ),
    ));
  }

  Widget editCredentialsButton() {
    return Center(
      child: SvgPicture.asset(
        'assets/icon/profile_edit.svg',
        height: 27,
        width: 27,
      ),
    );
  }

  void getFromCamera() async {
    var pickedFile = await _imagePicker.pickImage(
      source: ImageSource.camera,
      maxWidth: 1800,
      maxHeight: 1800,
    );
    if (pickedFile != null) {
      setState(() {
        userDetails!.photoUrl = pickedFile.path;
      });
    }
  }

  Future<void> initialize() async {
    await _secureStorage.getUserDetails().then((value) => {
          setState(() {
            _phoneEditor.text = value.phoneNumber;
            _emailEditor.text = value.emailAddress;
            _profilePic = value.photoUrl;
          })
        });
  }

  @override
  void initState() {
    super.initState();
    setState(() {
      userDetails = widget.userDetails;
      _phoneEditor.text = widget.userDetails.phoneNumber;
      _emailEditor.text = widget.userDetails.emailAddress;
    });
  }

  InputDecoration profileFormFieldDecoration() {
    return InputDecoration(
      filled: true,
      fillColor: Colors.white,
      hintText: '-',
      focusedBorder: OutlineInputBorder(
        borderSide: const BorderSide(color: Colors.transparent, width: 1.0),
        borderRadius: BorderRadius.circular(8.0),
      ),
      enabledBorder: OutlineInputBorder(
        borderSide: const BorderSide(color: Colors.transparent, width: 1.0),
        borderRadius: BorderRadius.circular(8.0),
      ),
      suffixIcon: Container(
        padding: const EdgeInsets.all(10),
        height: 20,
        width: 20,
        child: SvgPicture.asset(
          'assets/icon/profile_edit.svg',
        ),
      ),
    );
  }

  InputDecoration profileFormInactiveFieldDecoration() {
    return InputDecoration(
      filled: true,
      fillColor: Colors.white,
      hintText: '-',
      focusedBorder: OutlineInputBorder(
        borderSide: const BorderSide(color: Colors.transparent, width: 1.0),
        borderRadius: BorderRadius.circular(8.0),
      ),
      enabledBorder: OutlineInputBorder(
        borderSide: const BorderSide(color: Colors.transparent, width: 1.0),
        borderRadius: BorderRadius.circular(8.0),
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
            userDetails!.photoUrl == ''
                ? RotationTransition(
                    turns: const AlwaysStoppedAnimation(-5 / 360),
                    child: Container(
                      padding: const EdgeInsets.all(2.0),
                      decoration: BoxDecoration(
                          color: Config.appPicColor,
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
                : userDetails!.photoUrl.startsWith('http')
                    ? CircleAvatar(
                        radius: 44,
                        backgroundColor: Config.appPicColor,
                        foregroundColor: Config.appPicColor,
                        backgroundImage: CachedNetworkImageProvider(
                          userDetails!.photoUrl,
                        ),
                      )
                    : CircleAvatar(
                        radius: 44,
                        backgroundColor: Config.appPicColor,
                        foregroundColor: Config.appPicColor,
                        backgroundImage: FileImage(File(userDetails!.photoUrl)),
                      ),
            if (userDetails!.photoUrl == '')
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
                      color: Config.appColorBlue,
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

  Future<void> updateProfile() async {
    if (_formKey.currentState!.validate() && !updating) {
      var dialogContext = context;
      loadingScreen(dialogContext);

      setState(() {
        updating = true;
      });
      await _customAuth.updateProfile(userDetails!).then((value) => {
            uploadPicture().then((_) => {
                  Navigator.pop(dialogContext),
                  updating = false,
                  Navigator.pushAndRemoveUntil(context,
                      MaterialPageRoute(builder: (context) {
                    return const HomePage();
                  }), (r) => false)
                })
          });
    }
  }

  Future<void> uploadPicture() async {
    if (!changeImage) {
      return;
    }

    try {
      // var imageBytes = await File(userDetails!.photoUrl).readAsBytes();
      //
      // var imageUrl = await _airqoApiClient!
      //     .imageUpload(base64Encode(imageBytes),
      //     mimeType, userDetails!.userId);

      var imageUrl = await _cloudStore.uploadProfilePicture(
          _profilePic, _customAuth.getUserId());

      if (imageUrl != null) {
        userDetails!.photoUrl = imageUrl;
        await _customAuth.updateProfile(userDetails!);
      }
    } catch (exception, stackTrace) {
      debugPrint('$exception\n$stackTrace');
    }
  }

  void _getFromGallery() async {
    var pickedFile = await _imagePicker.pickImage(
      source: ImageSource.gallery,
      maxWidth: 1800,
      maxHeight: 1800,
    );
    if (pickedFile != null) {
      setState(() {
        userDetails!.photoUrl = pickedFile.path;
        _profilePic = pickedFile.path;
        changeImage = true;
      });
    }
  }
}
