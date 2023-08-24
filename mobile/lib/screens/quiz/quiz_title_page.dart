import 'package:app/models/models.dart';
import 'package:app/screens/quiz/quiz_view.dart';
import 'package:app/screens/quiz/quiz_widgets.dart';
import 'package:app/services/native_api.dart';
import 'package:auto_size_text/auto_size_text.dart';
import 'package:flutter/material.dart';
import 'package:cached_network_image/cached_network_image.dart';
import 'package:flutter_cache_manager/flutter_cache_manager.dart';
import 'package:flutter_gen/gen_l10n/app_localizations.dart';

Future<dynamic> bottomSheetQuizTitle(Quiz quiz, BuildContext context) {
  return showModalBottomSheet(
    isScrollControlled: true,
    enableDrag: false,
    elevation: 1,
    transitionAnimationController: bottomSheetTransition(context),
    shape: const RoundedRectangleBorder(
      borderRadius: BorderRadius.only(
        topLeft: Radius.circular(16),
        topRight: Radius.circular(16),
      ),
    ),
    isDismissible: false,
    context: context,
    builder: (context) {
      return SizedBox(
        height: MediaQuery.of(context).size.height * 0.8,
        child: Flexible(
          child: Padding(
            padding: const EdgeInsets.fromLTRB(2, 2, 2, 10),
            child: Column(
              mainAxisSize: MainAxisSize.min,
              mainAxisAlignment: MainAxisAlignment.start,
              crossAxisAlignment: CrossAxisAlignment.center,
              children: [
                const SizedBox(
                  height: 2,
                ),
                SizedBox(
                  height: MediaQuery.of(context).size.height * 0.28,
                  child: Padding(
                    padding: const EdgeInsets.all(4.0),
                    child: Container(
                      alignment: Alignment.center,
                      decoration: BoxDecoration(
                        borderRadius: BorderRadius.circular(8),
                        image: DecorationImage(
                          fit: BoxFit.cover,
                          image: CachedNetworkImageProvider(
                            quiz.imageUrl,
                            cacheKey: quiz.imageUrlCacheKey(),
                            cacheManager: CacheManager(
                              CacheService.cacheConfig(
                                quiz.imageUrlCacheKey(),
                              ),
                            ),
                          ),
                        ),
                      ),
                    ),
                  ),
                ),
                const SizedBox(height: 10),
                Padding(
                  padding: const EdgeInsets.fromLTRB(10, 0, 10, 20),
                  child: Column(
                    mainAxisSize: MainAxisSize.min,
                    mainAxisAlignment: MainAxisAlignment.start,
                    crossAxisAlignment: CrossAxisAlignment.center,
                    children: [
                      SizedBox(
                        width: MediaQuery.of(context).size.width * 0.8,
                        child: AutoSizeText(
                          quiz.title,
                          maxLines: 2,
                          textAlign: TextAlign.center,
                          style: const TextStyle(
                            color: Color.fromARGB(255, 31, 35, 45),
                            fontSize: 25,
                            fontWeight: FontWeight.w700,
                          ),
                        ),
                      ),
                      const SizedBox(height: 10),
                      SizedBox(
                        width: MediaQuery.of(context).size.width * 0.8,
                        child: AutoSizeText(
                          quiz.description,
                          textAlign: TextAlign.justify,
                          maxLines: 2,
                          style: const TextStyle(
                            color: Color(0xFF6F87A1),
                            fontSize: 15,
                            fontWeight: FontWeight.w500,
                            //height: 1.50,
                          ),
                        ),
                      ),
                      const SizedBox(height: 20),
                      InkWell(
                        onTap: () async {
                          Navigator.pop(context, true);
                        },
                        child: QuizActionButton(
                          text:
                              AppLocalizations.of(context)!.takeAirQualityQuiz,
                        ),
                      ),
                      const SizedBox(height: 10),
                      InkWell(
                        onTap: () async {
                          Navigator.pop(context, false);
                        },
                        child: QuizSkipButton(
                          text: AppLocalizations.of(context)!.skipThisForLater,
                        ),
                      ),
                    ],
                  ),
                ),
              ],
            ),
          ),
        ),
      );
    },
  );
}
