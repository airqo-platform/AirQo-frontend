
import 'package:airqo/src/meta/utils/colors.dart';
import 'package:flutter/material.dart';


import '../login_page.dart';


class ResetSuccessPage extends StatelessWidget {
  const ResetSuccessPage({super.key});

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
          "Reset Password",
          style: TextStyle(
              fontSize: 20,
              fontWeight: FontWeight.w700,
              color: AppColors.boldHeadlineColor2),
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
                    Text("Your password has been reset successfully!",
                      style: TextStyle(
                        fontSize: 20,
                        fontWeight: FontWeight.w700,
                        color: Theme.of(context).textTheme.titleMedium?.color

                      ),
                    ),
                    SizedBox(
                      height: 20,
                    ),
                    Text("You can now log in to your account using your new password.",
                      style: TextStyle(
                        fontSize: 16,
                        fontWeight: FontWeight.w500,
                          color: Theme.of(context).textTheme.titleMedium?.color
                      ),
                    ),

                    SizedBox(
                      height: 20,
                    ),

                InkWell(
                  onTap: () => Navigator.of(context).push(MaterialPageRoute(
                      builder: (context) => LoginPage())),
                  child: Container(
                    height: 56,
                    decoration: BoxDecoration(
                        color: AppColors.primaryColor,
                        borderRadius: BorderRadius.circular(4)),
                    child: Center(
                      child:Text(
                        "Login",
                        style: TextStyle(
                          fontWeight: FontWeight.w500,
                          color: Colors.white,
                        ),
                      ),
                    ),
                  ),
                ),

                  ],
                ),
              ),
            ),
          ),




        ],
      ),
    );
  }
}
