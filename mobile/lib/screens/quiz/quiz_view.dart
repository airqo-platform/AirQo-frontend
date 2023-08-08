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
      onPressed: () async {
        _displayBottomSheet(context);
      },
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

Future<dynamic> _displayBottomSheet(BuildContext context) {
  return showModalBottomSheet(
      context: context,
      builder: (context) {
        return SizedBox(
          height: 200,
          child: Container(
            width: MediaQuery.of(context).size.width * 0.3,
            height: MediaQuery.of(context).size.height * 0.87,
            padding: const EdgeInsets.symmetric(horizontal: 15, vertical: 23),
            decoration: const ShapeDecoration(
              color: Colors.white,
              shape: RoundedRectangleBorder(
                borderRadius: BorderRadius.only(
                  topLeft: Radius.circular(32),
                  topRight: Radius.circular(32),
                ),
              ),
            ),
            child: Padding(
              padding: const EdgeInsets.fromLTRB(31, 10, 31, 31),
              child: Column(
                mainAxisSize: MainAxisSize.min,
                mainAxisAlignment: MainAxisAlignment.start,
                crossAxisAlignment: CrossAxisAlignment.center,
                children: [
                  const SizedBox(
                    height: 40,
                  ),
                  SizedBox(
                    width: 120,
                    height: 120,
                    child: Container(
                      width: 100,
                      height: 100,
                      decoration: ShapeDecoration(
                        color: const Color(0xFFD1FADF),
                        shape: RoundedRectangleBorder(
                          borderRadius: BorderRadius.circular(15),
                        ),
                      ),
                      child: const Icon(
                        Icons.check_circle,
                        color: Color.fromARGB(188, 7, 77, 50),
                        size: 80,
                      ),
                    ),
                  ),
                  const SizedBox(height: 32),
                  const Column(
                    mainAxisSize: MainAxisSize.min,
                    mainAxisAlignment: MainAxisAlignment.start,
                    crossAxisAlignment: CrossAxisAlignment.center,
                    children: [
                      SizedBox(
                        child: AutoSizeText(
                          'You have completed the quiz!',
                          maxLines: 2,
                          textAlign: TextAlign.center,
                          style: TextStyle(
                            color: Color.fromARGB(255, 31, 35, 45),
                            fontSize: 24,
                            fontFamily: 'Inter',
                            fontWeight: FontWeight.w700,
                            height: 1.70,
                            letterSpacing: -0.90,
                          ),
                        ),
                      ),
                      SizedBox(height: 24),
                      SizedBox(
                        //width: 307,
                        //height: 89,
                        child: AutoSizeText(
                          'Way to go🎊. You have unlocked personalised air quality recommendations to empower you on your clean air journey.',
                          textAlign: TextAlign.center,
                          maxLines: 3,
                          style: TextStyle(
                            color: Color(0xFF6F87A1),
                            fontSize: 20,
                            fontFamily: 'Inter',
                            fontWeight: FontWeight.w500,
                            height: 1.50,
                          ),
                        ),
                      ),
                    ],
                  ),
                ],
              ),
            ),
          ),
        );
      });
}

// class QuizPage extends StatelessWidget {
//   const QuizPage({Key? key}) : super(key: key);

//   @override
//   Widget build(BuildContext context) {
//     return Stack(
//       children: [
//         const Positioned.fill(
//           child: Column(
//             children: [
//               Expanded(
//                 child: SizedBox(
//                   width: double.infinity,
//                   child: Image(
//                     image: NetworkImage(
//                       "https://images.unsplash.com/photo-1547721064-da6cfb341d50",
//                     ),
//                     fit: BoxFit.cover,
//                   ),
//                 ),
//               ),
//             ],
//           ),
//         ),
//         Positioned(
//           bottom: 0,
//           left: 0,
//           right: 0,
//           child: Container(
//               width: MediaQuery.of(context).size.width * 0.3,
//               height: MediaQuery.of(context).size.height * 0.87,
//               padding: const EdgeInsets.symmetric(horizontal: 15, vertical: 23),
//               decoration: const ShapeDecoration(
//                 color: Colors.white,
//                 shape: RoundedRectangleBorder(
//                   borderRadius: BorderRadius.only(
//                     topLeft: Radius.circular(32),
//                     topRight: Radius.circular(32),
//                   ),
//                 ),
//               ),
//               child: Padding(
//                 padding: const EdgeInsets.fromLTRB(31, 10, 31, 31),
//                 child: Column(
//                   mainAxisSize: MainAxisSize.min,
//                   mainAxisAlignment: MainAxisAlignment.start,
//                   crossAxisAlignment: CrossAxisAlignment.center,
//                   children: [
//                     const SizedBox(
//                       height: 40,
//                     ),
//                     SizedBox(
//                       width: 120,
//                       height: 120,
//                       child: Container(
//                         width: 100,
//                         height: 100,
//                         decoration: ShapeDecoration(
//                           color: const Color(0xFFD1FADF),
//                           shape: RoundedRectangleBorder(
//                             borderRadius: BorderRadius.circular(15),
//                           ),
//                         ),
//                         child: const Icon(
//                           Icons.check_circle,
//                           color: Color.fromARGB(188, 7, 77, 50),
//                           size: 80,
//                         ),
//                       ),
//                     ),
//                     const SizedBox(height: 32),
//                     const Column(
//                       mainAxisSize: MainAxisSize.min,
//                       mainAxisAlignment: MainAxisAlignment.start,
//                       crossAxisAlignment: CrossAxisAlignment.center,
//                       children: [
//                         SizedBox(
//                           child: AutoSizeText(
//                             'You have completed the quiz!',
//                             maxLines: 2,
//                             textAlign: TextAlign.center,
//                             style: TextStyle(
//                               color: Color.fromARGB(255, 31, 35, 45),
//                               fontSize: 24,
//                               fontFamily: 'Inter',
//                               fontWeight: FontWeight.w700,
//                               height: 1.70,
//                               letterSpacing: -0.90,
//                             ),
//                           ),
//                         ),
//                         SizedBox(height: 24),
//                         SizedBox(
//                           //width: 307,
//                           //height: 89,
//                           child: AutoSizeText(
//                             'Way to go🎊. You have unlocked personalised air quality recommendations to empower you on your clean air journey.',
//                             textAlign: TextAlign.center,
//                             maxLines: 3,
//                             style: TextStyle(
//                               color: Color(0xFF6F87A1),
//                               fontSize: 20,
//                               fontFamily: 'Inter',
//                               fontWeight: FontWeight.w500,
//                               height: 1.50,
//                             ),
//                           ),
//                         ),
//                       ],
//                     ),
//                   ],
//                 ),
//               )),
//         ),
//       ],
//     );
//   }
// }

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
