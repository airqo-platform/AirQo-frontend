import 'package:app/blocs/blocs.dart';
import 'package:app/models/models.dart';
import 'package:app/screens/home_page.dart';
import 'package:app/services/services.dart';
import 'package:app/themes/theme.dart';
import 'package:app/utils/utils.dart';
import 'package:app/widgets/widgets.dart';
import 'package:flutter/material.dart';
import 'package:flutter_bloc/flutter_bloc.dart';

import 'notifications_setup_screen.dart';
import 'on_boarding_widgets.dart';
import 'package:flutter_gen/gen_l10n/app_localizations.dart';

class ProfileSetupScreen extends StatefulWidget {
  const ProfileSetupScreen({super.key});

  @override
  ProfileSetupScreenState createState() => ProfileSetupScreenState();
}

class ProfileSetupScreenState extends State<ProfileSetupScreen> {
  DateTime? _exitTime;

  final _formKey = GlobalKey<FormState>();
  final TextEditingController _controller = TextEditingController();
  bool _keyboardVisible = false;

  @override
  Widget build(BuildContext context) {
    _keyboardVisible = MediaQuery.of(context).viewInsets.bottom != 0;

    return Scaffold(
      backgroundColor: Colors.white,
      appBar: const OnBoardingTopBar(),
      body: WillPopScope(
        onWillPop: onWillPop,
        child: AppSafeArea(
          backgroundColor: Colors.white,
          horizontalPadding: 24,
          verticalPadding: 10,
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.center,
            mainAxisAlignment: MainAxisAlignment.center,
            children: [
              Text(
              AppLocalizations.of(context)!.greatPleaseEnterYourName,
                textAlign: TextAlign.center,
                style: CustomTextStyle.headline7(context),
              ),
              const SizedBox(
                height: 32,
              ),
              SizedBox(
                height: 48,
                child: Row(
                  children: <Widget>[
                    const TitleDropDown(),
                    const SizedBox(
                      width: 8,
                    ),
                    Form(
                      key: _formKey,
                      child: Expanded(
                        child: ProfileSetupNameInputField(
                          controller: _controller,
                        ),
                      ),
                    ),
                  ],
                ),
              ),
              const Spacer(),
              BlocBuilder<ProfileBloc, Profile>(
                builder: (context, profile) {
                  return NextButton(
                    buttonColor: profile.fullName().isEmpty
                        ? CustomColors.appColorDisabled
                        : CustomColors.appColorBlue,
                    callBack: () async {
                      if (profile.fullName().isNotEmpty) {
                        await _saveName();
                      }
                    },
                  );
                },
              ),
              Visibility(
                visible: !_keyboardVisible,
                child: const SkipOnboardScreen(NotificationsSetupScreen()),
              ),
            ],
          ),
        ),
      ),
    );
  }

  @override
  void initState() {
    super.initState();
    updateOnBoardingPage();
  }

  Future<bool> onWillPop() {
    final now = DateTime.now();

    if (_exitTime == null ||
        now.difference(_exitTime!) > const Duration(seconds: 2)) {
      _exitTime = now;

      showSnackBar(
        context,
        AppLocalizations.of(context)!.tapAgainToExit,
      );

      return Future.value(false);
    }

    Navigator.pushAndRemoveUntil(
      context,
      MaterialPageRoute(builder: (context) {
        return const HomePage();
      }),
      (r) => false,
    );

    return Future.value(false);
  }

  Future<void> _saveName() async {
    if (_formKey.currentState!.validate()) {
      Profile profile = context.read<ProfileBloc>().state;
      context.read<ProfileBloc>().add(UpdateProfile(profile));
      FocusScope.of(context).requestFocus(FocusNode());
      await Navigator.pushAndRemoveUntil(
        context,
        MaterialPageRoute(builder: (context) {
          return const NotificationsSetupScreen();
        }),
        (r) => true,
      );
    }
  }

  void updateOnBoardingPage() async {
    await SharedPreferencesHelper.updateOnBoardingPage(OnBoardingPage.profile);
  }
}
