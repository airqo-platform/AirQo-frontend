import 'package:flutter/material.dart';
import '../../../meta/utils/colors.dart';

class MyPlacesView extends StatelessWidget {
  const MyPlacesView({super.key});

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 16),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Text(
            "Add places you love",
            style: TextStyle(
              fontSize: 24,
              fontWeight: FontWeight.w700,
              color: Theme.of(context).textTheme.headlineLarge?.color,
            ),
          ),
          SizedBox(height: 8),
          Text(
            "Start by adding locations you care about.",
            style: TextStyle(
              fontSize: 16,
              color: Theme.of(context).textTheme.bodyMedium?.color,
            ),
          ),
          SizedBox(height: 24),
          
          // Add Location Card
          _buildAddLocationCard(context),
          SizedBox(height: 16),
          
          // Second Add Location Card with FAB
          _buildAddLocationCardWithFAB(context),
        ],
      ),
    );
  }

  Widget _buildAddLocationCard(BuildContext context) {
    return Container(
      height: 150,
      decoration: BoxDecoration(
        border: Border.all(
          color: AppColors.primaryColor,
          width: 2,
          style: BorderStyle.solid,
        ),
        borderRadius: BorderRadius.circular(8),
      ),
      child: Center(
        child: TextButton(
          onPressed: () {
            // Add location logic
          },
          child: Text(
            "+Add Location",
            style: TextStyle(
              fontSize: 18,
              color: AppColors.primaryColor,
              fontWeight: FontWeight.w500,
            ),
          ),
        ),
      ),
    );
  }

  Widget _buildAddLocationCardWithFAB(BuildContext context) {
    return Stack(
      children: [
        Container(
          height: 150,
          decoration: BoxDecoration(
            border: Border.all(
              color: AppColors.primaryColor,
              width: 2,
              style: BorderStyle.solid,
            ),
            borderRadius: BorderRadius.circular(8),
          ),
          child: Center(
            child: TextButton(
              onPressed: () {
                // Add location logic
              },
              child: Text(
                "+Add Location",
                style: TextStyle(
                  fontSize: 18,
                  color: AppColors.primaryColor,
                  fontWeight: FontWeight.w500,
                ),
              ),
            ),
          ),
        ),
        Positioned(
          right: 0,
          bottom: 0,
          child: Container(
            margin: EdgeInsets.all(8),
            child: FloatingActionButton(
              onPressed: () {
                // Add location logic
              },
              backgroundColor: AppColors.primaryColor,
              child: Icon(Icons.add, color: Colors.white),
              mini: false,
            ),
          ),
        ),
      ],
    );
  }
}