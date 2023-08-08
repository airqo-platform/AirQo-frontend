// ignore_for_file: prefer_const_constructors

import 'package:app/themes/theme.dart';
//import 'package:app/widgets/widgets.dart';
import 'package:auto_size_text/auto_size_text.dart';
import 'package:cached_network_image/cached_network_image.dart';
import 'package:flutter/material.dart';
import 'package:flutter_cache_manager/flutter_cache_manager.dart';
//import 'package:flutter_svg/svg.dart';

// class CircularQuizButton extends StatelessWidget {
//   const CircularQuizButton({
//     super.key,
//     required this.icon,
//     this.isActive = true,
//   });

//   final String icon;
//   final bool isActive;

//   @override
//   Widget build(BuildContext context) {
//     return Container(
//       height: 48,
//       width: 48,
//       padding: const EdgeInsets.all(15.0),
//       decoration: BoxDecoration(
//         color: isActive
//             ? CustomColors.appColorBlue
//             : CustomColors.appColorBlue.withOpacity(0.5),
//         shape: BoxShape.circle,
//       ),
//       child: SvgPicture.asset(
//         icon,
//         colorFilter: const ColorFilter.mode(
//           Colors.white,
//           BlendMode.srcIn,
//         ),
//       ),
//     );
//   }
// }

class QuizMessageChip extends StatelessWidget {
  const QuizMessageChip({super.key});

  @override
  Widget build(BuildContext context) {
    Widget widget = AutoSizeText(
      "Take Quiz",
      maxLines: 1,
      overflow: TextOverflow.ellipsis,
      textAlign: TextAlign.center,
      style: CustomTextStyle.caption3(context)?.copyWith(
        color: CustomColors.appColorBlue,
      ),
    );
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

class QuizCardWidget extends StatelessWidget {
  const QuizCardWidget({super.key});

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
        padding: const EdgeInsets.fromLTRB(16.0, 8.0, 8.0, 8.0),
      ),
      onPressed: () async {},
      child: Row(
        crossAxisAlignment: CrossAxisAlignment.center,
        children: [
          SizedBox(
            width: MediaQuery.of(context).size.width * 0.5,
            height: 104,
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              mainAxisSize: MainAxisSize.min,
              children: [
                Padding(
                  padding: const EdgeInsets.only(bottom: 2),
                  child: AutoSizeText(
                    "Get personalised air  recommendations",
                    maxLines: 2,
                    overflow: TextOverflow.ellipsis,
                    style: CustomTextStyle.headline10(context),
                  ),
                ),
                const Spacer(),
                const QuizMessageChip(),
              ],
            ),
          ),
          const Spacer(),
          SizedBox(
            width: MediaQuery.of(context).size.width * 0.05,
          ),
          Container(
            width: MediaQuery.of(context).size.width * 0.27,
            height: 112,
            decoration: BoxDecoration(
              borderRadius: BorderRadius.circular(8.0),
              image: DecorationImage(
                fit: BoxFit.cover,
                image: NetworkImage(
                    "https://images.pexels.com/photos/4778611/pexels-photo-4778611.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1"),
              ),
            ),
          ),
        ],
      ),
    );
  }
}

// class QuizProgressBar extends StatelessWidget {
//   const QuizProgressBar({super.key});

//   @override
//   Widget build(BuildContext context) {
//     return SizedBox(
//       height: 10,
//       child: ClipRRect(
//         borderRadius: const BorderRadius.all(Radius.circular(10)),
//         child: LinearProgressIndicator(
//           color: CustomColors.appColorBlue,
//           //value: kyaLesson.activeTask / kyaLesson.tasks.length,
//           backgroundColor: CustomColors.appColorBlue.withOpacity(0.24),
//           valueColor: AlwaysStoppedAnimation<Color>(CustomColors.appColorBlue),
//         ),
//       ),
//     );
//   }
// }

// class QuizCard extends StatelessWidget {
//   const QuizCard({super.key});

