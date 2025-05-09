import 'package:airqo/src/app/auth/bloc/auth_bloc.dart';
import 'package:airqo/src/app/auth/pages/email_verification_screen.dart';
import 'package:airqo/src/app/auth/pages/password_reset/forgot_password.dart';
import 'package:airqo/src/app/auth/pages/register_page.dart';
import 'package:airqo/src/app/shared/pages/nav_page.dart';
import 'package:airqo/src/app/shared/widgets/form_field.dart';
import 'package:airqo/src/meta/utils/colors.dart';
import 'package:flutter/material.dart';
import 'package:flutter_bloc/flutter_bloc.dart';
import 'package:flutter_svg/flutter_svg.dart';

class LoginPage extends StatefulWidget {
  const LoginPage({super.key});

  @override
  State<LoginPage> createState() => _LoginPageState();
}

class _LoginPageState extends State<LoginPage> {
  String? error;
  bool _isLoading = false;
  late AuthBloc authBloc;
  final TextEditingController emailController = TextEditingController();
  final TextEditingController passwordController = TextEditingController();
  final GlobalKey<FormState> formKey = GlobalKey<FormState>();
  bool _isPasswordVisible = false;

  @override
  void initState() {
    super.initState();
    try {
      authBloc = context.read<AuthBloc>();
    } catch (e) {
      print('Failed to initialize AuthBloc: $e');
    }
  }

  @override
  void dispose() {
    emailController.dispose();
    passwordController.dispose();
    super.dispose();
  }

  void _login() {
    if (_isLoading) return;
    
    final currentForm = formKey.currentState;
    if (currentForm != null && currentForm.validate()) {
      setState(() {
        _isLoading = true;
        error = null;
      });
      
      authBloc.add(LoginUser(
        emailController.text.trim(),
        passwordController.text.trim()
      ));
    }
  }

