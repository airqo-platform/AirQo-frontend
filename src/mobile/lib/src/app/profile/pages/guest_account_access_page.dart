import 'package:airqo/src/app/auth/pages/login_page.dart';
import 'package:airqo/src/app/auth/pages/register_page.dart';
import 'package:airqo/src/app/shared/widgets/translated_text.dart';
import 'package:airqo/src/meta/utils/colors.dart';
import 'package:flutter/material.dart';

class GuestAccountAccessPage extends StatelessWidget {
  const GuestAccountAccessPage({super.key});

  @override
  Widget build(BuildContext context) {
    final isDarkMode = Theme.of(context).brightness == Brightness.dark;

    return Scaffold(
      appBar: AppBar(
        title: const TranslatedText('Account'),
        leading: IconButton(
          icon: const Icon(Icons.arrow_back),
          onPressed: () => Navigator.pop(context),
        ),
      ),
      body: SingleChildScrollView(
        padding: const EdgeInsets.all(24),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            const SizedBox(height: 24),
            TranslatedText(
              'Sign in or create an account to save your favourite locations, receive air quality alerts, and access personalised features.',
              style: TextStyle(
                fontSize: 15,
                color: Theme.of(context).textTheme.bodyMedium?.color,
                height: 1.6,
              ),
            ),
            const SizedBox(height: 48),
            SizedBox(
              width: double.infinity,
              height: 52,
              child: ElevatedButton(
                style: ElevatedButton.styleFrom(
                  backgroundColor: AppColors.primaryColor,
                  shape: RoundedRectangleBorder(
                    borderRadius: BorderRadius.circular(4),
                  ),
                  elevation: 0,
                ),
                onPressed: () => Navigator.of(context).push(
                  MaterialPageRoute(settings: const RouteSettings(name: 'create_account'), builder: (_) => CreateAccountScreen()),
                ),
                child: const TranslatedText(
                  'Create Account',
                  style: TextStyle(
                    color: Colors.white,
                    fontWeight: FontWeight.w600,
                    fontSize: 16,
                  ),
                ),
              ),
            ),
            const SizedBox(height: 16),
            SizedBox(
              width: double.infinity,
              height: 52,
              child: OutlinedButton(
                style: OutlinedButton.styleFrom(
                  side: BorderSide(
                    color: isDarkMode
                        ? Colors.grey[600]!
                        : AppColors.borderColor2,
                  ),
                  shape: RoundedRectangleBorder(
                    borderRadius: BorderRadius.circular(4),
                  ),
                ),
                onPressed: () => Navigator.of(context).pushAndRemoveUntil(
                  MaterialPageRoute(settings: const RouteSettings(name: 'login'), builder: (_) => LoginPage()),
                  (route) => false,
                ),
                child: TranslatedText(
                  'Sign In',
                  style: TextStyle(
                    fontWeight: FontWeight.w500,
                    fontSize: 16,
                    color: isDarkMode
                        ? Colors.white
                        : AppColors.boldHeadlineColor4,
                  ),
                ),
              ),
            ),
          ],
        ),
      ),
    );
  }
}
