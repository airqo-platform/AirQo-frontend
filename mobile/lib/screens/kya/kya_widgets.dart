import 'package:app/blocs/blocs.dart';
import 'package:app/models/models.dart';
import 'package:app/services/services.dart';
import 'package:app/themes/theme.dart';
import 'package:app/utils/utils.dart';
import 'package:app/widgets/widgets.dart';
import 'package:auto_size_text/auto_size_text.dart';
import 'package:cached_network_image/cached_network_image.dart';
import 'package:flutter/material.dart';
import 'package:flutter_bloc/flutter_bloc.dart';
import 'package:flutter_cache_manager/flutter_cache_manager.dart';
import 'package:flutter_gen/gen_l10n/app_localizations.dart';
import 'package:flutter_svg/svg.dart';

import 'kya_title_page.dart';

class CircularKyaButton extends StatelessWidget {
  const CircularKyaButton({
    super.key,
    required this.icon,
    this.isActive = true,
  });

  final String icon;
  final bool isActive;

  @override
  Widget build(BuildContext context) {
    return Container(
      height: 48,
      width: 48,
      padding: const EdgeInsets.all(15.0),
      decoration: BoxDecoration(
        color: isActive
            ? CustomColors.appColorBlue
            : CustomColors.appColorBlue.withOpacity(0.5),
        shape: BoxShape.circle,
      ),
      child: SvgPicture.asset(
        icon,
        colorFilter: const ColorFilter.mode(
          Colors.white,
          BlendMode.srcIn,
        ),
      ),
    );
  }
}

class KyaMessageChip extends StatelessWidget {
  const KyaMessageChip(this.kya, {super.key});

  final KyaLesson kya;

  @override
  Widget build(BuildContext context) {
    Widget widget = AutoSizeText(
      kya.getKyaMessage(context),
      maxLines: 2,
      overflow: TextOverflow.ellipsis,
      textAlign: TextAlign.center,
      style: CustomTextStyle.caption3(context)?.copyWith(
        color: CustomColors.appColorBlue,
      ),
    );
    if (kya.status == KyaLessonStatus.pendingCompletion) {
      widget = RichText(
        textAlign: TextAlign.start,
        overflow: TextOverflow.ellipsis,
        text: TextSpan(
          children: [
            TextSpan(
              text: AppLocalizations.of(context)!.completeMoveTo,
              style: CustomTextStyle.caption3(context)?.copyWith(
                color: CustomColors.appColorBlack,
              ),
            ),
            const TextSpan(
              text: " ",
            ),
            TextSpan(
              text: AppLocalizations.of(context)!.forYou,
              style: CustomTextStyle.caption3(context)?.copyWith(
                color: CustomColors.appColorBlue,
              ),
            ),
          ],
        ),
      );
    }

    return Row(
      crossAxisAlignment: CrossAxisAlignment.center,
      children: [
        widget,
        Icon(
          Icons.chevron_right_rounded,
          size: 17,
          color: CustomColors.appColorBlue,
        ),
        Visibility(
          visible: false,
          child: Chip(
            shadowColor: Colors.transparent,
            backgroundColor: Colors.transparent,
            surfaceTintColor: Colors.transparent,
            label: widget,
            elevation: 0,
            materialTapTargetSize: MaterialTapTargetSize.shrinkWrap,
            padding: EdgeInsets.zero,
            labelPadding: EdgeInsets.zero,
            deleteIconColor: CustomColors.appColorBlue,
            labelStyle: null,
            deleteIcon: Icon(
              Icons.chevron_right_rounded,
              size: 17,
              color: CustomColors.appColorBlue,
            ),
          ),
        ),
      ],
    );
  }
}

class KyaLessonCardWidget extends StatelessWidget {
  const KyaLessonCardWidget(this.kyaLesson, {super.key});

  final KyaLesson kyaLesson;

