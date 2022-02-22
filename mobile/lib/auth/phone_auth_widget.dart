import 'package:app/auth/login_screen.dart';
import 'package:app/constants/config.dart';
import 'package:app/on_boarding/profile_setup_screen.dart';
import 'package:app/screens/home_page.dart';
import 'package:app/services/app_service.dart';
import 'package:app/utils/dialogs.dart';
import 'package:app/widgets/buttons.dart';
import 'package:app/widgets/text_fields.dart';
import 'package:firebase_auth/firebase_auth.dart';
import 'package:flutter/material.dart';

class PhoneAuthWidget extends StatefulWidget {
  final bool enableBackButton;
  final ValueSetter<String> changeOption;
  final ValueSetter<bool> appLoading;
  final String action;
  final String phoneNumber;

  const PhoneAuthWidget(
      {Key? key,
      required this.enableBackButton,
      required this.changeOption,
      required this.action,
      required this.appLoading,
      required this.phoneNumber})
      : super(key: key);

  @override
  PhoneAuthWidgetState createState() => PhoneAuthWidgetState();
}

class PhoneAuthWidgetState extends State<PhoneAuthWidget> {
  bool _phoneFormValid = false;
  late String _phoneNumber;
  late String _countryCodePlaceHolder;
  late String _countryCode;
  bool _verifyCode = false;
  String _verificationId = '';
  bool _resendCode = false;
  bool _codeSent = false;
  bool _isResending = false;
  bool _isVerifying = false;
  List<String> _phoneVerificationCode = <String>['', '', '', '', '', ''];
  late Color _nextBtnColor;

  late TextEditingController _phoneInputController;
  final _phoneFormKey = GlobalKey<FormState>();
  late AppService _appService;

  Future<void> authenticatePhoneNumber(AuthCredential authCredential) async {
    if (widget.action == 'signup') {
      var signUpSuccessful = await _appService.authenticateUser(
          authCredential, '', '', authMethod.phone, authProcedure.signup);
      if (signUpSuccessful) {
        setState(() {
          widget.appLoading(false);
        });
        await Navigator.pushAndRemoveUntil(context,
            MaterialPageRoute(builder: (context) {
          return ProfileSetupScreen(widget.enableBackButton);
        }), (r) => false);
      } else {
        setState(() {
          widget.appLoading(false);
          _codeSent = true;
          _isVerifying = false;
          _nextBtnColor = Config.appColorBlue;
        });
        await showSnackBar(context, 'Signup failed.');
      }
    } else {
      var loginSuccessful = await _appService.authenticateUser(
          authCredential, '', '', authMethod.phone, authProcedure.login);
      if (loginSuccessful) {
        setState(() {
          widget.appLoading(false);
        });
        await Navigator.pushAndRemoveUntil(context,
            MaterialPageRoute(builder: (context) {
          return const HomePage();
        }), (r) => false);
      } else {
        setState(() {
          widget.appLoading(false);
          _codeSent = true;
          _isVerifying = false;
          _nextBtnColor = Config.appColorBlue;
        });
        await showSnackBar(context, 'Login failed.');
      }
    }
  }

  void autoVerifyPhoneFn(PhoneAuthCredential credential) {
    authenticatePhoneNumber(credential);
  }

