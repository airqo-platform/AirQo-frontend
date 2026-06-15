import 'package:airqo/src/app/profile/pages/widgets/guest_settings_widget.dart';
import 'package:airqo/src/app/shared/widgets/translated_text.dart';
import 'package:flutter/material.dart';
import 'package:flutter_svg/svg.dart';

class GuestProfilePage extends StatelessWidget {
  const GuestProfilePage({super.key});

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        automaticallyImplyLeading: false,
        actions: [
          IconButton(
              onPressed: () => Navigator.pop(context),
              icon: const Icon(Icons.close)),
          const SizedBox(width: 16),
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
                      radius: 50,
                      child: Center(
                        child: SvgPicture.asset("assets/icons/user_icon.svg"),
                      ),
                    ),
                  ),
                  TranslatedText(
                    "Guest User",
                    style: TextStyle(
                      color: Theme.of(context).textTheme.headlineSmall?.color,
                      fontSize: 24,
                      fontWeight: FontWeight.w700,
                    ),
                  ),
                ],
              ),
              const SizedBox(height: 32),
              Container(
                margin: const EdgeInsets.symmetric(horizontal: 20),
                child: TranslatedText(
                  'Settings',
                  style: TextStyle(
                    color: Theme.of(context).textTheme.headlineSmall?.color,
                    fontSize: 18,
                    fontWeight: FontWeight.w500,
                  ),
                ),
              ),
              const SizedBox(height: 5),
              Divider(
                color: Theme.of(context).highlightColor,
                indent: 20,
              ),
              const GuestSettingsWidget(),
              const SizedBox(height: 76),
              Center(
                child: Column(
                  children: [
                    SvgPicture.asset('assets/images/shared/logo.svg'),
                    const SizedBox(height: 18),
                    SvgPicture.asset(
                      'assets/images/shared/Frame 128.svg',
                      colorFilter: ColorFilter.mode(
                        Theme.of(context).textTheme.titleLarge?.color ??
                            Colors.black,
                        BlendMode.srcIn,
                      ),
                    ),
                  ],
                ),
              ),
              const SizedBox(height: 220),
            ],
          ),
        ),
      ),
    );
  }
}

