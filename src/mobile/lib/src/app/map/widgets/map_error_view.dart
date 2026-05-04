import 'package:airqo/src/app/shared/widgets/translated_text.dart';
import 'package:airqo/src/meta/utils/colors.dart';
import 'package:flutter/material.dart';

class MapErrorView extends StatelessWidget {
  final VoidCallback onRetry;

  const MapErrorView({super.key, required this.onRetry});

  @override
  Widget build(BuildContext context) {
    return Center(
      child: Column(
        mainAxisAlignment: MainAxisAlignment.center,
        children: [
          const Icon(Icons.map_outlined, size: 64, color: Colors.grey),
          const SizedBox(height: 16),
          TranslatedText(
            "Unable to load map data",
            style: TextStyle(
                fontSize: 18,
                fontWeight: FontWeight.bold,
                color: Theme.of(context).textTheme.headlineMedium?.color),
          ),
          const SizedBox(height: 8),
          TranslatedText(
            "Please check your connection and try again",
            style: TextStyle(
                fontSize: 16,
                color: Theme.of(context).textTheme.bodyMedium?.color),
          ),
          const SizedBox(height: 24),
          ElevatedButton.icon(
            onPressed: onRetry,
            icon: const Icon(Icons.refresh),
            label: TranslatedText('Try Again'),
            style: ElevatedButton.styleFrom(
                backgroundColor: AppColors.primaryColor,
                foregroundColor: Colors.white),
          ),
        ],
      ),
    );
  }
}