  @override
  Widget build(BuildContext context) {
    return Container(
      color: Colors.white,
      padding: const EdgeInsets.only(left: 24, right: 24),
      child: Center(
          child: ListView(children: [
        // Start Common widgets

        const SizedBox(
          height: 56,
        ),

        Visibility(
          visible: _verifyCode,
          child: const Text(
            'Verify your phone number!',
            textAlign: TextAlign.center,
            maxLines: 1,
            overflow: TextOverflow.ellipsis,
            style: TextStyle(
                fontWeight: FontWeight.bold, fontSize: 24, color: Colors.black),
          ),
        ),
        Visibility(
          visible: !_verifyCode,
          child: Text(
            widget.action == 'signup'
                ? 'Sign up with your email\nor mobile number'
                : 'Login with your email\nor mobile number',
            textAlign: TextAlign.center,
            maxLines: 2,
            overflow: TextOverflow.ellipsis,
            style: const TextStyle(
                fontWeight: FontWeight.bold, fontSize: 24, color: Colors.black),
          ),
        ),

        const SizedBox(
          height: 8,
        ),

        if (_phoneNumber.length > 8)
          Visibility(
            visible: _verifyCode,
            child: Text(
              // 'Enter the 6 digits code sent to your\n'
              //     'number that ends with ...'
              //     '${phoneNumber.substring(phoneNumber.length - 3)}',
              'Enter the 6 digits code sent to your\n'
              'number $_countryCode$_phoneNumber',
              textAlign: TextAlign.center,
              maxLines: 2,
              overflow: TextOverflow.ellipsis,
              style:
                  TextStyle(fontSize: 14, color: Colors.black.withOpacity(0.6)),
            ),
          ),
        Visibility(
            visible: !_verifyCode,
            child: Text(
              'We’ll send you a verification code',
              textAlign: TextAlign.center,
              maxLines: 2,
              overflow: TextOverflow.ellipsis,
              style:
                  TextStyle(fontSize: 14, color: Colors.black.withOpacity(0.6)),
            )),

        const SizedBox(
          height: 32,
        ),

        // End Common widgets

        Visibility(
          visible: _verifyCode,
          child: Padding(
            padding: const EdgeInsets.only(left: 36, right: 36),
            child: optField(0, context, setCode, _codeSent),
          ),
        ),
        Visibility(
          visible: !_verifyCode,
          child: Form(
            key: _phoneFormKey,
            child: SizedBox(
              height: 48,
              child: Row(
                children: [
                  SizedBox(
                    width: 64,
                    child: countryPickerField(
                        _countryCode, codeValueChange, context),
                  ),
                  const SizedBox(
                    width: 16,
                  ),
                  Expanded(
                    child: phoneInputField(),
                  )
                ],
              ),
            ),
          ),
        ),

        const SizedBox(
          height: 32,
        ),

        Visibility(
          visible: !_codeSent && _verifyCode,
          child: Text(
            'The code should arrive with in 5 sec',
            textAlign: TextAlign.center,
            style:
                TextStyle(fontSize: 12, color: Colors.black.withOpacity(0.5)),
          ),
        ),
        Visibility(
          visible: _codeSent && _verifyCode,
          child: GestureDetector(
            onTap: () async {
              await resendVerificationCode();
            },
            child: Text(
              'Resend code',
              textAlign: TextAlign.center,
              maxLines: 1,
              overflow: TextOverflow.ellipsis,
              style: TextStyle(
                  fontSize: 12,
                  color: _isResending
                      ? Colors.black.withOpacity(0.5)
                      : Config.appColorBlue),
            ),
          ),
        ),
        Visibility(
          visible: !_verifyCode,
          child: GestureDetector(
            onTap: () {
              setState(() {
                _initialize();
                widget.changeOption('email');
              });
            },
            child: widget.action == 'signup'
                ? signButton('Sign up with an email instead')
                : signButton('Login with an email instead'),
          ),
        ),

        const SizedBox(
          height: 19,
        ),

        Visibility(
          visible: _verifyCode,
          child: Padding(
            padding: const EdgeInsets.only(left: 36, right: 36),
            child: Stack(
              alignment: AlignmentDirectional.center,
              children: [
                Container(
                  height: 1.09,
                  color: Colors.black.withOpacity(0.05),
                ),
                Container(
                    color: Colors.white,
                    padding: const EdgeInsets.only(left: 5, right: 5),
                    child: const Text(
                      'Or',
                      style: TextStyle(fontSize: 12, color: Color(0xffD1D3D9)),
                    )),
              ],
            ),
          ),
        ),
        Visibility(
          visible: _verifyCode,
          child: const SizedBox(
            height: 19,
          ),
        ),
        Visibility(
          visible: _verifyCode,
          child: GestureDetector(
            onTap: _initialize,
            child: Text(
              'Change Phone Number',
              textAlign: TextAlign.center,
              style: TextStyle(
                  fontSize: 12,
                  color: _resendCode
                      ? Config.appColorBlue
                      : Colors.black.withOpacity(0.5)),
            ),
          ),
        ),

        const SizedBox(
          height: 212,
        ),
        Visibility(
          visible: _verifyCode,
          child: GestureDetector(
            onTap: () async {
              await verifySentCode();
            },
            child: nextButton('Next', _nextBtnColor),
          ),
        ),
        Visibility(
          visible: !_verifyCode,
          child: GestureDetector(
            onTap: () async {
              await requestVerification();
            },
            child: nextButton('Next', _nextBtnColor),
          ),
        ),
        const SizedBox(
          height: 16,
        ),
        Visibility(
          visible: widget.action == 'signup',
          child: signUpOptions(context),
        ),
        Visibility(
          visible: widget.action == 'login',
          child: loginOptions(context),
        ),
        const SizedBox(
          height: 36,
        ),
      ])),
    );
  }

