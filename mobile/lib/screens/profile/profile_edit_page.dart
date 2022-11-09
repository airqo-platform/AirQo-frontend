import 'package:app/blocs/blocs.dart';
import 'package:app/models/models.dart';
import 'package:app/services/services.dart';
import 'package:app/themes/theme.dart';
import 'package:app/widgets/widgets.dart';
import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:flutter_bloc/flutter_bloc.dart';
import 'package:image_picker/image_picker.dart';

import 'profile_widgets.dart';

class ProfileEditPage extends StatefulWidget {
  const ProfileEditPage({
    super.key,
  });

  @override
  State<ProfileEditPage> createState() => _ProfileEditPageState();
}

class _ProfileEditPageState extends State<ProfileEditPage> {
  late BuildContext _loadingContext;

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: const EditProfileAppBar(),
      body: BlocConsumer<AccountBloc, AccountState>(
        builder: (context, state) {
          var profile = state.profile;
          if (profile == null) {
            context.read<AccountBloc>().add(const LoadAccountInfo());
            return const LoadingWidget();
          }
          return Container(
            padding: const EdgeInsets.symmetric(horizontal: 16.0),
            color: CustomColors.appBodyColor,
            child: ListView(
              physics: const BouncingScrollPhysics(),
              children: <Widget>[
                MultiBlocListener(listeners: [
                  BlocListener<AccountBloc, AccountState>(
                      listenWhen: (previous, current) {
                    return current.blocError != AuthenticationError.none &&
                        current.blocStatus == BlocStatus.error;
                  }, listener: (context, state) {
                    showSnackBar(context, state.blocError.message);
                  }),
                  BlocListener<AccountBloc, AccountState>(
                      listenWhen: (previous, current) {
                    return current.blocStatus == BlocStatus.processing;
                  }, listener: (context, state) {
                    loadingScreen(_loadingContext);
                  }),
                  BlocListener<AccountBloc, AccountState>(
                      listenWhen: (previous, current) {
                    return previous.blocStatus == BlocStatus.processing;
                  }, listener: (context, state) {
                    Navigator.pop(_loadingContext);
                  }),
                ], child: Container()),
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
                  valueChange: (firstName) {
                    context
                        .read<AccountBloc>()
                        .add(EditProfile(firstName: firstName));
                  },
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
                  valueChange: (lastName) {
                    context
                        .read<AccountBloc>()
                        .add(EditProfile(lastName: lastName));
                  },
                ),
              ],
            ),
          );
        },
        listener: (context, state) {
          return;
        },
      ),
    );
  }

  @override
  void initState() {
    super.initState();
    _loadingContext = context;
  } // @override

  void _getImageFromGallery() async {
    await ImagePicker()
        .pickImage(
      source: ImageSource.gallery,
      maxWidth: 1800,
      maxHeight: 1800,
    )
        .then((file) {
      if (file != null) {
        context.read<AccountBloc>().add(EditProfile(photoUrl: file.path));
      }
    }).catchError((error) async {
      if (error is PlatformException) {
        await PermissionService.checkPermission(
          AppPermission.photosStorage,
          request: true,
        );
      }
    });
  }
}
