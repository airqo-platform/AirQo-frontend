import 'package:app/blocs/blocs.dart';
import 'package:app/models/models.dart';
import 'package:app/themes/theme.dart';
import 'package:app/utils/utils.dart';
import 'package:app/widgets/widgets.dart';
import 'package:flutter/material.dart';
import 'package:flutter_bloc/flutter_bloc.dart';
import 'package:flutter_gen/gen_l10n/app_localizations.dart';

import '../offline_banner.dart';
import 'package:flutter_svg/svg.dart';

class KyaFinalPage extends StatefulWidget {
  const KyaFinalPage(this.kyaLesson, {super.key});

  final KyaLesson kyaLesson;

  @override
  State<KyaFinalPage> createState() => _KyaFinalPageState();
}

class _KyaFinalPageState extends State<KyaFinalPage> {
  @override
  Widget build(BuildContext context) {
    return PopScope(
      onPopInvoked: ((didPop) {
        if (didPop) {
          _onWillPop();
        }
      }),
      child: OfflineBanner(
          child: Scaffold(
        appBar: AppBar(
          elevation: 0,
          toolbarHeight: 0,
          backgroundColor: CustomColors.appBodyColor,
        ),
        body: AppSafeArea(
          child: Column(
            children: [
              Row(
                mainAxisAlignment: MainAxisAlignment.end,
                children: [
                  AnimatedPadding(
                    duration: const Duration(milliseconds: 500),
                    curve: Curves.easeIn,
                    padding: const EdgeInsets.only(right: 16.0),
                    child: GestureDetector(
                      onTap: () async {
                        await popNavigation(context);
                      },
                      child: SvgPicture.asset(
                        'assets/icon/close.svg',
                        height: 40,
                        width: 40,
                      ),
                    ),
                  ),
                ],
              ),
              const SizedBox(
                height: 85,
              ),
              Column(
                mainAxisAlignment: MainAxisAlignment.center,
                crossAxisAlignment: CrossAxisAlignment.center,
                children: [
                  SvgPicture.asset(
                    'assets/icon/learn_complete.svg',
                    height: 133,
                    width: 221,
                  ),
                  const SizedBox(
                    height: 33.61,
                  ),
                  Padding(
                    padding: const EdgeInsets.symmetric(horizontal: 40),
                    child: Text(
                      AppLocalizations.of(context)!.congrats,
                      style: CustomTextStyle.headline11(context),
                    ),
                  ),
                  const SizedBox(
                    height: 8.0,
                  ),
                  Padding(
                    padding: const EdgeInsets.symmetric(horizontal: 60),
                    child: Text(
                      widget.kyaLesson.completionMessage,
                      textAlign: TextAlign.center,
                      style: Theme.of(context).textTheme.titleMedium?.copyWith(
                            color: CustomColors.appColorBlack.withOpacity(0.5),
                          ),
                    ),
                  ),
                ],
              ),
            ],
          ),
        ),
      )),
    );
  }

  @override
  void initState() {
    super.initState();
    context.read<KyaBloc>().add(
          UpdateKyaProgress(
            widget.kyaLesson.copyWith(
              activeTask: 1,
              status: KyaLessonStatus.complete,
              hasCompleted: true,
            ),
            updateRemote: true,
          ),
        );

    WidgetsBinding.instance.addPostFrameCallback((_) async {
      List<KyaLesson> completeLessons =
          context.read<KyaBloc>().state.lessons.filterInCompleteLessons();
      Profile profile = context.read<ProfileBloc>().state;
      bool rateApp = profile.requiresRating();
      if (completeLessons.length > 5 && rateApp) {
        await Future.delayed(const Duration(milliseconds: 1000))
            .then((_) async {
          if (mounted) {
            await showRatingDialog(context);
          }
        });
      }
    });
  }

  Future<bool> _onWillPop() {
    return Future.value(false);
  }
}
