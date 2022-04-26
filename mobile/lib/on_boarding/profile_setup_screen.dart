import 'package:app/constants/config.dart';
import 'package:app/models/user_details.dart';
import 'package:app/screens/home_page.dart';
import 'package:app/services/app_service.dart';
import 'package:app/utils/dialogs.dart';
import 'package:app/utils/extensions.dart';
import 'package:app/widgets/buttons.dart';
import 'package:app/widgets/custom_shimmer.dart';
import 'package:app/widgets/text_fields.dart';
import 'package:auto_size_text/auto_size_text.dart';
import 'package:flutter/material.dart';

import '../models/enum_constants.dart';
import '../themes/light_theme.dart';
import 'notifications_setup_screen.dart';

class ProfileSetupScreen extends StatefulWidget {
  const ProfileSetupScreen({Key? key}) : super(key: key);

  @override
  ProfileSetupScreenState createState() => ProfileSetupScreenState();
}

class ProfileSetupScreenState extends State<ProfileSetupScreen> {
  String _fullName = '';
  DateTime? _exitTime;
  Color nextBtnColor = Config.appColorDisabled;
  bool _isSaving = false;
  bool _showDropDown = false;
  late UserDetails _userDetails = UserDetails.initialize();

  final _formKey = GlobalKey<FormState>();
  final AppService _appService = AppService();
  bool _showOptions = true;
  final TextEditingController _controller = TextEditingController();
  late BuildContext dialogContext;

