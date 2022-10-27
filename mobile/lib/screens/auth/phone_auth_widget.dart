import 'dart:async';

import 'package:app/blocs/blocs.dart';
import 'package:app/models/models.dart';
import 'package:app/screens/home_page.dart';
import 'package:app/widgets/dialogs.dart';
import 'package:auto_size_text/auto_size_text.dart';
import 'package:flutter/material.dart';
import 'package:flutter_bloc/flutter_bloc.dart';

import '../../themes/app_theme.dart';
import '../../themes/colors.dart';
import '../../widgets/buttons.dart';
import '../../widgets/custom_shimmer.dart';
import '../../widgets/custom_widgets.dart';
import '../../widgets/text_fields.dart';
import 'auth_verification.dart';
import 'auth_widgets.dart';
import 'email_auth_widget.dart';

class PhoneAuthWidget extends StatefulWidget {
  const PhoneAuthWidget({
    super.key,
    this.phoneNumber,
    required this.authProcedure,
  });
  final String? phoneNumber;
  final AuthProcedure authProcedure;

  @override
  PhoneAuthWidgetState createState() => PhoneAuthWidgetState();
}

class PhoneAuthWidgetState<T extends PhoneAuthWidget> extends State<T> {
  DateTime? _exitTime;
  late BuildContext _loadingContext;

