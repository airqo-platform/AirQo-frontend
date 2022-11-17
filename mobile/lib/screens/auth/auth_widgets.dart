import 'package:app/blocs/blocs.dart';
import 'package:app/models/enum_constants.dart';
import 'package:app/screens/auth/phone_auth_widget.dart';
import 'package:app/screens/home_page.dart';
import 'package:app/themes/theme.dart';
import 'package:app/utils/utils.dart';
import 'package:app/widgets/widgets.dart';
import 'package:auto_size_text/auto_size_text.dart';
import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:flutter_bloc/flutter_bloc.dart';
import 'package:flutter_svg/svg.dart';

import 'email_auth_widget.dart';

class PhoneInputField extends StatefulWidget {
  const PhoneInputField({super.key});

  @override
  State<PhoneInputField> createState() => _PhoneInputFieldState();
}

class _PhoneInputFieldState extends State<PhoneInputField> {
  late TextEditingController _phoneInputController;
  @override
  void dispose() {
    _phoneInputController.dispose();
    super.dispose();
  }

  @override
  void initState() {
    super.initState();
    _phoneInputController = TextEditingController();
  }

  @override
  Widget build(BuildContext context) {
    return BlocBuilder<PhoneAuthBloc, PhoneAuthState>(
      builder: (context, state) {
        Color formColor = state.phoneNumber.isValidPhoneNumber()
            ? CustomColors.appColorValid
            : CustomColors.appColorBlue;
        Color fillColor = state.phoneNumber.isValidPhoneNumber()
            ? formColor.withOpacity(0.05)
            : Colors.transparent;
        Color textColor = state.phoneNumber.isValidPhoneNumber()
            ? formColor
            : CustomColors.appColorBlack;
        Color suffixIconColor = state.phoneNumber.isValidPhoneNumber()
            ? formColor
            : CustomColors.greyColor.withOpacity(0.7);

        if (state.blocStatus == BlocStatus.error) {
          formColor = CustomColors.appColorInvalid;
          textColor = formColor;
          suffixIconColor = formColor;
          fillColor = formColor.withOpacity(0.05);
        }

        InputBorder inputBorder = OutlineInputBorder(
          borderSide: BorderSide(color: formColor, width: 1.0),
          borderRadius: BorderRadius.circular(8.0),
        );

        Widget suffixIcon = state.phoneNumber.isValidEmail()
            ? Padding(
                padding: const EdgeInsets.all(14),
                child: SvgPicture.asset(
                  'assets/icon/valid_input_icon.svg',
                  height: 1,
                  width: 1,
                ),
              )
            : TextInputCloseButton(
                color: suffixIconColor,
              );

        return TextFormField(
          controller: _phoneInputController,
          inputFormatters: [
            FilteringTextInputFormatter.allow(
              RegExp(r'[0-9]'),
            ),
            PhoneNumberInputFormatter(),
          ],
          onEditingComplete: () async {
            FocusScope.of(context).requestFocus(
              FocusNode(),
            );
          },
          onTap: () {
            context
                .read<PhoneAuthBloc>()
                .add(UpdatePhoneNumber(state.phoneNumber));
          },
          onChanged: (value) {
            context.read<PhoneAuthBloc>().add(UpdatePhoneNumber(value));
          },
          style:
              Theme.of(context).textTheme.bodyText1?.copyWith(color: textColor),
          enableSuggestions: false,
          cursorWidth: 1,
          autofocus: false,
          cursorColor: formColor,
          keyboardType: TextInputType.number,
          decoration: InputDecoration(
            contentPadding: const EdgeInsets.fromLTRB(16, 12, 0, 12),
            iconColor: formColor,
            fillColor: fillColor,
            filled: true,
            focusedBorder: inputBorder,
            enabledBorder: inputBorder,
            border: inputBorder,
            suffixIconColor: formColor,
            hintText: '700 000 000',
            prefixIcon: Padding(
              padding: const EdgeInsets.fromLTRB(8, 11, 0, 15),
              child: Text(
                '${state.countryCode} ',
                style: Theme.of(context).textTheme.bodyText1?.copyWith(
                      color: CustomColors.appColorBlack.withOpacity(0.32),
                    ),
              ),
            ),
            hintStyle: Theme.of(context).textTheme.bodyText1?.copyWith(
                  color: CustomColors.appColorBlack.withOpacity(0.32),
                ),
            prefixStyle: Theme.of(context).textTheme.bodyText1?.copyWith(
                  color: CustomColors.appColorBlack.withOpacity(0.32),
                ),
            suffixIcon: GestureDetector(
              onTap: () {
                _phoneInputController.text = '';
                FocusScope.of(context).requestFocus(
                  FocusNode(),
                );

                context
                    .read<PhoneAuthBloc>()
                    .add(const ClearPhoneNumberEvent());
              },
              child: suffixIcon,
            ),
            errorStyle: const TextStyle(
              fontSize: 0,
            ),
          ),
        );
      },
    );
  }
}

