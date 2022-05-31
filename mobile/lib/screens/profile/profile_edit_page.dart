import 'dart:async';

import 'package:app/constants/config.dart';
import 'package:app/models/profile.dart';
import 'package:app/screens/profile/profile_widgets.dart';
import 'package:app/widgets/custom_shimmer.dart';
import 'package:flutter/material.dart';
import 'package:image_picker/image_picker.dart';

import '../../models/enum_constants.dart';
import '../../services/firebase_service.dart';
import '../../utils/exception.dart';
import '../auth/change_email_screen.dart';
import '../auth/change_phone_screen.dart';
import '../auth/email_reauthenticate_screen.dart';
import '../auth/phone_reauthenticate_screen.dart';
import '../home_page.dart';

class ProfileEditPage extends StatefulWidget {
  const ProfileEditPage({Key? key}) : super(key: key);

  @override
  _ProfileEditPageState createState() => _ProfileEditPageState();
}

class _ProfileEditPageState extends State<ProfileEditPage> {
  final _formKey = GlobalKey<FormState>();
  final ImagePicker _imagePicker = ImagePicker();
  bool _profileReady = false;
  String _profilePic = '';
  final TextEditingController _phoneEditor = TextEditingController();
  final TextEditingController _emailEditor = TextEditingController();
  bool changeImage = false;
  late Profile _profile;

  @override
  Widget build(BuildContext context) {
    if (!_profileReady) {
      return const LoadingWidget();
    }
    return Scaffold(
        appBar: EditProfileAppBar(
          updateProfile: _updateProfile,
        ),
        body: Container(
          padding: const EdgeInsets.only(left: 16.0, right: 16.0),
          color: Config.appBodyColor,
          child: Form(
            key: _formKey,
            child: ListView(
              physics: const BouncingScrollPhysics(),
              children: <Widget>[
                const SizedBox(
                  height: 26,
                ),
                EditProfilePicSection(
                  profile: _profile,
                  getFromGallery: _getFromGallery,
                ),
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
                NameEditField(
                  value: _profile.firstName,
                  valueChange: (String value) {
                    _profile.firstName = value;
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
                NameEditField(
                  value: _profile.lastName,
                  valueChange: (String value) {
                    _profile.lastName = value;
                  },
                ),
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
                            decoration: inactiveFormFieldDecoration(),
                          ),
                        ),
                        const SizedBox(
                          width: 16,
                        ),
                        GestureDetector(
                          onTap: () async {
                            var authResponse = await Navigator.push(context,
                                MaterialPageRoute(builder: (context) {
                              return PhoneReAuthenticateScreen(_profile);
                            }));
                            if (!authResponse) {
                              return;
                            }
                            var changeResponse = await Navigator.push(context,
                                MaterialPageRoute(builder: (context) {
                              return const ChangePhoneScreen();
                            }));

                            if (changeResponse) {
                              await _initialize();
                            }
                          },
                          child: const EditCredentialsIcon(),
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
                            decoration: inactiveFormFieldDecoration(),
                          ),
                        ),
                        const SizedBox(
                          width: 16,
                        ),
                        GestureDetector(
                          onTap: () async {
                            var authResponse = await Navigator.push(context,
                                MaterialPageRoute(builder: (context) {
                              return EmailReAuthenticateScreen(_profile);
                            }));
                            if (!authResponse) {
                              return;
                            }
                            var changeResponse = await Navigator.push(context,
                                MaterialPageRoute(builder: (context) {
                              return const ChangeEmailScreen();
                            }));

                            if (changeResponse) {
                              await _initialize();
                            }
                          },
                          child: const EditCredentialsIcon(),
                        )
                      ],
                    ),
                  ),
                ),
              ],
            ),
          ),
        ));
  }

  void getFromCamera() async {
    var pickedFile = await _imagePicker.pickImage(
      source: ImageSource.camera,
      maxWidth: 1800,
      maxHeight: 1800,
    );
    if (pickedFile != null) {
      setState(() => _profile.photoUrl = pickedFile.path);
    }
  }

  Future<void> _initialize() async {
    await Profile.getProfile().then((value) => {
          setState(() {
            _profile = value;
            _phoneEditor.text = value.phoneNumber;
            _emailEditor.text = value.emailAddress;
            _profilePic = value.photoUrl;
            _profileReady = true;
          }),
        });
  }

  @override
  void initState() {
    super.initState();
    _initialize();
  }

  Future<void> _updateProfile() async {
    if (_formKey.currentState!.validate()) {
      var dialogContext = context;
      loadingScreen(dialogContext);
      await Future.wait([_profile.saveProfile(), _uploadPicture()])
          .then((value) => {
                Navigator.pop(dialogContext),
                Navigator.pushAndRemoveUntil(context,
                    MaterialPageRoute(builder: (context) {
                  return const HomePage();
                }), (r) => false)
              });
    }
  }

  Future<void> _uploadPicture() async {
    if (changeImage) {
      try {
        var imageUrl = await CloudStore.uploadProfilePicture(_profilePic);

        if (imageUrl.isNotEmpty) {
          _profile.photoUrl = imageUrl;
          await Future.wait([
            CloudAnalytics.logEvent(AnalyticsEvent.uploadProfilePicture),
            _profile.saveProfile()
          ]);
        }
      } catch (exception, stackTrace) {
        await logException(exception, stackTrace);
      }
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
        _profile.photoUrl = pickedFile.path;
        _profilePic = pickedFile.path;
        changeImage = true;
      });
    }
  }
}
