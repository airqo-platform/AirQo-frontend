import 'package:app/constants/app_constants.dart';
import 'package:app/models/historicalMeasurement.dart';
import 'package:app/models/measurement.dart';
import 'package:app/screens/air_pollution_ways_page.dart';
import 'package:app/screens/tip_page.dart';
import 'package:app/utils/pm.dart';
import 'package:flutter/material.dart';
import 'package:flutter_svg/svg.dart';
import 'package:google_fonts/google_fonts.dart';

const shimmerGradient = LinearGradient(
  colors: [
    Color(0xFFEBEBF4),
    Color(0xFFF4F4F4),
    Color(0xFFEBEBF4),
  ],
  stops: [
    0.1,
    0.3,
    0.4,
  ],
  begin: Alignment(-1.0, -0.3),
  end: Alignment(1.0, 0.3),
  tileMode: TileMode.clamp,
);

Widget analyticsAvatar(
    Measurement measurement, double size, double fontSize, double iconHeight) {
  return Container(
    height: size,
    width: size,
    decoration: BoxDecoration(
        shape: BoxShape.circle,
        color: pm2_5ToColor(measurement.getPm2_5Value()),
        border: Border.all(color: Colors.transparent)),
    child: Column(
      crossAxisAlignment: CrossAxisAlignment.center,
      children: [
        const Spacer(),
        SvgPicture.asset(
          'assets/icon/PM2.5.svg',
          semanticsLabel: 'Pm2.5',
          height: iconHeight,
          width: 32.45,
          color: pm2_5TextColor(measurement.getPm2_5Value()),
        ),
        Text(
          '${measurement.getPm2_5Value().toStringAsFixed(0)}',
          maxLines: 1,
          overflow: TextOverflow.ellipsis,
          style: GoogleFonts.robotoMono(
              color: pm2_5TextColor(measurement.getPm2_5Value()),
              fontStyle: FontStyle.normal,
              fontSize: fontSize),
        ),
        SvgPicture.asset(
          'assets/icon/unit.svg',
          semanticsLabel: 'UNit',
          height: iconHeight,
          width: 32,
          color: pm2_5TextColor(measurement.getPm2_5Value()),
        ),
        const Spacer(),
      ],
    ),
  );
}

PreferredSizeWidget appTopBar(context, String title) {
  return AppBar(
    centerTitle: true,
    elevation: 0,
    backgroundColor: ColorConstants.appBodyColor,
    leading: Padding(
      padding: const EdgeInsets.only(top: 6.5, bottom: 6.5, left: 16),
      child: backButton(context),
    ),
    title: Text(
      title,
      style: TextStyle(color: ColorConstants.appColorBlack),
    ),
  );
}

Widget backButton(context) {
  return GestureDetector(
    onTap: () {
      Navigator.pop(context);
    },
    child: SvgPicture.asset(
      'assets/icon/back_button.svg',
      semanticsLabel: 'more',
      height: 40,
      width: 40,
    ),
  );
}

Widget backButtonV1(context) {
  return Container(
    constraints: const BoxConstraints(maxHeight: 32),
    padding: const EdgeInsets.all(0.0),
    decoration: const BoxDecoration(
        color: Colors.white,
        shape: BoxShape.rectangle,
        borderRadius: BorderRadius.all(Radius.circular(10.0))),
    child: IconButton(
      icon: const Icon(
        Icons.arrow_back,
        color: Colors.black,
        size: 20,
      ),
      onPressed: () {
        Navigator.pop(context);
      },
    ),
  );
}

// Widget backButton(context) {
//   return Container(
//     padding: const EdgeInsets.all(0.0),
//     decoration: const BoxDecoration(
//         color: Colors.white,
//         shape: BoxShape.rectangle,
//         borderRadius: BorderRadius.all(Radius.circular(10.0))),
//     child: IconButton(
//       icon: const Icon(
//         Icons.arrow_back,
//         color: Colors.black,
//       ),
//       onPressed: () {
//         Navigator.pop(context);
//       },
//     ),
//   );
// }

