import 'package:app/constants/config.dart';
import 'package:app/models/kya.dart';
import 'package:auto_size_text/auto_size_text.dart';
import 'package:cached_network_image/cached_network_image.dart';
import 'package:flutter/material.dart';
import 'package:flutter_svg/svg.dart';

import '../../widgets/buttons.dart';
import '../../widgets/custom_widgets.dart';
import 'kya_lessons_page.dart';

class KyaTitlePage extends StatefulWidget {
  final Kya kya;

  const KyaTitlePage(this.kya, {Key? key}) : super(key: key);

  @override
  _KyaTitlePageState createState() => _KyaTitlePageState();
}

class _KyaTitlePageState extends State<KyaTitlePage> {
  @override
  Widget build(BuildContext context) {
    return Scaffold(
      extendBodyBehindAppBar: true,
      appBar: knowYourAirAppBar(context, 'Know Your Air'),
      body: Stack(children: [
        Container(
          color: Config.appBodyColor,
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
                  widget.kya.secondaryImageUrl.trim() == ''
                      ? widget.kya.imageUrl
                      : widget.kya.secondaryImageUrl,
                ),
              ),
            ),
            child: Container(
              color: Config.appColorBlue.withOpacity(0.4),
            ),
          ),
          //   child: Stack(
          //     children: [
          //       CachedNetworkImage(
          //         fit: BoxFit.contain,
          //         placeholder: (context, url) => SizedBox(
          //           child: containerLoadingAnimation(
          //               height:
          //               double.infinity,
          //               radius: 0),
          //         ),
          //         imageUrl: widget.kya.secondaryImageUrl.trim() == ''
          //             ? widget.kya.imageUrl
          //             : widget.kya.secondaryImageUrl,
          //         errorWidget: (context, url, error) => Icon(
          //           Icons.error_outline,
          //           color: Config.red,
          //         ),
          //       ),
          //       Container(
          //         color: Config.appColorBlue.withOpacity(0.4),
          //       ),
          //     ],
          //   )
        ),
        Positioned.fill(
          child: Align(
              alignment: Alignment.bottomCenter,
              child: Padding(
                padding: const EdgeInsets.only(left: 24, right: 24),
                child: Column(
                  children: [
                    const Spacer(),
                    Container(
                        decoration: const BoxDecoration(
                            color: Colors.white,
                            borderRadius:
                                BorderRadius.all(Radius.circular(16.0))),
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
                                padding:
                                    const EdgeInsets.only(left: 16, right: 16),
                                child: AutoSizeText(
                                  widget.kya.title,
                                  textAlign: TextAlign.center,
                                  maxLines: 3,
                                  overflow: TextOverflow.ellipsis,
                                  maxFontSize: 28,
                                  style: TextStyle(
                                      fontWeight: FontWeight.bold,
                                      color: Config.appColorBlack,
                                      fontSize: 28),
                                ),
                              ),
                              const SizedBox(
                                height: 64,
                              ),
                            ],
                          ),
                        )),
                    const SizedBox(
                      height: 16,
                    ),
                    GestureDetector(
                      onTap: () {
                        setState(() {
                          Navigator.push(context,
                              MaterialPageRoute(builder: (context) {
                            return KyaLessonsPage(widget.kya);
                            // return MyHomePage();
                          }));
                        });
                      },
                      child: nextButton('Begin', Config.appColorBlue),
                    ),
                    const SizedBox(
                      height: 32,
                    ),
                  ],
                ),
              )),
        ),
      ]),
    );
  }

  Widget circularButton(String icon) {
    return Container(
      height: 48,
      width: 48,
      padding: const EdgeInsets.all(15.0),
      decoration: BoxDecoration(
        color: Config.appColorPaleBlue,
        shape: BoxShape.circle,
      ),
      child: SvgPicture.asset(
        icon,
        color: Config.appColorBlue,
      ),
    );
  }
}