  @override
  Widget build(BuildContext context) {
    final screenSize = MediaQuery.of(context).size;
    final isSmallScreen = screenSize.height < 600;
    
    return BlocListener<AuthBloc, AuthState>(
      listener: (context, state) {
        if (state is AuthLoaded) {
          Navigator.of(context).pushAndRemoveUntil(MaterialPageRoute(
            builder: (context) => NavPage(),
          ), (_) => false);
        } else if (state is EmailUnverifiedError) {
          setState(() {
            error = state.message;
            _isLoading = false;
          });
          
          showDialog(
            context: context,
            barrierDismissible: false,
            builder: (context) => AlertDialog(
              title: Text(
                'Email Verification Required',
                style: TextStyle(
                  fontWeight: FontWeight.bold,
                  color: Theme.of(context).textTheme.headlineLarge?.color,
                ),
              ),
              content: Column(
                mainAxisSize: MainAxisSize.min,
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(
                    'Your account has not been verified yet.',
                    style: TextStyle(
                      fontSize: 16,
                      color: Theme.of(context).textTheme.bodyLarge?.color,
                    ),
                  ),
                  SizedBox(height: 8),
                  Text(
                    'Please check your email for a verification code or request a new one.',
                    style: TextStyle(
                      fontSize: 14,
                      color: Theme.of(context).textTheme.bodyMedium?.color,
                    ),
                  ),
                ],
              ),
              actions: [
                TextButton(
                  onPressed: () => Navigator.pop(context),
                  child: Text(
                    'Cancel',
                    style: TextStyle(
                      color: Colors.grey[600],
                    ),
                  ),
                ),
                ElevatedButton(
                  style: ElevatedButton.styleFrom(
                    backgroundColor: AppColors.primaryColor,
                    foregroundColor: Colors.white,
                  ),
                  onPressed: () {
                    Navigator.pop(context);
                    Navigator.push(
                      context, 
                      MaterialPageRoute(
                        builder: (context) => EmailVerificationScreen(
                          email: state.email,
                        ),
                      ),
                    );
                  },
                  child: Text('Verify Now'),
                ),
              ],
              shape: RoundedRectangleBorder(
                borderRadius: BorderRadius.circular(12),
              ),
            ),
          );
        } else if (state is AuthLoadingError) {
          setState(() {
            error = state.message;
            _isLoading = false;
          });
        }
      },
      child: Scaffold(
        appBar: AppBar(
          title: Text(
            "Login",
            style: TextStyle(
              fontSize: 20,
              fontWeight: FontWeight.w700,
              color: Theme.of(context).textTheme.headlineLarge?.color,
            ),
          ),
          centerTitle: true,
          leading: IconButton(
            icon: Icon(Icons.arrow_back_ios),
            onPressed: () => Navigator.pop(context),
          ),
        ),

        body: LayoutBuilder(
          builder: (context, constraints) {
            return SingleChildScrollView(
              child: ConstrainedBox(
                constraints: BoxConstraints(
                  minHeight: constraints.maxHeight,
                ),
                child: IntrinsicHeight(
                  child: Form(
                    key: formKey,
                    child: Padding(
                      padding: EdgeInsets.symmetric(
                        horizontal: 32,
                        vertical: isSmallScreen ? 16 : 24,
                      ),
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        mainAxisAlignment: MainAxisAlignment.center,
                        children: [
                          SizedBox(height: isSmallScreen ? 8 : 16),

                          FormFieldWidget(
                            prefixIcon: Container(
                              padding: const EdgeInsets.all(13.5),
                              child: SvgPicture.asset(
                                "assets/icons/email-icon.svg",
                                height: 10,
                              ),
                            ),
                            validator: (value) {
                              if (value == null || value.isEmpty) {
                                return "Email is required";
                              }
                              return null;
                            },
                            hintText: "Enter your email",
                            label: "Email*",
                            controller: emailController,
                          ),
                          
                          SizedBox(height: isSmallScreen ? 12 : 16),
                          
                          FormFieldWidget(
                            prefixIcon: Container(
                              padding: const EdgeInsets.all(13.5),
                              child: SvgPicture.asset(
                                "assets/icons/password.svg",
                                height: 10,
                              ),
                            ),
                            suffixIcon: IconButton(
                              icon: Icon(
                                _isPasswordVisible
                                    ? Icons.visibility
                                    : Icons.visibility_off,
                                color: AppColors.primaryColor,
                              ),
                              onPressed: () {
                                setState(() {
                                  _isPasswordVisible = !_isPasswordVisible;
                                });
                              },
                            ),
                            validator: (value) {
                              if (value == null || value.isEmpty) {
                                return "Password is required";
                              }
                              return null;
                            },
                            hintText: "Enter your password",
                            label: "Password",
                            isPassword: !_isPasswordVisible,
                            controller: passwordController,
                          ),
                          
                          if (error != null)
                            Padding(
                              padding: const EdgeInsets.only(top: 16.0),
                              child: Container(
                                width: double.infinity,
                                padding: EdgeInsets.all(8),
                                decoration: BoxDecoration(
                                  color: Colors.red.withOpacity(0.1),
                                  borderRadius: BorderRadius.circular(4),
                                ),
                                child: Text(
                                  error!,
                                  style: TextStyle(
                                    color: Colors.red,
                                    fontSize: 14,
                                  ),
                                ),
                              ),
                            ),
                          
                          SizedBox(height: isSmallScreen ? 20 : 24),
                          
                          InkWell(
                            onTap: _isLoading ? null : _login,
                            child: Container(
                              height: 56,
                              decoration: BoxDecoration(
                                color: _isLoading 
                                    ? AppColors.primaryColor.withOpacity(0.7)
                                    : AppColors.primaryColor,
                                borderRadius: BorderRadius.circular(4),
                              ),
                              child: Center(
                                child: _isLoading
                                    ? SizedBox(
                                        height: 24,
                                        width: 24,
                                        child: CircularProgressIndicator(
                                          color: Colors.white,
                                          strokeWidth: 2,
                                        ),
                                      )
                                    : Text(
                                        "Login",
                                        style: TextStyle(
                                          fontWeight: FontWeight.w500,
                                          color: Colors.white,
                                        ),
                                      ),
                              ),
                            ),
                          ),
                          
                          SizedBox(height: isSmallScreen ? 12 : 16),
                          
                          Row(
                            mainAxisAlignment: MainAxisAlignment.center,
                            children: [
                              Flexible(
                                child: Text(
                                  "Don't have an account?",
                                  style: TextStyle(
                                    color: Theme.of(context).textTheme.headlineLarge?.color,
                                    fontWeight: FontWeight.w500,
                                    fontSize: isSmallScreen ? 13 : 14,
                                  ),
                                  overflow: TextOverflow.ellipsis,
                                ),
                              ),
                              InkWell(
                                onTap: () => Navigator.of(context).push(
                                  MaterialPageRoute(
                                    builder: (context) => CreateAccountScreen(),
                                  ),
                                ),
                                child: Text(
                                  " Create Account",
                                  style: TextStyle(
                                    fontWeight: FontWeight.w500,
                                    color: AppColors.primaryColor,
                                    fontSize: isSmallScreen ? 13 : 14,
                                  ),
                                ),
                              )
                            ],
                          ),
                          
                          SizedBox(height: isSmallScreen ? 12 : 16),
                          
                          Center(
                            child: Wrap(
                              alignment: WrapAlignment.center,
                              spacing: 4,
                              runSpacing: 8,
                              children: [
                                InkWell(
                                  onTap: () => Navigator.of(context).push(
                                    MaterialPageRoute(
                                      builder: (context) => ForgotPasswordPage(),
                                    ),
                                  ),
                                  child: Text(
                                    "Forgot password?",
                                    style: TextStyle(
                                      fontWeight: FontWeight.w500,
                                      color: AppColors.primaryColor,
                                      fontSize: isSmallScreen ? 13 : 14,
                                    ),
                                  ),
                                ),
                                
                                Text(
                                  " • ",
                                  style: TextStyle(
                                    color: Colors.grey,
                                    fontSize: isSmallScreen ? 13 : 14,
                                  ),
                                ),
                                
                                VerificationOption(
                                  emailController: emailController,
                                  isSmallScreen: isSmallScreen,
                                ),
                              ],
                            ),
                          ),

                          Spacer(),
                        ],
                      ),
                    ),
                  ),
                ),
              ),
            );
          },
        ),
      ),
    );
  }
}

class VerificationOption extends StatelessWidget {
  final TextEditingController emailController;
  final bool isSmallScreen;
  
  const VerificationOption({
    super.key,
    required this.emailController,
    this.isSmallScreen = false,
  });

  @override
  Widget build(BuildContext context) {
    return InkWell(
      onTap: () {
        final email = emailController.text.trim();
        if (email.isEmpty) {
          ScaffoldMessenger.of(context).showSnackBar(
            const SnackBar(
              content: Text('Please enter your email first'),
              duration: Duration(seconds: 2),
            ),
          );
          return;
        }
        
        Navigator.push(
          context,
          MaterialPageRoute(
            builder: (context) => EmailVerificationScreen(
              email: email,
            ),
          ),
        );
      },
      child: Text(
        "Verify account",
        style: TextStyle(
          fontWeight: FontWeight.w500,
          color: AppColors.primaryColor,
          fontSize: isSmallScreen ? 13 : 14,
        ),
      ),
    );
  }
}