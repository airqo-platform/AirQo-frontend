import 'package:app/new_authentication/create_account4.dart';
import 'package:app/new_authentication/widgets.dart';
import 'package:app/themes/colors.dart';
import 'package:auto_size_text/auto_size_text.dart';
import 'package:flutter/material.dart';
import 'package:smooth_page_indicator/smooth_page_indicator.dart';

class UserDetailsPage3 extends StatefulWidget {
  const UserDetailsPage3({super.key});

  @override
  UserDetailsPage3State createState() => UserDetailsPage3State();
}

class UserDetailsPage3State extends State<UserDetailsPage3> {
  final _formKey = GlobalKey<FormState>();

  final _pageController = PageController();
  int _currentPage = 0;

  @override
  void initState() {
    super.initState();
  }

  @override
  void dispose() {
    _pageController.dispose();
    super.dispose();
  }

  void _updateIndicator() {
    setState(() {
      _currentPage = 0;
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
              backgroundColor: const Color(0xff34373B),

        title: Column(
          children: [
            Text(
              'Create Account',
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
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Column(
              mainAxisSize: MainAxisSize.min,
              mainAxisAlignment: MainAxisAlignment.start,
              crossAxisAlignment: CrossAxisAlignment.center,
              children: [
                Container(
                  padding:
                      const EdgeInsets.symmetric(horizontal: 15, vertical: 10),
                  child: Column(
                    mainAxisSize: MainAxisSize.min,
                    mainAxisAlignment: MainAxisAlignment.start,
                    crossAxisAlignment: CrossAxisAlignment.center,
                    children: [
                      const SizedBox(
                        height: 20,
                      ),
                      Image.asset(
                        'assets/images/Icon.png',
                        width: 150,
                        height: 150,
                      ),
                      const SizedBox(height: 32),
                      Column(
                        mainAxisSize: MainAxisSize.min,
                        mainAxisAlignment: MainAxisAlignment.start,
                        crossAxisAlignment: CrossAxisAlignment.center,
                        children: [
                          SizedBox(
                            child: AutoSizeText(
                              ' Lets verify your account!',
                              maxLines: 1,
                              maxFontSize: 20,
                              textAlign: TextAlign.center,
                              style: TextStyle(
                                color: Theme.of(context)
                                    .textTheme
                                    .displayLarge
                                    ?.color,
                                fontFamily: 'Inter',
                                fontWeight: FontWeight.w700,
                              ),
                            ),
                          ),
                          const SizedBox(height: 24),
                          SizedBox(
                            child: AutoSizeText(
                              'Continue with either your email or phone number',
                              textAlign: TextAlign.center,
                              maxLines: 2,
                              style: TextStyle(
                                color: Theme.of(context)
                                    .textTheme
                                    .bodyMedium
                                    ?.color,
                                fontFamily: 'Inter',
                                fontSize: 16,
                                fontWeight: FontWeight.w400,
                              ),
                            ),
                          ),
                          //Checkboxes
                          const SizedBox(height: 20),
                          const CheckBoxListTile(),
                          const SizedBox(height: 20),
                        ],
                      ),
                    ],
                  ),
                ),
                Padding(
                  padding: const EdgeInsets.symmetric(horizontal: 20),
                  child: NextButton(
                    textColor: Colors.white,
                    text: 'Continue',
                    buttonColor: const Color(0xff145FFF),
                    callBack: () {
                      // if (_formKey.currentState!.validate()) {
                      //   _submitForm();

                        // Navigate to the next page
                        Navigator.push(
                          context,
                          MaterialPageRoute(
                            builder: (context) => const VerificationPage(),
                          ),
                        );
                      // }
                    },
                  ),
                ),
              ],
            ),
          ],
        ),
      ),
    );
  }

  void _submitForm() {
    // TODO Implement form submission logic here
  }
}
