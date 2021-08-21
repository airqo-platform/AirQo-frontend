
import 'package:app/constants/app_constants.dart';
import 'package:app/models/feedback.dart' as feedbackModel;
import 'package:app/utils/services/rest_api.dart';
import 'package:flutter/material.dart';

import 'home_page_v2.dart';


class FeedbackPage extends StatefulWidget {
  @override
  _FeedbackPageState createState() => _FeedbackPageState();
}

class _FeedbackPageState extends State<FeedbackPage> {
  final _formKey = GlobalKey<FormState>();
  final feedbackController = TextEditingController();
  final emailController = TextEditingController();
  bool sendingFeedback = false;

  @override
  void initState() {
    sendingFeedback = false;
    super.initState();
  }

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
                padding: const EdgeInsets.symmetric(horizontal: 20),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.center,
                  mainAxisAlignment: MainAxisAlignment.center,
                  children: <Widget>[
                    const SizedBox(height: 10),
                    emailInput(),
                    const SizedBox(height: 5),
                    feedbackInput(),
                    const SizedBox(height: 10,),
                    submitButton(),
                  ],
                ),
              ),
            ),
            // Positioned(
            //   child: isLoading ? const Loading() : Container(),
            // ),
            Positioned(bottom: 10, left: 0, right: 0,
                child: airqoLogo()
            ),
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
        icon: Icon(Icons.email_outlined),
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
      maxLines: 8,
      validator: (value) {
        if (value == null || value.isEmpty) {
          return 'Feedback is required';
        }
        return null;
      },
    );
  }

  Widget submitButton() {
    if(sendingFeedback){
      return const Center(
          child: CircularProgressIndicator(
            valueColor: AlwaysStoppedAnimation<Color>(appColor),
          ));
    }
    else{
      return ElevatedButton(
        style: ElevatedButton.styleFrom(primary: appColor),
        onPressed: () async {
          if (_formKey.currentState!.validate()) {
            var email = '';
            if (emailController.text.isNotEmpty) {
              email = emailController.text;
            }

            var feedback = feedbackController.text;
            var feedBackModel =
            feedbackModel.UserFeedback(email: email, feedback: feedback);

            setState(() {
              sendingFeedback = true;
            });

            Future.delayed(const Duration(seconds: 2), () async {

              var success = await AirqoApiClient(context)
                  .sendFeedbackV2(feedBackModel);

              if(success){

                setState(() {
                  sendingFeedback = false;
                });

                await showDialog<void>(
              context: context,
              builder: (_) => SuccessDialog(),
              );
              }
              else{

              setState(() {
              sendingFeedback = false;
              });

              await showDialog<void>(
              context: context,
              builder: (_) => FailureDialog(),
              );
              }
            });

          }
        },
        child: const Text('Submit'),
      );
    }

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
                Icon(Icons.info_outline_rounded,
                color: ColorConstants().appColor,),
                const Flexible(
                  child: Padding(
                    padding: EdgeInsets.all(10),
                    child: Text(
                      'Thanks for your feedback.'
                          ' The AirQo team shall address it asap',
                      softWrap: true,
                    ),
                  ),
                ),
              ],
            ),
            customOkayButton(context, true),
          ],
        ),
      ),
    );
  }
}

RawMaterialButton customOkayButton(context, success){

  return RawMaterialButton(
    shape: RoundedRectangleBorder(
        borderRadius: BorderRadius.circular(4.0),
        side: const BorderSide(color: appColor, width: 1)),
    fillColor: Colors.transparent,
    elevation: 0,
    highlightElevation: 0,
    splashColor: Colors.black12,
    highlightColor: appColor.withOpacity(0.4),
    onPressed: () async {
      if(success){

        await Navigator.pushAndRemoveUntil(context,
            MaterialPageRoute(builder: (context) {
              return HomePageV2();
            }), (r) => false);
      }
      else{
        Navigator.of(context).pop();
      }

    },
    child: Padding(
      padding: const EdgeInsets.all(4),
      child: Text(
        'Close',
        style: TextStyle(color: ColorConstants().appColor),
      ),
    ),
  );
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
                 Icon(Icons.info_outline_rounded,
                  color: ColorConstants().red,),
                const Flexible(
                  child: Padding(
                    padding: EdgeInsets.all(10),
                    child: Text(
                      'Oops! Something went wrong, try again later',
                      softWrap: true,
                    ),
                  ),
                ),
              ],
            ),
            customOkayButton(context, false),
          ],
        ),
      ),
    );
  }
}
