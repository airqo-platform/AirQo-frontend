import 'package:app/blocs/blocs.dart';
import 'package:app/constants/constants.dart';
import 'package:app/models/enum_constants.dart';
import 'package:app/services/services.dart';
import 'package:app/themes/theme.dart';
import 'package:app/utils/utils.dart';
import 'package:app/widgets/widgets.dart';
import 'package:auto_size_text/auto_size_text.dart';
import 'package:flutter/material.dart';
import 'package:flutter_bloc/flutter_bloc.dart';

import '../home_page.dart';
import '../email_authentication/email_auth_screen.dart';
import '../phone_authentication/phone_auth_screen.dart';

class AuthOrSeparator extends StatelessWidget {
  const AuthOrSeparator({super.key});

  @override
  Widget build(BuildContext context) {
    return Padding(
      padding: const EdgeInsets.only(left: 36, right: 36, top: 16),
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
            child: Text(
              'Or',
              style: Theme.of(context).textTheme.bodySmall?.copyWith(
                    color: const Color(0xffD1D3D9),
                  ),
            ),
          ),
        ],
      ),
    );
  }
}

class ProceedAsGuest extends StatelessWidget {
  const ProceedAsGuest({super.key});

  @override
  Widget build(BuildContext context) {
    return InkWell(
      onTap: () async {
        await _guestSignIn(context);
      },
      child: SizedBox(
        width: double.infinity,
        child: Row(
          crossAxisAlignment: CrossAxisAlignment.center,
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            Text(
              'Proceed as',
              textAlign: TextAlign.center,
              style: Theme.of(context).textTheme.bodySmall?.copyWith(
                    color: CustomColors.appColorBlack.withOpacity(0.6),
                  ),
            ),
            const SizedBox(
              width: 2,
            ),
            Text(
              'Guest',
              textAlign: TextAlign.center,
              style: Theme.of(context).textTheme.bodySmall?.copyWith(
                    color: CustomColors.appColorBlue,
                  ),
            ),
          ],
        ),
      ),
    );
  }

  Future<void> _guestSignIn(BuildContext context) async {
    await hasNetworkConnection().then((hasConnection) async {
      if (!hasConnection) {
        showSnackBar(context, "Check your internet connection");

        return;
      }

      loadingScreen(context);

      await CustomAuth.guestSignIn().then((success) async {
        if (success) {
          await AppService.postSignInActions(context).then((_) async {
            Navigator.pop(context);
            await Navigator.pushAndRemoveUntil(
              context,
              MaterialPageRoute(builder: (context) {
                return const HomePage();
              }),
              (r) => true,
            );
          });
        } else {
          Navigator.pop(context);
          showSnackBar(context, Config.guestLogInFailed);
        }
      });
    });
  }
}

class AuthSuccessWidget extends StatelessWidget {
  const AuthSuccessWidget({super.key});

  @override
  Widget build(BuildContext context) {
    return Center(
      child: Container(
        padding: const EdgeInsets.all(25),
        decoration: BoxDecoration(
          color: CustomColors.appColorValid.withOpacity(0.1),
          borderRadius: const BorderRadius.all(
            Radius.circular(15.0),
          ),
        ),
        child: Icon(
          size: 100,
          Icons.check_circle_rounded,
          color: CustomColors.appColorValid,
        ),
      ),
    );
  }
}

