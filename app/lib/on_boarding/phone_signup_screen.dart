import 'package:app/on_boarding/profile_setup_screen.dart';
import 'package:app/on_boarding/verify_code_screen.dart';
import 'package:app/services/fb_notifications.dart';
import 'package:app/utils/dialogs.dart';
import 'package:app/widgets/buttons.dart';
import 'package:app/widgets/text_fields.dart';
import 'package:firebase_auth/firebase_auth.dart';
import 'package:flutter/material.dart';
import 'package:flutter/rendering.dart';

import 'email_signup_screen.dart';

class PhoneSignupScreen extends StatefulWidget {
  @override
  PhoneSignupScreenState createState() => PhoneSignupScreenState();
}

class PhoneSignupScreenState extends State<PhoneSignupScreen> {

  final _formKey = GlobalKey<FormState>();
  var phoneNumber = '';
  var requestCode = false;
  var verifyId = '';

  var smsCode = <String>['','','','','',''];

  @override
  Widget build(BuildContext context) {
    return Scaffold(
        resizeToAvoidBottomInset: false,
        body: Container(
          padding: const EdgeInsets.only(left: 24, right: 24),
          child: Center(
            child:
            requestCode ?

            Column(
                crossAxisAlignment: CrossAxisAlignment.center,
                children: [
                  const SizedBox(
                    height: 42,
                  ),
                  const Text(
                    'Now enter the code',
                    textAlign: TextAlign.center,
                    style: TextStyle(
                        fontWeight: FontWeight.bold,
                        fontSize: 24,
                        color: Colors.black),
                  ),
                  const SizedBox(
                    height: 8,
                  ),
                  Text(
                    'Enter the 6 digit code sent via SMS, to '
                        '\nverify your account',
                    textAlign: TextAlign.center,
                    style: TextStyle(
                        fontSize: 14, color: Colors.black.withOpacity(0.6)),
                  ),
                  const SizedBox(
                    height: 8,
                  ),
                  Container(
                    padding: const EdgeInsets.all(12),
                    child: Row(
                      mainAxisAlignment: MainAxisAlignment.spaceBetween,
                      children: [
                        optField(0, context, setCode),
                        optField(1, context, setCode),
                        optField(2, context, setCode),
                        optField(3, context, setCode),
                        optField(4, context, setCode),
                        optField(5, context, setCode)
                      ],
                    ),
                  ),
                  const SizedBox(
                    height: 24,
                  ),
                  Text(
                    'The code should arrive with in 5 sec.',
                    textAlign: TextAlign.center,
                    style: TextStyle(
                        fontSize: 12, color: Colors.black.withOpacity(0.5)),
                  ),
                  const Spacer(),
                  GestureDetector(
                    onTap: () async {

                      // Create a PhoneAuthCredential with the code
                      var credential = PhoneAuthProvider
                          .credential(verificationId: verifyId,
                          smsCode: smsCode.join(''));

                      // Sign the user in (or link) with the credential
                      // await auth.signInWithCredential(credential);

                      // Navigator.pushAndRemoveUntil(context,
                      //     MaterialPageRoute(builder: (context) {
                      //       return ProfileSetupScreen();
                      //     }), (r) => false);
                    },
                    child: nextButton('Next'),
                  ),
                  const SizedBox(
                    height: 20,
                  ),
                  signUpOptions(context),
                  const SizedBox(
                    height: 36,
                  ),
                ])
                :
            Column(
                crossAxisAlignment: CrossAxisAlignment.center,
                children: [
                  const SizedBox(
                    height: 42,
                  ),
                  const Text(
                    'Ok! What’s your mobile\nnumber?',
                    textAlign: TextAlign.center,
                    style: TextStyle(
                        fontWeight: FontWeight.bold,
                        fontSize: 24,
                        color: Colors.black),
                  ),
                  const SizedBox(
                    height: 4,
                  ),
                  Text(
                    'We’ll send you a verification code',
                    textAlign: TextAlign.center,
                    style: TextStyle(
                        fontSize: 14,
                        color: Colors.black.withOpacity(0.6)
                    ),
                  ),
                  const SizedBox(
                    height: 32,
                  ),
                  // Row(
                  //   children: <Widget>[
                  //
                  //     countryDropDown('Sign'),
                  //     const SizedBox(width: 16,),
                  //     Flexible(
                  //       child: TextField(
                  //         decoration: InputDecoration(
                  //           focusedBorder: OutlineInputBorder(
                  //             borderSide: BorderSide(
                  //                 color: ColorConstants.appColorBlue,
                  //                 width: 1.0),
                  //             borderRadius: BorderRadius.circular(10.0),
                  //           ),
                  //           enabledBorder: OutlineInputBorder(
                  //             borderSide: BorderSide(
                  //                 color: ColorConstants.appColorBlue,
                  //                 width: 1.0),
                  //             borderRadius: BorderRadius.circular(10.0),
                  //           ),
                  //           hintText: '+256(0) 701000000',
                  //         ),
                  //       ),
                  //     ),
                  //   ],
                  // ),
                  Form(
                    key: _formKey,
                    child: phoneInputField('701000000', valueChange),
                  ),
                  const SizedBox(
                    height: 36,
                  ),
                  GestureDetector(
                    onTap: () {
                      Navigator.push(context,
                          MaterialPageRoute(builder: (context) {
                            return EmailSignupScreen();
                          }));
                    },
                    child: signButton('Sign up with email instead'),
                  ),
                  const Spacer(),
                  GestureDetector(
                    onTap: () async {
                      setState(() {
                        requestCode = true;
                      });
                      if(_formKey.currentState!.validate()){

                        await FirebaseAuth.instance.verifyPhoneNumber(
                          phoneNumber: '+256$phoneNumber',
                          verificationCompleted:
                              (PhoneAuthCredential credential) async {
                            print('verification completed '
                                '${credential.smsCode}');
                            print(credential);
                            // await auth.signInWithCredential(credential);
                          },
                          verificationFailed: (FirebaseAuthException e) async {
                            if (e.code == 'invalid-phone-number') {
                              print('The provided phone number is not valid.');
                              await showSnackBar(context, 'The provided phone '
                                  'number is not valid.');
                            }
                            else{
                              await showSnackBar(context,'${e.toString()}');
                            }
                          },
                          codeSent: (String verificationId, int? resendToken)
                          async {
                            // Update the UI - wait for the user to enter
                            // the SMS code
                            await showSnackBar(context, 'We have sent a'
                                ' verification code to your phone number');
                            setState(() {
                              requestCode = true;
                              verifyId = verificationId;
                            });
                            // Create a PhoneAuthCredential with the code
                            var credential = PhoneAuthProvider
                                .credential(verificationId:
                            verificationId, smsCode: smsCode.join(''));

                            // Sign the user in (or link) with the credential
                            // await auth.signInWithCredential(credential);
                          },
                          codeAutoRetrievalTimeout: (String verificationId)
                          async {
                            await showSnackBar(context,
                                'codeAutoRetrievalTimeout');
                          },
                        );

                        // CustomAuth().signUpWithPhoneNumber('0$phoneNumber');
                        // Navigator.push(context,
                        //     MaterialPageRoute(builder: (context) {
                        //       return VerifyCodeScreen();
                        //     }));
                      }
                      // if(_formKey.currentState!.validate()){
                      //   Navigator.push(context,
                      //       MaterialPageRoute(builder: (context) {
                      //         return VerifyCodeScreen();
                      //       }));
                      // }
                    },
                    child: nextButton('Next'),
                  ),
                  const SizedBox(
                    height: 20,
                  ),
                  signUpOptions(context),
                  const SizedBox(
                    height: 36,
                  ),
                ])
          ),
        ));
  }

  void initialize() {
    Future.delayed(const Duration(seconds: 8), () async {
      await Navigator.pushReplacement(context,
          MaterialPageRoute(builder: (context) {
        return PhoneSignupScreen();
      }));
    });
  }

  @override
  void initState() {
    // initialize();
    super.initState();
  }

  void setCode(value, position){
    smsCode[position] = value;
  }

  void valueChange(text){
    setState(() {
      phoneNumber = text;
    });
  }
}
