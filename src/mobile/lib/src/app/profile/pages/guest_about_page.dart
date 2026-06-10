import 'package:airqo/src/app/profile/pages/guest_account_access_page.dart';
import 'package:airqo/src/app/shared/widgets/translated_text.dart';
import 'package:flutter/material.dart';
import 'package:flutter_svg/svg.dart';
import 'package:package_info_plus/package_info_plus.dart';

class GuestAboutPage extends StatefulWidget {
  const GuestAboutPage({super.key});

  @override
  State<GuestAboutPage> createState() => _GuestAboutPageState();
}

class _GuestAboutPageState extends State<GuestAboutPage> {
  String _appVersion = '';

  @override
  void initState() {
    super.initState();
    _loadVersion();
  }

  Future<void> _loadVersion() async {
    final info = await PackageInfo.fromPlatform();
    if (mounted) {
      setState(() {
        _appVersion = '${info.version}(${info.buildNumber})';
      });
    }
  }

  @override
  Widget build(BuildContext context) {
    final isDarkMode = Theme.of(context).brightness == Brightness.dark;

    return Scaffold(
      appBar: AppBar(
        title: const TranslatedText('About'),
        leading: IconButton(
          icon: const Icon(Icons.arrow_back),
          onPressed: () => Navigator.pop(context),
        ),
      ),
      body: SingleChildScrollView(
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            // App identity
            Center(
              child: Padding(
                padding: const EdgeInsets.symmetric(vertical: 40),
                child: Column(
                  children: [
                    SvgPicture.asset(
                      'assets/images/shared/logo.svg',
                      height: 56,
                    ),
                    const SizedBox(height: 14),
                    if (_appVersion.isNotEmpty)
                      Text(
                        'Version $_appVersion',
                        style: TextStyle(
                          fontSize: 13,
                          color: isDarkMode
                              ? Colors.grey[400]
                              : Colors.grey[600],
                        ),
                      ),
                    const SizedBox(height: 4),
                    Text(
                      'A project by Makerere University',
                      style: TextStyle(
                        fontSize: 13,
                        color: isDarkMode
                            ? Colors.grey[400]
                            : Colors.grey[600],
                      ),
                    ),
                  ],
                ),
              ),
            ),

            Divider(color: Theme.of(context).highlightColor),

            Padding(
              padding: const EdgeInsets.symmetric(horizontal: 24, vertical: 20),
              child: TranslatedText(
                'AirQo operates Africa\'s leading air quality monitoring network, '
                'providing real-time pollution data through locally designed sensors, '
                'analytics platforms, and this mobile app across African cities.\n\n'
                'Our mission: clean air for all African cities.',
                style: TextStyle(
                  fontSize: 14,
                  color: Theme.of(context).textTheme.bodyMedium?.color,
                  height: 1.65,
                ),
              ),
            ),

            const SizedBox(height: 60),

            // Account access — intentionally subtle and far down the page
            Divider(color: Theme.of(context).highlightColor),
            ListTile(
              contentPadding:
                  const EdgeInsets.symmetric(horizontal: 24, vertical: 4),
              title: TranslatedText(
                'Account',
                style: TextStyle(
                  fontSize: 15,
                  color: isDarkMode ? Colors.grey[500] : Colors.grey[500],
                ),
              ),
              trailing: Icon(
                Icons.chevron_right,
                color: isDarkMode ? Colors.grey[600] : Colors.grey[400],
                size: 20,
              ),
              onTap: () => Navigator.of(context).push(
                MaterialPageRoute(
                  builder: (_) => const GuestAccountAccessPage(),
                ),
              ),
            ),
            const SizedBox(height: 40),
          ],
        ),
      ),
    );
  }
}