  @override
  Widget build(BuildContext context) {
    return OutlinedButton(
      style: OutlinedButton.styleFrom(
        minimumSize: const Size.fromHeight(112),
        foregroundColor: CustomColors.appColorBlue,
        elevation: 0,
        side: const BorderSide(
          color: Colors.transparent,
          width: 0,
        ),
        shape: const RoundedRectangleBorder(
          borderRadius: BorderRadius.all(
            Radius.circular(16),
          ),
        ),
        backgroundColor: Colors.white,
        padding: const EdgeInsets.fromLTRB(16.0, 8.0, 4.0, 8.0),
      ),
      onPressed: () async {
        if (kyaLesson.status == KyaLessonStatus.pendingCompletion) {
          context.read<KyaBloc>().add(
                UpdateKyaProgress(
                  kyaLesson.copyWith(
                    status: KyaLessonStatus.complete,
                    activeTask: 1,
                  ),
                  updateRemote: true,
                ),
              );
        } else {
          await Navigator.push(
            context,
            MaterialPageRoute(
              builder: (context) {
                return KyaTitlePage(kyaLesson);
              },
            ),
          );
        }
      },
      child: Row(
        crossAxisAlignment: CrossAxisAlignment.center,
        children: [
          SizedBox(
            width: MediaQuery.of(context).size.width * 0.5375,
            height: 104,
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              mainAxisSize: MainAxisSize.min,
              children: [
                Flexible(
                  flex: 3,
                  child: Padding(
                    padding: const EdgeInsets.only(bottom: 2),
                    child: AutoSizeText(
                      kyaLesson.title,
                      maxLines: 5,
                      overflow: TextOverflow.ellipsis,
                      style: CustomTextStyle.headline10(context),
                    ),
                  ),
                ),
                const Spacer(),
                Flexible(
                  flex: 1,
                  child: KyaMessageChip(kyaLesson),
                ),
                Visibility(
                  visible: kyaLesson.status != KyaLessonStatus.todo &&
                      kyaLesson.activeTask != 1,
                  child: KyaLessonProgressBar(kyaLesson),
                ),
              ],
            ),
          ),
          const Spacer(),
          SizedBox(
            width: MediaQuery.of(context).size.width * 0.02,
          ),
          FittedBox(
            fit: BoxFit.cover,
            child: SizedBox(
              width: MediaQuery.of(context).size.width * 0.28,
              height: 112,
              child: CachedNetworkImage(
                imageUrl: kyaLesson.imageUrl,
                imageBuilder: (context, imageProvider) => Container(
                  decoration: BoxDecoration(
                    borderRadius: BorderRadius.circular(8.0),
                    image: DecorationImage(
                      fit: BoxFit.cover,
                      image: imageProvider,
                    ),
                  ),
                ),
                placeholder: (context, url) => const ContainerLoadingAnimation(
                  radius: 8,
                  height: 112,
                ),
                errorWidget: (context, url, error) => Container(
                  decoration: BoxDecoration(
                    borderRadius: BorderRadius.circular(8.0),
                    color: Colors.grey,
                  ),
                  child: const Center(
                    child: Icon(
                      Icons.error,
                      color: Colors.white,
                    ),
                  ),
                ),
              ),
            ),
          ),
        ],
      ),
    );
  }
}

class KyaLessonProgressBar extends StatelessWidget {
  const KyaLessonProgressBar(this.kyaLesson, {super.key});

  final KyaLesson kyaLesson;

  @override
  Widget build(BuildContext context) {
    return SizedBox(
      height: kyaLesson.tasks.length.toDouble(),
      child: ClipRRect(
        borderRadius: const BorderRadius.all(Radius.circular(10)),
        child: LinearProgressIndicator(
          color: CustomColors.appColorBlue,
          value: kyaLesson.activeTask / kyaLesson.tasks.length,
          backgroundColor: CustomColors.appColorBlue.withOpacity(0.24),
          valueColor: AlwaysStoppedAnimation<Color>(CustomColors.appColorBlue),
        ),
      ),
    );
  }
}

class KyaLessonCard extends StatelessWidget {
  const KyaLessonCard(this.kyaTask, this.kya, {super.key});

