import 'package:airqo/src/app/dashboard/pages/dashboard_page.dart';
import 'package:airqo/src/app/shared/widgets/loading_widget.dart';
import 'package:airqo/src/meta/utils/colors.dart';
import 'package:flutter/material.dart';

class CountriesChip extends StatelessWidget {
  final CountryModel countryModel;
  final double? fontSize;
  final bool current;
  final void Function() onTap;
  const CountriesChip(
      {super.key,
      required this.onTap,
      this.fontSize = 16,
      required this.current,
      required this.countryModel});

  @override
  Widget build(BuildContext context) {
    return InkWell(
      onTap: onTap,
      child: Container(
        padding: const EdgeInsets.symmetric(horizontal: 24),
        margin: const EdgeInsets.only(left: 8),
        height: 51,
        decoration: BoxDecoration(
            color: current
                ? AppColors.primaryColor
                : Theme.of(context).highlightColor,
            borderRadius: BorderRadius.circular(40)),
        child: Center(
            child: Padding(
          padding: const EdgeInsets.only(bottom: 4.0),
          child: Row(
            children: [
              Text(countryModel.flag + countryModel.countryName,
                  style: TextStyle(
                      color: current ||
                              Theme.of(context).brightness == Brightness.dark
                          ? Colors.white
                          : Colors.black,
                      fontSize: fontSize,
                      fontWeight: FontWeight.w500)),
            ],
          ),
        )),
      ),
    );
  }
}

class CountriesChipsLoading extends StatelessWidget {
  const CountriesChipsLoading({super.key});

  @override
  Widget build(BuildContext context) {
    return Padding(
      padding: const EdgeInsets.symmetric(horizontal: 16.0, vertical: 8),
      child: Row(
        children: [
          Expanded(
              child:
                  ShimmerContainer(height: 45, borderRadius: 20, width: 100)),
          SizedBox(width: 8),
          Expanded(
              child:
                  ShimmerContainer(height: 45, borderRadius: 20, width: 150)),
          SizedBox(width: 8),
          Expanded(
              child:
                  ShimmerContainer(height: 45, borderRadius: 20, width: 150)),
        ],
      ),
    );
  }
}
