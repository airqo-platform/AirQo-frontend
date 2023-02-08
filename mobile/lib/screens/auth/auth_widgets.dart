import 'dart:async';

import 'package:app/blocs/blocs.dart';
import 'package:app/constants/constants.dart';
import 'package:app/models/enum_constants.dart';
import 'package:app/models/models.dart';
import 'package:app/screens/auth/phone_auth_widget.dart';
import 'package:app/services/services.dart';
import 'package:app/themes/theme.dart';
import 'package:app/utils/utils.dart';
import 'package:app/widgets/widgets.dart';
import 'package:auto_size_text/auto_size_text.dart';
import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:flutter_bloc/flutter_bloc.dart';
import 'package:flutter_svg/svg.dart';

import '../on_boarding/on_boarding_widgets.dart';
import 'email_auth_widget.dart';

class PhoneInputField extends StatefulWidget {
  const PhoneInputField({super.key});

  @override
  State<PhoneInputField> createState() => _PhoneInputFieldState();
}

class _PhoneInputFieldState extends State<PhoneInputField> {
  final TextEditingController _phoneInputController = TextEditingController();
  @override
  void dispose() {
    _phoneInputController.dispose();
    super.dispose();
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

        if (state.status == PhoneBlocStatus.error) {
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
          onEditingComplete: () {
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
              Theme.of(context).textTheme.bodyLarge?.copyWith(color: textColor),
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
                style: Theme.of(context).textTheme.bodyLarge?.copyWith(
                      color: CustomColors.appColorBlack.withOpacity(0.32),
                    ),
              ),
            ),
            hintStyle: Theme.of(context).textTheme.bodyLarge?.copyWith(
                  color: CustomColors.appColorBlack.withOpacity(0.32),
                ),
            prefixStyle: Theme.of(context).textTheme.bodyLarge?.copyWith(
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

class PhoneAuthVerificationWidget extends StatefulWidget {
  const PhoneAuthVerificationWidget({super.key});

  @override
  State<PhoneAuthVerificationWidget> createState() =>
      _PhoneAuthVerificationWidgetState();
}

class _PhoneAuthVerificationWidgetState
    extends State<PhoneAuthVerificationWidget> {
  void _startCodeSentCountDown() {
    context.read<PhoneAuthBloc>().add(const UpdatePhoneCountDown(5));

    Timer.periodic(
      const Duration(milliseconds: 1200),
      (Timer timer) {
        if (mounted) {
          final count = context.read<PhoneAuthBloc>().state.codeCountDown - 1;
          context.read<PhoneAuthBloc>().add(UpdatePhoneCountDown(count));
          if (count == 0) {
            setState(() => timer.cancel());
          }
        }
      },
    );
  }

  @override
  void initState() {
    super.initState();
    _startCodeSentCountDown();
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: const OnBoardingTopBar(backgroundColor: Colors.white),
      body: AppSafeArea(
        horizontalPadding: 24,
        backgroundColor: Colors.white,
        widget: BlocBuilder<PhoneAuthBloc, PhoneAuthState>(
          builder: (context, state) {
            return Column(
              crossAxisAlignment: CrossAxisAlignment.center,
              mainAxisAlignment: MainAxisAlignment.center,
              children: [
                MultiBlocListener(
                  listeners: [
                    // verification success listener
                    BlocListener<PhoneAuthBloc, PhoneAuthState>(
                      listener: (context, state) async {
                        await AppService.postSignInActions(
                          context,
                          state.authProcedure,
                        );
                      },
                      listenWhen: (previous, current) {
                        return previous.status != current.status &&
                            current.status ==
                                PhoneBlocStatus.verificationSuccessful;
                      },
                    ),

                    BlocListener<PhoneAuthBloc, PhoneAuthState>(
                      listener: (context, state) {
                        _startCodeSentCountDown();
                      },
                      listenWhen: (previous, current) {
                        return previous.status != current.status &&
                            current.status ==
                                EmailBlocStatus.verificationCodeSent;
                      },
                    ),

                    // loading screen listeners
                    BlocListener<PhoneAuthBloc, PhoneAuthState>(
                      listener: (context, state) {
                        loadingScreen(context);
                      },
                      listenWhen: (previous, current) {
                        return current.status == PhoneBlocStatus.processing;
                      },
                    ),
                    BlocListener<PhoneAuthBloc, PhoneAuthState>(
                      listener: (context, state) {
                        Navigator.pop(context);
                      },
                      listenWhen: (previous, current) {
                        return previous.status == PhoneBlocStatus.processing;
                      },
                    ),
                  ],
                  child: Container(),
                ),
                AutoSizeText(
                  'Verify your account',
                  textAlign: TextAlign.center,
                  maxLines: 1,
                  overflow: TextOverflow.ellipsis,
                  style: CustomTextStyle.headline7(context),
                ),
                const SizedBox(
                  height: 14,
                ),
                Padding(
                  padding: const EdgeInsets.symmetric(horizontal: 16),
                  child: AutoSizeText(
                    AuthMethod.phone.codeVerificationText,
                    textAlign: TextAlign.center,
                    maxLines: 2,
                    overflow: TextOverflow.ellipsis,
                    style: Theme.of(context).textTheme.bodyMedium?.copyWith(
                          color: CustomColors.appColorBlack.withOpacity(0.6),
                        ),
                  ),
                ),
                const SizedBox(
                  height: 5,
                ),
                AutoSizeText(
                  state.fullPhoneNumber(),
                  textAlign: TextAlign.center,
                  maxLines: 1,
                  overflow: TextOverflow.ellipsis,
                  style: Theme.of(context).textTheme.bodyMedium?.copyWith(
                        fontSize: 18.0,
                        color: CustomColors.appColorBlue,
                      ),
                ),
                const SizedBox(
                  height: 15,
                ),
                Padding(
                  padding: const EdgeInsets.symmetric(horizontal: 36),
                  child: PhoneOptField(
                    callbackFn: (String value) {
                      context.read<PhoneAuthBloc>().add(UpdatePhoneAuthCode(
                            value,
                          ));
                    },
                    status: state.status,
                    codeCountDown: state.codeCountDown,
                  ),
                ),
                InputValidationErrorMessage(
                  visible: state.status == PhoneBlocStatus.error &&
                      state.error == PhoneBlocError.verificationFailed,
                  message: state.errorMessage,
                ),
                const SizedBox(
                  height: 16,
                ),
                Visibility(
                  visible: state.codeCountDown > 0,
                  child: Text(
                    'The code should arrive with in ${state.codeCountDown} sec',
                    textAlign: TextAlign.center,
                    style: Theme.of(context).textTheme.bodySmall?.copyWith(
                          color: CustomColors.appColorBlack.withOpacity(0.5),
                        ),
                  ),
                ),
                Visibility(
                  visible: state.codeCountDown <= 0 &&
                      state.status != PhoneBlocStatus.verificationSuccessful,
                  child: GestureDetector(
                    onTap: () {
                      FocusManager.instance.primaryFocus?.unfocus();
                      context.read<PhoneAuthBloc>().add(VerifyPhoneNumber(
                            context,
                            showConfirmationDialog: false,
                          ));
                    },
                    child: Text(
                      'Resend code',
                      textAlign: TextAlign.center,
                      style: Theme.of(context).textTheme.bodySmall?.copyWith(
                            color: CustomColors.appColorBlue,
                          ),
                    ),
                  ),
                ),
                Visibility(
                  visible: state.codeCountDown <= 0 &&
                      state.status != PhoneBlocStatus.verificationSuccessful,
                  child: Padding(
                    padding: const EdgeInsets.only(
                      left: 36,
                      right: 36,
                      top: 19,
                    ),
                    child: Stack(
                      alignment: AlignmentDirectional.center,
                      children: [
                        Container(
                          height: 1.09,
                          color: Colors.black.withOpacity(0.05),
                        ),
                        Container(
                          color: Colors.white,
                          padding: const EdgeInsets.symmetric(horizontal: 5),
                          child: Text(
                            'Or',
                            style:
                                Theme.of(context).textTheme.bodySmall?.copyWith(
                                      color: const Color(0xffD1D3D9),
                                    ),
                          ),
                        ),
                      ],
                    ),
                  ),
                ),
                Visibility(
                  visible: state.codeCountDown <= 0 &&
                      state.status != PhoneBlocStatus.verificationSuccessful,
                  child: Padding(
                    padding: const EdgeInsets.only(top: 19),
                    child: GestureDetector(
                      onTap: () {
                        FocusManager.instance.primaryFocus?.unfocus();
                        Navigator.pop(context);
                        context
                            .read<PhoneAuthBloc>()
                            .add(const ClearPhoneNumberEvent());
                      },
                      child: Text(
                        AuthMethod.phone.editEntryText,
                        textAlign: TextAlign.center,
                        style: Theme.of(context).textTheme.bodySmall?.copyWith(
                              color: CustomColors.appColorBlue,
                            ),
                      ),
                    ),
                  ),
                ),
                Visibility(
                  visible:
                      state.status == PhoneBlocStatus.verificationSuccessful,
                  child: const Spacer(),
                ),
                Visibility(
                  visible:
                      state.status == PhoneBlocStatus.verificationSuccessful,
                  child: Center(
                    child: Container(
                      height: 151,
                      width: 151,
                      padding: const EdgeInsets.all(25),
                      decoration: BoxDecoration(
                        color: CustomColors.appColorValid.withOpacity(0.1),
                        borderRadius: const BorderRadius.all(
                          Radius.circular(15.0),
                        ),
                      ),
                      child: SvgPicture.asset(
                        'assets/icon/valid_input_icon.svg',
                      ),
                    ),
                  ),
                ),
                const Spacer(),
                Visibility(
                  visible: state.codeCountDown <= 0 &&
                      state.status != PhoneBlocStatus.verificationSuccessful,
                  child: NextButton(
                    buttonColor: state.inputAuthCode.length >= 6
                        ? CustomColors.appColorBlue
                        : CustomColors.appColorDisabled,
                    callBack: () {
                      FocusManager.instance.primaryFocus?.unfocus();
                      context
                          .read<PhoneAuthBloc>()
                          .add(const VerifyPhoneAuthCode());
                    },
                  ),
                ),
                Visibility(
                  visible:
                      state.status != PhoneBlocStatus.verificationSuccessful,
                  child: const SizedBox(
                    height: 12,
                  ),
                ),
              ],
            );
          },
        ),
      ),
    );
  }
}

class EmailAuthVerificationWidget extends StatefulWidget {
  const EmailAuthVerificationWidget({super.key});

  @override
  State<EmailAuthVerificationWidget> createState() =>
      _EmailAuthVerificationWidgetState();
}

class _EmailAuthVerificationWidgetState
    extends State<EmailAuthVerificationWidget> {
  void _startCodeSentCountDown() {
    context.read<EmailAuthBloc>().add(const UpdateEmailCountDown(5));

    Timer.periodic(
      const Duration(milliseconds: 1200),
      (Timer timer) {
        if (mounted) {
          final count = context.read<EmailAuthBloc>().state.codeCountDown - 1;
          context.read<EmailAuthBloc>().add(UpdateEmailCountDown(count));
          if (count == 0) {
            setState(() => timer.cancel());
          }
        }
      },
    );
  }

  @override
  void initState() {
    super.initState();
    _startCodeSentCountDown();
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: const OnBoardingTopBar(backgroundColor: Colors.white),
      body: AppSafeArea(
        horizontalPadding: 24,
        backgroundColor: Colors.white,
        widget: BlocBuilder<EmailAuthBloc, EmailAuthState>(
          builder: (context, state) {
            final String cancelText = AuthMethod.email.editEntryText;

            return Column(
              crossAxisAlignment: CrossAxisAlignment.center,
              mainAxisAlignment: MainAxisAlignment.center,
              children: [
                MultiBlocListener(
                  listeners: [
                    // verification success listener
                    BlocListener<EmailAuthBloc, EmailAuthState>(
                      listener: (context, state) async {
                        await AppService.postSignInActions(
                          context,
                          state.authProcedure,
                        );
                      },
                      listenWhen: (previous, current) {
                        return previous.status != current.status &&
                            current.status ==
                                EmailBlocStatus.verificationSuccessful;
                      },
                    ),

                    BlocListener<EmailAuthBloc, EmailAuthState>(
                      listener: (context, state) {
                        _startCodeSentCountDown();
                      },
                      listenWhen: (previous, current) {
                        return previous.status != current.status &&
                            current.status ==
                                EmailBlocStatus.verificationCodeSent;
                      },
                    ),

                    // loading screen listeners
                    BlocListener<EmailAuthBloc, EmailAuthState>(
                      listener: (context, state) {
                        loadingScreen(context);
                      },
                      listenWhen: (previous, current) {
                        return current.status == EmailBlocStatus.processing;
                      },
                    ),
                    BlocListener<EmailAuthBloc, EmailAuthState>(
                      listener: (context, state) {
                        Navigator.pop(context);
                      },
                      listenWhen: (previous, current) {
                        return previous.status == EmailBlocStatus.processing;
                      },
                    ),
                  ],
                  child: Container(),
                ),
                AutoSizeText(
                  'Verify your account',
                  textAlign: TextAlign.center,
                  maxLines: 1,
                  overflow: TextOverflow.ellipsis,
                  style: CustomTextStyle.headline7(context),
                ),
                const SizedBox(
                  height: 14,
                ),
                Padding(
                  padding: const EdgeInsets.symmetric(horizontal: 16),
                  child: AutoSizeText(
                    AuthMethod.email.codeVerificationText,
                    textAlign: TextAlign.center,
                    maxLines: 2,
                    overflow: TextOverflow.ellipsis,
                    style: Theme.of(context).textTheme.bodyMedium?.copyWith(
                          color: CustomColors.appColorBlack.withOpacity(0.6),
                        ),
                  ),
                ),
                const SizedBox(
                  height: 5,
                ),
                AutoSizeText(
                  state.emailAddress,
                  textAlign: TextAlign.center,
                  maxLines: 1,
                  overflow: TextOverflow.ellipsis,
                  style: Theme.of(context).textTheme.bodyMedium?.copyWith(
                        fontSize: 18.0,
                        color: CustomColors.appColorBlue,
                      ),
                ),
                const SizedBox(
                  height: 15,
                ),
                Padding(
                  padding: const EdgeInsets.symmetric(horizontal: 36),
                  child: EmailOptField(
                    callbackFn: (String value) {
                      context.read<EmailAuthBloc>().add(UpdateEmailAuthCode(
                            value,
                          ));
                    },
                    status: state.status,
                    codeCountDown: state.codeCountDown,
                  ),
                ),
                InputValidationErrorMessage(
                  visible: state.status == EmailBlocStatus.error &&
                      state.error == EmailBlocError.verificationFailed,
                  message: state.errorMessage,
                ),
                const SizedBox(
                  height: 16,
                ),
                Visibility(
                  visible: state.codeCountDown > 0,
                  child: Text(
                    'The code should arrive with in ${state.codeCountDown} sec',
                    textAlign: TextAlign.center,
                    style: Theme.of(context).textTheme.bodySmall?.copyWith(
                          color: CustomColors.appColorBlack.withOpacity(0.5),
                        ),
                  ),
                ),
                Visibility(
                  visible:
                      state.status != EmailBlocStatus.verificationSuccessful,
                  child: GestureDetector(
                    onTap: () {
                      FocusManager.instance.primaryFocus?.unfocus();
                      context.read<EmailAuthBloc>().add(ValidateEmailAddress(
                            context,
                            showConfirmationDialog: false,
                          ));
                    },
                    child: Text(
                      'Resend code',
                      textAlign: TextAlign.center,
                      style: Theme.of(context).textTheme.bodySmall?.copyWith(
                            color: CustomColors.appColorBlue,
                          ),
                    ),
                  ),
                ),
                Visibility(
                  visible: state.codeCountDown <= 0 &&
                      state.status != EmailBlocStatus.verificationSuccessful,
                  child: Padding(
                    padding: const EdgeInsets.only(
                      left: 36,
                      right: 36,
                      top: 19,
                    ),
                    child: Stack(
                      alignment: AlignmentDirectional.center,
                      children: [
                        Container(
                          height: 1.09,
                          color: Colors.black.withOpacity(0.05),
                        ),
                        Container(
                          color: Colors.white,
                          padding: const EdgeInsets.symmetric(horizontal: 5),
                          child: Text(
                            'Or',
                            style:
                                Theme.of(context).textTheme.bodySmall?.copyWith(
                                      color: const Color(0xffD1D3D9),
                                    ),
                          ),
                        ),
                      ],
                    ),
                  ),
                ),
                Visibility(
                  visible: state.codeCountDown <= 0 &&
                      state.status != EmailBlocStatus.verificationSuccessful,
                  child: Padding(
                    padding: const EdgeInsets.only(top: 19),
                    child: GestureDetector(
                      onTap: () {
                        FocusManager.instance.primaryFocus?.unfocus();
                        context
                            .read<EmailAuthBloc>()
                            .add(const ClearEmailAddress());
                        Navigator.pop(context);
                      },
                      child: Text(
                        cancelText,
                        textAlign: TextAlign.center,
                        style: Theme.of(context).textTheme.bodySmall?.copyWith(
                              color: CustomColors.appColorBlue,
                            ),
                      ),
                    ),
                  ),
                ),
                Visibility(
                  visible:
                      state.status == EmailBlocStatus.verificationSuccessful,
                  child: const Spacer(),
                ),
                Visibility(
                  visible:
                      state.status == EmailBlocStatus.verificationSuccessful,
                  child: Center(
                    child: Container(
                      height: 151,
                      width: 151,
                      padding: const EdgeInsets.all(25),
                      decoration: BoxDecoration(
                        color: CustomColors.appColorValid.withOpacity(0.1),
                        borderRadius: const BorderRadius.all(
                          Radius.circular(15.0),
                        ),
                      ),
                      child: SvgPicture.asset(
                        'assets/icon/valid_input_icon.svg',
                      ),
                    ),
                  ),
                ),
                const Spacer(),
                Visibility(
                  visible: state.codeCountDown <= 0 &&
                      state.status != EmailBlocStatus.verificationSuccessful,
                  child: NextButton(
                    buttonColor: state.inputAuthCode.length >= 6
                        ? CustomColors.appColorBlue
                        : CustomColors.appColorDisabled,
                    callBack: () {
                      FocusManager.instance.primaryFocus?.unfocus();
                      context
                          .read<EmailAuthBloc>()
                          .add(const VerifyEmailCode());
                    },
                  ),
                ),
                Visibility(
                  visible:
                      state.status != EmailBlocStatus.verificationSuccessful,
                  child: const SizedBox(
                    height: 12,
                  ),
                ),
              ],
            );
          },
        ),
      ),
    );
  }
}

class EmailInputField extends StatefulWidget {
  const EmailInputField({Key? key}) : super(key: key);