class EmailInputField extends StatefulWidget {
  const EmailInputField({Key? key}) : super(key: key);

  @override
  State<EmailInputField> createState() => _EmailInputFieldState();
}

class _EmailInputFieldState extends State<EmailInputField> {
  late TextEditingController _emailInputController;
  @override
  void dispose() {
    _emailInputController.dispose();
    super.dispose();
  }

  @override
  void initState() {
    super.initState();
    _emailInputController = TextEditingController();
  }

  @override
  Widget build(BuildContext context) {
    return BlocBuilder<EmailAuthBloc, EmailAuthState>(
      buildWhen: (previous, current) {
        return true;
      },
      builder: (context, state) {
        Color formColor = state.emailAddress.isValidEmail()
            ? CustomColors.appColorValid
            : CustomColors.appColorBlue;
        Color fillColor = state.emailAddress.isValidEmail()
            ? formColor.withOpacity(0.05)
            : Colors.transparent;
        Color textColor = state.emailAddress.isValidEmail()
            ? formColor
            : CustomColors.appColorBlack;
        Color suffixIconColor = state.emailAddress.isValidEmail()
            ? formColor
            : CustomColors.greyColor.withOpacity(0.7);

        if (state.blocStatus == BlocStatus.error) {
          formColor = CustomColors.appColorInvalid;
          textColor = formColor;
          suffixIconColor = formColor;
          fillColor = formColor.withOpacity(0.05);
        }

        InputBorder inputBorder = OutlineInputBorder(
          borderSide: BorderSide(color: formColor, width: 1.0),
          borderRadius: BorderRadius.circular(8.0),
        );

        Widget suffixIcon = state.emailAddress.isValidEmail()
            ? Padding(
                padding: const EdgeInsets.all(14),
                child: SvgPicture.asset(
                  'assets/icon/valid_input_icon.svg',
                  height: 1,
                  width: 1,
                ),
              )
            : TextInputCloseButton(
                color: suffixIconColor,
              );

        return TextFormField(
          controller: _emailInputController,
          onTap: () {
            context
                .read<EmailAuthBloc>()
                .add(UpdateEmailAddress(state.emailAddress));
          },
          onChanged: (value) {
            context.read<EmailAuthBloc>().add(UpdateEmailAddress(value));
          },
          onEditingComplete: () async {
            context
                .read<EmailAuthBloc>()
                .add(ValidateEmailAddress(context: context));
          },
          style:
              Theme.of(context).textTheme.bodyText1?.copyWith(color: textColor),
          enableSuggestions: true,
          cursorWidth: 1,
          autofocus: false,
          cursorColor: formColor,
          keyboardType: TextInputType.emailAddress,
          decoration: InputDecoration(
            contentPadding: const EdgeInsets.fromLTRB(16, 12, 0, 12),
            iconColor: formColor,
            fillColor: fillColor,
            filled: true,
            focusedBorder: inputBorder,
            enabledBorder: inputBorder,
            border: inputBorder,
            suffixIconColor: formColor,
            hintText: 'Enter your email',
            hintStyle: Theme.of(context).textTheme.bodyText1?.copyWith(
                  color: CustomColors.appColorBlack.withOpacity(0.32),
                ),
            prefixStyle: Theme.of(context).textTheme.bodyText1?.copyWith(
                  color: CustomColors.appColorBlack.withOpacity(0.32),
                ),
            suffixIcon: GestureDetector(
              onTap: () {
                _emailInputController.text = '';
                FocusScope.of(context).requestFocus(
                  FocusNode(),
                );

                context.read<EmailAuthBloc>().add(const ClearEmailAddress());
              },
              child: suffixIcon,
            ),
            errorStyle: const TextStyle(
              fontSize: 0,
            ),
          ),
        );
      },
    );
  }
}

