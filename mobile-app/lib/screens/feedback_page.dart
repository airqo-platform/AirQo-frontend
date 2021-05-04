import 'dart:developer';

import 'package:app/constants/app_constants.dart';
import 'package:app/models/feedback.dart' as feedbackModel;
import 'package:app/utils/services/rest_api.dart';
import 'package:flutter/material.dart';

class FeedbackPage extends StatefulWidget {
  @override
  _FeedbackPageState createState() => _FeedbackPageState();
}

class _FeedbackPageState extends State<FeedbackPage> {
  final _formKey = GlobalKey<FormState>();
  final feedbackController = TextEditingController();
  final emailController = TextEditingController();

  @override
  Widget build(BuildContext context) {
    final height = MediaQuery.of(context).size.height;

    return Scaffold(
      appBar: AppBar(
        title: const Text('Feedback'),
      ),
      body: Container(
        height: height,
        child: Stack(
          children: <Widget>[
            Form(
              key: _formKey,
              child: SingleChildScrollView(
                padding: EdgeInsets.symmetric(horizontal: 20),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.center,
                  mainAxisAlignment: MainAxisAlignment.center,
                  children: <Widget>[
                    // SizedBox(height: height * .2),
                    const SizedBox(height: 2),
                    emailInput(),
                    const SizedBox(
                      height: 5,
                    ),
                    feedbackInput(),
                    const SizedBox(
                      height: 5,
                    ),
                    submitButton(),
                    const SizedBox(
                      height: 10,
                    ),
                    // SizedBox(height: height * .14),
                    // _loginAccountLabel(),
                  ],
                ),
              ),
            ),
            // Positioned(
            //   child: isLoading ? const Loading() : Container(),
            // ),
            // Positioned(bottom: 10, left: 0, right: 0,
            //     child: airqoLogo()
            // ),
          ],
        ),
      ),
    );
  }

  @override
  void dispose() {
    emailController.dispose();
    feedbackController.dispose();
    super.dispose();
  }

  Widget emailInput() {
    return TextFormField(
      decoration: const InputDecoration(
        icon: const Icon(Icons.email_outlined),
        labelText: 'Email Address (Optional)',
        // helperText: 'Optional',
      ),
      keyboardType: TextInputType.emailAddress,
      onChanged: (value) {},
      textInputAction: TextInputAction.next,
    );
  }

  Widget feedbackInput() {
    return TextFormField(
      controller: feedbackController,
      decoration: const InputDecoration(
        // icon: const Icon(Icons.),
        // helperText:
        // '''Feedback''',
        labelText: 'Feedback',
      ),
      textInputAction: TextInputAction.done,
      maxLines: 6,
      validator: (value) {
        if (value == null || value.isEmpty) {
          return 'Feedback Required';
        }
        return null;
      },
    );
  }

  Widget submitButton() {
    return ElevatedButton(
      style: ElevatedButton.styleFrom(
          primary: appColor
      ),
      onPressed: () async {
        if (_formKey.currentState!.validate()) {
          var email = '';
          if (emailController.text.isNotEmpty) {
            email = emailController.text;
          }

          var feedback = feedbackController.text;
          var feedBackModel =
              feedbackModel.UserFeedback(email: email, feedback: feedback);

          var success = await AirqoApiClient(context)
              .sendFeedback(feedBackModel);


          if(success){
            await showDialog<void>(
              context: context,
              builder: (_) => SuccessDialog(),
            );
          }
          else{
            await showDialog<void>(
              context: context,
              builder: (_) => FailureDialog(),
            );
          }
        }
      },
      child: const Text('Submit'),
    );
  }

  Widget airqoLogo() {
    return Image.asset(
      'assets/icon/airqo_logo.png',
      height: 50,
      width: 50,
    );
  }
}

class SuccessDialog extends StatelessWidget {
  @override
  Widget build(BuildContext context) {
    return Dialog(
      shape: RoundedRectangleBorder(
        borderRadius: BorderRadius.circular(8),
      ),
      child: Padding(
        padding: const EdgeInsets.all(8.0),
        child: Column(
          mainAxisSize: MainAxisSize.min,
          children: <Widget>[
            Row(
              mainAxisSize: MainAxisSize.max,
              children: <Widget>[
                const Icon(Icons.info_outline_rounded),
                const Flexible(
                  child: Padding(
                    padding: EdgeInsets.all(10),
                    child: Text(
                      'Your feedback has been received. Thank you!',
                      softWrap: true,
                    ),
                  ),
                ),
              ],
            ),
            ElevatedButton(
              onPressed: () => Navigator.of(context).pop(),
              child: const Text('OK'),
            ),
          ],
        ),
      ),
    );
  }
}

class FailureDialog extends StatelessWidget {
  @override
  Widget build(BuildContext context) {
    return Dialog(
      shape: RoundedRectangleBorder(
        borderRadius: BorderRadius.circular(8),
      ),
      child: Padding(
        padding: const EdgeInsets.all(8.0),
        child: Column(
          mainAxisSize: MainAxisSize.min,
          children: <Widget>[
            Row(
              mainAxisSize: MainAxisSize.max,
              children: <Widget>[
                const Icon(Icons.info_outline_rounded),
                const Flexible(
                  child: Padding(
                    padding: EdgeInsets.all(10),
                    child: Text(
                      'Oops!',
                      softWrap: true,
                    ),
                  ),
                ),
              ],
            ),
            ElevatedButton(
              onPressed: () => Navigator.of(context).pop(),
              child: const Text('OK'),
            ),
          ],
        ),
      ),
    );
  }
}
