import 'package:app/models/models.dart';
import 'package:app/themes/theme.dart';
import 'package:flutter/material.dart';
import 'package:flutter_svg/svg.dart';

class SvgIcons {
  static Widget location() {
    return Icon(
      Icons.location_on_rounded,
      color: CustomColors.appColorBlue,
      size: 27,
    );
  }

  static Widget airQualityEmoji(
    AirQuality? airQuality, {
    double height = 18,
    double width = 30,
  }) {
    if (airQuality == null) {
      return Padding(
        padding: const EdgeInsets.only(bottom: 3.0),
        child: SizedBox(
          height: 4,
          width: width,
          child: Row(
            children: [
              Expanded(
                child: Container(
                  color: CustomColors.greyColor,
                ),
              ),
              const SizedBox(
                width: 2,
              ),
              Expanded(
                child: Container(
                  color: CustomColors.greyColor,
                ),
              ),
            ],
          ),
        ),
      );
    }

    return SvgPicture.asset(
      airQuality.svgEmoji,
      height: height,
      width: width,
    );
  }

  static Widget close({double size = 40}) {
    return SvgPicture.asset(
      'assets/icon/close.svg',
      height: size,
      width: size,
    );
  }

  static Widget update() {
    return SvgPicture.asset('assets/icon/update_icon.svg');
  }

  static Widget information() {
    return SvgPicture.asset(
      'assets/icon/info_icon.svg',
      height: 20,
      width: 20,
    );
  }

  static Widget pm2_5(double value) {
    return SvgPicture.asset(
      Pollutant.pm2_5.svg,
      semanticsLabel: 'Pm2.5',
      height: 8,
      width: 16,
      colorFilter: ColorFilter.mode(
        Pollutant.pm2_5.textColor(
          value: value,
        ),
        BlendMode.srcIn,
      ),
    );
  }

  static Widget pmUnit(double value) {
    return SvgPicture.asset(
      'assets/icon/unit.svg',
      semanticsLabel: 'Unit',
      height: 10,
      width: 16,
      colorFilter: ColorFilter.mode(
        Pollutant.pm2_5.textColor(
          value: value,
        ),
        BlendMode.srcIn,
      ),
    );
  }
}

class MaterialIcons {
  static Widget closeSearchFilter() {
    return Container(
      height: 24,
      width: 24,
      decoration: const BoxDecoration(
        color: Color(0xffC6C6CC),
        shape: BoxShape.circle,
      ),
      child: const Center(
        child: Icon(
          Icons.close,
          color: Colors.white,
          size: 20,
        ),
      ),
    );
  }

  static Widget forwardIcon() {
    return Container(
      height: 24,
      width: 24,
      decoration: BoxDecoration(
        color: CustomColors.appBodyColor,
        shape: BoxShape.rectangle,
        borderRadius: const BorderRadius.all(
          Radius.circular(4.0),
        ),
      ),
      child: Icon(
        Icons.chevron_right_rounded,
        size: 20,
        color: CustomColors.appColorBlack,
      ),
    );
  }

  static Widget searchFilter({Color? foregroundColor, Color? backgroundColor}) {
    return Container(
      height: 35,
      width: 35,
      decoration: BoxDecoration(
        color: backgroundColor ?? const Color(0xffC6C6CC),
        shape: BoxShape.circle,
      ),
      child: Icon(
        Icons.filter_list,
        color: foregroundColor ?? CustomColors.appColorBlue,
      ),
    );
  }
}
