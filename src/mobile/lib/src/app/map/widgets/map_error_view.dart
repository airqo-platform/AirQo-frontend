import 'package:airqo/src/app/shared/widgets/translated_text.dart';
import 'package:airqo/src/meta/utils/colors.dart';
import 'package:flutter/material.dart';

class MapErrorView extends StatelessWidget {
  final VoidCallback onRetry;
  final bool isOffline;

  const MapErrorView({super.key, required this.onRetry, this.isOffline = false});

  @override
  Widget build(BuildContext context) {
    return Center(
      child: Column(
        mainAxisAlignment: MainAxisAlignment.center,
        children: [
          Icon(isOffline ? Icons.cloud_off : Icons.map_outlined, size: 64, color: Colors.grey),
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
            isOffline
                ? "Please check your connection and try again"
                : "Something went wrong. Please try again later",
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
