import 'package:app/blocs/blocs.dart';
import 'package:app/constants/constants.dart' as config;
import 'package:app/models/models.dart';
import 'package:app/services/services.dart';
import 'package:app/themes/theme.dart';
import 'package:app/utils/utils.dart';
import 'package:app/widgets/widgets.dart';
import 'package:cached_network_image/cached_network_image.dart';
import 'package:flutter/material.dart';
import 'package:flutter_bloc/flutter_bloc.dart';
import 'package:flutter_cache_manager/flutter_cache_manager.dart';

import 'kya_lessons_page.dart';
import 'kya_widgets.dart';

class KyaTitlePage extends StatelessWidget {
  const KyaTitlePage(this.kyaLesson, {super.key});

  final KyaLesson kyaLesson;

  @override
  Widget build(BuildContext context) {
    final mediaQueryData = MediaQuery.of(context);

    final num textScaleFactor = mediaQueryData.textScaleFactor.clamp(
      config.Config.minimumTextScaleFactor,
      config.Config.maximumTextScaleFactor,
    );

    return MediaQuery(
      data: mediaQueryData.copyWith(textScaleFactor: textScaleFactor as double),
      child: BlocBuilder<KyaBloc, KyaState>(
        builder: (context, state) {
          KyaLesson cachedKya = state.lessons.firstWhere(
            (element) => element.id == kyaLesson.id,
            orElse: () => kyaLesson,
          );

          if (cachedKya.tasks.isNotEmpty) return PageScaffold(cachedKya);

          return FutureBuilder<KyaLesson?>(
            future: AppService.getKya(kyaLesson),
            builder: (context, snapshot) {
              if (snapshot.hasError) {
                if (snapshot.error.runtimeType == NetworkConnectionException) {
                  return NoInternetConnectionWidget(
                    callBack: () =>
                        context.read<KyaBloc>().add(const FetchKya()),
                  );
                }

                return const KyaNotFoundWidget();
              }

              if (snapshot.hasData) {
                final KyaLesson? kya = snapshot.data;
                if (kya == null) {
                  return const KyaNotFoundWidget();
                }

                return PageScaffold(kya);
              }

              return const KyaLoadingWidget();
            },
          );
        },
      ),
    );
  }
}

class PageScaffold extends StatefulWidget {
  const PageScaffold(this.kyaLesson, {super.key});

  final KyaLesson kyaLesson;

  @override
  State<PageScaffold> createState() => _PageScaffoldState();
}

class _PageScaffoldState extends State<PageScaffold> {
  @override
  void initState() {
    super.initState();
    if (widget.kyaLesson.status == KyaLessonStatus.todo) {
      context.read<KyaBloc>().add(
            UpdateKyaProgress(
              widget.kyaLesson.copyWith(
                activeTask: 1,
                status: KyaLessonStatus.inProgress,
              ),
              updateRemote: true,
            ),
          );
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      extendBodyBehindAppBar: true,
      appBar: const KnowYourAirAppBar(),
      body: Stack(
        fit: StackFit.expand,
        children: [
          Container(
            color: CustomColors.appBodyColor,
            height: double.infinity,
            width: double.infinity,
          ),
          FractionallySizedBox(
            alignment: Alignment.topCenter,
            widthFactor: 1.0,
            heightFactor: 0.4,
            child: Container(
              decoration: BoxDecoration(
                image: DecorationImage(
                  fit: BoxFit.cover,
                  image: CachedNetworkImageProvider(
                    widget.kyaLesson.imageUrl,
                    cacheKey: widget.kyaLesson.imageUrlCacheKey(),
                    cacheManager: CacheManager(
                      CacheService.cacheConfig(
                        widget.kyaLesson.imageUrlCacheKey(),
                      ),
                    ),
                  ),
                ),
              ),
            ),
          ),
          Align(
            alignment: AlignmentDirectional.bottomCenter,
            child: Padding(
              padding: const EdgeInsets.only(
                left: 24,
                right: 24,
                bottom: 32,
              ),
              child: NextButton(
                text: widget.kyaLesson.startButtonText(context),
                buttonColor: CustomColors.appColorBlue,
                callBack: () {
                  Navigator.pushReplacement(
                    context,
                    MaterialPageRoute(
                      builder: (context) {
                        return KyaLessonsPage(widget.kyaLesson);
                      },
                    ),
                  );
                },
              ),
            ),
          ),
          Positioned.fill(
            child: Align(
              alignment: Alignment.center,
              child: Padding(
                padding: const EdgeInsets.symmetric(horizontal: 24),
                child: Column(
                  children: [
                    const Spacer(),
                    Container(
                      decoration: const BoxDecoration(
                        color: Colors.white,
                        borderRadius: BorderRadius.all(
                          Radius.circular(16.0),
                        ),
                      ),
                      child: Center(
                        child: Column(
                          crossAxisAlignment: CrossAxisAlignment.center,
                          children: [
                            const SizedBox(
                              height: 48,
                            ),
                            Container(
                              constraints: const BoxConstraints(
                                maxWidth: 221.46,
                                maxHeight: 133.39,
                                minWidth: 221.46,
                                minHeight: 133.39,
                              ),
                              decoration: const BoxDecoration(
                                // borderRadius: BorderRadius.circular(8.0),
                                image: DecorationImage(
                                  fit: BoxFit.cover,
                                  image: AssetImage(
                                    'assets/images/kya_stars.png',
                                  ),
                                ),
                              ),
                            ),
                            const SizedBox(
                              height: 18,
                            ),
                            Padding(
                              padding: const EdgeInsets.symmetric(
                                horizontal: 40,
                              ),
                              child: Text(
                                widget.kyaLesson.title,
                                textAlign: TextAlign.center,
                                style: CustomTextStyle.headline11(context)
                                    ?.copyWith(
                                  color: CustomColors.appColorBlack,
                                ),
                              ),
                            ),
                            const SizedBox(
                              height: 64,
                            ),
                          ],
                        ),
                      ),
                    ),
                    const Spacer(),
                  ],
                ),
              ),
            ),
          ),
        ],
      ),
    );
  }
}