Widget customInputField(context, text) {
  return Container(
    constraints: const BoxConstraints(minWidth: double.infinity),
    padding: const EdgeInsets.only(left: 16.0, right: 8.0),
    decoration: const BoxDecoration(
        color: Colors.white,
        shape: BoxShape.rectangle,
        borderRadius: BorderRadius.all(Radius.circular(10.0))),
    child: Row(
      children: [
        Text('$text'),
        const Spacer(),
        IconButton(
          icon: Icon(
            Icons.edit,
            color: ColorConstants.appColorBlue,
          ),
          onPressed: () {},
        )
      ],
    ),
  );
}

Widget customSearchField(context, text) {
  return Container(
    constraints: const BoxConstraints(minWidth: double.maxFinite),
    decoration: const BoxDecoration(
        color: Colors.white,
        shape: BoxShape.rectangle,
        borderRadius: BorderRadius.all(Radius.circular(10.0))),
    child: Row(
      children: [
        IconButton(
          icon: const Icon(Icons.search),
          onPressed: () {},
        ),
        Expanded(
          child: TextFormField(
            maxLines: 1,
            autofocus: true,
            decoration: InputDecoration(
              hintText: '$text',
              border: InputBorder.none,
            ),
          ),
        ),
      ],
    ),
  );
}

Widget iconTextButton(Widget icon, text) {
  return Row(
    children: [
      icon,
      const SizedBox(
        width: 10,
      ),
      Text(
        text,
        style: const TextStyle(fontSize: 14, color: Colors.black),
      )
    ],
  );
}

Widget insightsAvatar(
    context, HistoricalMeasurement measurement, double size, String pollutant) {
  return Container(
    height: size,
    width: size,
    decoration: BoxDecoration(
        shape: BoxShape.circle,
        color: pollutant == 'pm2.5'
            ? pm2_5ToColor(measurement.getPm2_5Value())
            : pm10ToColor(measurement.getPm10Value()),
        border: Border.all(color: Colors.transparent)),
    child: Column(
      crossAxisAlignment: CrossAxisAlignment.center,
      children: [
        const Spacer(),
        SvgPicture.asset(
          'assets/icon/PM2.5.svg',
          semanticsLabel: 'Pm2.5',
          height: 6,
          width: 32.45,
          color: pollutant == 'pm2.5'
              ? pm2_5TextColor(measurement.getPm2_5Value())
              : pm10TextColor(measurement.getPm10Value()),
        ),
        Text(
          '${measurement.getPm2_5Value().toStringAsFixed(0)}',
          maxLines: 1,
          overflow: TextOverflow.ellipsis,
          style: GoogleFonts.robotoMono(
            fontStyle: FontStyle.normal,
            fontSize: 32,
            color: pollutant == 'pm2.5'
                ? pm2_5TextColor(measurement.getPm2_5Value())
                : pm10TextColor(measurement.getPm10Value()),
          ),
        ),
        SvgPicture.asset(
          'assets/icon/unit.svg',
          semanticsLabel: 'UNit',
          height: 6,
          width: 32,
          color: pollutant == 'pm2.5'
              ? pm2_5TextColor(measurement.getPm2_5Value())
              : pm10TextColor(measurement.getPm10Value()),
        ),
        const Spacer(),
      ],
    ),
  );
  // return Container(
  //   height: size,
  //   width: size,
  //   decoration: BoxDecoration(
  //       shape: BoxShape.circle,
  //       color: pollutant == 'pm2.5'
  //           ? pm2_5ToColor(measurement.getPm2_5Value())
  //           : pm10ToColor(measurement.getPm10Value()),
  //       border: Border.all(color: Colors.transparent)),
  //   child: Column(
  //     mainAxisAlignment: MainAxisAlignment.spaceBetween,
  //     crossAxisAlignment: CrossAxisAlignment.center,
  //     children: [
  //       const Spacer(),
  //       RichText(
  //           text: TextSpan(
  //         style: DefaultTextStyle.of(context).style,
  //         children: <TextSpan>[
  //           TextSpan(
  //             text: 'PM',
  //             style: TextStyle(
  //               fontSize: 6,
  //               color: ColorConstants.appColor,
  //               fontWeight: FontWeight.bold,
  //             ),
  //           ),
  //           TextSpan(
  //             text: pollutant == 'pm2.5' ? '2.5' : '10',
  //             style: TextStyle(
  //               fontSize: 4,
  //               color: ColorConstants.appColor,
  //             ),
  //           )
  //         ],
  //       )),
  //       Text(
  //         pollutant == 'pm2.5'
  //             ? '${measurement.getPm2_5Value().toStringAsFixed(0)}'
  //             : '${measurement.getPm10Value().toStringAsFixed(0)}',
  //         maxLines: 1,
  //         overflow: TextOverflow.ellipsis,
  //         style:
  //             GoogleFonts.robotoMono(fontStyle: FontStyle.normal, fontSize: 32),
  //       ),
  //       SvgPicture.asset(
  //         'assets/icon/unit.svg',
  //         semanticsLabel: 'UNit',
  //         height: 12,
  //         width: 32,
  //       ),
  //       // const Text(
  //       //   'µg/m\u00B3',
  //       //   style: TextStyle(fontSize: 6),
  //       // ),
  //       const Spacer(),
  //     ],
  //   ),
  // );
}