  void clearPhoneCallBack() {
    setState(() {
      _phoneNumber = '';
      _phoneInputController.text = '';
      _nextBtnColor = Config.appColorDisabled;
    });
  }

  void codeValueChange(text) {
    setState(() {
      _countryCode = text;
      _countryCodePlaceHolder = '$text(0) ';
    });
  }

  @override
  void initState() {
    super.initState();
    _appService = AppService(context);
    _initialize();
  }

  Widget phoneInputField() {
    return Container(
        height: 48,
        alignment: Alignment.center,
        padding: const EdgeInsets.only(left: 15),
        decoration: BoxDecoration(
            borderRadius: const BorderRadius.all(Radius.circular(10.0)),
            border: Border.all(color: Config.appColorBlue)),
        child: Center(
            child: TextFormField(
          controller: _phoneInputController,
          autofocus: true,
          enableSuggestions: false,
          cursorWidth: 1,
          cursorColor: Config.appColorBlue,
          keyboardType: TextInputType.number,
          onChanged: phoneValueChange,
          validator: (value) {
            if (value == null || value.isEmpty) {
              showSnackBar(context, 'Please enter your phone number');
              setState(() {
                _phoneFormValid = false;
              });
            } else {
              setState(() {
                _phoneFormValid = true;
              });
            }
            return null;
          },
          decoration: InputDecoration(
            prefixText: _countryCodePlaceHolder,
            focusedBorder: InputBorder.none,
            enabledBorder: InputBorder.none,
            // focusedBorder: OutlineInputBorder(
            //   borderSide: BorderSide(color: Config.appColorBlue,
            //   width: 1.0),
            //   borderRadius: BorderRadius.circular(10.0),
            // ),
            // enabledBorder: OutlineInputBorder(
            //   borderSide: BorderSide(color: Config.appColorBlue,
            //   width: 1.0),
            //   borderRadius: BorderRadius.circular(10.0),
            // ),
            hintText: '701000000',
            suffixIcon: GestureDetector(
              onTap: clearPhoneCallBack,
              child: textInputCloseButton(),
            ),
          ),
        )));
  }

  void phoneValueChange(text) {
    if (text.toString().isEmpty) {
      setState(() {
        _nextBtnColor = Config.appColorDisabled;
      });
    } else {
      setState(() {
        _nextBtnColor = Config.appColorBlue;
      });
    }

    setState(() {
      _phoneNumber = text;
    });
  }

