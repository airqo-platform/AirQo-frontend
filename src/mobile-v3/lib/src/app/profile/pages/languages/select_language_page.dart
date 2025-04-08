import 'package:flutter/material.dart';
import 'package:airqo/src/meta/utils/colors.dart';

class SelectLanguagePage extends StatefulWidget {
  const SelectLanguagePage({super.key});

  @override
  State<SelectLanguagePage> createState() => _SelectLanguagePageState();
}

class _SelectLanguagePageState extends State<SelectLanguagePage> {
  String selectedLanguage = 'English';
  final List<String> languages = ['English', 'French', 'Luganda', 'Swahili', 'Portuguese'];

  @override
  Widget build(BuildContext context) {
    final isDarkMode = Theme.of(context).brightness == Brightness.dark;
    final dividerColor = isDarkMode 
        ? AppColors.dividerColordark 
        : AppColors.dividerColorlight;
    
    return Scaffold(
      appBar: AppBar(
        title: Text(
          'Select language', 
          style: TextStyle(
            fontSize: 22,
            fontWeight: FontWeight.w500,
          ),
        ),
        centerTitle: true,
        leading: IconButton(
          icon: const Icon(Icons.arrow_back_ios, size: 20),
          onPressed: () {
            Navigator.pop(context);
          },
        ),
        elevation: 0,
        backgroundColor: Colors.transparent,
      ),
      body: Padding(
        padding: const EdgeInsets.symmetric(horizontal: 16.0),
        child: ListView.separated(
          itemCount: languages.length,
          separatorBuilder: (context, index) => Divider(
            color: dividerColor,
            height: 1,
          ),
          itemBuilder: (context, index) {
            final language = languages[index];
            final isSelected = language == selectedLanguage;
            
            return ListTile(
              contentPadding: const EdgeInsets.symmetric(vertical: 12),
              title: Text(
                language,
                style: TextStyle(
                  fontSize: 18,
                  fontWeight: FontWeight.w400,
                  color: isDarkMode 
                      ? AppColors.highlightColor2 
                      : AppColors.boldHeadlineColor4,
                ),
              ),
              trailing: isSelected
                  ? Container(
                      width: 24,
                      height: 24,
                      decoration: BoxDecoration(
                        color: AppColors.primaryColor,
                        borderRadius: BorderRadius.circular(4),
                      ),
                      child: const Icon(
                        Icons.check,
                        color: Colors.white,
                        size: 18,
                      ),
                    )
                  : Container(
                      width: 24,
                      height: 24,
                      decoration: BoxDecoration(
                        border: Border.all(
                          color: isDarkMode 
                              ? AppColors.secondaryHeadlineColor2 
                              : AppColors.borderColor2,
                        ),
                        borderRadius: BorderRadius.circular(4),
                      ),
                    ),
              onTap: () {
                setState(() {
                  selectedLanguage = language;
                });
              },
            );
          },
        ),
      ),
    );
  }
}