PreferredSizeWidget knowYourAirAppBar(context, title) {
  return AppBar(
    centerTitle: true,
    elevation: 0,
    backgroundColor: Colors.transparent,
    foregroundColor: Colors.transparent,
    leading: Padding(
      padding: const EdgeInsets.only(top: 6.5, bottom: 6.5, left: 16),
      child: backButton(context),
    ),
    title: Text(
      title,
      style: TextStyle(color: Colors.white),
    ),
  );
}

Widget locationTile(Measurement measurement) {
  return Container(
    padding: const EdgeInsets.all(8.0),
    decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: const BorderRadius.all(Radius.circular(16.0)),
        border: Border.all(color: Colors.transparent)),
    child: ListTile(
      contentPadding: const EdgeInsets.only(left: 0.0),
      title: Text(
        '${measurement.site.getName()}',
        maxLines: 1,
        overflow: TextOverflow.ellipsis,
        style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 16),
      ),
      subtitle: Text(
        '${measurement.site.getLocation()}',
        maxLines: 1,
        overflow: TextOverflow.ellipsis,
        style: TextStyle(color: Colors.black.withOpacity(0.3), fontSize: 14),
      ),
      trailing: SvgPicture.asset(
        'assets/icon/more_arrow.svg',
        semanticsLabel: 'more',
        height: 6.99,
        width: 4,
      ),
      leading: analyticsAvatar(measurement, 40, 15, 5),
    ),
  );
}

