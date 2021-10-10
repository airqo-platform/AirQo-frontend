import 'package:app/constants/app_constants.dart';
import 'package:app/utils/pm.dart';
import 'package:app/widgets/help/aqi_index.dart';
import 'package:app/widgets/help/pollutant.dart';
import 'package:flutter/material.dart';

class HelpPage extends StatelessWidget {
  final int initialIndex;

  const HelpPage({Key? key, required this.initialIndex}) : super(key: key);

  @override
  Widget build(BuildContext context) {
    return DefaultTabController(
      initialIndex: getInitialIndex(),
      length: 3,
      child: Scaffold(
        appBar: AppBar(
          backgroundColor: ColorConstants.appBarBgColor,
          leading: BackButton(color: ColorConstants.appColor),
          elevation: 0,
          bottom: TabBar(
            isScrollable: false,
            indicatorColor: ColorConstants.appColor,
            tabs: [
              const Tab(
                  child: Text(
                'AQI',
                style: TextStyle(fontWeight: FontWeight.bold, fontSize: 17),
              )),
              const Tab(
                  child: Text(
                'PM2.5',
                style: TextStyle(fontWeight: FontWeight.bold, fontSize: 17),
              )),
              const Tab(
                  child: Text(
                'PM10',
                style: TextStyle(fontWeight: FontWeight.bold, fontSize: 17),
              )),
              // const Tab(
              //     child: Text(
              //   'Humidity',
              //   style: TextStyle(fontWeight: FontWeight.bold, fontSize: 17),
              // )),
              // const Tab(
              //     child: Text(
              //   'Temperature',
              //   style: TextStyle(fontWeight: FontWeight.bold, fontSize: 17),
              // )),
            ],
          ),
          title: Text(
            'Help Guides',
            style: TextStyle(
                color: ColorConstants.appBarTitleColor,
                fontWeight: FontWeight.bold),
          ),
        ),
        body: TabBarView(
          children: [
            AqiDialog(),
            PollutantDialog(pollutantDetails(PollutantConstant.pm2_5)),
            PollutantDialog(pollutantDetails(PollutantConstant.pm10)),
            // PollutantDialogV2(pollutantDetails(PollutantConstant.humidity)),
            // PollutantDialogV2(pollutantDetails(PollutantConstant.temperature)),
          ],
        ),
      ),
    );
  }

  int getInitialIndex() {
    if (initialIndex > 2 || initialIndex < 0) {
      return 0;
    }
    return initialIndex;
  }
}