  @override
  Widget build(BuildContext context) {
    return Scaffold(
        body: WillPopScope(
      onWillPop: onWillPop,
      child: Container(
        padding: const EdgeInsets.only(left: 24, right: 24),
        child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            mainAxisAlignment: MainAxisAlignment.start,
            children: [
              const SizedBox(
                height: 56,
              ),
              Center(
                child: Text(
                  'Great!\nPlease enter your name?',
                  textAlign: TextAlign.center,
                  style: CustomTextStyle.headline7(context),
                ),
              ),
              const SizedBox(
                height: 32,
              ),
              SizedBox(
                height: 48,
                child: Row(
                  children: <Widget>[
                    titleDropdown(),
                    const SizedBox(
                      width: 16,
                    ),
                    Form(
                      key: _formKey,
                      child: Flexible(
                        child: nameInputField(),
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
                child: Container(
                    padding: const EdgeInsets.only(left: 10, right: 10),
                    decoration: BoxDecoration(
                        color: const Color(0xffF4F4F4),
                        borderRadius: BorderRadius.circular(8)),
                    child: Padding(
                      padding: const EdgeInsets.symmetric(
                          vertical: 12, horizontal: 12),
                      child: Column(
                          crossAxisAlignment: CrossAxisAlignment.start,
                          mainAxisAlignment: MainAxisAlignment.start,
                          mainAxisSize: MainAxisSize.max,
                          children: getTitleOptions()),
                    )),
              ),
              const Spacer(),
              GestureDetector(
                onTap: () async {
                  await saveName();
                },
                child: nextButton('Next', nextBtnColor),
              ),
              SizedBox(
                height: _showOptions ? 16 : 12,
              ),
              Visibility(
                visible: _showOptions,
                child: GestureDetector(
                  onTap: () {
                    Navigator.pushAndRemoveUntil(context,
                        MaterialPageRoute(builder: (context) {
                      return const NotificationsSetupScreen();
                    }), (r) => false);
                  },
                  child: Center(
                    child: Text(
                      'No, thanks',
                      textAlign: TextAlign.center,
                      style: Theme.of(context)
                          .textTheme
                          .caption
                          ?.copyWith(color: Config.appColorBlue),
                    ),
                  ),
                ),
              ),
              Visibility(
                visible: _showOptions,
                child: const SizedBox(
                  height: 40,
                ),
              ),
            ]),
      ),
    ));
  }

  void clearNameCallBack() {
    if (_fullName == '') {
      FocusScope.of(context).unfocus();
    }
    setState(() {
      _fullName = '';
      _controller.text = '';
    });
  }

  List<GestureDetector> getTitleOptions() {
    var options = <GestureDetector>[];

    for (var option in TitleOptions.values) {
      options.add(GestureDetector(
        onTap: () {
          updateTitle(option.getValue());
        },
        child: AutoSizeText(
          option.getDisplayName(),
          style: Theme.of(context).textTheme.bodyText1?.copyWith(
              color: _userDetails.title == option.getValue()
                  ? Config.appColorBlack
                  : Config.appColorBlack.withOpacity(0.32)),
        ),
      ));
    }
    return options;
  }

  void initialize() async {
    _userDetails = await _appService.secureStorage.getUserDetails();
  }

  @override
  void initState() {
    super.initState();
    dialogContext = context;
    initialize();
    updateOnBoardingPage();
  }

  Widget nameInputField() {
    return TextFormField(
      controller: _controller,
      onTap: () {
        setState(() {
          _showOptions = false;
        });
      },
      onEditingComplete: () async {
        FocusScope.of(context).requestFocus(FocusNode());
        Future.delayed(const Duration(milliseconds: 250), () {
          setState(() {
            _showOptions = true;
          });
        });
      },
      enableSuggestions: false,
      cursorWidth: 1,
      cursorColor: Config.appColorBlue,
      keyboardType: TextInputType.name,
      onChanged: valueChange,
      validator: (value) {
        if (value == null || value.isEmpty) {
          return 'Please enter your name';
        }
        return null;
      },
      decoration: InputDecoration(
        contentPadding: const EdgeInsets.fromLTRB(16, 12, 0, 12),
        focusedBorder: OutlineInputBorder(
          borderSide: BorderSide(color: Config.appColorBlue, width: 1.0),
          borderRadius: BorderRadius.circular(8.0),
        ),
        enabledBorder: OutlineInputBorder(
          borderSide: BorderSide(color: Config.appColorBlue, width: 1.0),
          borderRadius: BorderRadius.circular(8.0),
        ),
        border: OutlineInputBorder(
            borderSide: BorderSide(color: Config.appColorBlue, width: 1.0),
            borderRadius: BorderRadius.circular(8.0)),
        hintText: 'Enter your name',
        errorStyle: const TextStyle(
          fontSize: 0,
        ),
        suffixIcon: GestureDetector(
          onTap: () {
            _controller.text = '';
            clearNameCallBack();
          },
          child: textInputCloseButton(),
        ),
      ),
    );
  }

  Future<bool> onWillPop() {
    var now = DateTime.now();

    if (_exitTime == null ||
        now.difference(_exitTime!) > const Duration(seconds: 2)) {
      _exitTime = now;

      showSnackBar(context, 'Tap again to exit !');
      return Future.value(false);
    }

    Navigator.pushAndRemoveUntil(context, MaterialPageRoute(builder: (context) {
      return const HomePage();
    }), (r) => false);

    return Future.value(false);
  }

  Future<void> saveName() async {
    try {
      if (_formKey.currentState!.validate() && !_isSaving) {
        FocusScope.of(context).requestFocus(FocusNode());
        Future.delayed(const Duration(milliseconds: 250), () {
          setState(() {
            _showOptions = true;
          });
        });

        setState(() {
          nextBtnColor = Config.appColorDisabled;
          _isSaving = true;
        });
        setState(() {
          _userDetails
            ..firstName = UserDetails.getNames(_fullName).first
            ..lastName = UserDetails.getNames(_fullName).last;
        });

        loadingScreen(dialogContext);
        var success = await _appService.updateProfile(_userDetails, context);
        if (success) {
          Navigator.pop(dialogContext);
          await Navigator.pushAndRemoveUntil(context,
              MaterialPageRoute(builder: (context) {
            return const NotificationsSetupScreen();
          }), (r) => false);
        }
      }
    } on Exception catch (exception, stackTrace) {
      Navigator.pop(dialogContext);
      setState(() {
        nextBtnColor = Config.appColorBlue;
        _isSaving = false;
      });
      await showSnackBar(context, 'Failed to update profile. Try again later');
      debugPrint('$exception\n$stackTrace');
    }
  }

  Widget titleDropdown() {
    return GestureDetector(
      onTap: () {
        setState(() {
          _showDropDown = true;
        });
      },
      child: Container(
          width: 70,
          padding:
              const EdgeInsets.only(left: 10, right: 10, top: 15, bottom: 15),
          decoration: BoxDecoration(
              color: const Color(0xffF4F4F4),
              borderRadius: BorderRadius.circular(8)),
          child: Center(
            child: Row(
              crossAxisAlignment: CrossAxisAlignment.center,
              mainAxisAlignment: MainAxisAlignment.center,
              children: [
                Text('${_userDetails.title.substring(0, 2)}.'),
                const Icon(
                  Icons.keyboard_arrow_down_sharp,
                  color: Colors.black,
                ),
              ],
            ),
          )),
    );
  }

  void updateOnBoardingPage() async {
    await _appService.preferencesHelper
        .updateOnBoardingPage(OnBoardingPage.profile);
  }

  void updateTitle(String text) {
    setState(() {
      _userDetails.title = text;
      _showDropDown = false;
    });
  }

  void valueChange(text) {
    if (text.toString().isEmpty || text.toString() == '') {
      setState(() {
        nextBtnColor = Config.appColorDisabled;
      });
    } else {
      setState(() {
        nextBtnColor = Config.appColorBlue;
      });
    }
    setState(() {
      _fullName = text;
    });
  }
}
