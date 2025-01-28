import 'package:airqo/src/app/auth/bloc/ForgotPasswordBloc/forgot_password_bloc.dart';
import 'package:airqo/src/app/auth/bloc/ForgotPasswordBloc/forgot_password_event.dart';
import 'package:airqo/src/app/auth/pages/password_reset/password_reset.dart';

import 'package:airqo/src/meta/utils/colors.dart';
import 'package:flutter/material.dart';
import 'package:flutter_bloc/flutter_bloc.dart';


class ResetLinkSentPage extends StatelessWidget {
  const ResetLinkSentPage({super.key});






  @override
  Widget build(BuildContext context) {


    return Scaffold(
      appBar: AppBar(
        leading: IconButton(
          icon: Icon(Icons.arrow_back),
          onPressed: () {
            Navigator.of(context).pop();
          },
        ),
        title: Text(
          "Forgot Password",
          style: TextStyle(
              fontSize: 20,
              fontWeight: FontWeight.w700,
              color: AppColors.boldHeadlineColor),
        ),
        centerTitle: true,


      ),

      body: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Container(
            child: Padding(
              padding: const EdgeInsets.only(left: 32, right: 32, top: 8),
              child: SizedBox(
                child: Column(
                  children: [
                    Text("Password Reset Code Sent!",
                      style: TextStyle(
                        fontSize: 20,
                        fontWeight: FontWeight.w700,
                      ),
                    ),
                    SizedBox(
                      height: 20,
                    ),
                    Text("We’ve successfully sent you an email with a code to reset your password. Please check your inbox (and spam folder, just in case) for the email and copy the code. You'll need this code on the next step to reset your password.",
                      style: TextStyle(
                        fontSize: 16,
                        fontWeight: FontWeight.w500,
                      ),
                    ),

                    SizedBox(
                      height: 20,
                    ),

                    Row(
                      mainAxisAlignment: MainAxisAlignment.center,
                      children: [
                        Text('Not seeing the email?',
                          style: TextStyle(
                            fontSize: 14,
                            fontWeight: FontWeight.w500,
                          ),
                        ),

                        InkWell(
                          onTap: (){
                            final email = context.read<PasswordResetBloc>().state.email;
                            if (email != null && email.isNotEmpty) {
                              context.read<PasswordResetBloc>().add(
                                RequestPasswordReset(email),
                              );
                              print("Resend requested for email: $email");
                            } else {
                              print("Email is null or empty. Cannot resend.");
                            }
                          },
                          child: Center(
                            child: Text(
                              " Resend",
                              style: TextStyle(
                                  fontWeight: FontWeight.w500,
                                  color: AppColors.primaryColor),
                            ),
                          ),
                        ),




                      ],
                    ),

                    SizedBox(
                      height: 20,
                    ),

                    Row(
                      mainAxisAlignment: MainAxisAlignment.center,
                      children: [
                        Text('Received the email?',
                          style: TextStyle(
                            fontSize: 14,
                            fontWeight: FontWeight.w500,
                          ),
                        ),

                        InkWell(
                          onTap: (){
                            Navigator.of(context).push(
                                MaterialPageRoute(
                                    builder: (context) => PasswordResetPage()));
                          },
                          child: Center(
                            child: Text(
                              " Continue",
                              style: TextStyle(
                                  fontWeight: FontWeight.w500,
                                  color: AppColors.primaryColor),
                            ),
                          ),
                        ),




                      ],
                    ),


                  ],
                ),
              ),
            ),
          ),

          SizedBox(height: 24),


        ],
      ),
    );
  }
}