  Future<void> requestVerification() async {
    var connected = await _appService.isConnected();
    if (!connected) {
      await showSnackBar(context, Config.connectionErrorMessage);
      return;
    }
    _phoneFormKey.currentState!.validate();
    if (_phoneFormValid) {
      setState(() {
        _nextBtnColor = Config.appColorDisabled;
        _isVerifying = true;
        _codeSent = false;
        widget.appLoading(true);
      });

      var hasConnection = await _appService.isConnected();
      if (!hasConnection) {
        setState(() {
          _codeSent = true;
          _isVerifying = false;
          widget.appLoading(false);
        });
        await showSnackBar(context, 'Check your internet connection');
        return;
      }

      var phoneNumber = '$_countryCode$_phoneNumber';

      if (widget.action == 'signup') {
        var phoneNumberTaken = await _appService.doesUserExist(phoneNumber, '');

        if (phoneNumberTaken) {
          setState(() {
            _codeSent = true;
            _isVerifying = false;
            widget.appLoading(false);
          });
          await showSnackBar(
              context,
              'You already have an '
              'account with ths phone number');
          await Navigator.pushAndRemoveUntil(context,
              MaterialPageRoute(builder: (context) {
            return LoginScreen(
              phoneNumber: '$_countryCode.$_phoneNumber',
              emailAddress: '',
            );
          }), (r) => false);
          return;
        }
      }

      var success = await _appService.customAuth.requestPhoneVerification(
          phoneNumber, context, verifyPhoneFn, autoVerifyPhoneFn);

      if (success) {
        setState(() {
          _codeSent = true;
          _isVerifying = false;
          widget.appLoading(false);
        });
      } else {
        setState(() {
          _codeSent = false;
          _isVerifying = false;
          widget.appLoading(false);
        });
      }
    }
  }

  Future<void> resendVerificationCode() async {
    var connected = await _appService.isConnected();
    if (!connected) {
      await showSnackBar(context, Config.connectionErrorMessage);
      return;
    }

    if (_isResending) {
      return;
    }

    setState(() {
      _isResending = true;
    });

    await _appService.customAuth
        .requestPhoneVerification('$_countryCode$_phoneNumber', context,
            verifyPhoneFn, autoVerifyPhoneFn)
        .then((value) => {
              setState(() {
                _isResending = false;
              })
            })
        .whenComplete(() => {
              setState(() {
                _isResending = false;
              })
            });
  }

  void setCode(value, position) {
    setState(() {
      _phoneVerificationCode[position] = value;
    });
    var code = _phoneVerificationCode.join('');
    if (code.length == 6) {
      setState(() {
        _nextBtnColor = Config.appColorBlue;
      });
    } else {
      setState(() {
        _nextBtnColor = Config.appColorDisabled;
      });
    }
  }

  void verifyPhoneFn(verificationId) {
    setState(() {
      _verifyCode = true;
      _verificationId = verificationId;
    });

    Future.delayed(const Duration(seconds: 5), () async {
      setState(() {
        _resendCode = true;
      });
    });
  }

  Future<void> verifySentCode() async {
    var connected = await _appService.isConnected();
    if (!connected) {
      await showSnackBar(context, Config.connectionErrorMessage);
      return;
    }

    var code = _phoneVerificationCode.join('');

    if (code.length != 6) {
      await showSnackBar(context, 'Enter all the 6 digits');
      return;
    }

    if (_isVerifying) {
      return;
    }

    setState(() {
      _nextBtnColor = Config.appColorDisabled;
      _isVerifying = true;
      widget.appLoading(true);
    });

    var phoneCredential = PhoneAuthProvider.credential(
        verificationId: _verificationId,
        smsCode: _phoneVerificationCode.join(''));

    await authenticatePhoneNumber(phoneCredential);
  }

  void _initialize() {
    setState(() {
      _phoneNumber =
          widget.phoneNumber == '' ? '' : widget.phoneNumber.split('.').last;
      _countryCodePlaceHolder = widget.phoneNumber == ''
          ? '+256(0)'
          : '${widget.phoneNumber.split('.').first}(0) ';
      _countryCode = widget.phoneNumber == ''
          ? '+256'
          : widget.phoneNumber.split('.').first;
      _phoneVerificationCode = <String>['', '', '', '', '', ''];
      _nextBtnColor = widget.phoneNumber == ''
          ? Config.appColorDisabled
          : Config.appColorBlue;
      _verifyCode = false;
      _verificationId = '';
      _resendCode = false;
      _codeSent = false;
      _isResending = false;
      _isVerifying = false;
      _phoneFormValid = false;
      _phoneInputController = TextEditingController(text: _phoneNumber);
    });
  }
}
