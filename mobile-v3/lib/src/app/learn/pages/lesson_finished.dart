import 'package:flutter/material.dart';
import 'package:flutter_svg/flutter_svg.dart';

class LessonFinishedWidget extends StatelessWidget {
  const LessonFinishedWidget({super.key});

  @override
  Widget build(BuildContext context) {
    return Padding(
      padding: const EdgeInsets.symmetric(horizontal: 8),
      child: Column(
        mainAxisAlignment: MainAxisAlignment.center,
        children: [
          Text("👋🏼 Great Job Jordan!",
              style: TextStyle(fontSize: 20, fontWeight: FontWeight.w700)),
          Text(
              "You can invite your friends to learn a thing about Air Pollution",
              textAlign: TextAlign.center,
              style: TextStyle(fontSize: 18, fontWeight: FontWeight.w500)),
          SizedBox(height: 64),
          SmallRoundedButton(
            label: "Share",
            imagePath: "assets/images/shared/share_icon.svg",
          ),
          SizedBox(height: 16),
          SmallRoundedButton(
            label: "Rate the App",
            imagePath: "assets/images/shared/bookmark_icon.svg",
          ),
        ],
      ),
    );
  }
}

class SmallRoundedButton extends StatelessWidget {
  final String label;
  final String imagePath;
  const SmallRoundedButton(
      {super.key, required this.label, required this.imagePath});

  @override
  Widget build(BuildContext context) {
    return Container(
      height: 49,
      width: 144,
      decoration: BoxDecoration(
          borderRadius: BorderRadius.circular(200),
          color: Theme.of(context).highlightColor),
      child: Center(
        child: Row(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            SvgPicture.asset(imagePath),
            SizedBox(width: 4),
            Text(label),
          ],
        ),
      ),
    );
  }
}
