import 'package:app/screens/new_authentication/widgets.dart';
import 'package:app/themes/colors.dart';
import 'package:flutter/material.dart';

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

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: Text(
          style: Theme.of(context).textTheme.titleMedium,
          'Create Account',
        ),
        backgroundColor: Theme.of(context).primaryColor.withOpacity(0.9),
        centerTitle: true,
        titleTextStyle: Theme.of(context).appBarTheme.titleTextStyle,
        leading: IconButton(
          icon: Icon(
            color: Theme.of(context).iconTheme.color,
            Icons.arrow_back,
          ),
          onPressed: () {
            Navigator.pop(context);
          },
        ),
      ),
      body: Form(
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
              ),
            ),
            const SizedBox(height: 20),
            Padding(
              padding: const EdgeInsets.symmetric(horizontal: 20),
              child: DateEditField(
                focusedBorderColor: Theme.of(context).focusColor,
                fillColor: Theme.of(context).inputDecorationTheme.focusColor,
                label: 'Birthday',
                hintText: 'DD \u00B7 MM \u00B7 YYYY',
                valueChange: (value) {},
              ),
            ),
            const SizedBox(height: 20),
            Padding(
              padding: const EdgeInsets.symmetric(horizontal: 20),
              child: NextButton(
                textColor: CustomColors.appColorBlack,
                text: 'Continue',
                buttonColor: CustomColors.appBodyColor,
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
    );
  }

  void _submitForm() {
    final firstName = _firstNameController.text;
    final lastName = _lastNameController.text;
    final birthday = _birthdayController.text;

    print('First Name: $firstName');
    print('Last Name: $lastName');
    print('Birthday: $birthday');
  }
}
