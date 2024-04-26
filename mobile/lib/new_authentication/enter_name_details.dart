import 'package:app/blocs/profile/profile_bloc.dart';
import 'package:app/models/profile.dart';
import 'package:app/new_authentication/auth_details.dart';
import 'package:app/new_authentication/sign_up.dart';
import 'package:app/new_authentication/widgets.dart';
import 'package:app/themes/colors.dart';
import 'package:flutter/material.dart';
import 'package:flutter_bloc/flutter_bloc.dart';
import 'package:smooth_page_indicator/smooth_page_indicator.dart';

class NewProfileDetails extends StatefulWidget {
  const NewProfileDetails({super.key});

  @override
  NewProfileDetailsState createState() => NewProfileDetailsState();
}

class NewProfileDetailsState extends State<NewProfileDetails> {
  final _formKey = GlobalKey<FormState>();
  final _firstNameController = TextEditingController();
  final _lastNameController = TextEditingController();
  final _birthdayController = TextEditingController();
  final _pageController = PageController();
  int _currentPage = 0;

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
      body: BlocBuilder<ProfileBloc, Profile>(builder: (context, profile) {
        return SingleChildScrollView(
          child: Form(
            key: _formKey,
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Padding(
                  padding: const EdgeInsets.symmetric(horizontal: 20),
                  child: NameEditField(
                    value: profile.firstName,
                    focusedBorderColor: const Color(0xffE1E7EC),
                    fillColor: const Color(0xff2E2F33),
                    hintText: 'Enter your first name',
                    label: 'First Name',
                    controller: _firstNameController,
                    valueChange: (firstName) {
                      context.read<ProfileBloc>().add(
                            UpdateProfile(
                              profile.copyWith(firstName: firstName),
                            ),
                          );
                    },
                  ),
                ),
                const SizedBox(height: 20),
                Padding(
                  padding: const EdgeInsets.symmetric(horizontal: 20),
                  child: NameEditField(
                    value: profile.lastName,
                    label: 'Last Name',
                    hintText: 'Enter your last name',
                    valueChange: (lastName) {
                      context.read<ProfileBloc>().add(
                            UpdateProfile(
                              profile.copyWith(lastName: lastName),
                            ),
                          );
                    },
                    focusedBorderColor: const Color(0xffE1E7EC),
                    fillColor: const Color(0xff2E2F33),
                    controller: _lastNameController,
                  ),
                ),
                const SizedBox(height: 20),
                Padding(
                  padding: const EdgeInsets.symmetric(horizontal: 20),
                  child: DateEditField(
                    value: profile.birthday,
                    focusedBorderColor: const Color(0xffE1E7EC),
                    fillColor: const Color(0xff2E2F33),
                    label: 'Birthday',
                    hintText: ' DD  -  MM  -  YEAR',
                    valueChange: (birthday) {
                      context.read<ProfileBloc>().add(
                            UpdateProfile(
                              profile.copyWith(firstName: birthday),
                            ),
                          );
                    },
                    controller: _birthdayController,
                  ),
                ),
                const SizedBox(height: 20),
                Padding(
                  padding: const EdgeInsets.symmetric(horizontal: 20),
                  child: NextButton(
                    textColor: Colors.white,
                    text: 'Continue',
                    buttonColor: const Color(0xff145FFF),
                    callBack: () {
                      if (_formKey.currentState!.validate()) {
                        context.read<ProfileBloc>().add(UpdateProfile(profile));
                        Navigator.pop(context);
                      }
                    },
                  ),
                ),
              ],
            ),
          ),
        );
      }),
    );
  }
}