class InputValidationErrorMessage extends StatelessWidget {
  const InputValidationErrorMessage({
    super.key,
    required this.visible,
    required this.message,
  });

  final bool visible;
  final String message;

  @override
  Widget build(BuildContext context) {
    return Visibility(
      visible: visible,
      child: Padding(
        padding: const EdgeInsets.only(top: 9),
        child: Row(
          mainAxisAlignment: MainAxisAlignment.center,
          crossAxisAlignment: CrossAxisAlignment.center,
          children: [
            SvgPicture.asset(
              'assets/icon/error_info_icon.svg',
            ),
            const SizedBox(
              width: 10,
            ),
            Center(
              child: Text(
                message,
                textAlign: TextAlign.center,
                style: Theme.of(context).textTheme.bodyText1?.copyWith(
                      color: CustomColors.appColorInvalid,
                      fontSize: 14,
                    ),
              ),
            ),
          ],
        ),
      ),
    );
  }
}

class InputValidationCodeMessage extends StatelessWidget {
  const InputValidationCodeMessage(this.visible, {super.key});

  final bool visible;

  @override
  Widget build(BuildContext context) {
    return Visibility(
      visible: visible,
      child: Padding(
        padding: const EdgeInsets.only(left: 16, right: 16, top: 8),
        child: AutoSizeText(
          'We’ll send you a verification code',
          textAlign: TextAlign.center,
          maxLines: 2,
          overflow: TextOverflow.ellipsis,
          style: Theme.of(context).textTheme.bodyText2?.copyWith(
                color: CustomColors.appColorBlack.withOpacity(0.6),
              ),
        ),
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
        context.read<AuthCodeBloc>().add(GuestUserEvent(context));
        await Navigator.pushAndRemoveUntil(
          context,
          MaterialPageRoute(builder: (context) {
            return const HomePage();
          }),
          (r) => false,
        );
      },
      child: Row(
        children: [
          const Spacer(),
          Text(
            'Proceed as',
            textAlign: TextAlign.center,
            style: Theme.of(context).textTheme.caption?.copyWith(
                  color: CustomColors.appColorBlack.withOpacity(0.6),
                ),
          ),
          const SizedBox(
            width: 2,
          ),
          Text(
            'Guest',
            textAlign: TextAlign.center,
            style: Theme.of(context).textTheme.caption?.copyWith(
                  color: CustomColors.appColorBlue,
                ),
          ),
          const Spacer(),
        ],
      ),
    );
  }
}

class SignUpButton extends StatelessWidget {
  const SignUpButton({
    super.key,
    required this.text,
  });

  final String text;

  @override
  Widget build(BuildContext context) {
    return Container(
      height: 48,
      constraints: const BoxConstraints(
        minWidth: double.infinity,
        maxHeight: 48,
      ),
      decoration: BoxDecoration(
        color: const Color(0xff8D8D8D).withOpacity(0.1),
        borderRadius: const BorderRadius.all(
          Radius.circular(8.0),
        ),
      ),
      child: Center(
        child: Padding(
          padding: const EdgeInsets.fromLTRB(0, 16, 0, 16),
          child: AutoSizeText(
            text,
            textAlign: TextAlign.center,
            style: Theme.of(context).textTheme.caption?.copyWith(
                  color: CustomColors.appColorBlue,
                ),
          ),
        ),
      ),
    );
  }
}