  @override
  State<EmailInputField> createState() => _EmailInputFieldState();
}

class _EmailInputFieldState extends State<EmailInputField> {
  final TextEditingController _emailInputController = TextEditingController();

  @override
  void dispose() {
    _emailInputController.dispose();
    super.dispose();
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

        if (state.status == EmailBlocStatus.error) {
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
          onEditingComplete: () {
            context.read<EmailAuthBloc>().add(ValidateEmailAddress(context));
          },
          style:
              Theme.of(context).textTheme.bodyLarge?.copyWith(color: textColor),
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
            hintStyle: Theme.of(context).textTheme.bodyLarge?.copyWith(
                  color: CustomColors.appColorBlack.withOpacity(0.32),
                ),
            prefixStyle: Theme.of(context).textTheme.bodyLarge?.copyWith(
                  color: CustomColors.appColorBlack.withOpacity(0.32),
                ),
            suffixIcon: GestureDetector(
              onTap: () {
                _emailInputController.text = '';
                FocusManager.instance.primaryFocus?.unfocus();
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
                style: Theme.of(context).textTheme.bodyLarge?.copyWith(
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

class VerificationCodeMessage extends StatelessWidget {
  const VerificationCodeMessage(this.visible, {super.key});

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
          style: Theme.of(context).textTheme.bodyMedium?.copyWith(
                color: CustomColors.appColorBlack.withOpacity(0.6),
              ),
        ),
      ),
    );
  }
}

class ProceedAsGuest extends StatefulWidget {
  const ProceedAsGuest({super.key});

  @override
  State<ProceedAsGuest> createState() => _ProceedAsGuestState();
}

class _ProceedAsGuestState extends State<ProceedAsGuest> {
  @override
  Widget build(BuildContext context) {
    return InkWell(
      onTap: () async {
        await _guestSignIn();
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

  Future<void> _guestSignIn() async {
    final hasConnection = await hasNetworkConnection();
    if (!hasConnection) {
      if (!mounted) return;
      showSnackBar(context, "Check your internet connection");

      return;
    }
    if (!mounted) return;

    loadingScreen(context);

    final success = await CustomAuth.guestSignIn();

    if (!mounted) return;

    if (success) {
      Navigator.pop(context);
      await AppService.postSignInActions(
        context,
        AuthProcedure.anonymousLogin,
        delay: 0,
      );
    } else {
      Navigator.pop(context);
      showSnackBar(context, Config.guestLogInFailed);
    }
  }
}

class SignUpButton extends StatelessWidget {
  const SignUpButton({
    super.key,
    required this.authProcedure,
    required this.authMethod,
  });
  final AuthProcedure authProcedure;
  final AuthMethod authMethod;

  @override
  Widget build(BuildContext context) {
    return SizedBox(
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
                        ? const EmailLoginWidget()
                        : const EmailSignUpWidget();
                  case AuthMethod.email:
                    return authProcedure == AuthProcedure.login
                        ? const PhoneLoginWidget()
                        : const PhoneSignUpWidget();
                  case AuthMethod.none:
                    return const PhoneSignUpWidget();
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
    );
  }
}

class SignUpOptions extends StatelessWidget {
  const SignUpOptions({super.key, required this.authMethod});

  final AuthMethod authMethod;

  @override
  Widget build(BuildContext context) {
    final tween = Tween<double>(begin: 0, end: 1);

    return SizedBox(
      height: 60,
      child: Column(
        mainAxisAlignment: MainAxisAlignment.spaceBetween,
        children: [
          Expanded(
            child: InkWell(
              onTap: () async {
                await Navigator.pushAndRemoveUntil(
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
              child: SizedBox(
                width: double.infinity,
                child: Row(
                  mainAxisAlignment: MainAxisAlignment.center,
                  crossAxisAlignment: CrossAxisAlignment.center,
                  children: [
                    Text(
                      'Already have an account',
                      textAlign: TextAlign.center,
                      style: Theme.of(context).textTheme.bodySmall?.copyWith(
                            color: CustomColors.appColorBlack.withOpacity(0.6),
                          ),
                    ),
                    const SizedBox(
                      width: 2,
                    ),
                    Text(
                      'Log in',
                      textAlign: TextAlign.center,
                      style: Theme.of(context).textTheme.bodySmall?.copyWith(
                            color: CustomColors.appColorBlue,
                          ),
                    ),
                  ],
                ),
              ),
            ),
          ),
          const Expanded(child: ProceedAsGuest()),
        ],
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

    return SizedBox(
      height: 60,
      child: Column(
        mainAxisAlignment: MainAxisAlignment.spaceBetween,
        children: [
          Expanded(
            child: InkWell(
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
              child: SizedBox(
                width: double.infinity,
                child: Row(
                  mainAxisAlignment: MainAxisAlignment.center,
                  crossAxisAlignment: CrossAxisAlignment.center,
                  children: [
                    Text(
                      'Don’t have an account',
                      textAlign: TextAlign.center,
                      style: Theme.of(context).textTheme.bodySmall?.copyWith(
                            color: CustomColors.appColorBlack.withOpacity(0.6),
                          ),
                    ),
                    const SizedBox(
                      width: 2,
                    ),
                    Text(
                      'Sign up',
                      textAlign: TextAlign.center,
                      style: Theme.of(context).textTheme.bodySmall?.copyWith(
                            color: CustomColors.appColorBlue,
                          ),
                    ),
                  ],
                ),
              ),
            ),
          ),
          const Expanded(child: ProceedAsGuest()),
        ],
      ),
    );
  }
}
