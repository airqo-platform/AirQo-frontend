import 'package:app/blocs/blocs.dart';
import 'package:app/screens/auth/phone_auth_widget.dart';
import 'package:app/screens/home_page.dart';
import 'package:auto_size_text/auto_size_text.dart';
import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:flutter_bloc/flutter_bloc.dart';

import '../../themes/colors.dart';
import '../../widgets/text_fields.dart';

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
      buildWhen: (previous, current) {
        return true;
      },
      builder: (context, state) {
        return TextFormField(
          controller: _phoneInputController,
          inputFormatters: [
            FilteringTextInputFormatter.allow(
              RegExp(r'[0-9]'),
            ),
            PhoneNumberInputFormatter(),
          ],
          // initialValue: state.phoneNumber,
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
          style: Theme.of(context).textTheme.bodyText1,
          validator: (value) {
            if (value == null || value.isEmpty) {
              return 'Please enter your phone number';
            }
            return null;
          },
          enableSuggestions: false,
          cursorWidth: 1,
          autofocus: false,
          cursorColor: CustomColors.appColorBlue,
          keyboardType: TextInputType.number,
          decoration: InputDecoration(
            contentPadding: const EdgeInsets.fromLTRB(16, 12, 0, 12),
            focusedBorder: OutlineInputBorder(
              borderSide:
                  BorderSide(color: CustomColors.appColorBlue, width: 1.0),
              borderRadius: BorderRadius.circular(8.0),
            ),
            enabledBorder: OutlineInputBorder(
              borderSide:
                  BorderSide(color: CustomColors.appColorBlue, width: 1.0),
              borderRadius: BorderRadius.circular(8.0),
            ),
            border: OutlineInputBorder(
              borderSide:
                  BorderSide(color: CustomColors.appColorBlue, width: 1.0),
              borderRadius: BorderRadius.circular(8.0),
            ),
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
              child: const TextInputCloseButton(),
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

class ProceedAsGuest extends StatelessWidget {
  const ProceedAsGuest({super.key});

  @override
  Widget build(BuildContext context) {
    return InkWell(
      onTap: () async {
        context.read<AuthCodeBloc>().add(const GuestUserEvent());
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
  const SignUpOptions({
    super.key,
  });

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
                pageBuilder: (context, animation, secondaryAnimation) =>
                    const PhoneLoginWidget(),
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
  const LoginOptions({
    super.key,
  });

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
                pageBuilder: (context, animation, secondaryAnimation) =>
                    const PhoneSignUpWidget(),
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
