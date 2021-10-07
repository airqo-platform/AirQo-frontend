import 'package:app/constants/app_constants.dart';
import 'package:app/models/measurement.dart';
import 'package:app/utils/pm.dart';
import 'package:flutter/material.dart';

class HealthRecommendationSection extends StatefulWidget {
  final Measurement measurement;

  HealthRecommendationSection({Key? key, required this.measurement})
      : super(key: key);

  @override
  _HealthRecommendationSectionState createState() =>
      _HealthRecommendationSectionState();
}

class HealthRecommendationSlider extends StatefulWidget {
  final Measurement measurement;

  const HealthRecommendationSlider({Key? key, required this.measurement})
      : super(key: key);

  @override
  _HealthRecommendationSliderState createState() =>
      _HealthRecommendationSliderState();
}

class ParallaxImage extends StatelessWidget {
  final Recommendation recommendation;
  final double horizontalSlide;

  const ParallaxImage({
    Key? key,
    required this.recommendation,
    required this.horizontalSlide,
  }) : super(key: key);

  @override
  Widget build(BuildContext context) {
    final scale = 1 - horizontalSlide.abs();
    final size = 200;
    return Container(
      child: Center(
        child: SizedBox(
          width: size * ((scale * 0.6) + 0.6),
          height: size * ((scale * 0.1) + 0.1),
          child: ClipRRect(
            borderRadius: const BorderRadius.all(Radius.circular(20)),
            child: Image.asset(
              recommendation.imageUrl,
              height: size * ((scale * 0.2) + 0.1),
              width: size * ((scale * 0.6) + 0.2),
              alignment: Alignment(horizontalSlide, 1),
            ),
          ),
        ),
      ),
    );
  }
}

class _HealthRecommendationSectionState
    extends State<HealthRecommendationSection> {
  var recommendation = '';
  var recommendations = <Recommendation>[];

  @override
  Widget build(BuildContext context) {
    return Container(
        child: Padding(
      padding: const EdgeInsets.all(5.0),
      child: Column(
        mainAxisAlignment: MainAxisAlignment.spaceEvenly,
        children: [
          if (recommendations.isNotEmpty)
            Text(
              'Recommendations',
              softWrap: true,
              style: TextStyle(
                  fontSize: 20,
                  color: ColorConstants.appColor,
                  fontWeight: FontWeight.bold),
            ),
          const SizedBox(height: 5.0),
          SizedBox(
            height: 100.0,
            child: ListView.builder(
              physics: const ClampingScrollPhysics(),
              shrinkWrap: true,
              scrollDirection: Axis.horizontal,
              itemCount: recommendations.length,
              itemBuilder: (BuildContext context, int index) => Card(
                color: recommendations[index].isSelected
                    ? ColorConstants.appColor
                    : Colors.white,
                shape: RoundedRectangleBorder(
                  borderRadius: BorderRadius.circular(10),
                ),
                elevation: 0.0,
                child: Padding(
                  padding: const EdgeInsets.only(top: 8.0, bottom: 8.0),
                  child: GestureDetector(
                    onTap: () {
                      openRecommendation(recommendations[index]);
                    },
                    child: Image.asset(
                      recommendations[index].imageUrl,
                      height: 100,
                      width: 100,
                    ),
                  ),
                ),
              ),
            ),
          ),
          Padding(
            padding: const EdgeInsets.only(left: 8.0, right: 8.0),
            child: Text(
              '$recommendation',
              softWrap: true,
              textAlign: TextAlign.center,
              style: TextStyle(
                fontSize: 15,
                color: ColorConstants.appColor,
              ),
            ),
          ),
        ],
      ),
    ));
  }

  void initialize() {
    setState(() {
      recommendations =
          getHealthRecommendations(widget.measurement.getPm2_5Value());
      if (recommendations.isNotEmpty) {
        recommendation = recommendations[0].recommendation;
        recommendations[0].isSelected = true;
      }
    });
  }

  @override
  void initState() {
    initialize();
    super.initState();
  }

  void openRecommendation(Recommendation s) {
    var updated = <Recommendation>[];

    for (var r in recommendations) {
      if (r == s) {
        r.isSelected = true;
      } else {
        r.isSelected = false;
      }

      updated.add(r);
    }

    setState(() {
      recommendation = s.recommendation;
      recommendations = updated;
    });
  }
}

class _HealthRecommendationSliderState
    extends State<HealthRecommendationSlider> {
  late PageController _pageController;
  double page = 0.0;
  var recommendations = <Recommendation>[];

  @override
  Widget build(BuildContext context) {
    if (recommendations.isNotEmpty) {
      return Center(
        child: SizedBox(
          height: 200,
          child: PageView.builder(
            controller: _pageController,
            itemBuilder: (context, index) {
              return Column(
                children: [
                  SizedBox(
                    child: Padding(
                      padding: const EdgeInsets.all(8.0),
                      child: ParallaxImage(
                        recommendation: recommendations[index],
                        horizontalSlide: (index - page).clamp(-1, 1).toDouble(),
                      ),
                    ),
                  ),
                  Text('${recommendations[index].recommendation}')
                ],
              );
            },
            itemCount: recommendations.length,
          ),
        ),
      );
    } else {
      return const Text('');
    }
  }

  @override
  void dispose() {
    _pageController.removeListener(_onScroll);
    _pageController.dispose();
    super.dispose();
  }

  @override
  void initState() {
    _getRecommendations();
    _pageController = PageController(
      initialPage: 0,
      viewportFraction: 0.5,
    );
    _pageController.addListener(_onScroll);
    super.initState();
  }

  void _getRecommendations() {
    setState(() {
      recommendations =
          getHealthRecommendations(widget.measurement.getPm2_5Value());
    });
  }

  void _onScroll() {
    setState(() {
      page = _pageController.page!;
    });
  }
}
