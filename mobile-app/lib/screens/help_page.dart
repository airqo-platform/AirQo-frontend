import 'package:app/constants/app_constants.dart';
import 'package:app/utils/pm.dart';
import 'package:app/widgets/help/aqi_index.dart';
import 'package:app/widgets/help/pollutant.dart';
import 'package:flutter/material.dart';

class HelpPage extends StatelessWidget {
  const HelpPage({Key? key, required this.initialIndex}) : super(key: key);
  final int initialIndex;

  int getInitialIndex(){
    if(initialIndex > 2 || initialIndex < 0){
      return 0;
    }
    return initialIndex;
  }

  @override
  Widget build(BuildContext context) {
    return DefaultTabController(
      initialIndex: getInitialIndex(),
      length: 3,
      child: Scaffold(
        appBar: AppBar(
          bottom: const TabBar(
            tabs: [
              Tab(
                  child: Text(
                'AQI',
                style: TextStyle(
                    color: Colors.white,
                    fontWeight: FontWeight.bold,
                    fontSize: 17),
              )),
              Tab(
                  child: Text(
                'PM 2.5',
                style: TextStyle(
                    color: Colors.white,
                    fontWeight: FontWeight.bold,
                    fontSize: 17),
              )),
              Tab(
                  child: Text(
                'PM 10',
                style: TextStyle(
                    color: Colors.white,
                    fontWeight: FontWeight.bold,
                    fontSize: 17),
              )),
            ],
          ),
          title: const Text(
            'Help Guides',
            style: TextStyle(color: Colors.white, fontWeight: FontWeight.bold),
          ),
        ),
        body: TabBarView(
          children: [
            AqiDialog(),
            PollutantDialog(pollutantDetails(PollutantConstants.pm2_5)),
            PollutantDialog(pollutantDetails(PollutantConstants.pm10)),
          ],
        ),
      ),
    );
  }
}
