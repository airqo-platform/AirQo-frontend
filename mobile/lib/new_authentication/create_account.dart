import 'package:app/new_authentication/widgets.dart';
import 'package:app/themes/colors.dart';
import 'package:flutter/material.dart';
import 'package:smooth_page_indicator/smooth_page_indicator.dart';

class UserDetailsPage extends StatefulWidget {
  const UserDetailsPage({super.key});

  @override
  UserDetailsPageState createState() => UserDetailsPageState();
}

class UserDetailsPageState extends State<UserDetailsPage> {
  final _formKey = GlobalKey<FormState>();
  final _firstNameController = TextEditingController();
  final _lastNameController = TextEditingController();
  final _birthdayController = TextEditingController();
  final _pageController = PageController();
  int _currentPage = 0; // Track the current page index

  @override
  void initState() {
    super.initState();
    _firstNameController.addListener(_updateIndicator);
    _lastNameController.addListener(_updateIndicator);
    _birthdayController.addListener(_updateIndicator);
  }

  @override
  void dispose() {
    _firstNameController.removeListener(_updateIndicator);
    _lastNameController.removeListener(_updateIndicator);
    _birthdayController.removeListener(_updateIndicator);
    _firstNameController.dispose();
    _lastNameController.dispose();
    _birthdayController.dispose();
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
      if (_birthdayController.text.isNotEmpty) {
        _currentPage = 3;
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
      appBar: AppBar(
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
        backgroundColor: Theme.of(context).primaryColor.withOpacity(0.9),
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
                child: NameEditField(
                  focusedBorderColor: Theme.of(context).focusColor,
                  fillColor: Theme.of(context).inputDecorationTheme.focusColor,
                  hintText: 'Enter your first name',
                  valueChange: (value) {},
                  label: 'First Name',
                  controller: _firstNameController,
                ),
              ),
              const SizedBox(height: 20),
              Padding(
                padding: const EdgeInsets.symmetric(horizontal: 20),
                child: NameEditField(
                  label: 'Last Name',
                  hintText: 'Enter your last name',
                  valueChange: (value) {},
                  focusedBorderColor: Theme.of(context).focusColor,
                  fillColor: Theme.of(context).inputDecorationTheme.focusColor,
                  controller: _lastNameController,
                ),
              ),
              const SizedBox(height: 20),
              Padding(
                padding: const EdgeInsets.symmetric(horizontal: 20),
                child: DateEditField(
                  focusedBorderColor: Theme.of(context).focusColor,
                  fillColor: Theme.of(context).inputDecorationTheme.focusColor,
                  label: 'Birthday',
                  hintText: 'DD · MM · YYYY',
                  valueChange: (value) {},
                  controller: _birthdayController,
                ),
              ),
              const SizedBox(height: 20),
              Padding(
                padding: const EdgeInsets.symmetric(horizontal: 20),
                child: NextButton(
                  textColor: CustomColors.appColorBlack,
                  text: 'Continue',
                  buttonColor: CustomColors.appColorBlue,
                  callBack: () {
                    if (_formKey.currentState!.validate()) {
                      _submitForm();
                    }
                  },
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }

  void _submitForm() {
    final firstName = _firstNameController.text;
    final lastName = _lastNameController.text;
    final birthday = _birthdayController.text;

    print('First Name: $firstName');
    print('Last Name: $lastName');
    print('Birthday: $birthday');

    // Submission logic...
  }
}