  @override
  void initState() {
    super.initState();
    _loadingContext = context;
    context.read<PhoneAuthBloc>().add(InitializePhoneAuth(
          phoneNumber: widget.phoneNumber ?? '',
          authProcedure: widget.authProcedure,
        ));
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      body: WillPopScope(
        onWillPop: onWillPop,
        child: CustomSafeArea(
          widget: Container(
            color: Colors.white,
            child: BlocConsumer<PhoneAuthBloc, PhoneAuthState>(
              listener: (context, state) {},
              buildWhen: (previous, current) {
                return current.authStatus != AuthStatus.error &&
                    current.authStatus != AuthStatus.success &&
                    current.authStatus != AuthStatus.processing;
              },
              builder: (context, state) {
                return Center(
                  child: Padding(
                    padding: const EdgeInsets.symmetric(horizontal: 24),
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.center,
                      mainAxisAlignment: MainAxisAlignment.center,
                      children: [
                        MultiBlocListener(
                          listeners: [
                            BlocListener<PhoneAuthBloc, PhoneAuthState>(
                              listener: (context, state) {
                                loadingScreen(_loadingContext);
                              },
                              listenWhen: (previous, current) {
                                return current.authStatus ==
                                    AuthStatus.processing;
                              },
                            ),
                            BlocListener<PhoneAuthBloc, PhoneAuthState>(
                              listener: (context, state) {
                                Navigator.pop(_loadingContext);
                              },
                              listenWhen: (previous, current) {
                                return previous.authStatus ==
                                    AuthStatus.processing;
                              },
                            ),
                            BlocListener<PhoneAuthBloc, PhoneAuthState>(
                              listener: (context, state) {
                                showSnackBar(context, state.error.message);
                              },
                              listenWhen: (previous, current) {
                                return current.authStatus == AuthStatus.error &&
                                    current.error != AuthenticationError.none;
                              },
                            ),
                            BlocListener<PhoneAuthBloc, PhoneAuthState>(
                              listener: (context, state) {
                                context
                                    .read<AuthCodeBloc>()
                                    .add(InitializeAuthCodeState(
                                      phoneNumber:
                                          '${state.countryCode} ${state.phoneNumber}',
                                      verificationId: state.verificationId,
                                      credential: state.credential,
                                      authProcedure: state.authProcedure,
                                    ));

                                Navigator.push(
                                  context,
                                  MaterialPageRoute(builder: (context) {
                                    return const AuthVerificationWidget();
                                  }),
                                );
                              },
                              listenWhen: (previous, current) {
                                return current.authStatus == AuthStatus.success;
                              },
                            ),
                          ],
                          child: Container(),
                        ),
                        Padding(
                          padding: const EdgeInsets.symmetric(horizontal: 16),
                          child: AutoSizeText(
                            AuthMethod.phone.optionsText(state.authProcedure),
                            textAlign: TextAlign.center,
                            maxLines: 2,
                            overflow: TextOverflow.ellipsis,
                            style: CustomTextStyle.headline7(context),
                          ),
                        ),
                        const SizedBox(
                          height: 8,
                        ),
                        Padding(
                          padding: const EdgeInsets.symmetric(horizontal: 16),
                          child: AutoSizeText(
                            'We’ll send you a verification code',
                            textAlign: TextAlign.center,
                            maxLines: 2,
                            overflow: TextOverflow.ellipsis,
                            style:
                                Theme.of(context).textTheme.bodyText2?.copyWith(
                                      color: CustomColors.appColorBlack
                                          .withOpacity(0.6),
                                    ),
                          ),
                        ),
                        const SizedBox(
                          height: 32,
                        ),
                        SizedBox(
                          height: 48,
                          child: Row(
                            children: [
                              SizedBox(
                                width: 64,
                                child: CountryCodePickerField(
                                  valueChange: (code) {
                                    context.read<PhoneAuthBloc>().add(
                                        UpdateCountryCode(
                                            code ?? state.countryCode));
                                  },
                                  placeholder: state.countryCode,
                                ),
                              ),
                              const SizedBox(
                                width: 16,
                              ),
                              const Expanded(
                                child: PhoneInputField(),
                              ),
                            ],
                          ),
                        ),
                        const SizedBox(
                          height: 32,
                        ),
                        GestureDetector(
                          onTap: () {
                            setState(
                              () {
                                Navigator.pushAndRemoveUntil(
                                  context,
                                  PageRouteBuilder(
                                    pageBuilder: (context, animation,
                                            secondaryAnimation) =>
                                        state.authProcedure ==
                                                AuthProcedure.login
                                            ? const EmailLoginWidget()
                                            : const EmailSignUpWidget(),
                                    transitionsBuilder: (
                                      context,
                                      animation,
                                      secondaryAnimation,
                                      child,
                                    ) {
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
                            );
                          },
                          child: SignUpButton(
                            text: AuthMethod.phone
                                .optionsButtonText(state.authProcedure),
                          ),
                        ),
                        const Spacer(),
                        GestureDetector(
                          onTap: () async {
                            if (state.isValidPhoneNumber) {
                              await showDialog<ConfirmationAction>(
                                context: context,
                                barrierDismissible: false,
                                builder: (BuildContext context) {
                                  return AuthMethodDialog(
                                    credentials:
                                        '${state.countryCode} ${state.phoneNumber}',
                                    authMethod: AuthMethod.phone,
                                  );
                                },
                              ).then((action) => {
                                    if (action != null ||
                                        action == ConfirmationAction.ok)
                                      {
                                        context.read<PhoneAuthBloc>().add(
                                            InitiatePhoneNumberVerification(
                                                context: context))
                                      }
                                  });
                            }
                          },
                          child: NextButton(
                            buttonColor: state.isValidPhoneNumber
                                ? CustomColors.appColorBlue
                                : CustomColors.appColorDisabled,
                          ),
                        ),
                        Visibility(
                          visible: state.authStatus != AuthStatus.editing,
                          child: const SizedBox(
                            height: 16,
                          ),
                        ),
                        Visibility(
                          visible: state.authStatus != AuthStatus.editing,
                          child: state.authProcedure == AuthProcedure.login
                              ? const LoginOptions()
                              : const SignUpOptions(),
                        ),
                      ],
                    ),
                  ),
                );
              },
            ),
          ),
        ),
      ),
    );
  }

  Future<bool> onWillPop() {
    final now = DateTime.now();

    if (_exitTime == null ||
        now.difference(_exitTime!) > const Duration(seconds: 2)) {
      _exitTime = now;

      showSnackBar(
        context,
        'Tap again to cancel!',
      );

      return Future.value(false);
    }

    Navigator.pushAndRemoveUntil(
      context,
      MaterialPageRoute(
        builder: (context) {
          return const HomePage();
        },
      ),
      (r) => false,
    );

    return Future.value(false);
  }
}

class PhoneLoginWidget extends PhoneAuthWidget {
  const PhoneLoginWidget({super.key, String? phoneNumber})
      : super(
          phoneNumber: phoneNumber,
          authProcedure: AuthProcedure.login,
        );

  @override
  PhoneLoginWidgetState createState() => PhoneLoginWidgetState();
}

class PhoneLoginWidgetState extends PhoneAuthWidgetState<PhoneLoginWidget> {}

class PhoneSignUpWidget extends PhoneAuthWidget {
  const PhoneSignUpWidget({super.key})
      : super(authProcedure: AuthProcedure.signup);

  @override
  PhoneSignUpWidgetState createState() => PhoneSignUpWidgetState();
}

class PhoneSignUpWidgetState extends PhoneAuthWidgetState<PhoneSignUpWidget> {}
