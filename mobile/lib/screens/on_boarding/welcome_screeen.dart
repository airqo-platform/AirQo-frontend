import 'package:app/models/models.dart';
import 'package:app/screens/on_boarding/notifications_setup_screen.dart';
import 'package:app/services/services.dart';
import 'package:app/themes/theme.dart';
import 'package:app/widgets/widgets.dart';
import 'package:flutter/material.dart';
import 'package:hive_flutter/hive_flutter.dart';

class WelcomeScreen extends StatelessWidget {
  const WelcomeScreen({super.key});

  @override
  Widget build(BuildContext context) {
    return AppSafeArea(
      horizontalPadding: 24,
      verticalPadding: 16,
      backgroundColor: Colors.white,
      widget: ValueListenableBuilder<Box<Profile>>(
        valueListenable: Hive.box<Profile>(HiveBox.profile)
            .listenable(keys: [HiveBox.profile]),
        builder: (context, box, widget) {
          if (box.values.isEmpty) {
            return CircularProgressIndicator();
          }

          final profile = box.values.toList().cast<Profile>().first;

          return Column(
            crossAxisAlignment: CrossAxisAlignment.center,
            children: [
              Spacer(),
              Text('Welcome'),
              RichText(
                textAlign: TextAlign.center,
                overflow: TextOverflow.ellipsis,
                text: TextSpan(
                  children: [
                    TextSpan(
                      text: profile.firstName,
                      style: CustomTextStyle.caption3(context),
                    ),
                    TextSpan(
                      text: profile.lastName,
                      style: CustomTextStyle.caption3(context)?.copyWith(
                        color: CustomColors.appColorBlue,
                      ),
                    ),
                  ],
                ),
              ),
              Spacer(),
              GestureDetector(
                onTap: () {
                  Navigator.pushAndRemoveUntil(
                    context,
                    MaterialPageRoute(
                      builder: (context) {
                        return NotificationsSetupScreen();
                      },
                    ),
                    (r) => false,
                  );
                },
                child: NextButton(
                  text: 'Next',
                  buttonColor: CustomColors.appColorBlue,
                ),
              ),
            ],
          );
        },
      ),
    );
  }
}
