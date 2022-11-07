import 'package:app/models/models.dart';
import 'package:app/screens/home_page.dart';
import 'package:app/services/services.dart';
import 'package:app/themes/theme.dart';
import 'package:app/utils/utils.dart';
import 'package:app/widgets/widgets.dart';
import 'package:auto_size_text/auto_size_text.dart';
import 'package:flutter/material.dart';

import 'notifications_setup_screen.dart';
import 'on_boarding_widgets.dart';

class ProfileSetupScreen extends StatefulWidget {
  const ProfileSetupScreen({
    super.key,
  });

  @override
  ProfileSetupScreenState createState() => ProfileSetupScreenState();
}

class ProfileSetupScreenState extends State<ProfileSetupScreen> {
  String _fullName = '';
  DateTime? _exitTime;
  Color nextBtnColor = CustomColors.appColorDisabled;
  bool _showDropDown = false;

  final _formKey = GlobalKey<FormState>();
  bool _showOptions = true;
  final TextEditingController _controller = TextEditingController();

  TitleOptions _title = TitleOptions.ms;

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: const OnBoardingTopBar(),
      body: WillPopScope(
        onWillPop: onWillPop,
        child: AppSafeArea(
          horizontalPadding: 24,
          widget: Column(
            crossAxisAlignment: CrossAxisAlignment.center,
            mainAxisAlignment: MainAxisAlignment.center,
            children: [
              Text(
                'Great!\nPlease enter your name?',
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
                    TitleDropDown(
                      showTileOptionsCallBack: _showTileOptionsCallBack,
                      title: _title,
                    ),
                    const SizedBox(
                      width: 16,
                    ),
                    Form(
                      key: _formKey,
                      child: Flexible(
                        child: ProfileSetupNameInputField(
                          showTileOptionsCallBack: _showTileOptionsCallBack,
                          nameChangeCallBack: _nameChangeCallBack,
                          controller: _controller,
                        ),
                      ),
                    ),
                  ],
                ),
              ),
              const SizedBox(
                height: 8,
              ),
              Visibility(
                visible: _showDropDown,
                child: Row(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  mainAxisAlignment: MainAxisAlignment.start,
                  children: [
                    Container(
                      padding: const EdgeInsets.symmetric(horizontal: 10),
                      decoration: BoxDecoration(
                        color: const Color(0xffF4F4F4),
                        borderRadius: BorderRadius.circular(8),
                      ),
                      child: Padding(
                        padding: const EdgeInsets.all(12),
                        child: Column(
                          crossAxisAlignment: CrossAxisAlignment.start,
                          mainAxisAlignment: MainAxisAlignment.start,
                          mainAxisSize: MainAxisSize.max,
                          children: _getTitleOptions(),
                        ),
                      ),
                    ),
                  ],
                ),
              ),
              const Spacer(),
              GestureDetector(
                onTap: () async {
                  await _saveName();
                },
                child: NextButton(
                  buttonColor: nextBtnColor,
                ),
              ),
              SizedBox(
                height: _showOptions ? 16 : 12,
              ),
              Visibility(
                visible: _showOptions,
                child: GestureDetector(
                  onTap: () {
                    Navigator.pushAndRemoveUntil(
                      context,
                      MaterialPageRoute(builder: (context) {
                        return const NotificationsSetupScreen();
                      }),
                      (r) => false,
                    );
                  },
                  child: Text(
                    'No, thanks',
                    textAlign: TextAlign.center,
                    style: Theme.of(context).textTheme.caption?.copyWith(
                          color: CustomColors.appColorBlue,
                        ),
                  ),
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }

  List<GestureDetector> _getTitleOptions() {
    final options = <GestureDetector>[];

    for (final option in TitleOptions.values) {
      options.add(
        GestureDetector(
          onTap: () {
            _updateTitleCallback(option);
          },
          child: AutoSizeText(
            option.displayValue,
            style: Theme.of(context).textTheme.bodyText1?.copyWith(
                  color: _title.displayValue == option.value
                      ? CustomColors.appColorBlack
                      : CustomColors.appColorBlack.withOpacity(0.32),
                ),
          ),
        ),
      );
    }

    return options;
  }

  @override
  void initState() {
    super.initState();
    updateOnBoardingPage();
  }

  void _showTileOptionsCallBack(bool showTitleOptions) {
    setState(() => _showOptions = showTitleOptions);
    setState(() => _showDropDown = showTitleOptions);
  }

  void _nameChangeCallBack(String name) {
    if (name.toString().isEmpty || name.toString() == '') {
      if (_fullName == '') {
        FocusScope.of(context).unfocus();
      }
      setState(
        () {
          _fullName = '';
          _controller.text = '';
          nextBtnColor = CustomColors.appColorDisabled;
          _controller.text = '';
        },
      );
    } else {
      setState(
        () {
          nextBtnColor = CustomColors.appColorBlue;
          _fullName = name;
        },
      );
    }
  }

  Future<bool> onWillPop() {
    final now = DateTime.now();

    if (_exitTime == null ||
        now.difference(_exitTime!) > const Duration(seconds: 2)) {
      _exitTime = now;

      showSnackBar(
        context,
        'Tap again to exit !',
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
    try {
      if (_formKey.currentState!.validate()) {
        loadingScreen(context);

        FocusScope.of(context).requestFocus(
          FocusNode(),
        );
        Future.delayed(
          const Duration(milliseconds: 250),
          () {
            setState(() => _showOptions = true);
          },
        );

        setState(() => nextBtnColor = CustomColors.appColorDisabled);

        final profile = await Profile.getProfile();
        await profile.updateName(_fullName);

        Navigator.pop(context);
        await Navigator.pushAndRemoveUntil(
          context,
          MaterialPageRoute(builder: (context) {
            return const NotificationsSetupScreen();
          }),
          (r) => false,
        );
      }
    } on Exception catch (exception, stackTrace) {
      Navigator.pop(context);
      setState(
        () {
          nextBtnColor = CustomColors.appColorBlue;
        },
      );
      showSnackBar(
        context,
        'Failed to update profile. Try again later',
      );
      await logException(
        exception,
        stackTrace,
      );
    }
  }

  void updateOnBoardingPage() async {
    await SharedPreferencesHelper.updateOnBoardingPage(OnBoardingPage.profile);
  }

  void _updateTitleCallback(TitleOptions title) {
    setState(
      () {
        _title = title;
        _showDropDown = false;
      },
    );
  }
}
