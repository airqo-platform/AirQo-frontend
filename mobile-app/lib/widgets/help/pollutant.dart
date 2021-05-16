import 'package:app/constants/app_constants.dart';
import 'package:app/models/pollutant.dart';
import 'package:flutter/material.dart';

// https://www.epa.gov/pm-pollution/particulate-matter-pm-basics

class PollutantDialog extends StatelessWidget {
  PollutantDialog(this.pollutant);

  final Pollutant pollutant;

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        backgroundColor: appColor,
        title: Text(pollutant.pollutant),
      ),
      body: Padding(
        padding: const EdgeInsets.fromLTRB(10, 0, 10, 0),
        child: ListView(
          children: [whatIs(), source(), effects(), howToReduce()],
        ),
      ),
    );
  }

  Widget whatIs() {
    return Padding(
      padding: const EdgeInsets.fromLTRB(0, 2, 0, 0),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        mainAxisAlignment: MainAxisAlignment.start,
        children: [
          Padding(
            padding: const EdgeInsets.all(5),
            child: Text(
                'What is ${pollutant.pollutant}, '
                'and how does it get into the air?',
                softWrap: true,
                style:
                    const TextStyle(height: 1.2, color: appColor, fontSize: 15
                        // letterSpacing: 1.0
                        )),
          ),
          Padding(
            padding: const EdgeInsets.all(5),
            child: Text('${pollutant.description}',
                softWrap: true,
                style: const TextStyle(
                  height: 1.5,
                  // letterSpacing: 1.0
                )),
          ),
        ],
      ),
    );
  }

  Widget source() {
    return Padding(
      padding: const EdgeInsets.fromLTRB(0, 2, 0, 0),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        mainAxisAlignment: MainAxisAlignment.start,
        children: [
          Padding(
            padding: const EdgeInsets.all(5),
            child: Text('Sources of ${pollutant.pollutant}',
                softWrap: true,
                style:
                    const TextStyle(height: 1.2, color: appColor, fontSize: 15
                        // letterSpacing: 1.0
                        )),
          ),
          Padding(
            padding: const EdgeInsets.all(5),
            child: Text('${pollutant.source}',
                softWrap: true,
                style: const TextStyle(
                  height: 1.5,
                  // letterSpacing: 1.0
                )),
          ),
        ],
      ),
    );
  }

  Widget effects() {
    return Padding(
      padding: const EdgeInsets.fromLTRB(0, 2, 0, 0),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        mainAxisAlignment: MainAxisAlignment.start,
        children: [
          Padding(
            padding: const EdgeInsets.all(5),
            child: Text(
                'What are the Harmful Effects '
                'of ${pollutant.pollutant}',
                softWrap: true,
                style:
                    const TextStyle(height: 1.2, color: appColor, fontSize: 15
                        // letterSpacing: 1.0
                        )),
          ),
          Padding(
            padding: const EdgeInsets.all(5),
            child: Text('${pollutant.effects}',
                softWrap: true,
                style: const TextStyle(
                  height: 1.5,
                  // letterSpacing: 1.0
                )),
          ),
        ],
      ),
    );
  }

  Widget howToReduce() {
    return Padding(
      padding: const EdgeInsets.fromLTRB(0, 2, 0, 0),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        mainAxisAlignment: MainAxisAlignment.start,
        children: [
          Padding(
            padding: const EdgeInsets.all(5),
            child: Text(
                'How Can I Reduce My Exposure to'
                ' ${pollutant.pollutant}',
                softWrap: true,
                style:
                    const TextStyle(height: 1.5, color: appColor, fontSize: 15
                        // letterSpacing: 1.0
                        )),
          ),
          Padding(
            padding: const EdgeInsets.all(5),
            child: Text('${pollutant.howToReduce}',
                softWrap: true,
                style: const TextStyle(
                  height: 1.5,
                  // letterSpacing: 1.0
                )),
          ),
        ],
      ),
    );
  }
}
