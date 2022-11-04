import 'dart:async';

import 'package:app/blocs/blocs.dart';
import 'package:app/models/models.dart';
import 'package:app/screens/auth/phone_auth_widget.dart';
import 'package:app/screens/home_page.dart';
import 'package:app/services/services.dart';
import 'package:app/themes/theme.dart';
import 'package:app/utils/utils.dart';
import 'package:app/widgets/widgets.dart';
import 'package:auto_size_text/auto_size_text.dart';
import 'package:flutter/material.dart';
import 'package:flutter_bloc/flutter_bloc.dart';

import '../on_boarding/on_boarding_widgets.dart';
import '../on_boarding/profile_setup_screen.dart';
import 'auth_verification.dart';
import 'auth_widgets.dart';

class EmailAuthWidget extends StatefulWidget {
  const EmailAuthWidget({
    super.key,
    this.emailAddress,
    required this.authProcedure,
  });
  final String? emailAddress;
  final AuthProcedure authProcedure;

  @override
  EmailAuthWidgetState createState() => EmailAuthWidgetState();
}

class EmailAuthWidgetState<T extends EmailAuthWidget> extends State<T> {
  DateTime? _exitTime;
  late BuildContext _loadingContext;

  @override
  void initState() {
    super.initState();
    _loadingContext = context;
    context.read<EmailAuthBloc>().add(InitializeEmailAuth(
          emailAddress: widget.emailAddress ?? '',
          authProcedure: widget.authProcedure,
        ));
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: const OnBoardingTopBar(backgroundColor: Colors.white),
      body: WillPopScope(
        onWillPop: onWillPop,
        child: AppSafeArea(
          backgroundColor: Colors.white,
          widget: BlocConsumer<EmailAuthBloc, EmailAuthState>(
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
                          BlocListener<EmailAuthBloc, EmailAuthState>(
                            listener: (context, state) {
                              loadingScreen(_loadingContext);
                            },
                            listenWhen: (previous, current) {
                              return current.authStatus ==
                                  AuthStatus.processing;
                            },
                          ),
                          BlocListener<EmailAuthBloc, EmailAuthState>(
                            listener: (context, state) {
                              Navigator.pop(_loadingContext);
                            },
                            listenWhen: (previous, current) {
                              return previous.authStatus ==
                                  AuthStatus.processing;
                            },
                          ),
                          BlocListener<EmailAuthBloc, EmailAuthState>(
                            listener: (context, state) {
                              showSnackBar(context, state.error.message);
                            },
                            listenWhen: (previous, current) {
                              return current.authStatus == AuthStatus.error &&
                                  current.error != AuthenticationError.none;
                            },
                          ),
                          BlocListener<EmailAuthBloc, EmailAuthState>(
                            listener: (context, state) {
                              context
                                  .read<AuthCodeBloc>()
                                  .add(InitializeAuthCodeState(
                                    emailAddress: state.emailAddress,
                                    authProcedure: state.authProcedure,
                                    authMethod: AuthMethod.email,
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
                          AuthMethod.email.optionsText(state.authProcedure),
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
                          style: Theme.of(context)
                              .textTheme
                              .bodyText2
                              ?.copyWith(
                                color:
                                    CustomColors.appColorBlack.withOpacity(0.6),
                              ),
                        ),
                      ),
                      const SizedBox(
                        height: 32,
                      ),
                      const SizedBox(
                        height: 48,
                        child: EmailInputField(),
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
                                      state.authProcedure == AuthProcedure.login
                                          ? const PhoneLoginWidget()
                                          : const PhoneSignUpWidget(),
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
                          text: AuthMethod.email
                              .optionsButtonText(state.authProcedure),
                        ),
                      ),
                      const Spacer(),
                      GestureDetector(
                        onTap: () async {
                          if (state.emailAddress.isValidEmail()) {
                            context
                                .read<EmailAuthBloc>()
                                .add(ValidateEmailAddress(context: context));
                          }
                        },
                        child: NextButton(
                          buttonColor: state.emailAddress.isValidEmail()
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
                            ? const LoginOptions(authMethod: AuthMethod.email)
                            : const SignUpOptions(authMethod: AuthMethod.email),
                      ),
                    ],
                  ),
                ),
              );
            },
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
        'Tap again to cancel !',
      );

      return Future.value(false);
    }

    Navigator.pop(_loadingContext);

    Navigator.pushAndRemoveUntil(
      context,
      MaterialPageRoute(builder: (context) {
        return const HomePage();
      }),
      (r) => false,
    );

    return Future.value(false);
  }
}

class EmailLoginWidget extends EmailAuthWidget {
  const EmailLoginWidget({super.key, String? emailAddress})
      : super(
          emailAddress: emailAddress,
          authProcedure: AuthProcedure.login,
        );

  @override
  EmailLoginWidgetState createState() => EmailLoginWidgetState();
}

class EmailLoginWidgetState extends EmailAuthWidgetState<EmailLoginWidget> {}

class EmailSignUpWidget extends EmailAuthWidget {
  const EmailSignUpWidget({super.key})
      : super(authProcedure: AuthProcedure.signup);

  @override
  EmailSignUpWidgetState createState() => EmailSignUpWidgetState();
}

class EmailSignUpWidgetState extends EmailAuthWidgetState<EmailSignUpWidget> {}
