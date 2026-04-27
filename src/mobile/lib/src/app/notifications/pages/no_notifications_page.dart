import 'package:airqo/src/app/shared/widgets/translated_text.dart';
import 'package:flutter/material.dart';
import 'package:flutter_svg/svg.dart';

class NoNotificationsScreen extends StatelessWidget {
  const NoNotificationsScreen({super.key});

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: Colors.black,
      body: LayoutBuilder(
        builder: (context, constraints) {
          double maxWidth = constraints.maxWidth;
          double maxHeight = constraints.maxHeight;

          return Center(
            child: Column(
              mainAxisAlignment: MainAxisAlignment.center,
              children: [
                Container(
                    width: maxWidth * 0.2,
                    height: maxWidth * 0.2,
                    decoration: BoxDecoration(
                      color: Colors.grey[900],
                      shape: BoxShape.circle,
                    ),
                    child: SvgPicture.asset(
                      "assets/icons/notification.svg",
                    )),
                SizedBox(height: maxHeight * 0.05),
                TranslatedText(
                  "No Notifications",
                  style: TextStyle(
                    color: Colors.white,
                    fontSize: maxWidth * 0.06,
                    fontWeight: FontWeight.bold,
                  ),
                ),
                SizedBox(height: maxHeight * 0.02),
                TranslatedText(
                  "Here you'll find all updates on our Air Quality network",
                  style: TextStyle(
                    color: Colors.grey,
                    fontSize: maxWidth * 0.045,
                  ),
                ),
              ],
            ),
          );
        },
      ),
    );
  }
}