// class PhoneInputField extends StatefulWidget {
//   const PhoneInputField({super.key});
//
//   @override
//   State<PhoneInputField> createState() => _PhoneInputFieldState();
// }
//
// class _PhoneInputFieldState extends State<PhoneInputField> {
//   late TextEditingController _phoneInputController;
//
//   @override
//   void dispose() {
//     _phoneInputController.dispose();
//     super.dispose();
//   }
//
//   @override
//   void initState() {
//     super.initState();
//     _phoneInputController = TextEditingController();
//   }
//
//   @override
//   Widget build(BuildContext context) {
//     return BlocBuilder<PhoneAuthBloc, PhoneAuthState>(
//       builder: (context, state) {
//         Color formColor;
//         Color fillColor;
//         Color textColor;
//         Color suffixIconColor;
//         Widget suffixIcon;
//
//         switch (state.status) {
//           case PhoneAuthStatus.initial:
//           case PhoneAuthStatus.verificationCodeSent:
//             if (state.fullPhoneNumber.isValidPhoneNumber()) {
//               formColor = CustomColors.appColorValid;
//               textColor = CustomColors.appColorValid;
//               suffixIconColor = CustomColors.appColorValid;
//               fillColor = CustomColors.appColorValid.withOpacity(0.05);
//               suffixIcon = const Padding(
//                 padding: EdgeInsets.all(14),
//                 child: Icon(
//                   Icons.check_circle_rounded,
//                 ),
//               );
//               break;
//             }
//
//             formColor = CustomColors.appColorBlue;
//             textColor = CustomColors.appColorBlack;
//             suffixIconColor = CustomColors.greyColor.withOpacity(0.7);
//             fillColor = Colors.transparent;
//             suffixIcon = TextInputCloseButton(
//               color: suffixIconColor,
//             );
//
//             break;
//           case PhoneAuthStatus.error:
//           case PhoneAuthStatus.phoneNumberDoesNotExist:
//           case PhoneAuthStatus.phoneNumberTaken:
//           case PhoneAuthStatus.invalidPhoneNumber:
//             formColor = CustomColors.appColorInvalid;
//             textColor = CustomColors.appColorInvalid;
//             suffixIconColor = CustomColors.appColorInvalid;
//             fillColor = CustomColors.appColorInvalid.withOpacity(0.1);
//             suffixIcon = TextInputCloseButton(
//               color: suffixIconColor,
//             );
//             break;
//           case PhoneAuthStatus.success:
//             formColor = CustomColors.appColorValid;
//             textColor = CustomColors.appColorValid;
//             suffixIconColor = CustomColors.appColorValid;
//             fillColor = CustomColors.appColorValid.withOpacity(0.05);
//             suffixIcon = const Padding(
//               padding: EdgeInsets.all(14),
//               child: Icon(
//                 Icons.check_circle_rounded,
//               ),
//             );
//             break;
//         }
//
//         InputBorder inputBorder = OutlineInputBorder(
//           borderSide: BorderSide(color: formColor, width: 1.0),
//           borderRadius: BorderRadius.circular(8.0),
//         );
//
//         return Row(
//           children: [
//             SizedBox(
//               width: 64,
//               child: CountryCodePickerField(
//                 valueChange: (code) {
//                   context.read<PhoneAuthBloc>().add(UpdateCountryCode(
//                         code ?? state.countryCode,
//                       ));
//                 },
//                 placeholder: state.countryCode,
//               ),
//             ),
//             const SizedBox(
//               width: 16,
//             ),
//             Expanded(
//               child: TextFormField(
//                 controller: _phoneInputController,
//                 inputFormatters: [
//                   FilteringTextInputFormatter.allow(
//                     RegExp(r'\d'),
//                   ),
//                   PhoneNumberInputFormatter(),
//                 ],
//                 onEditingComplete: () {
//                   FocusScope.of(context).requestFocus(
//                     FocusNode(),
//                   );
//                 },
//                 onChanged: (value) {
//                   context.read<PhoneAuthBloc>().add(UpdatePhoneNumber(value));
//                 },
//                 style: Theme.of(context)
//                     .textTheme
//                     .bodyLarge
//                     ?.copyWith(color: textColor),
//                 enableSuggestions: false,
//                 cursorWidth: 1,
//                 autofocus: false,
//                 cursorColor: formColor,
//                 keyboardType: TextInputType.number,
//                 decoration: InputDecoration(
//                   contentPadding: const EdgeInsets.fromLTRB(16, 12, 0, 12),
//                   iconColor: formColor,
//                   fillColor: fillColor,
//                   filled: true,
//                   focusedBorder: inputBorder,
//                   enabledBorder: inputBorder,
//                   border: inputBorder,
//                   suffixIconColor: formColor,
//                   hintText: '700 000 000',
//                   prefixIcon: Padding(
//                     padding: const EdgeInsets.fromLTRB(8, 11, 0, 15),
//                     child: Text(
//                       '${state.countryCode} ',
//                       style: Theme.of(context).textTheme.bodyLarge?.copyWith(
//                             color: textColor,
//                           ),
//                     ),
//                   ),
//                   hintStyle: Theme.of(context).textTheme.bodyLarge?.copyWith(
//                         color: CustomColors.appColorBlack.withOpacity(0.32),
//                       ),
//                   prefixStyle: Theme.of(context).textTheme.bodyLarge?.copyWith(
//                         color: CustomColors.appColorBlack.withOpacity(0.32),
//                       ),
//                   suffixIcon: GestureDetector(
//                     onTap: () {
//                       _phoneInputController.text = '';
//                       FocusScope.of(context).requestFocus(
//                         FocusNode(),
//                       );
//                       context
//                           .read<PhoneAuthBloc>()
//                           .add(const ClearPhoneNumberEvent());
//                     },
//                     child: suffixIcon,
//                   ),
//                   errorStyle: const TextStyle(
//                     fontSize: 0,
//                   ),
//                 ),
//               ),
//             ),
//           ],
//         );
//       },
//     );
//   }
// }

