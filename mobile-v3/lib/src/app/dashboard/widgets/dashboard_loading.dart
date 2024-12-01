import 'package:airqo/src/app/shared/widgets/loading_widget.dart';
import 'package:flutter/material.dart';

class DashboardLoadingPage extends StatelessWidget {
  const DashboardLoadingPage({super.key});

  @override
  Widget build(BuildContext context) {
    return Container(
      child: Column(
        children: [
          ShimmerContainer(
              height: 200, borderRadius: 0, width: double.infinity),
          SizedBox(height: 8),
          ShimmerContainer(
              height: 200, borderRadius: 0, width: double.infinity),
          SizedBox(height: 8),
          ShimmerContainer(height: 200, borderRadius: 0, width: double.infinity)
        ],
      ),
    );
  }
}
