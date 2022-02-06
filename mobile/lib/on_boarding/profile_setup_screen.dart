import 'package:app/constants/config.dart';
import 'package:app/models/user_details.dart';
import 'package:app/screens/home_page.dart';
import 'package:app/services/app_service.dart';
import 'package:app/utils/dialogs.dart';
import 'package:app/widgets/buttons.dart';
import 'package:app/widgets/custom_shimmer.dart';
import 'package:app/widgets/text_fields.dart';
import 'package:firebase_auth/firebase_auth.dart';
import 'package:flutter/material.dart';

import 'notifications_setup_screen.dart';

class ProfileSetupScreen extends StatefulWidget {
  final bool enableBackButton;

  const ProfileSetupScreen(this.enableBackButton, {Key? key}) : super(key: key);

  @override
  ProfileSetupScreenState createState() => ProfileSetupScreenState();
}

class ProfileSetupScreenState extends State<ProfileSetupScreen> {
  String _fullName = '';
  DateTime? _exitTime;
  Color nextBtnColor = Config.appColorDisabled;
  bool _isSaving = false;
  bool _nameFormValid = false;
  bool _showDropDown = false;
  late UserDetails _userDetails = UserDetails.initialize();

  final _formKey = GlobalKey<FormState>();
  late AppService _appService;
  final TextEditingController _controller = TextEditingController();
  final List<String> _titleOptions = ['Ms.', 'Mr.', 'Rather Not Say'];

