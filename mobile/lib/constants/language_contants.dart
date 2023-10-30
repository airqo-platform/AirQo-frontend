import 'package:flutter/material.dart';

class Language {
  final int id;
  final Widget flag;

  final String name;
  final String languageCode;

  Language(this.id, this.flag, this.name, this.languageCode);

  static List<Language> languageList() {
    return <Language>[
      Language(
          1, Image.asset('assets/images/english_flag.png'), "English", "en"),
      Language(2, Image.asset('assets/images/france_flag.png'), "French", "fr"),
      Language(3, Image.asset('assets/images/portugal_flag.png'), "Portuguese",
          "pt"),
      Language(
          4, Image.asset('assets/images/swahili_flag.png'), "Swahili", "sw"),
    ];
  }
}
