// ignore_for_file: must_be_immutable
import 'package:airqo/src/meta/utils/colors.dart';
import 'package:flutter/material.dart';
import 'package:flutter_svg/svg.dart';

class SettingsTile extends StatelessWidget {
  final String title;
  bool? switchValue;
  String? description;
  final String iconPath;
  final void Function(bool)? onChanged;
  final void Function()? onTap;

  SettingsTile({
    super.key,
    required this.iconPath,
    required this.title,
    this.switchValue,
    this.onChanged,
    this.onTap,
    this.description
  });

  @override
  Widget build(BuildContext context) {
    final isDarkMode = Theme.of(context).brightness == Brightness.dark;
    
    // Get theme-aware colors
    final titleColor = isDarkMode 
        ? Colors.white 
        : AppColors.boldHeadlineColor4;
    final descriptionColor = isDarkMode 
        ? Colors.grey[400] 
        : Theme.of(context).textTheme.headlineMedium?.color;
    final iconBgColor = Theme.of(context).highlightColor;
    final dividerColor = isDarkMode 
        ? Colors.grey[800] 
        : Theme.of(context).highlightColor;

    return Padding(
      padding: const EdgeInsets.symmetric(vertical: 8.0, horizontal: 4.0),
      child: Column(
        children: [
          Material(
            color: Colors.transparent,
            child: InkWell(
              borderRadius: BorderRadius.circular(12),
              onTap: onTap,
              child: ListTile(
                contentPadding: EdgeInsets.symmetric(horizontal: 16, vertical: 4),
                trailing: switchValue != null
                    ? Switch(
                        activeColor: Colors.white,
                        activeTrackColor: AppColors.primaryColor,
                        inactiveThumbColor: Colors.white,
                        inactiveTrackColor: isDarkMode 
                            ? Colors.grey[700] 
                            : Theme.of(context).highlightColor,
                        value: switchValue!,
                        onChanged: onChanged)
                    : onTap != null
                        ? Icon(
                            Icons.chevron_right,
                            color: isDarkMode ? Colors.grey[400] : Colors.grey[600],
                            size: 24,
                          )
                        : null,
                subtitle: description != null
                ? Padding(
                    padding: const EdgeInsets.only(top: 6.0),
                    child: Text(
                      description!,
                      style: TextStyle(
                        color: descriptionColor,
                        fontSize: 14,
                        fontWeight: FontWeight.w400,
                        height: 1.4,
                      ),
                    ),
                  )
                : null,
                leading: Container(
              decoration: BoxDecoration(
                shape: BoxShape.circle,
                boxShadow: isDarkMode
                    ? []
                    : [
                        BoxShadow(
                          color: Colors.black.withOpacity(0.05),
                          blurRadius: 3,
                          offset: Offset(0, 1),
                        ),
                      ],
              ),
              child: CircleAvatar(
                radius: 26,
                backgroundColor: iconBgColor,
                child: Center(
                  child: SvgPicture.asset(
                    iconPath,
                    color: isDarkMode ? AppColors.primaryColor : null,
                    width: 22,
                    height: 22,
                  ),
                ),
              ),
            ),
                title: Text(
              title,
              style: TextStyle(
                fontSize: 18,
                fontWeight: FontWeight.w600,
                color: titleColor,
              ),
                ),
              ),
            ),
          ),
          Divider(
            color: isDarkMode ? Colors.grey[700] : Colors.grey[300],
            indent: 16,
            thickness: 1.0,
            height: 1.0,
          )
        ],
      ),
    );
  }
}