  @override
  Widget build(BuildContext context) {
    return Scaffold(
        resizeToAvoidBottomInset: false,
        body: WillPopScope(
          onWillPop: onWillPop,
          child: Container(
            padding: const EdgeInsets.only(left: 24, right: 24),
            child: Center(
              child: Column(
                  crossAxisAlignment: CrossAxisAlignment.center,
                  children: [
                    const SizedBox(
                      height: 42,
                    ),
                    const Text(
                      'Great!\nPlease enter your name?',
                      textAlign: TextAlign.center,
                      style: TextStyle(
                          fontWeight: FontWeight.bold,
                          fontSize: 24,
                          color: Colors.black),
                    ),
                    const SizedBox(
                      height: 42,
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
                      child: Row(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          titleDropdownList(),
                        ],
                      ),
                    ),
                    const Spacer(),
                    GestureDetector(
                      onTap: () async {
                        if (_formKey.currentState!.validate()) {
                          await saveName();
                        }
                      },
                      child: nextButton('Let’s go', nextBtnColor),
                    ),
                    const SizedBox(
                      height: 20,
                    ),
                    GestureDetector(
                      onTap: () {
                        Navigator.pushAndRemoveUntil(context,
                            MaterialPageRoute(builder: (context) {
                          return NotificationsSetupScreen(
                              widget.enableBackButton);
                        }), (r) => false);
                      },
                      child: Text(
                        'Remind me later',
                        textAlign: TextAlign.center,
                        style: TextStyle(
                            fontSize: 14,
                            fontWeight: FontWeight.bold,
                            color: Config.appColorBlue),
                      ),
                    ),
                    const SizedBox(
                      height: 36,
                    ),
                  ]),
            ),
          ),
        ));
  }

  void clearNameCallBack() {
    setState(() {
      _fullName = '';
      _controller.text = '';
    });
  }

  void initialize() async {
    _userDetails = await _appService.secureStorage.getUserDetails();
  }

  @override
  void initState() {
    super.initState();
    _appService = AppService(context);
    initialize();
    updateOnBoardingPage();
  }

  Widget nameInputField() {
    return Container(
        alignment: Alignment.center,
        padding: const EdgeInsets.only(left: 15),
        decoration: BoxDecoration(
            borderRadius: const BorderRadius.all(Radius.circular(8.0)),
            border: Border.all(color: Config.appColorBlue)),
        child: Center(
            child: TextFormField(
          controller: _controller,
          autofocus: true,
          enableSuggestions: false,
          cursorWidth: 1,
          cursorColor: Config.appColorBlue,
          keyboardType: TextInputType.name,
          onChanged: valueChange,
          validator: (value) {
            if (value == null || value.isEmpty) {
              showSnackBar(context, 'Please enter your name');
              setState(() {
                _nameFormValid = false;
              });
            } else if (value.length > 15) {
              showSnackBar(context, 'Maximum number of characters is 15');
              setState(() {
                _nameFormValid = false;
              });
            } else {
              setState(() {
                _nameFormValid = true;
              });
            }

            return null;
          },
          decoration: InputDecoration(
            focusedBorder: InputBorder.none,
            enabledBorder: InputBorder.none,
            hintText: 'Enter your name',
            suffixIcon: GestureDetector(
              onTap: () {
                _controller.text = '';
                clearNameCallBack();
              },
              child: textInputCloseButton(),
            ),
          ),
        )));
  }

  Future<bool> onWillPop() {
    var now = DateTime.now();

    if (_exitTime == null ||
        now.difference(_exitTime!) > const Duration(seconds: 2)) {
      _exitTime = now;

      showSnackBar(context, 'Tap again to exit !');
      return Future.value(false);
    }

    if (widget.enableBackButton) {
      Navigator.pushAndRemoveUntil(context,
          MaterialPageRoute(builder: (context) {
        return const HomePage();
      }), (r) => false);
    }

    return Future.value(true);
  }

  Future<void> saveName() async {
    try {
      if (_nameFormValid && !_isSaving) {
        setState(() {
          nextBtnColor = Config.appColorDisabled;
          _isSaving = true;
        });
        setState(() {
          _userDetails
            ..firstName = UserDetails.getNames(_fullName).first
            ..lastName = UserDetails.getNames(_fullName).last;
        });

        var dialogContext = context;
        loadingScreen(dialogContext);
        await _appService.updateProfile(_userDetails).then((value) => {
              Navigator.pop(dialogContext),
              Navigator.pushAndRemoveUntil(context,
                  MaterialPageRoute(builder: (context) {
                return NotificationsSetupScreen(widget.enableBackButton);
              }), (r) => false)
            });
      }
    } on FirebaseAuthException catch (exception, stackTrace) {
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

  Widget titleDropdownList() {
    return Container(
        width: 140,
        height: 100,
        padding: const EdgeInsets.only(left: 10, right: 10),
        decoration: BoxDecoration(
            color: const Color(0xffF4F4F4),
            borderRadius: BorderRadius.circular(8)),
        child: MediaQuery.removePadding(
            context: context,
            removeTop: true,
            child: ListView.builder(
              itemBuilder: (BuildContext context, int index) {
                return GestureDetector(
                  onTap: () {
                    updateTitle(_titleOptions[index]);
                  },
                  child: Padding(
                    padding: const EdgeInsets.only(top: 8, left: 12),
                    child: Text(
                      _titleOptions[index],
                      style: TextStyle(
                          fontSize: 14,
                          color: _userDetails.title == _titleOptions[index]
                              ? Config.appColorBlack
                              : Config.appColorBlack.withOpacity(0.32)),
                    ),
                  ),
                );
              },
              itemCount: _titleOptions.length,
            )));
  }

  Widget titleDropdownV1() {
    return Container(
        width: 70,
        padding: const EdgeInsets.only(left: 10, right: 10),
        decoration: BoxDecoration(
            color: Config.greyColor.withOpacity(0.2),
            borderRadius: BorderRadius.circular(10)),
        child: Center(
          child: DropdownButton<String>(
            value: 'Ms.',
            icon: const Icon(
              Icons.keyboard_arrow_down_sharp,
              color: Colors.black,
            ),
            iconSize: 10,
            dropdownColor: Config.greyColor.withOpacity(0.2),
            elevation: 0,
            underline: const Visibility(visible: false, child: SizedBox()),
            style: const TextStyle(color: Colors.black),
            onChanged: (String? newValue) {},
            borderRadius: BorderRadius.circular(10.0),
            items: <String>['Ms.', 'Mr.', 'Ra']
                .map<DropdownMenuItem<String>>((String value) {
              return DropdownMenuItem<String>(
                value: value,
                child: Text(
                  value,
                  overflow: TextOverflow.ellipsis,
                  maxLines: 3,
                  style: const TextStyle(fontSize: 14),
                ),
              );
            }).toList(),
          ),
        ));
  }

  void updateOnBoardingPage() async {
    await _appService.preferencesHelper.updateOnBoardingPage('profile');
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
