import 'package:app/constants/config.dart';
import 'package:app/utils/pm.dart';
import 'package:auto_size_text/auto_size_text.dart';
import 'package:flutter/material.dart';

import '../themes/app_theme.dart';

class RecommendationContainer extends StatelessWidget {
  final Recommendation recommendation;
  const RecommendationContainer(this.recommendation, {Key? key})
      : super(key: key);

  @override
  Widget build(BuildContext context) {
    return Container(
        width: 304,
        height: 128,
        constraints: const BoxConstraints(
            minWidth: 304, minHeight: 128, maxWidth: 304, maxHeight: 128),
        padding: const EdgeInsets.all(8.0),
        decoration: const BoxDecoration(
            color: Colors.white,
            borderRadius: BorderRadius.all(Radius.circular(16.0))),
        child: Row(
          children: [
            Container(
              constraints: const BoxConstraints(
                maxWidth: 83,
                maxHeight: 112,
                minWidth: 83,
                minHeight: 112,
              ),
              decoration: BoxDecoration(
                borderRadius: BorderRadius.circular(8.0),
                image: DecorationImage(
                  fit: BoxFit.cover,
                  image: AssetImage(
                    recommendation.imageUrl,
                  ),
                ),
              ),
            ),
            const SizedBox(
              width: 12,
            ),
            Expanded(
                child: Container(
              constraints: BoxConstraints(
                maxWidth: MediaQuery.of(context).size.width,
              ),
              child: Column(
                mainAxisAlignment: MainAxisAlignment.center,
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  AutoSizeText(
                    recommendation.title,
                    maxLines: 1,
                    overflow: TextOverflow.ellipsis,
                    style: CustomTextStyle.headline10(context),
                  ),
                  const SizedBox(
                    height: 4,
                  ),
                  AutoSizeText(
                    recommendation.body,
                    maxLines: 4,
                    overflow: TextOverflow.ellipsis,
                    style: Theme.of(context).textTheme.subtitle2?.copyWith(
                        color: Config.appColorBlack.withOpacity(0.5)),
                  )
                ],
              ),
            )),
            const SizedBox(
              width: 12,
            ),
          ],
        ));
  }
}
