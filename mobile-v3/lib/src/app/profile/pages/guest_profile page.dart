import 'package:airqo/src/app/profile/pages/widgets/guest_settings_widget.dart';
import 'package:airqo/src/app/profile/pages/widgets/settings_tile.dart';
import 'package:flutter/cupertino.dart';
import 'package:flutter/material.dart';
import 'package:flutter_svg/svg.dart';

import '../../../meta/utils/colors.dart';
import '../../auth/pages/register_page.dart';
import '../../shared/widgets/spinner.dart';

class GuestProfilePage extends StatefulWidget {
  const GuestProfilePage({super.key});

  @override
  State<GuestProfilePage> createState() => _GuestProfilePageState();
}

class _GuestProfilePageState extends State<GuestProfilePage> {
  // Declare a loading state variable
  bool isLoading = false;

  void handleCreateAccount() async {
    setState(() {
      isLoading = true; // Set loading to true
    });

    // Simulate a delay for account creation or call an API here
    await Future.delayed(Duration(seconds: 2));

    setState(() {
      isLoading = false; // Set loading to false once done
    });

    // Navigate to CreateAccountScreen or handle success
    Navigator.of(context).push(MaterialPageRoute(builder: (context) => CreateAccountScreen()));
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        automaticallyImplyLeading: false,
        actions: [
          IconButton(
              onPressed: () => Navigator.pop(context),
              icon: Icon(Icons.close)),
          SizedBox(width: 16)
        ],
      ),
      body: SingleChildScrollView(
        child: Container(
          padding: const EdgeInsets.only(left: 16, right: 16, top: 8),
          child: Column(

            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Row(
                mainAxisAlignment: MainAxisAlignment.start,
                children: [

                Container(
                  margin: const EdgeInsets.symmetric(horizontal: 20),
                  child: CircleAvatar(
                    backgroundColor: Theme.of(context).highlightColor,
                    child: Center(
                      child: SvgPicture.asset(
                          "assets/icons/user_icon.svg"),
                    ),
                    radius: 50,
                  ),
                ),


                Text(
                  "Guest User",
                  style: TextStyle(
                    color: AppColors.boldHeadlineColor2,
                    fontSize: 24,
                    fontWeight: FontWeight.w700,
                  ),
                ),
              ],),
              SizedBox(height: 32),
              Container(
                margin: const EdgeInsets.symmetric(horizontal: 20),
                child: Text(
                  'Settings',
                style:TextStyle(
                  color: AppColors.boldHeadlineColor2,
                  fontSize: 18,
                  fontWeight: FontWeight.w500,
                  ),

                ),
              ),
              SizedBox(
                height: 5,
              ),

              Divider(
                color:Theme.of(context).highlightColor,
                indent: 20,
              ),




              GuestSettingsWidget(),



              SizedBox(
                height: 18,
              ),
              InkWell(
                onTap: () => Navigator.of(context).push(MaterialPageRoute(
                builder: (context) => CreateAccountScreen())),
                child: Container(
                  height: 56,
                  decoration: BoxDecoration(
                      color: AppColors.primaryColor,
                      borderRadius:
                      BorderRadius.circular(4)),
                  child: Center(
                    child: isLoading
                        ? Spinner()
                        : Text(
                      "Create Account",
                      style: TextStyle(
                        fontWeight: FontWeight.w500,
                        color: Colors.white,
                      ),
                    ),
                  ),
                ),
              ),
              SizedBox(
                height: 76,
              ),

              Center(
                  child: SvgPicture.asset('assets/images/shared/Frame 26085560.svg')
              ),
              SizedBox(
                height: 220,
              )
            ],
          ),
        ),
      ),
    );
  }
}

