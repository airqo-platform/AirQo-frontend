import 'dart:async';

import 'package:app/models/models.dart';
import 'package:app/screens/profile/profile_widgets.dart';
import 'package:app/widgets/custom_shimmer.dart';
import 'package:flutter/material.dart';
import 'package:hive_flutter/hive_flutter.dart';
import 'package:image_picker/image_picker.dart';

import '../../services/firebase_service.dart';
import '../../services/hive_service.dart';
import '../../themes/colors.dart';
import '../../utils/exception.dart';
import '../../widgets/custom_widgets.dart';
import '../home_page.dart';

class ProfileEditPage extends StatefulWidget {
  const ProfileEditPage({
    super.key,
  });

  @override
  State<ProfileEditPage> createState() => _ProfileEditPageState();
}

class _ProfileEditPageState extends State<ProfileEditPage> {
  final _formKey = GlobalKey<FormState>();
  String _profilePic = '';
  bool _updateImage = false;
  bool _changedProfile = false;
  late Profile _profile;

  @override
  Widget build(BuildContext context) {
    return ValueListenableBuilder<Box<Profile>>(
      valueListenable: Hive.box<Profile>(HiveBox.profile).listenable(
        keys: [HiveBox.profile],
      ),
      builder: (context, box, widget) {
        if (box.values.isEmpty || !CustomAuth.isLoggedIn()) {
          return const Scaffold(
            appBar: AppTopBar('Profile'),
            body: LoadingWidget(),
          );
        }
        final profile = box.values.toList().cast<Profile>().first;
        _profile = profile;
        _profilePic = profile.photoUrl;

        return Scaffold(
          appBar: EditProfileAppBar(
            updateProfile: _updateProfile,
            hasChangedProfile: _changedProfile,
          ),
          body: Container(
            padding: const EdgeInsets.symmetric(horizontal: 16.0),
            color: CustomColors.appBodyColor,
            child: Form(
              key: _formKey,
              child: ListView(
                physics: const BouncingScrollPhysics(),
                children: <Widget>[
                  const SizedBox(
                    height: 26,
                  ),
                  EditProfilePicSection(
                    profile: profile,
                    getFromGallery: _getImageFromGallery,
                  ),
                  const SizedBox(
                    height: 40,
                  ),
                  Visibility(
                    visible: profile.phoneNumber.isNotEmpty,
                    child: EditCredentialsField(
                      profile: profile,
                      authMethod: AuthMethod.phone,
                    ),
                  ),
                  Visibility(
                    visible: profile.emailAddress.isNotEmpty,
                    child: EditCredentialsField(
                      profile: profile,
                      authMethod: AuthMethod.email,
                    ),
                  ),
                  const SizedBox(
                    height: 16,
                  ),
                  Text(
                    'First Name',
                    style: TextStyle(
                      fontSize: 12,
                      color: CustomColors.inactiveColor,
                    ),
                  ),
                  const SizedBox(
                    height: 4,
                  ),
                  NameEditField(
                    value: profile.firstName,
                    valueChange: _updateFirstName,
                  ),
                  const SizedBox(
                    height: 16,
                  ),
                  Text(
                    'Last Name',
                    style: TextStyle(
                      fontSize: 12,
                      color: CustomColors.inactiveColor,
                    ),
                  ),
                  const SizedBox(
                    height: 4,
                  ),
                  NameEditField(
                    value: profile.lastName,
                    valueChange: _updateLastName,
                  ),
                ],
              ),
            ),
          ),
        );
      },
    );
  }

  void _updateFirstName(String value) {
    setState(() {
      _profile.firstName = value;
      _changedProfile = true;
    });
  }

  void _updateLastName(String value) {
    setState(() {
      _profile.lastName = value;
      _changedProfile = true;
    });
  }

  Future<void> _updateProfile() async {
    if (_formKey.currentState!.validate()) {
      final dialogContext = context;
      loadingScreen(dialogContext);
      await Future.wait(
        [
          _profile.update(),
          _uploadPicture(),
        ],
      ).then(
        (value) => {
          Navigator.pop(dialogContext),
          Navigator.pushAndRemoveUntil(
            context,
            MaterialPageRoute(
              builder: (context) {
                return const HomePage();
              },
            ),
            (r) => false,
          ),
        },
      );
    }
  }

  Future<void> _uploadPicture() async {
    if (_updateImage) {
      try {
        final imageUrl = await CloudStore.uploadProfilePicture(_profilePic);

        if (imageUrl.isNotEmpty) {
          _profile.photoUrl = imageUrl;
          await Future.wait(
            [
              CloudAnalytics.logEvent(
                AnalyticsEvent.uploadProfilePicture,
              ),
              _profile.update(),
            ],
          );
        }
      } catch (exception, stackTrace) {
        await logException(
          exception,
          stackTrace,
        );
      }
    }
  }

  void _getImageFromGallery() async {
    final pickedFile = await ImagePicker().pickImage(
      source: ImageSource.gallery,
      maxWidth: 1800,
      maxHeight: 1800,
    );
    if (pickedFile != null) {
      setState(
        () {
          _profile.photoUrl = pickedFile.path;
          _profilePic = pickedFile.path;
          _updateImage = true;
          _changedProfile = true;
        },
      );
    }
  }
}