  final KyaTask kyaTask;
  final KyaLesson kya;

  @override
  Widget build(BuildContext context) {
    return Card(
      color: Colors.white,
      elevation: 5,
      margin: EdgeInsets.zero,
      shadowColor: CustomColors.appBodyColor,
      shape: RoundedRectangleBorder(
        borderRadius: BorderRadius.circular(16),
      ),
      child: Column(
        mainAxisSize: MainAxisSize.min,
        crossAxisAlignment: CrossAxisAlignment.center,
        children: [
          Padding(
            padding: const EdgeInsets.only(
              left: 8.0,
              right: 8.0,
              top: 8.0,
            ),
            child: ClipRRect(
              borderRadius: BorderRadius.circular(8),
              child: CachedNetworkImage(
                fit: BoxFit.fill,
                placeholder: (context, url) => const ContainerLoadingAnimation(
                  height: 180,
                  radius: 8,
                ),
                imageUrl: kyaTask.imageUrl,
                errorWidget: (context, url, error) => SizedBox(
                  height: 180,
                  child: Center(
                    child: SvgPicture.asset(
                      'assets/icon/no_internet_connection_icon.svg',
                    ),
                  ),
                ),
                cacheKey: kyaTask.imageUrlCacheKey(kya),
                cacheManager: CacheManager(
                  CacheService.cacheConfig(
                    kyaTask.imageUrlCacheKey(kya),
                  ),
                ),
              ),
            ),
          ),
          Padding(
            padding: const EdgeInsets.only(left: 36, right: 36, top: 12.0),
            child: AutoSizeText(
              kyaTask.title,
              maxLines: 2,
              minFontSize: 20,
              overflow: TextOverflow.ellipsis,
              textAlign: TextAlign.center,
              style: CustomTextStyle.headline9(context),
            ),
          ),
          Padding(
            padding: const EdgeInsets.only(left: 16, right: 16, top: 8.0),
            child: AutoSizeText(
              kyaTask.content,
              maxLines: 3,
              overflow: TextOverflow.ellipsis,
              textAlign: TextAlign.center,
              minFontSize: 16,
              style: Theme.of(context).textTheme.titleMedium?.copyWith(
                    color: CustomColors.appColorBlack.withOpacity(0.5),
                  ),
            ),
          ),
          const Spacer(),
          SvgPicture.asset(
            'assets/icon/tips_graphics.svg',
            semanticsLabel: 'tips_graphics',
          ),
          const SizedBox(
            height: 30,
          ),
        ],
      ),
    );
  }
}

class KyaLoadingWidget extends StatelessWidget {
  const KyaLoadingWidget({super.key});

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      body: Stack(
        fit: StackFit.expand,
        children: [
          Container(
            color: CustomColors.appBodyColor,
            height: double.infinity,
            width: double.infinity,
          ),
          const FractionallySizedBox(
            alignment: Alignment.topCenter,
            widthFactor: 1.0,
            heightFactor: 0.4,
            child: ContainerLoadingAnimation(
              radius: 0,
              height: double.infinity,
            ),
          ),
          const Align(
            alignment: AlignmentDirectional.bottomCenter,
            child: Padding(
              padding: EdgeInsets.only(
                left: 24,
                right: 24,
                bottom: 32,
              ),
              child: ContainerLoadingAnimation(
                radius: 8,
                height: 48,
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
                      child: const Center(
                        child: Column(
                          crossAxisAlignment: CrossAxisAlignment.center,
                          children: [
                            SizedBox(
                              height: 48,
                            ),
                            SizedContainerLoadingAnimation(
                              radius: 8,
                              height: 133,
                              width: 221,
                            ),
                            SizedBox(
                              height: 18,
                            ),
                            Padding(
                              padding: EdgeInsets.symmetric(horizontal: 40),
                              child: ContainerLoadingAnimation(
                                radius: 5,
                                height: 20,
                              ),
                            ),
                            SizedBox(
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
