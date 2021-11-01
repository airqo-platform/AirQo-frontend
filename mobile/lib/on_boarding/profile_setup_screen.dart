import 'package:app/constants/app_constants.dart';
import 'package:app/models/userDetails.dart';
import 'package:app/screens/home_page.dart';
import 'package:app/services/fb_notifications.dart';
import 'package:app/utils/dialogs.dart';
import 'package:app/widgets/buttons.dart';
import 'package:app/widgets/text_fields.dart';
import 'package:firebase_auth/firebase_auth.dart';
import 'package:flutter/material.dart';
import 'package:flutter/rendering.dart';

import 'notifications_setup_screen.dart';

class ProfileSetupScreen extends StatefulWidget {
  bool enableBackButton;

  ProfileSetupScreen(this.enableBackButton);

  @override
  ProfileSetupScreenState createState() => ProfileSetupScreenState();
}

class ProfileSetupScreenState extends State<ProfileSetupScreen> {
  var fullName = '';
  final _formKey = GlobalKey<FormState>();
  final CustomAuth _customAuth = CustomAuth();
  TextEditingController controller = TextEditingController();
  DateTime? exitTime;
  Color nextBtnColor = ColorConstants.appColorDisabled;
  bool isSaving = false;
  bool nameFormValid = false;
  bool showDropDown = false;
  String title = 'Ms.';
  List<String> titleOptions = ['Ms.', 'Mr.', 'Rather Not Say'];

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
                      'Great!\nWhat’s your name?',
                      textAlign: TextAlign.center,
                      style: TextStyle(
                          fontWeight: FontWeight.bold,
                          fontSize: 24,
                          color: Colors.black),
                    ),
                    const SizedBox(
                      height: 42,
                    ),
                    Container(
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
                      visible: showDropDown,
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
                            color: ColorConstants.appColorBlue),
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
      fullName = '';
      controller.text = '';
    });
  }

  Widget nameInputField() {
    return Container(
        alignment: Alignment.center,
        padding: const EdgeInsets.only(left: 15),
        decoration: BoxDecoration(
            borderRadius: const BorderRadius.all(Radius.circular(8.0)),
            border: Border.all(color: ColorConstants.appColorBlue)),
        child: Center(
            child: TextFormField(
          controller: controller,
          autofocus: true,
          enableSuggestions: false,
          cursorWidth: 1,
          cursorColor: ColorConstants.appColorBlue,
          keyboardType: TextInputType.name,
          onChanged: valueChange,
          validator: (value) {
            if (value == null || value.isEmpty) {
              showSnackBar(context, 'Please enter your name');
              setState(() {
                nameFormValid = false;
              });
            } else if (value.length > 15) {
              showSnackBar(context, 'Maximum number of characters is 15');
              setState(() {
                nameFormValid = false;
              });
            } else {
              setState(() {
                nameFormValid = true;
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
                  controller.text = '';
                },
                child: GestureDetector(
                  onTap: clearNameCallBack,
                  child: textInputCloseButton(),
                )),
          ),
        )));
  }

  Future<bool> onWillPop() {
    var now = DateTime.now();

    if (exitTime == null ||
        now.difference(exitTime!) > const Duration(seconds: 2)) {
      exitTime = now;

      showSnackBar(context, 'Tap again to exit !');
      return Future.value(false);
    }

    if (widget.enableBackButton) {
      Navigator.pushAndRemoveUntil(context,
          MaterialPageRoute(builder: (context) {
        return HomePage();
      }), (r) => false);
    }

    return Future.value(true);
  }

  Future<void> saveName() async {
    try {
      if (nameFormValid && !isSaving) {
        setState(() {
          nextBtnColor = ColorConstants.appColorDisabled;
          isSaving = true;
        });
        var userDetails = UserDetails.initialize()
          ..title = title
          ..firstName = UserDetails.getNames(fullName).first
          ..lastName = UserDetails.getNames(fullName).last;

        await _customAuth.updateProfile(userDetails).then((value) => {
              Navigator.pushAndRemoveUntil(context,
                  MaterialPageRoute(builder: (context) {
                return NotificationsSetupScreen(widget.enableBackButton);
              }), (r) => false)
            });
      }
    } on FirebaseAuthException catch (e) {
      setState(() {
        nextBtnColor = ColorConstants.appColorBlue;
        isSaving = false;
      });
      await showSnackBar(context, 'Failed to update profile. Try again later');
      print(e);
    }
  }

  Widget titleDropdown() {
    return GestureDetector(
      onTap: () {
        setState(() {
          showDropDown = true;
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
                Text('${title.substring(0, 2)}.'),
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
                    updateTitle(titleOptions[index]);
                  },
                  child: Padding(
                    padding: const EdgeInsets.only(top: 8, left: 12),
                    child: Text(
                      '${titleOptions[index]}',
                      style: TextStyle(
                          fontSize: 14,
                          color: title == titleOptions[index]
                              ? ColorConstants.appColorBlack
                              : ColorConstants.appColorBlack.withOpacity(0.32)),
                    ),
                  ),
                );
              },
              itemCount: titleOptions.length,
            )));
  }

  Widget titleDropdownV1() {
    return Container(
        width: 70,
        padding: const EdgeInsets.only(left: 10, right: 10),
        decoration: BoxDecoration(
            color: ColorConstants.greyColor.withOpacity(0.2),
            borderRadius: BorderRadius.circular(10)),
        child: Center(
          child: DropdownButton<String>(
            value: 'Ms.',
            icon: const Icon(
              Icons.keyboard_arrow_down_sharp,
              color: Colors.black,
            ),
            iconSize: 10,
            dropdownColor: ColorConstants.greyColor.withOpacity(0.2),
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

  void updateTitle(String text) {
    setState(() {
      title = text;
      showDropDown = false;
    });
  }

  void valueChange(text) {
    if (text.toString().isEmpty || text.toString() == '') {
      setState(() {
        nextBtnColor = ColorConstants.appColorDisabled;
      });
    } else {
      setState(() {
        nextBtnColor = ColorConstants.appColorBlue;
      });
    }
    setState(() {
      fullName = text;
    });
  }
}
