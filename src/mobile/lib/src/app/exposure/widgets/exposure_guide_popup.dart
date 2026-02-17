import 'package:flutter/material.dart';
import 'package:flutter_svg/flutter_svg.dart';
import 'package:airqo/src/meta/utils/colors.dart';

class ExposureGuidePopup extends StatelessWidget {
  final VoidCallback onClose;

  const ExposureGuidePopup({super.key, required this.onClose});

  @override
  Widget build(BuildContext context) {
    return Container(
      decoration: BoxDecoration(
        color: Theme.of(context).cardColor,
        borderRadius: BorderRadius.circular(12),
        boxShadow: [
          BoxShadow(
            color: Colors.black.withValues(alpha: 0.1),
            blurRadius: 4,
            offset: const Offset(0, 2),
          ),
        ],
      ),
      child: Material(
        color: Colors.transparent,
        child: Container(
          padding: const EdgeInsets.all(20),
          child: Column(
            mainAxisSize: MainAxisSize.min,
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Row(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Expanded(
                    child: Container(
                      padding: const EdgeInsets.only(left: 4),
                      decoration: BoxDecoration(
                        border: Border(
                          left: BorderSide(
                            color: Theme.of(context).brightness == Brightness.dark
                                ? AppColors.dividerColordark
                                : Colors.grey.shade400,
                            width: 4,
                          ),
                        ),
                      ),
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          Text(
                            'Concern levels',
                            style: TextStyle(
                              fontSize: 14,
                              fontWeight: FontWeight.bold,
                              color: Theme.of(context)
                                  .textTheme
                                  .headlineMedium
                                  ?.color,
                            ),
                          ),
                          const SizedBox(height: 8),
                          Text(
                            'We use the different concentration levels of airquality that you experience at different times of the day to share your exposure per hour with a color from these concern level icons',
                            style: TextStyle(
                              fontSize: 10,
                              color: Theme.of(context)
                                  .textTheme
                                  .bodyMedium
                                  ?.color
                                  ?.withValues(alpha: 0.7),
                              height: 1.3,
                            ),
                          ),
                        ],
                      ),
                    ),
                  ),
                  GestureDetector(
                    onTap: onClose,
                    child: Container(
                      padding: const EdgeInsets.all(4),
                      child: Icon(
                        Icons.close,
                        size: 20,
                        color: Theme.of(context)
                            .textTheme
                            .bodyMedium
                            ?.color
                            ?.withValues(alpha: 0.6),
                      ),
                    ),
                  ),
                ],
              ),
              const SizedBox(height: 16),
              _buildConcernLevelItem(context, 'Good', "assets/images/shared/airquality_indicators/good.svg", const Color(0xFF8FE6A4)),
              _buildConcernLevelItem(context, 'Moderate', "assets/images/shared/airquality_indicators/moderate.svg", const Color(0xFFFFEC89)),
              _buildConcernLevelItem(context, 'Unhealthy for Sensitive Groups', "assets/images/shared/airquality_indicators/unhealthy-sensitive.svg", const Color(0xFFFFC170)),
              _buildConcernLevelItem(context, 'Unhealthy', "assets/images/shared/airquality_indicators/unhealthy.svg", const Color(0xFFF0B1D8)),
              _buildConcernLevelItem(context, 'Very Unhealthy', "assets/images/shared/airquality_indicators/very-unhealthy.svg", const Color(0xFFDBB6F1)),
              _buildConcernLevelItem(context, 'Hazardous', "assets/images/shared/airquality_indicators/hazardous.svg", const Color(0xFFF7453C)),
            ],
          ),
        ),
      ),
    );
  }

  Widget _buildConcernLevelItem(BuildContext context, String label, String iconPath, Color color) {
    return Padding(
      padding: const EdgeInsets.symmetric(vertical: 2),
      child: Row(
        children: [
          Expanded(
            child: Text(
              label,
              style: TextStyle(
                fontSize: 14,
                fontWeight: FontWeight.w500,
                color: Theme.of(context)
                    .textTheme
                    .bodyMedium
                    ?.color,
              ),
            ),
          ),
          SizedBox(
            width: 32,
            height: 32,
            child: Center(
              child: SvgPicture.asset(
                iconPath,
                width: 18,
                height: 18,
              ),
            ),
          ),
        ],
      ),
    );
  }
}