Widget locationTileV1(Measurement measurement) {
  return ListTile(
    title: Text(
      '${measurement.site.getName()}',
      style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 16),
    ),
    subtitle: Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Text('${measurement.site.getLocation()}',
            style:
                TextStyle(color: ColorConstants.inactiveColor, fontSize: 12)),
        const SizedBox(
          height: 4,
        ),
        Row(
          crossAxisAlignment: CrossAxisAlignment.center,
          mainAxisAlignment: MainAxisAlignment.spaceEvenly,
          children: [
            Container(
              height: 12,
              padding: const EdgeInsets.only(left: 3.0, right: 3.0),
              decoration: BoxDecoration(
                color:
                    pm2_5ToColor(measurement.getPm2_5Value()).withOpacity(0.2),
                borderRadius: const BorderRadius.all(Radius.circular(10.0)),
              ),
              child: Row(
                crossAxisAlignment: CrossAxisAlignment.center,
                mainAxisAlignment: MainAxisAlignment.center,
                children: [
                  Container(
                    width: 8,
                    height: 8,
                    padding: const EdgeInsets.only(right: 1.0),
                    decoration: BoxDecoration(
                      color: pm2_5ToColor(measurement.getPm2_5Value()),
                      shape: BoxShape.circle,
                    ),
                  ),
                  const SizedBox(
                    width: 2,
                  ),
                  Text(
                      '${pmToString(measurement.getPm2_5Value()).replaceAll('\n', ' ')}',
                      style: TextStyle(
                          fontSize: 6,
                          color: pm2_5TextColor(measurement.getPm2_5Value()))),
                ],
              ),
            ),
            const SizedBox(
              width: 8,
            ),
            Container(
              height: 12,
              padding: const EdgeInsets.only(left: 3.0, right: 3.0),
              decoration: BoxDecoration(
                color:
                    pm2_5ToColor(measurement.getPm2_5Value()).withOpacity(0.2),
                borderRadius: const BorderRadius.all(Radius.circular(10.0)),
              ),
              child: Row(
                mainAxisAlignment: MainAxisAlignment.center,
                children: [
                  Container(
                    width: 8,
                    height: 8,
                    padding: const EdgeInsets.all(1.0),
                    decoration: BoxDecoration(
                      color: pm2_5ToColor(measurement.getPm2_5Value()),
                      shape: BoxShape.circle,
                    ),
                  ),
                  const SizedBox(
                    width: 2,
                  ),
                  Text('${measurement.getPm2_5Value()}',
                      style: TextStyle(
                          fontSize: 6,
                          color: pm2_5TextColor(measurement.getPm2_5Value()))),
                ],
              ),
            ),
            const Spacer()
          ],
        )
      ],
    ),
    trailing: Padding(
      padding: const EdgeInsets.all(10),
      child: Container(
        width: 40,
        height: 80,
        decoration: BoxDecoration(
            color: ColorConstants.appBodyColor,
            borderRadius: const BorderRadius.all(Radius.circular(10.0))),
        child: const Icon(
          Icons.arrow_forward_ios_rounded,
          color: Colors.black,
          size: 15,
        ),
      ),
    ),
  );
}

Widget tipWidget(context, header) {
  return Container(
    padding: const EdgeInsets.fromLTRB(16.0, 8.0, 8.0, 8.0),
    decoration: const BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.all(Radius.circular(16.0))),
    child: Row(
      crossAxisAlignment: CrossAxisAlignment.center,
      children: [
        Expanded(
          child: Column(
            children: [
              GestureDetector(
                onTap: () async {
                  await Navigator.push(context,
                      MaterialPageRoute(builder: (context) {
                    return const AirPollutionWaysPage();
                  }));
                },
                child: Text(header,
                    maxLines: 2,
                    overflow: TextOverflow.ellipsis,
                    style: const TextStyle(
                      fontSize: 16,
                      fontWeight: FontWeight.bold,
                    )),
              ),
              const SizedBox(
                height: 28,
              ),
              GestureDetector(
                onTap: () async {
                  await Navigator.push(context,
                      MaterialPageRoute(builder: (context) {
                    return const AirPollutionWaysPage();
                  }));
                },
                child: Row(
                  crossAxisAlignment: CrossAxisAlignment.center,
                  mainAxisAlignment: MainAxisAlignment.start,
                  children: [
                    Text('Start reading',
                        maxLines: 1,
                        overflow: TextOverflow.ellipsis,
                        textAlign: TextAlign.center,
                        style: TextStyle(
                          fontSize: 12,
                          color: ColorConstants.appColorBlue,
                        )),
                    const SizedBox(
                      width: 6,
                    ),
                    Icon(
                      Icons.arrow_forward_ios_sharp,
                      size: 10,
                      color: ColorConstants.appColorBlue,
                    )
                  ],
                ),
              ),
            ],
          ),
        ),
        const SizedBox(
          width: 16,
        ),
        GestureDetector(
          onTap: () async {
            await Navigator.push(context, MaterialPageRoute(builder: (context) {
              return const AirPollutionWaysPage();
            }));
          },
          child: ClipRRect(
            borderRadius: BorderRadius.circular(8.0),
            child: Image.asset(
              'assets/images/know-your-air.png',
              width: 104,
              height: 104,
              fit: BoxFit.cover,
            ),
          ),
        ),
      ],
    ),
  );
}

