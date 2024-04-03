import 'package:app/constants/config.dart';
import 'package:app/new_authentication/widgets.dart';
import 'package:app/screens/home_page.dart';
import 'package:app/services/app_service.dart';
import 'package:app/services/firebase_service.dart';
import 'package:app/themes/colors.dart';
import 'package:app/utils/network.dart';
import 'package:app/widgets/custom_shimmer.dart';
import 'package:app/widgets/dialogs.dart';
import 'package:flutter/material.dart';
import 'package:smooth_page_indicator/smooth_page_indicator.dart';
import 'package:flutter_gen/gen_l10n/app_localizations.dart';

class LoginPage extends StatefulWidget {
  const LoginPage({super.key});

  @override
  LoginPageState createState() => LoginPageState();
}

class LoginPageState extends State<LoginPage> {
  final _formKey = GlobalKey<FormState>();
  final _firstNameController = TextEditingController();
  final _lastNameController = TextEditingController();
  final _emailController = TextEditingController();
  final _passwordController = TextEditingController();
  final _pageController = PageController();
  int _currentPage = 0; // Track the current page index

  @override
  void initState() {
    super.initState();
    _firstNameController.addListener(_updateIndicator);
    _lastNameController.addListener(_updateIndicator);
  }

  @override
  void dispose() {
    _firstNameController.removeListener(_updateIndicator);
    _lastNameController.removeListener(_updateIndicator);
    _firstNameController.dispose();
    _lastNameController.dispose();
    _pageController.dispose();
    super.dispose();
  }

  void _updateIndicator() {
    setState(() {
      _currentPage = 0;
      if (_firstNameController.text.isNotEmpty) {
        _currentPage = 1;
      }
      if (_lastNameController.text.isNotEmpty) {
        _currentPage = 2;
      }
    });
    _pageController.animateToPage(
      _currentPage - 1,
      duration: const Duration(milliseconds: 500),
      curve: Curves.ease,
    );
  }

  Color _getIndicatorColor(int index) {
    if (index == _currentPage - 1) {
      return CustomColors.appColorBlue;
    } else {
      return Theme.of(context).unselectedWidgetColor;
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: const Color(0xff34373B),
      appBar: AppBar(
        title: Column(
          children: [
            Text(
              'Login',
              style: Theme.of(context).textTheme.titleMedium,
            ),
            const SizedBox(height: 5),
            SmoothPageIndicator(
              controller: _pageController,
              count: 3,
              effect: WormEffect(
                dotWidth: 40,
                dotHeight: 6,
                activeDotColor: _getIndicatorColor(0),
                dotColor: _getIndicatorColor(1),
              ),
            ),
          ],
        ),
        centerTitle: true,
        titleTextStyle: Theme.of(context).appBarTheme.titleTextStyle,
        leading: IconButton(
          icon: Icon(
            Icons.arrow_back,
            color: Theme.of(context).textTheme.bodyLarge?.color,
          ),
          onPressed: () {
            Navigator.pop(context);
          },
        ),
      ),
      body: SingleChildScrollView(
        child: Form(
          key: _formKey,
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Padding(
                padding: const EdgeInsets.symmetric(horizontal: 20),
                child: EmailEditField(
                  focusedBorderColor: Theme.of(context).focusColor,
                  fillColor: Theme.of(context).inputDecorationTheme.focusColor,
                  hintText: 'Enter your email',
                  valueChange: (value) {},
                  label: 'Email',
                  controller: _emailController,
                ),
              ),
              const SizedBox(height: 20),
              Padding(
                padding: const EdgeInsets.symmetric(horizontal: 20),
                child: PasswordEditField(
                  focusedBorderColor: Theme.of(context).focusColor,
                  fillColor: Theme.of(context).inputDecorationTheme.focusColor,
                  label: 'Password',
                  hintText: 'Enter your password',
                  valueChange: (value) {},
                  controller: _passwordController,
                ),
              ),
              const SizedBox(height: 20),
              Padding(
                padding: const EdgeInsets.symmetric(horizontal: 20),
                child: NextButton(
                  textColor: Colors.white,
                  text: 'Login',
                  buttonColor: const Color(0xff145FFF),
                  callBack: () {
                    if (_formKey.currentState!.validate()) {
                      _submitForm();

                      // Navigate to the next page
                      // Navigator.push(
                      //   context,
                      //   MaterialPageRoute(
                      //     builder: (context) => const UserDetailsPage(),
                      //   ),
                      // );
                    }
                  },
                ),
              ),
              SizedBox(
                width: double.infinity,
                child: Row(
                  crossAxisAlignment: CrossAxisAlignment.center,
                  mainAxisAlignment: MainAxisAlignment.center,
                  children: [
                    Text(
                      "Don’t have an account?",
                      textAlign: TextAlign.center,
                      style: Theme.of(context).textTheme.bodySmall?.copyWith(
                            color: CustomColors.appBodyColor.withOpacity(0.6),
                          ),
                    ),
                    Text(
                      'Create an account',
                      textAlign: TextAlign.center,
                      style: Theme.of(context).textTheme.bodySmall?.copyWith(
                            color: CustomColors.appColorBlue.withOpacity(0.6),
                          ),
                    ),
                  ],
                ),
              )
            ],
          ),
        ),
      ),
    );
  }

  void _submitForm() {
    // TODO Implement form submission logic here
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
              'Continue As Guest',
              textAlign: TextAlign.center,
              style: Theme.of(context).textTheme.bodySmall?.copyWith(
                    color: CustomColors.appBodyColor.withOpacity(0.6),
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
        showSnackBar(
            context, AppLocalizations.of(context)!.checkYourInternetConnection);
        return;
      }

      loadingScreen(context);

      await CustomAuth.guestSignIn().then((success) async {
        if (success) {
          await AppService.postSignOutActions(context, log: false)
              .then((_) async {
            await AppService.postSignInActions(context, isGuest: true)
                .then((_) async {
              Navigator.pop(context);
              await Navigator.pushAndRemoveUntil(
                context,
                MaterialPageRoute(builder: (context) {
                  return const HomePage();
                }),
                (r) => true,
              );
            });
          });
        } else {
          Navigator.pop(context);
          showSnackBar(context, Config.guestLogInFailed);
        }
      });
    });
  }
}
