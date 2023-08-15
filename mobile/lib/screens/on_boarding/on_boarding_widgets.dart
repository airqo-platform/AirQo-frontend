import 'package:app/blocs/blocs.dart';
import 'package:app/models/models.dart';
import 'package:app/themes/theme.dart';
import 'package:app/utils/extensions.dart';
import 'package:app/widgets/widgets.dart';
import 'package:flutter/material.dart';
import 'package:flutter_bloc/flutter_bloc.dart';
import 'package:flutter_svg/svg.dart';
import 'package:flutter_gen/gen_l10n/app_localizations.dart';

OnBoardingPage getOnBoardingPageConstant(String value) {
  switch (value) {
    case 'signup':
      return OnBoardingPage.signup;
    case 'profile':
      return OnBoardingPage.profile;
    case 'notification':
      return OnBoardingPage.notification;
    case 'location':
      return OnBoardingPage.location;
    case 'complete':
      return OnBoardingPage.complete;
    case 'home':
      return OnBoardingPage.home;
    case 'welcome':
      return OnBoardingPage.welcome;
    default:
      return OnBoardingPage.signup;
  }
}

class OnBoardingLocationIcon extends StatelessWidget {
  const OnBoardingLocationIcon({super.key});

  @override
  Widget build(BuildContext context) {
    return Stack(
      alignment: AlignmentDirectional.center,
      children: [
        Image.asset(
          'assets/icon/floating_bg.png',
          fit: BoxFit.fitWidth,
          width: double.infinity,
        ),
        Image.asset(
          'assets/icon/enable_location_icon.png',
          height: 221,
        ),
      ],
    );
  }
}

class OnBoardingNotificationIcon extends StatelessWidget {
  const OnBoardingNotificationIcon({super.key});

  @override
  Widget build(BuildContext context) {
    return Stack(
      alignment: AlignmentDirectional.center,
      children: [
        Image.asset(
          'assets/icon/floating_bg.png',
          fit: BoxFit.fitWidth,
          width: double.infinity,
        ),
        SvgPicture.asset(
          'assets/icon/enable_notifications_icon.svg',
          height: 221,
        ),
      ],
    );
  }
}

class ProfileSetupNameInputField extends StatelessWidget {
  const ProfileSetupNameInputField({
    super.key,
    required this.controller,
  });

  final TextEditingController controller;

  @override
  Widget build(BuildContext context) {
    OutlineInputBorder borderSide = OutlineInputBorder(
      borderSide: BorderSide(color: CustomColors.appColorBlue, width: 1.0),
      borderRadius: BorderRadius.circular(8.0),
    );

    return BlocBuilder<ProfileBloc, Profile>(
      builder: (context, profile) {
        return TextFormField(
          controller: controller,
          onEditingComplete: () {
            FocusScope.of(context).requestFocus(
              FocusNode(),
            );
            List<String> names = controller.text.getFirstAndLastNames();
            context.read<ProfileBloc>().add(
                  UpdateProfile(
                    profile.copyWith(
                      firstName: names.first,
                      lastName: names.last,
                    ),
                  ),
                );
          },
          enableSuggestions: false,
          cursorWidth: 1,
          cursorColor: CustomColors.appColorBlue,
          keyboardType: TextInputType.name,
          onChanged: (text) {
            List<String> names = text.getFirstAndLastNames();
            context.read<ProfileBloc>().add(
                  UpdateProfile(
                    profile.copyWith(
                      firstName: names.first,
                      lastName: names.last,
                    ),
                  ),
                );
          },
          validator: (value) {
            if (value == null || value.isEmpty) {
              return AppLocalizations.of(context)!.pleaseEnterYourName;
            }

            return null;
          },
          decoration: InputDecoration(
            contentPadding: const EdgeInsets.fromLTRB(16, 12, 0, 12),
            focusedBorder: borderSide,
            enabledBorder: borderSide,
            border: borderSide,
            hintText: AppLocalizations.of(context)!.enterYourName,
            errorStyle: const TextStyle(
              fontSize: 0,
            ),
            suffixIcon: GestureDetector(
              onTap: () {
                controller.text = "";
                context.read<ProfileBloc>().add(
                      UpdateProfile(
                        profile.copyWith(firstName: "", lastName: ""),
                      ),
                    );
              },
              child: const TextInputCloseButton(),
            ),
          ),
        );
      },
    );
  }
}

class TitleToggleListOption extends StatelessWidget {
  const TitleToggleListOption({
    super.key,
    required this.title,
    required this.currentTitle,
  });

  final TitleOptions title;
  final TitleOptions currentTitle;

