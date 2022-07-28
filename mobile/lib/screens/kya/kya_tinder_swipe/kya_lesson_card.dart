import 'package:cached_network_image/cached_network_image.dart';
import 'package:flutter/material.dart';
import 'package:flutter_svg/svg.dart';

import '../../../models/kya.dart';
import '../../../themes/colors.dart';
import '../../../widgets/custom_shimmer.dart';

class KyaLessonCard extends StatelessWidget {
  const KyaLessonCard({
    Key? key,
    required this.kyaLesson,
  }) : super(key: key);
  final KyaLesson kyaLesson;

  @override
  Widget build(BuildContext context) {
    return Container(
      height: MediaQuery.of(context).size.height * 0.5,
      width: MediaQuery.of(context).size.width * 0.9,
      decoration: ShapeDecoration(
        color: Colors.white,
        shape: RoundedRectangleBorder(
          borderRadius: BorderRadius.circular(10),
        ),
        shadows: <BoxShadow>[
          BoxShadow(
            color: Colors.black.withOpacity(0.05),
            blurRadius: 8,
          ),
        ],
      ),
      padding: const EdgeInsets.symmetric(horizontal: 8),
      child: Column(
        children: [
          const SizedBox(
            height: 8,
          ),
          ClipRRect(
            borderRadius: BorderRadius.circular(8),
            child: CachedNetworkImage(
              fit: BoxFit.contain,

                  placeholder: (context, url) => const SizedBox(
                    child: ContainerLoadingAnimation(
                      height: 180,
                      radius: 8,
                    ),
                  ),
              imageUrl: kyaLesson.imageUrl,
                              errorWidget: (context, url, error) => Icon(
                    Icons.error_outline,
                    color: CustomColors.aqiRed,
                  ),
            ),
          ),
          const Spacer(),
          Text(
            textAlign: TextAlign.center,
            kyaLesson.title,
            style: const TextStyle(
              fontWeight: FontWeight.w800,
              fontSize: 20,
            ),
          ),
          Text(
            kyaLesson.body,
            textAlign: TextAlign.center,
            style: const TextStyle(
              fontWeight: FontWeight.w400,
              fontSize: 16,
              color: Colors.grey,
            ),
          ),
          const Spacer(),
          SvgPicture.asset(
            'assets/icon/tips_graphics.svg',
            semanticsLabel: 'tips_graphics',
          ),
          const SizedBox(
            height: 20,
          )
        ],
      ),
    );
  
  }
}