//   @override
//   Widget build(BuildContext context) {
//     return Card(
//       color: Colors.white,
//       elevation: 5,
//       margin: EdgeInsets.zero,
//       shadowColor: CustomColors.appBodyColor,
//       shape: RoundedRectangleBorder(
//         borderRadius: BorderRadius.circular(16),
//       ),
//       child: Column(
//         mainAxisSize: MainAxisSize.min,
//         crossAxisAlignment: CrossAxisAlignment.center,
//         children: [
//           Padding(
//             padding: const EdgeInsets.only(
//               left: 8.0,
//               right: 8.0,
//               top: 8.0,
//             ),
//             // child: ClipRRect(
//             //   borderRadius: BorderRadius.circular(8),
//             //   child: CachedNetworkImage(
//             //     fit: BoxFit.fill,
//             //     placeholder: (context, url) => const ContainerLoadingAnimation(
//             //       height: 180,
//             //       radius: 8,
//             //     ),
//             //     imageUrl:Quiz.image,
//             //   ),
//             // ),
//           ),
//           Padding(
//             padding: const EdgeInsets.only(left: 36, right: 36, top: 12.0),
//             child: AutoSizeText(
//               "Quiz.title",
//               maxLines: 2,
//               minFontSize: 20,
//               overflow: TextOverflow.ellipsis,
//               textAlign: TextAlign.center,
//               style: CustomTextStyle.headline9(context),
//             ),
//           ),
//           Padding(
//             padding: const EdgeInsets.only(left: 16, right: 16, top: 8.0),
//             child: AutoSizeText(
//               "Quiz.content",
//               maxLines: 3,
//               overflow: TextOverflow.ellipsis,
//               textAlign: TextAlign.center,
//               minFontSize: 16,
//               style: Theme.of(context).textTheme.titleMedium?.copyWith(
//                     color: CustomColors.appColorBlack.withOpacity(0.5),
//                   ),
//             ),
//           ),
//           const Spacer(),
//           SvgPicture.asset(
//             'assets/icon/tips_graphics.svg',
//             semanticsLabel: 'tips_graphics',
//           ),
//           const SizedBox(
//             height: 30,
//           ),
//         ],
//       ),
//     );
//   }
// }

// class Quiz {
// }

// class QuizLoadingWidget extends StatelessWidget {
//   const QuizLoadingWidget({super.key});

//   @override
//   Widget build(BuildContext context) {
//     return Scaffold(
//       body: Stack(
//         fit: StackFit.expand,
//         children: [
//           Container(
//             color: CustomColors.appBodyColor,
//             height: double.infinity,
//             width: double.infinity,
//           ),
//           const FractionallySizedBox(
//             alignment: Alignment.topCenter,
//             widthFactor: 1.0,
//             heightFactor: 0.4,
//             child: ContainerLoadingAnimation(
//               radius: 0,
//               height: double.infinity,
//             ),
//           ),
//           const Align(
//             alignment: AlignmentDirectional.bottomCenter,
//             child: Padding(
//               padding: EdgeInsets.only(
//                 left: 24,
//                 right: 24,
//                 bottom: 32,
//               ),
//               child: ContainerLoadingAnimation(
//                 radius: 8,
//                 height: 48,
//               ),
//             ),
//           ),
//           Positioned.fill(
//             child: Align(
//               alignment: Alignment.center,
//               child: Padding(
//                 padding: const EdgeInsets.symmetric(horizontal: 24),
//                 child: Column(
//                   children: [
//                     const Spacer(),
//                     Container(
//                       decoration: const BoxDecoration(
//                         color: Colors.white,
//                         borderRadius: BorderRadius.all(
//                           Radius.circular(16.0),
//                         ),
//                       ),
//                       child: const Center(
//                         child: Column(
//                           crossAxisAlignment: CrossAxisAlignment.center,
//                           children: [
//                             SizedBox(
//                               height: 48,
//                             ),
//                             SizedContainerLoadingAnimation(
//                               radius: 8,
//                               height: 133,
//                               width: 221,
//                             ),
//                             SizedBox(
//                               height: 18,
//                             ),
//                             Padding(
//                               padding: EdgeInsets.symmetric(horizontal: 40),
//                               child: ContainerLoadingAnimation(
//                                 radius: 5,
//                                 height: 20,
//                               ),
//                             ),
//                             SizedBox(
//                               height: 64,
//                             ),
//                           ],
//                         ),
//                       ),
//                     ),
//                     const Spacer(),
//                   ],
//                 ),
//               ),
//             ),
//           ),
//         ],
//       ),
//     );
//   }
// }
