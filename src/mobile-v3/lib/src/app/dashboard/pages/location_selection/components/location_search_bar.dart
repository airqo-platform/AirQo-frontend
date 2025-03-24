import 'package:flutter/material.dart';
import 'package:flutter_svg/svg.dart';

class LocationSearchBar extends StatelessWidget {
  final TextEditingController controller;
  final ValueChanged<String> onChanged;

  const LocationSearchBar({
    super.key,
    required this.controller,
    required this.onChanged,
  });

  @override
  Widget build(BuildContext context) {
    return Padding(
      padding: const EdgeInsets.symmetric(horizontal: 16),
      child: TextField(
        controller: controller,
        style: TextStyle(color: Theme.of(context).textTheme.bodyLarge?.color),
        onChanged: onChanged,
        decoration: InputDecoration(
          hintText: 'Search Villages, Cities or Countries',
          hintStyle: TextStyle(color: Theme.of(context).textTheme.bodyMedium?.color?.withOpacity(0.6)),
          prefixIcon: Padding(
            padding: const EdgeInsets.all(11.0),
            child: SvgPicture.asset(
              "assets/icons/search_icon.svg",
              height: 15,
              color: Theme.of(context).textTheme.headlineLarge!.color,
            ),
          ),
          filled: true,
          fillColor: Theme.of(context).highlightColor,
          border: OutlineInputBorder(
            borderRadius: BorderRadius.circular(12),
            borderSide: BorderSide.none,
          ),
        ),
      ),
    );
  }
}