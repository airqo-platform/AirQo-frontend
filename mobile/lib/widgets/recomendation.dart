import 'package:app/constants/config.dart';
import 'package:app/utils/pm.dart';
import 'package:flutter/material.dart';
import 'package:flutter/widgets.dart';

Widget recommendationContainer(Recommendation recommendation, context) {
  return Container(
      width: 304,
      height: 128,
      constraints: const BoxConstraints(
          minWidth: 304, minHeight: 128, maxWidth: 304, maxHeight: 128),
      padding: const EdgeInsets.all(8.0),
      decoration: const BoxDecoration(
          color: Colors.white,
          borderRadius: BorderRadius.all(Radius.circular(8.0))),
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
                Text(
                  recommendation.title,
                  maxLines: 4,
                  overflow: TextOverflow.ellipsis,
                  style: TextStyle(
                      color: Config.appColorBlack,
                      fontWeight: FontWeight.bold,
                      fontSize: 16),
                ),
                const SizedBox(
                  height: 4,
                ),
                Text(
                  recommendation.body,
                  maxLines: 4,
                  overflow: TextOverflow.ellipsis,
                  style: TextStyle(
                      color: Config.appColorBlack.withOpacity(0.5),
                      fontSize: 14),
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