class Shimmer extends StatefulWidget {
  final LinearGradient linearGradient;

  final Widget? child;

  const Shimmer({
    Key? key,
    required this.linearGradient,
    this.child,
  }) : super(key: key);

  @override
  ShimmerState createState() => ShimmerState();

  static ShimmerState? of(BuildContext context) {
    return context.findAncestorStateOfType<ShimmerState>();
  }
}

class ShimmerLoading extends StatefulWidget {
  final bool isLoading;

  final Widget child;

  const ShimmerLoading({
    Key? key,
    required this.isLoading,
    required this.child,
  }) : super(key: key);

  @override
  _ShimmerLoadingState createState() => _ShimmerLoadingState();
}

class ShimmerState extends State<Shimmer> with SingleTickerProviderStateMixin {
  late AnimationController _shimmerController;

  LinearGradient get gradient => LinearGradient(
        colors: widget.linearGradient.colors,
        stops: widget.linearGradient.stops,
        begin: widget.linearGradient.begin,
        end: widget.linearGradient.end,
        transform:
            _SlidingGradientTransform(slidePercent: _shimmerController.value),
      );

  bool get isSized => (context.findRenderObject() as RenderBox).hasSize;

  Listenable get shimmerChanges => _shimmerController;

  Size get size => (context.findRenderObject() as RenderBox).size;

  @override
  Widget build(BuildContext context) {
    return widget.child ?? const SizedBox();
  }

  @override
  void dispose() {
    _shimmerController.dispose();
    super.dispose();
  }

  Offset getDescendantOffset({
    required RenderBox descendant,
    Offset offset = Offset.zero,
  }) {
    final shimmerBox = context.findRenderObject() as RenderBox;
    return descendant.localToGlobal(offset, ancestor: shimmerBox);
  }

  @override
  void initState() {
    super.initState();

    _shimmerController = AnimationController.unbounded(vsync: this)
      ..repeat(min: -0.5, max: 1.5, period: const Duration(milliseconds: 1000));
  }
}

class _ShimmerLoadingState extends State<ShimmerLoading> {
  Listenable? _shimmerChanges;

  @override
  Widget build(BuildContext context) {
    if (!widget.isLoading) {
      return widget.child;
    }

    // Collect ancestor shimmer info.
    final shimmer = Shimmer.of(context)!;
    if (!shimmer.isSized) {
      // The ancestor Shimmer widget has not laid
      // itself out yet. Return an empty box.
      return const SizedBox();
    }
    final shimmerSize = shimmer.size;
    final gradient = shimmer.gradient;
    final offsetWithinShimmer = shimmer.getDescendantOffset(
      descendant: context.findRenderObject() as RenderBox,
    );

    return ShaderMask(
      blendMode: BlendMode.srcATop,
      shaderCallback: (bounds) {
        return gradient.createShader(
          Rect.fromLTWH(
            -offsetWithinShimmer.dx,
            -offsetWithinShimmer.dy,
            shimmerSize.width,
            shimmerSize.height,
          ),
        );
      },
      child: widget.child,
    );
  }

  @override
  void didChangeDependencies() {
    super.didChangeDependencies();
    if (_shimmerChanges != null) {
      _shimmerChanges!.removeListener(_onShimmerChange);
    }
    _shimmerChanges = Shimmer.of(context)?.shimmerChanges;
    if (_shimmerChanges != null) {
      _shimmerChanges!.addListener(_onShimmerChange);
    }
  }

  @override
  void dispose() {
    _shimmerChanges?.removeListener(_onShimmerChange);
    super.dispose();
  }

  void _onShimmerChange() {
    if (widget.isLoading) {
      setState(() {
        // update the shimmer painting.
      });
    }
  }
}

class _SlidingGradientTransform extends GradientTransform {
  final double slidePercent;

  const _SlidingGradientTransform({
    required this.slidePercent,
  });

  @override
  Matrix4? transform(Rect bounds, {TextDirection? textDirection}) {
    return Matrix4.translationValues(bounds.width * slidePercent, 0.0, 0.0);
  }
}