class ChangeAuthCredentials extends StatelessWidget {
  const ChangeAuthCredentials(this.authMethod, {super.key});
  final AuthMethod authMethod;

  @override
  Widget build(BuildContext context) {
    return Padding(
      padding: const EdgeInsets.only(top: 16.0),
      child: InkWell(
        onTap: () {
          switch (authMethod) {
            case AuthMethod.email:
              context.read<EmailAuthBloc>().add(InitializeEmailAuth(
                    authProcedure:
                        context.read<EmailAuthBloc>().state.authProcedure,
                  ));
              break;
            case AuthMethod.phone:
              context.read<PhoneAuthBloc>().add(InitializePhoneAuth(
                    context.read<PhoneAuthBloc>().state.authProcedure,
                  ));
              break;
          }
          Navigator.of(context).popUntil((route) => route.isFirst);
        },
        child: Text(
          authMethod.editEntryText,
          textAlign: TextAlign.center,
          style: Theme.of(context).textTheme.bodySmall?.copyWith(
                color: CustomColors.appColorBlue,
              ),
        ),
      ),
    );
  }
}

// class EmailInputField extends StatefulWidget {
//   const EmailInputField({Key? key}) : super(key: key);
//
//   @override
//   State<EmailInputField> createState() => _EmailInputFieldState();
// }
//
// class _EmailInputFieldState extends State<EmailInputField> {
//   late TextEditingController _emailInputController;
//
//   @override
//   void dispose() {
//     _emailInputController.dispose();
//     super.dispose();
//   }
//
//   @override
//   void initState() {
//     super.initState();
//     _emailInputController = TextEditingController();
//   }
//
//   @override
//   Widget build(BuildContext context) {
//     return BlocBuilder<EmailAuthBloc, EmailAuthState>(
//       buildWhen: (previous, current) {
//         return true;
//       },
//       builder: (context, state) {
//         Color formColor;
//         Color fillColor;
//         Color textColor;
//         Color suffixIconColor;
//         Widget suffixIcon;
//
//         switch (state.status) {
//           case EmailAuthStatus.initial:
//             // if (state.emailAddress.isValidEmail()) {
//             //   formColor = CustomColors.appColorValid;
//             //   textColor = CustomColors.appColorValid;
//             //   suffixIconColor = CustomColors.appColorValid;
//             //   fillColor = CustomColors.appColorValid.withOpacity(0.05);
//             //   suffixIcon = const Padding(
//             //     padding: EdgeInsets.all(14),
//             //     child: Icon(
//             //       Icons.check_circle_rounded,
//             //     ),
//             //   );
//             //   break;
//             // }
//
//             formColor = CustomColors.appColorBlue;
//             textColor = CustomColors.appColorBlack;
//             suffixIconColor = CustomColors.greyColor.withOpacity(0.7);
//             fillColor = Colors.transparent;
//             suffixIcon = TextInputCloseButton(
//               color: suffixIconColor,
//             );
//
//             break;
//           case EmailAuthStatus.error:
//             formColor = CustomColors.appColorInvalid;
//             textColor = CustomColors.appColorInvalid;
//             suffixIconColor = CustomColors.appColorInvalid;
//             fillColor = CustomColors.appColorInvalid.withOpacity(0.1);
//             suffixIcon = TextInputCloseButton(
//               color: suffixIconColor,
//             );
//             break;
//           case EmailAuthStatus.success:
//             formColor = CustomColors.appColorValid;
//             textColor = CustomColors.appColorValid;
//             suffixIconColor = CustomColors.appColorValid;
//             fillColor = CustomColors.appColorValid.withOpacity(0.05);
//             suffixIcon = const Padding(
//               padding: EdgeInsets.all(14),
//               child: Icon(
//                 Icons.check_circle_rounded,
//               ),
//             );
//             break;
//         }
//
//         InputBorder inputBorder = OutlineInputBorder(
//           borderSide: BorderSide(color: formColor, width: 1.0),
//           borderRadius: BorderRadius.circular(8.0),
//         );
//
//         return TextFormField(
//           controller: _emailInputController,
//           onTap: () {
//             // context
//             //     .read<EmailAuthBloc>()
//             //     .add(UpdateEmailAddress(state.emailAddress));
//           },
//           onChanged: (value) {
//             // context.read<EmailAuthBloc>().add(UpdateEmailAddress(value));
//           },
//           onEditingComplete: () {
//             FocusScope.of(context).requestFocus(FocusNode());
//           },
//           style:
//               Theme.of(context).textTheme.bodyLarge?.copyWith(color: textColor),
//           enableSuggestions: true,
//           cursorWidth: 1,
//           autofocus: false,
//           cursorColor: formColor,
//           keyboardType: TextInputType.emailAddress,
//           decoration: InputDecoration(
//             contentPadding: const EdgeInsets.fromLTRB(16, 12, 0, 12),
//             iconColor: formColor,
//             fillColor: fillColor,
//             filled: true,
//             focusedBorder: inputBorder,
//             enabledBorder: inputBorder,
//             border: inputBorder,
//             suffixIconColor: formColor,
//             hintText: 'Enter your email',
//             hintStyle: Theme.of(context).textTheme.bodyLarge?.copyWith(
//                   color: CustomColors.appColorBlack.withOpacity(0.32),
//                 ),
//             prefixStyle: Theme.of(context).textTheme.bodyLarge?.copyWith(
//                   color: CustomColors.appColorBlack.withOpacity(0.32),
//                 ),
//             suffixIcon: GestureDetector(
//               onTap: () {
//                 _emailInputController.text = '';
//                 FocusScope.of(context).requestFocus(FocusNode());
//                 // context.read<EmailAuthBloc>().add(const ClearEmailAddress());
//               },
//               child: suffixIcon,
//             ),
//             errorStyle: const TextStyle(
//               fontSize: 0,
//             ),
//           ),
//         );
//       },
//     );
//   }
// }

