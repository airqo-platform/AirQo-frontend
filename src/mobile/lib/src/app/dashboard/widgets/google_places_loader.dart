import 'package:flutter/material.dart';
import 'package:airqo/src/app/shared/widgets/loading_widget.dart';

class GooglePlacesLoader extends StatelessWidget {
  const GooglePlacesLoader({
    super.key,
  });

  @override
  Widget build(BuildContext context) {
    return Container(
        child: Row(
      children: [
        ShimmerContainer(height: 50, borderRadius: 100, width: 50),
        SizedBox(width: 8),
        Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            ShimmerText(
              width: 200,
            ),
            SizedBox(height: 8),
            ShimmerText()
          ],
        )
      ],
    ));
  }
}