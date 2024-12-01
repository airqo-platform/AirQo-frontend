import 'package:airqo/src/app/shared/widgets/airqo_button.dart';
import 'package:airqo/src/meta/utils/colors.dart';
import 'package:flutter/material.dart';
import 'package:flutter_svg/svg.dart';

class ExposureWidget extends StatelessWidget {
  const ExposureWidget({super.key});

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 16),
      width: double.infinity,
      child: Column(
        children: [
          SizedBox(height: 32),
          SvgPicture.asset("assets/images/shared/exposure_icon.svg"),
          SizedBox(height: 32),
          Text("This is where you'll manage the places you care about.",
              textAlign: TextAlign.center,
              style: TextStyle(
                  fontSize: 20,
                  fontWeight: FontWeight.w500,
                  color: AppColors.boldHeadlineColor)),
          SizedBox(height: 16),
          Text(
              "You can add a locations you frequently visit like your home, office and parent’s house.",
              textAlign: TextAlign.center,
              style: TextStyle(color: AppColors.secondaryHeadlineColor)),
          SizedBox(height: 32),
          // AirQoButton(
          //     icon: SvgPicture.asset("assets/images/shared/add_icon.svg"),
          //     label: "Add Places",
          //     textColor: Colors.white,
          //     color: AppColors.primaryColor,
          //     onPressed: () {})
        ],
      ),
    );
  }
}
