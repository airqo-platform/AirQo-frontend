import 'dart:async';
import 'dart:convert';
import 'dart:io';

import 'package:app/constants/app_constants.dart';
import 'package:app/models/user_details.dart';
import 'package:app/screens/credentials_screen.dart';
import 'package:app/services/fb_notifications.dart';
import 'package:app/services/local_storage.dart';
import 'package:app/services/rest_api.dart';
import 'package:app/utils/dialogs.dart';
import 'package:app/widgets/custom_widgets.dart';
import 'package:cached_network_image/cached_network_image.dart';
import 'package:camera/camera.dart';
import 'package:flutter/material.dart';
import 'package:flutter_svg/svg.dart';
import 'package:image_picker/image_picker.dart';
import 'package:mime/mime.dart';

class ViewProfilePage extends StatefulWidget {
  final UserDetails userDetails;

  const ViewProfilePage(this.userDetails, {Key? key}) : super(key: key);

  @override
  _ViewProfilePageState createState() => _ViewProfilePageState();
}

class _ViewProfilePageState extends State<ViewProfilePage> {
  final _formKey = GlobalKey<FormState>();
  bool updating = false;
  final CustomAuth _customAuth = CustomAuth();
  final ImagePicker _imagePicker = ImagePicker();
  AirqoApiClient? _airqoApiClient;
  String profilePic = '';
  TextEditingController phoneEditor = TextEditingController();
  bool changeImage = false;
  final SecureStorageHelper _secureStorageHelper = SecureStorageHelper();

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
                      child: SizedBox(
                        height: 40,
                        width: 40,
                        child: Text(
                          'Save',
                          style: TextStyle(color: ColorConstants.inactiveColor),
                        ),
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
                //   initialValue: widget.userDetails.emailAddress,
                //   readOnly: true,
                //   decoration: profileFormFieldDecoration(),
                // ),
                // const SizedBox(
                //   height: 16,
                // ),
                Text(
                  'First Name',
                  style: TextStyle(
                      fontSize: 12, color: ColorConstants.inactiveColor),
                ),
                const SizedBox(
                  height: 4,
                ),
                TextFormField(
                  initialValue: widget.userDetails.firstName,
                  autofocus: true,
                  enableSuggestions: false,
                  cursorWidth: 1,
                  cursorColor: ColorConstants.appColorBlue,
                  keyboardType: TextInputType.name,
                  decoration: profileFormFieldDecoration(),
                  onChanged: (text) {
                    widget.userDetails.firstName = text;
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
                  initialValue: widget.userDetails.lastName,
                  autofocus: true,
                  enableSuggestions: false,
                  cursorWidth: 1,
                  cursorColor: ColorConstants.appColorBlue,
                  keyboardType: TextInputType.name,
                  decoration: profileFormFieldDecoration(),
                  onChanged: (text) {
                    widget.userDetails.lastName = text;
                  },
                  validator: (value) {
                    if (value == null || value.isEmpty) {
                      return 'Please enter your last name';
                    }
                    return null;
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
                SizedBox(
                  width: MediaQuery.of(context).size.width,
                  child: Row(
                    children: <Widget>[
                      Expanded(
                        child: TextFormField(
                          controller: phoneEditor,
                          enableSuggestions: false,
                          readOnly: true,
                          style: TextStyle(color: ColorConstants.inactiveColor),
                          decoration: profileFormInactiveFieldDecoration(),
                        ),
                      ),
                      const SizedBox(
                        width: 16,
                      ),
                      GestureDetector(
                        onTap: () async {
                          var response = await Navigator.push(context,
                              MaterialPageRoute(builder: (context) {
                            return const UpdateCredentialsScreen('phone');
                          }));
                          if (response) {
                            await initialize();
                          }
                        },
                        child: editCredentialsButton(),
                      )
                    ],
                  ),
                ),

                const SizedBox(
                  height: 16,
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
        widget.userDetails.photoUrl = pickedFile.path;
      });
    }
  }

  Future<void> initialize() async {
    await _secureStorageHelper.getUserDetails().then((value) => {
          setState(() {
            phoneEditor.text = value.phoneNumber;
          })
        });
  }

  @override
  void initState() {
    setState(() {
      profilePic = widget.userDetails.photoUrl;
      phoneEditor.text = widget.userDetails.phoneNumber;
    });
    _airqoApiClient = AirqoApiClient(context);
    super.initState();
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
            profilePic == ''
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
                : profilePic.startsWith('http')
                    ? CircleAvatar(
                        radius: 44,
                        backgroundColor: ColorConstants.appPicColor,
                        foregroundColor: ColorConstants.appPicColor,
                        backgroundImage: CachedNetworkImageProvider(
                          profilePic,
                        ),
                      )
                    : CircleAvatar(
                        radius: 44,
                        backgroundColor: ColorConstants.appPicColor,
                        foregroundColor: ColorConstants.appPicColor,
                        backgroundImage: FileImage(File(profilePic)),
                      ),
            if (profilePic == '')
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
        widget.userDetails.photoUrl = image.path;
      });
    } catch (e) {
      debugPrint(e.toString());
    }
  }

  Future<void> updateProfile() async {
    if (_formKey.currentState!.validate() && !updating) {
      await showSnackBar(context, 'Updating profile');
      setState(() {
        updating = true;
      });
      await _customAuth.updateProfile(widget.userDetails).then((value) => {
            uploadPicture().then((_) => {
                  updating = false,
                  showSnackBar(context, 'Profile updated'),
                  Navigator.pop(context, true)
                })
          });
    }
  }

  Future<void> uploadCompeteHandler(value) async {
    setState(() {
      updating = false;
    });

    await showSnackBar(context, 'complete');
  }

  FutureOr<String> uploadFailureHandler(var error) async {
    setState(() {
      updating = false;
    });
    await showSnackBar(context, 'Profile Picture update failed, try again');
    await showSnackBar(context, 'failed');
    return '';
  }

  Future<void> uploadPicture() async {
    if (!changeImage) {
      return;
    }

    try {
      var mimeType = lookupMimeType(profilePic);

      mimeType ??= 'jpeg';

      var imageBytes = await File(profilePic).readAsBytes();

      var imageUrl = await _airqoApiClient!.imageUpload(
          base64Encode(imageBytes), mimeType, widget.userDetails.userId);

      widget.userDetails.photoUrl = imageUrl;

      await _customAuth.updateProfile(widget.userDetails);
    } catch (e) {
      debugPrint(e.toString());
    }
  }

  Future<void> uploadSuccessHandler(var value) async {
    setState(() {
      updating = false;
    });

    widget.userDetails.photoUrl = value;
    await _customAuth.updateProfile(widget.userDetails);
    await showSnackBar(context, 'success');
  }

  void _getFromGallery() async {
    var pickedFile = await _imagePicker.pickImage(
      source: ImageSource.gallery,
      maxWidth: 1800,
      maxHeight: 1800,
    );
    if (pickedFile != null) {
      setState(() {
        profilePic = pickedFile.path;
        changeImage = true;
      });
    }
  }
}
