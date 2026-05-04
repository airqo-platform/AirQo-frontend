import 'package:airqo/src/app/shared/widgets/translated_text.dart';
import 'package:airqo/src/meta/utils/colors.dart';
import 'package:flutter/material.dart';

class MapLoadingView extends StatelessWidget {
  const MapLoadingView({super.key});

  @override
  Widget build(BuildContext context) {
    return Center(
      child: Column(
        mainAxisAlignment: MainAxisAlignment.center,
        children: [
          CircularProgressIndicator(color: AppColors.primaryColor),
          const SizedBox(height: 16),
          TranslatedText(
            "Loading map data...",
            style: TextStyle(
                fontSize: 16,
                color: Theme.of(context).textTheme.bodyMedium?.color),
          ),
        ],
      ),
    );
  }
}