class SignUpOptions extends StatelessWidget {
  const SignUpOptions({super.key, required this.authMethod});

  final AuthMethod authMethod;

  @override
  Widget build(BuildContext context) {
    final tween = Tween<double>(begin: 0, end: 1);

    return Column(
      children: [
        GestureDetector(
          onTap: () {
            Navigator.pushAndRemoveUntil(
              context,
              PageRouteBuilder(
                pageBuilder: (context, animation, secondaryAnimation) {
                  switch (authMethod) {
                    case AuthMethod.none:
                    case AuthMethod.phone:
                      return const PhoneLoginWidget();
                    case AuthMethod.email:
                      return const EmailLoginWidget();
                  }
                },
                transitionsBuilder:
                    (context, animation, secondaryAnimation, child) {
                  return FadeTransition(
                    opacity: animation.drive(tween),
                    child: child,
                  );
                },
              ),
              (r) => false,
            );
          },
          child: Row(
            mainAxisAlignment: MainAxisAlignment.center,
            children: [
              Text(
                'Already have an account',
                textAlign: TextAlign.center,
                style: Theme.of(context).textTheme.caption?.copyWith(
                      color: CustomColors.appColorBlack.withOpacity(0.6),
                    ),
              ),
              const SizedBox(
                width: 2,
              ),
              Text(
                'Log in',
                textAlign: TextAlign.center,
                style: Theme.of(context).textTheme.caption?.copyWith(
                      color: CustomColors.appColorBlue,
                    ),
              ),
            ],
          ),
        ),
        const SizedBox(
          height: 8,
        ),
        const ProceedAsGuest(),
      ],
    );
  }
}

class CancelOption extends StatelessWidget {
  const CancelOption({
    super.key,
  });

  @override
  Widget build(BuildContext context) {
    return GestureDetector(
      onTap: () {
        Navigator.pop(context, false);
      },
      child: Text(
        'Cancel',
        textAlign: TextAlign.center,
        style: TextStyle(
          fontSize: 14,
          fontWeight: FontWeight.bold,
          color: CustomColors.appColorBlue,
        ),
      ),
    );
  }
}

class LoginOptions extends StatelessWidget {
  const LoginOptions({super.key, required this.authMethod});

  final AuthMethod authMethod;

  @override
  Widget build(BuildContext context) {
    final tween = Tween<double>(begin: 0, end: 1);

    return Column(
      mainAxisAlignment: MainAxisAlignment.center,
      crossAxisAlignment: CrossAxisAlignment.center,
      children: [
        GestureDetector(
          onTap: () {
            Navigator.pushAndRemoveUntil(
              context,
              PageRouteBuilder(
                pageBuilder: (context, animation, secondaryAnimation) {
                  switch (authMethod) {
                    case AuthMethod.none:
                    case AuthMethod.phone:
                      return const PhoneSignUpWidget();
                    case AuthMethod.email:
                      return const EmailSignUpWidget();
                  }
                },
                transitionsBuilder:
                    (context, animation, secondaryAnimation, child) {
                  return FadeTransition(
                    opacity: animation.drive(tween),
                    child: child,
                  );
                },
              ),
              (r) => false,
            );
          },
          child: Row(
            mainAxisAlignment: MainAxisAlignment.center,
            children: [
              Text(
                'Don’t have an account',
                textAlign: TextAlign.center,
                style: Theme.of(context).textTheme.caption?.copyWith(
                      color: CustomColors.appColorBlack.withOpacity(0.6),
                    ),
              ),
              const SizedBox(
                width: 2,
              ),
              Text(
                'Sign up',
                textAlign: TextAlign.center,
                style: Theme.of(context).textTheme.caption?.copyWith(
                      color: CustomColors.appColorBlue,
                    ),
              ),
            ],
          ),
        ),
        const SizedBox(
          height: 8,
        ),
        const ProceedAsGuest(),
      ],
    );
  }
}