class AuthSignUpButton extends StatelessWidget {
  const AuthSignUpButton({
    super.key,
    required this.authProcedure,
    required this.authMethod,
  });

  final AuthProcedure authProcedure;
  final AuthMethod authMethod;

  @override
  Widget build(BuildContext context) {
    return Padding(
      padding: const EdgeInsets.only(top: 20),
      child: SizedBox(
        height: 48,
        width: double.infinity,
        child: OutlinedButton(
          onPressed: () {
            Navigator.pushAndRemoveUntil(
              context,
              PageRouteBuilder(
                pageBuilder: (context, animation, secondaryAnimation) {
                  switch (authMethod) {
                    case AuthMethod.phone:
                      return authProcedure == AuthProcedure.login
                          ? const EmailLoginScreen()
                          : const EmailSignUpScreen();
                    case AuthMethod.email:
                      return authProcedure == AuthProcedure.login
                          ? const PhoneLoginScreen()
                          : const PhoneSignUpScreen();
                  }
                },
                transitionsBuilder:
                    (context, animation, secondaryAnimation, child) {
                  return FadeTransition(
                    opacity: animation.drive(
                      Tween<double>(
                        begin: 0,
                        end: 1,
                      ),
                    ),
                    child: child,
                  );
                },
              ),
              (r) => false,
            );
          },
          style: OutlinedButton.styleFrom(
            elevation: 0,
            side: const BorderSide(
              color: Colors.transparent,
            ),
            shape: const RoundedRectangleBorder(
              borderRadius: BorderRadius.all(
                Radius.circular(8),
              ),
            ),
            backgroundColor: const Color(0xff8D8D8D).withOpacity(0.1),
            foregroundColor: const Color(0xff8D8D8D).withOpacity(0.1),
            padding: const EdgeInsets.symmetric(
              vertical: 16,
              horizontal: 0,
            ),
          ),
          child: AutoSizeText(
            authMethod.optionsButtonText(authProcedure),
            textAlign: TextAlign.center,
            style: Theme.of(context).textTheme.bodySmall?.copyWith(
                  color: CustomColors.appColorBlue,
                ),
          ),
        ),
      ),
    );
  }
}
