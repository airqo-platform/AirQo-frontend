import 'package:app/constants/app_constants.dart';
import 'package:app/utils/pm.dart';
import 'package:flutter/material.dart';
import 'package:flutter_svg/svg.dart';

void pmInfoDialog(context, double pm2_5) {
  showGeneralDialog(
    context: context,
    barrierDismissible: false,
    transitionDuration: const Duration(milliseconds: 250),
    transitionBuilder: (context, animation, secondaryAnimation, child) {
      return FadeTransition(
        opacity: animation,
        child: ScaleTransition(
          scale: animation,
          child: child,
        ),
      );
    },
    pageBuilder: (context, animation, secondaryAnimation) {
      return AlertDialog(
        scrollable: true,
        shape: const RoundedRectangleBorder(
            borderRadius: BorderRadius.all(Radius.circular(8.0))),
        contentPadding: const EdgeInsets.all(0),
        content: Container(
            decoration: const BoxDecoration(
                color: Colors.white,
                borderRadius: BorderRadius.all(Radius.circular(8.0))),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                const SizedBox(
                  height: 16,
                ),
                Padding(
                  padding: const EdgeInsets.only(left: 16, right: 16),
                  child: Row(
                    mainAxisAlignment: MainAxisAlignment.spaceBetween,
                    children: [
                      Text(
                        'Know Your Air',
                        style: TextStyle(
                            color: ColorConstants.appColorBlue,
                            fontSize: 16,
                            fontWeight: FontWeight.bold),
                      ),
                      GestureDetector(
                        onTap: () => Navigator.pop(context, 'OK'),
                        child: SvgPicture.asset(
                          'assets/icon/close.svg',
                          semanticsLabel: 'Pm2.5',
                          height: 20,
                          width: 20,
                        ),
                      ),
                    ],
                  ),
                ),
                const SizedBox(
                  height: 11,
                ),
                Divider(
                  height: 1,
                  color: ColorConstants.appColorBlack.withOpacity(0.2),
                ),
                const SizedBox(
                  height: 8,
                ),
                Padding(
                  padding:
                      const EdgeInsets.only(left: 16, right: 16, bottom: 16),
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      RichText(
                        text: TextSpan(
                          children: <TextSpan>[
                            TextSpan(
                              text: 'PM',
                              style: TextStyle(
                                fontSize: 17,
                                color: ColorConstants.appColor,
                                fontWeight: FontWeight.bold,
                              ),
                            ),
                            TextSpan(
                              text: '2.5',
                              style: TextStyle(
                                fontSize: 12,
                                fontWeight: FontWeight.bold,
                                color: ColorConstants.appColor,
                              ),
                            )
                          ],
                        ),
                      ),
                      const SizedBox(
                        height: 5,
                      ),
                      RichText(
                        text: TextSpan(
                          children: <TextSpan>[
                            TextSpan(
                              text: 'Particulate matter(PM) ',
                              style: TextStyle(
                                  fontSize: 10,
                                  fontWeight: FontWeight.w500,
                                  color: ColorConstants.appColorBlack),
                            ),
                            TextSpan(
                              text: 'is a complex mixture of extremely'
                                  ' small particles and liquid droplets.',
                              style: TextStyle(
                                color: ColorConstants.appColorBlack
                                    .withOpacity(0.7),
                                fontSize: 10,
                              ),
                            )
                          ],
                        ),
                      ),
                      const SizedBox(
                        height: 8,
                      ),
                      RichText(
                        text: TextSpan(
                          children: <TextSpan>[
                            TextSpan(
                              text: 'When measuring particles there are two '
                                  'size categories commonly used: ',
                              style: TextStyle(
                                color: ColorConstants.appColorBlack
                                    .withOpacity(0.7),
                                fontSize: 10,
                              ),
                            ),
                            TextSpan(
                              text: 'PM',
                              style: TextStyle(
                                fontSize: 10,
                                fontWeight: FontWeight.w500,
                                color: ColorConstants.appColorBlack,
                              ),
                            ),
                            TextSpan(
                              text: '2.5',
                              style: TextStyle(
                                fontSize: 7,
                                fontWeight: FontWeight.w800,
                                color: ColorConstants.appColorBlack,
                              ),
                            ),
                            TextSpan(
                              text: ' and ',
                              style: TextStyle(
                                fontSize: 10,
                                color: ColorConstants.appColorBlack
                                    .withOpacity(0.7),
                              ),
                            ),
                            TextSpan(
                              text: 'PM',
                              style: TextStyle(
                                fontSize: 10,
                                fontWeight: FontWeight.w500,
                                color: ColorConstants.appColorBlack,
                              ),
                            ),
                            TextSpan(
                              text: '10',
                              style: TextStyle(
                                fontSize: 7,
                                fontWeight: FontWeight.w800,
                                color: ColorConstants.appColorBlack,
                              ),
                            ),
                          ],
                        ),
                      ),
                      const SizedBox(
                        height: 17.35,
                      ),
                      Container(
                        padding: const EdgeInsets.fromLTRB(12, 2.0, 12, 2),
                        decoration: BoxDecoration(
                            color: pm2_5ToColor(pm2_5).withOpacity(0.4),
                            borderRadius:
                                const BorderRadius.all(Radius.circular(537.0))),
                        child: Text(
                          pm2_5ToString(pm2_5),
                          maxLines: 2,
                          overflow: TextOverflow.ellipsis,
                          style: TextStyle(
                              fontSize: 10,
                              color: pm2_5TextColor(pm2_5),
                              fontWeight: FontWeight.w500),
                        ),
                      ),
                      const SizedBox(
                        height: 6.35,
                      ),
                      RichText(
                        text: TextSpan(
                          children: <TextSpan>[
                            TextSpan(
                              text: '${pmToLongString(pm2_5)}'
                                  ' means; ',
                              style: TextStyle(
                                  fontSize: 10,
                                  fontWeight: FontWeight.w500,
                                  color: ColorConstants.appColorBlack),
                            ),
                            TextSpan(
                              text: pmToInfoDialog(pm2_5),
                              style: TextStyle(
                                color: ColorConstants.appColorBlack
                                    .withOpacity(0.7),
                                fontSize: 10,
                              ),
                            )
                          ],
                        ),
                      ),
                    ],
                  ),
                ),
              ],
            )),
      );
    },
  );
}

Future<void> showSnackBar(context, String message) async {
  var snackBar = SnackBar(
    shape: RoundedRectangleBorder(
      borderRadius: BorderRadius.circular(10),
    ),
    elevation: 10,
    behavior: SnackBarBehavior.floating,
    content: Text(
      message,
      softWrap: true,
      textAlign: TextAlign.center,
      style: const TextStyle(
        color: Colors.white,
      ),
    ),
    backgroundColor: ColorConstants.snackBarBgColor,
  );
  ScaffoldMessenger.of(context).showSnackBar(snackBar);
}
