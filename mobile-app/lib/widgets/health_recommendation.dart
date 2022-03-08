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
              itemBuilder: (BuildContext context, int index) => Container(
                height: 100,
                width: 100,
                decoration: BoxDecoration(
                  border: Border(
                    bottom: BorderSide(
                      width: 4.0,
                      color: recommendations[index].isSelected
                          ? recommendations[index].imageColor
                          : Colors.white,
                    ),
                  ),
                ),
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
            padding: const EdgeInsets.only(left: 12.0, right: 12.0),
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