  @override
  Widget build(BuildContext context) {
    Color textColor = currentTitle == title
        ? CustomColors.appColorBlue
        : CustomColors.appColorBlack;

    Color bgColor = currentTitle == title
        ? CustomColors.appColorBlue.withOpacity(0.05)
        : Colors.transparent;

    return ListTile(
      shape: const RoundedRectangleBorder(
        borderRadius: BorderRadius.all(
          Radius.circular(8.0),
        ),
      ),
      tileColor: bgColor,
      title: Text(
        title.value,
        style: Theme.of(context).textTheme.bodySmall?.copyWith(
              color: textColor,
              fontWeight: FontWeight.w700,
            ),
      ),
    );
  }
}

class SkipOnboardScreen extends StatelessWidget {
  const SkipOnboardScreen(this.nextScreen, {super.key});

  final Widget nextScreen;

  @override
  Widget build(BuildContext context) {
    return InkWell(
      onTap: () async {
        await Navigator.pushAndRemoveUntil(
          context,
          MaterialPageRoute(builder: (context) {
            return nextScreen;
          }),
          (r) => false,
        );
      },
      child: Padding(
        padding: const EdgeInsets.only(top: 16.0),
        child: Text(
          AppLocalizations.of(context)!.noThanks,
          textAlign: TextAlign.center,
          style: Theme.of(context).textTheme.bodySmall?.copyWith(
                color: CustomColors.appColorBlue,
                fontWeight: FontWeight.w600,
              ),
        ),
      ),
    );
  }
}

class TitleDropDown extends StatelessWidget {
  const TitleDropDown({super.key});

  @override
  Widget build(BuildContext context) {
    return BlocBuilder<ProfileBloc, Profile>(
      builder: (context, profile) {
        return PopupMenuButton<TitleOptions>(
          padding: const EdgeInsets.only(top: -8),
          position: PopupMenuPosition.under,
          color: CustomColors.appBodyColor,
          shape: const RoundedRectangleBorder(
            borderRadius: BorderRadius.all(
              Radius.circular(8.0),
            ),
          ),
          onSelected: (title) {
            context
                .read<ProfileBloc>()
                .add(UpdateProfile(profile.copyWith(title: title.value)));
          },
          child: Container(
            width: 65,
            decoration: BoxDecoration(
              color: CustomColors.appBodyColor,
              borderRadius: BorderRadius.circular(8),
            ),
            child: Padding(
              padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 15),
              child: Row(
                crossAxisAlignment: CrossAxisAlignment.center,
                mainAxisAlignment: MainAxisAlignment.center,
                children: [
                  Text(
                    profile.getTitle().getAbbr(context),
                    style: Theme.of(context).textTheme.bodySmall?.copyWith(
                          fontWeight: FontWeight.w700,
                        ),
                  ),
                  const Icon(
                    Icons.keyboard_arrow_down_sharp,
                    color: Colors.black,
                  ),
                ],
              ),
            ),
          ),
          itemBuilder: (BuildContext context) => TitleOptions.values
              .map(
                (element) => PopupMenuItem(
                  padding: const EdgeInsets.symmetric(horizontal: 8),
                  value: element,
                  child: TitleToggleListOption(
                    title: element,
                    currentTitle: profile.getTitle(),
                  ),
                ),
              )
              .toList(),
        );
      },
    );
  }
}

class LogoWidget extends StatelessWidget {
  const LogoWidget({super.key});

  @override
  Widget build(BuildContext context) {
    return Center(
      child: SvgPicture.asset(
        'assets/icon/splash_image.svg',
        semanticsLabel: 'Splash image',
      ),
    );
  }
}

class TaglineWidget extends StatelessWidget {
  const TaglineWidget({
    super.key,
    required this.visible,
  });

  final bool visible;

  @override
  Widget build(BuildContext context) {
    return AnimatedOpacity(
      opacity: visible ? 1.0 : 0.0,
      duration: const Duration(milliseconds: 500),
      child: Center(
        child: Stack(
          alignment: AlignmentDirectional.center,
          children: [
            Image.asset(
              'assets/images/splash-image.png',
              fit: BoxFit.cover,
              height: double.infinity,
              width: double.infinity,
              alignment: Alignment.center,
            ),
            Text(
              AppLocalizations.of(context)!.breatheClean,
              textAlign: TextAlign.center,
              style: Theme.of(context)
                  .textTheme
                  .headlineMedium
                  ?.copyWith(color: Colors.white),
            ),
          ],
        ),
      ),
    );
  }
}

class OnBoardingTopBar extends StatelessWidget implements PreferredSizeWidget {
  const OnBoardingTopBar({super.key, this.backgroundColor});

  final Color? backgroundColor;

  @override
  PreferredSizeWidget build(BuildContext context) {
    return AppBar(
      toolbarHeight: 0,
      backgroundColor: backgroundColor ?? CustomColors.appBodyColor,
    );
  }

  @override
  Size get preferredSize => const Size.fromHeight(0);
}
